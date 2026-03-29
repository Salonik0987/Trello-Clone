const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- Global labels ---

router.get("/", (req, res) => {
  db.query("SELECT * FROM labels ORDER BY name", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
  db.query(
    "INSERT INTO labels (name, color) VALUES (?, ?)",
    [name.trim(), color || "#6b7280"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM labels WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// --- Card ↔ label assignments ---

router.get("/card/:cardId", (req, res) => {
  db.query(
    `SELECT l.* FROM labels l
     INNER JOIN card_labels cl ON l.id = cl.label_id
     WHERE cl.card_id = ?`,
    [req.params.cardId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.post("/card/:cardId", (req, res) => {
  const { label_id } = req.body;
  db.query(
    `INSERT INTO card_labels (card_id, label_id)
     SELECT ?, ? FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM card_labels WHERE card_id=? AND label_id=?)`,
    [req.params.cardId, label_id, req.params.cardId, label_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.delete("/card/:cardId/:labelId", (req, res) => {
  db.query(
    "DELETE FROM card_labels WHERE card_id=? AND label_id=?",
    [req.params.cardId, req.params.labelId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

module.exports = router;

