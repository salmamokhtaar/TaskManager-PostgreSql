// controllers/task.controller.js
const Task = require("../models/task.model");

async function getTasks(req, res) {
  try {
    const items = await Task.listAll();
    res.json({ items, total: items.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

// NEW: POST /api/tasks
async function createTask(req, res) {
  try {
    const { title, description, dueDate, priority } = req.body;

    // minimal validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (priority && !["LOW", "MEDIUM", "HIGH", "low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "priority must be LOW|MEDIUM|HIGH" });
    }

    const task = await Task.create({ title, description, dueDate, priority });
    return res.status(201).json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create task" });
  }
}

module.exports = { getTasks, createTask };
