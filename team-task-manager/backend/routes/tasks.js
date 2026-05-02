const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// GET tasks for a project
router.get("/project/:projectId", verifyToken, async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.*, u.name as assigned_name, c.name as created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.project_id = ?
       ORDER BY t.created_at DESC`,
      [req.params.projectId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET all tasks for logged-in user (dashboard)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.*, p.name as project_name, u.name as assigned_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.assigned_to = ?
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET dashboard stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    let statsQuery;
    let params;

    if (req.user.role === "admin") {
      statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(status = 'todo') as todo,
          SUM(status = 'in_progress') as in_progress,
          SUM(status = 'done') as done,
          SUM(due_date < CURDATE() AND status != 'done') as overdue
        FROM tasks
      `;
      params = [];
    } else {
      statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(status = 'todo') as todo,
          SUM(status = 'in_progress') as in_progress,
          SUM(status = 'done') as done,
          SUM(due_date < CURDATE() AND status != 'done') as overdue
        FROM tasks WHERE assigned_to = ?
      `;
      params = [req.user.id];
    }

    const [stats] = await db.query(statsQuery, params);
    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE task (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { title, description, due_date, project_id, assigned_to } = req.body;
  if (!title || !project_id)
    return res.status(400).json({ message: "Title and project required" });

  try {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, due_date, project_id, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, due_date || null, project_id, assigned_to || null, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, description, due_date, project_id, assigned_to });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE task
router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, status, due_date, assigned_to } = req.body;
  try {
    // Admin can update all fields; member can only update status of their tasks
    if (req.user.role === "admin") {
      await db.query(
        `UPDATE tasks SET title=?, description=?, status=?, due_date=?, assigned_to=? WHERE id=?`,
        [title, description, status, due_date || null, assigned_to || null, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE tasks SET status=? WHERE id=? AND assigned_to=?`,
        [status, req.params.id, req.user.id]
      );
    }
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE task (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;