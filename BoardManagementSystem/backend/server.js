const express = require("express");
const cors = require("cors");

const boardRoutes = require("./routes/boardRoutes");
const listRoutes = require("./routes/listRoutes");
const cardRoutes = require("./routes/cardRoutes");
const memberRoutes = require("./routes/memberRoutes");
const labelRoutes = require("./routes/labelRoutes");
const checklistRoutes = require("./routes/checklistRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

app.use("/boards", boardRoutes);
app.use("/lists", listRoutes);
app.use("/cards", cardRoutes);
app.use("/members", memberRoutes);
app.use("/labels", labelRoutes);
app.use("/checklist", checklistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
