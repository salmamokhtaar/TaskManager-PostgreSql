// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { pool } = require("./models/db");
const taskRoutes = require("./routes/task.route");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
// Simple health check
// test api 
app.get("/health", (req, res) => {
  res.json({ ok: true, env: "up" });
});


// my apis

app.use("/api", taskRoutes);

// Start server only if DB connects
async function start() {
  try {
    await pool.query("SELECT 1"); // quick ping
    console.log("✅ Connected to PostgreSQL");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
}

start();
