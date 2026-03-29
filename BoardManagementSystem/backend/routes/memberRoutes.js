const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- Global members ---

router.get("/", (req, res) => {
  db.query("SELECT * FROM members ORDER BY name", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
  db.query("INSERT INTO members (name) VALUES (?)", [name.trim()], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM members WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// --- Card ↔ member assignments ---

router.get("/card/:cardId", (req, res) => {
  db.query(
    `SELECT m.* FROM members m
     INNER JOIN card_members cm ON m.id = cm.member_id
     WHERE cm.card_id = ?`,
    [req.params.cardId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.post("/card/:cardId", (req, res) => {
  const { member_id } = req.body;
  db.query(
    `INSERT INTO card_members (card_id, member_id)
     SELECT ?, ? FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM card_members WHERE card_id=? AND member_id=?)`,
    [req.params.cardId, member_id, req.params.cardId, member_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.delete("/card/:cardId/:memberId", (req, res) => {
  db.query(
    "DELETE FROM card_members WHERE card_id=? AND member_id=?",
    [req.params.cardId, req.params.memberId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

module.exports = router;

