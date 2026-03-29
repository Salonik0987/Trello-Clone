const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
  const { title } = req.body;
  db.query("INSERT INTO boards (title) VALUES (?)", [title], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM boards", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.put("/:id", (req, res) => {
  const { title } = req.body;
  db.query("UPDATE boards SET title=? WHERE id=?", [title, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM boards WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
