const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
  const { title, board_id, position } = req.body;
  db.query(
    "INSERT INTO lists (title, board_id, position) VALUES (?, ?, ?)",
    [title, board_id, position],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.get("/:boardId", (req, res) => {
  db.query(
    "SELECT * FROM lists WHERE board_id = ? ORDER BY position",
    [req.params.boardId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.put("/:id", (req, res) => {
  const { title } = req.body;
  db.query("UPDATE lists SET title=? WHERE id=?", [title, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM lists WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
