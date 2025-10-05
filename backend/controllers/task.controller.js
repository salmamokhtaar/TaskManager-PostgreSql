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





async function updateTask(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, priority } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ error: "Title is required" });

    if (priority && !["LOW","MEDIUM","HIGH","low","medium","high"].includes(priority))
      return res.status(400).json({ error: "priority must be LOW|MEDIUM|HIGH" });

    const updated = await Task.update(id, req.body);
    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update task" });
  }
}





async function toggleTask(req, res) {
  try {
    const id = Number(req.params.id);
    const toggled = await Task.toggle(id);
    if (!toggled) return res.status(404).json({ error: "Task not found" });
    res.json(toggled);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to toggle task" });
  }
}


async function deleteTask(req, res) {
  try {
    const id = Number(req.params.id);
    const ok = await Task.remove(id);
    if (!ok) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete task" });
  }
}


async function getTasks(req, res) {
  try {
    const data = await Task.list(req.query);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}



module.exports = { getTasks, createTask , updateTask , toggleTask , deleteTask  };
