// routes/task.routes.js
const express = require("express");
const { getTasks, createTask , updateTask , toggleTask , deleteTask} = require("../controllers/task.controller");

const router = express.Router();

router.get("/tasks", getTasks);
router.post("/tasks", createTask); // NEW
router.put("/tasks/:id", updateTask);
router.patch("/tasks/:id/toggle", toggleTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
