const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// GET all users (admin only — for assigning tasks / adding members)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY name"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;