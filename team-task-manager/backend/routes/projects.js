const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// GET all projects (admin sees all, member sees their own)
router.get("/", verifyToken, async (req, res) => {
  try {
    let rows;
    if (req.user.role === "admin") {
      [rows] = await db.query(
        `SELECT p.*, u.name as admin_name FROM projects p 
         JOIN users u ON p.admin_id = u.id ORDER BY p.created_at DESC`
      );
    } else {
      [rows] = await db.query(
        `SELECT p.*, u.name as admin_name FROM projects p 
         JOIN users u ON p.admin_id = u.id
         JOIN project_members pm ON pm.project_id = p.id
         WHERE pm.user_id = ? ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single project with members
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT p.*, u.name as admin_name FROM projects p 
       JOIN users u ON p.admin_id = u.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (projects.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const [members] = await db.query(
      `SELECT u.id, u.name, u.email, u.role FROM project_members pm
       JOIN users u ON pm.user_id = u.id WHERE pm.project_id = ?`,
      [req.params.id]
    );

    res.json({ ...projects[0], members });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE project (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Project name required" });

  try {
    const [result] = await db.query(
      "INSERT INTO projects (name, description, admin_id) VALUES (?, ?, ?)",
      [name, description, req.user.id]
    );
    // Add admin as member too
    await db.query(
      "INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)",
      [result.insertId, req.user.id]
    );
    res.status(201).json({ id: result.insertId, name, description, admin_id: req.user.id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE project (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    await db.query(
      "UPDATE projects SET name = ?, description = ? WHERE id = ? AND admin_id = ?",
      [name, description, req.params.id, req.user.id]
    );
    res.json({ message: "Project updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE project (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM projects WHERE id = ? AND admin_id = ?", [
      req.params.id, req.user.id,
    ]);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADD member to project (admin only)
router.post("/:id/members", verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)",
      [req.params.id, userId]
    );
    res.json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// REMOVE member from project (admin only)
router.delete("/:id/members/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM project_members WHERE project_id = ? AND user_id = ?",
      [req.params.id, req.params.userId]
    );
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;