const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
  const { title, text, list_id, position } = req.body;
  const cardTitle = title || text; // Support both 'title' and 'text'

  db.query(
    "INSERT INTO cards (title, list_id, position) VALUES (?, ?, ?)",
    [cardTitle, list_id, position],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.get("/:listId", (req, res) => {
  db.query(
    `SELECT c.*,
       GROUP_CONCAT(DISTINCT l.color ORDER BY l.id SEPARATOR ',') AS label_colors,
       COUNT(DISTINCT cm.member_id)                               AS member_count,
       COUNT(DISTINCT ci.id)                                      AS checklist_total,
       COUNT(DISTINCT CASE WHEN ci.completed = 1 THEN ci.id END)  AS checklist_done
     FROM cards c
     LEFT JOIN card_labels  cl ON c.id = cl.card_id
     LEFT JOIN labels        l  ON cl.label_id  = l.id
     LEFT JOIN card_members cm ON c.id = cm.card_id
     LEFT JOIN checklist_items ci ON c.id = ci.card_id
     WHERE c.list_id = ?
     GROUP BY c.id, c.title, c.description, c.list_id, c.position, c.due_date
     ORDER BY c.position`,
    [req.params.listId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.put("/:id", (req, res) => {
  const { title, text, description, due_date, list_id, position } = req.body;

  // Build a dynamic partial update — only update fields that were actually sent
  const fields = [];
  const values = [];

  const cardTitle = title !== undefined ? title : text;
  if (cardTitle !== undefined) { fields.push("title=?");       values.push(cardTitle); }
  if (description !== undefined) { fields.push("description=?"); values.push(description); }
  if (due_date    !== undefined) { fields.push("due_date=?");    values.push(due_date); }
  if (list_id     !== undefined) { fields.push("list_id=?");     values.push(list_id); }
  if (position    !== undefined) { fields.push("position=?");    values.push(position); }

  if (fields.length === 0)
    return res.status(400).json({ error: "No fields to update" });

  values.push(req.params.id);

  db.query(
    `UPDATE cards SET ${fields.join(", ")} WHERE id=?`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM cards WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
