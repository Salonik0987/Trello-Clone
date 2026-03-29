const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all checklist items for a card
router.get("/:cardId", (req, res) => {
  db.query(
    "SELECT * FROM checklist_items WHERE card_id = ? ORDER BY id",
    [req.params.cardId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// Create a checklist item
router.post("/", (req, res) => {
  const { card_id, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Text is required" });
  db.query(
    "INSERT INTO checklist_items (card_id, text, completed) VALUES (?, ?, false)",
    [card_id, text.trim()],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// Update a checklist item (toggle complete or edit text) — partial update
router.put("/:id", (req, res) => {
  const { text, completed } = req.body;
  const fields = [];
  const values = [];
  if (text      !== undefined) { fields.push("text=?");      values.push(text); }
  if (completed !== undefined) { fields.push("completed=?"); values.push(completed ? 1 : 0); }
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });
  values.push(req.params.id);
  db.query(
    `UPDATE checklist_items SET ${fields.join(", ")} WHERE id=?`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// Delete a checklist item
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM checklist_items WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;

