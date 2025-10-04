// routes/task.routes.js
const express = require("express");
const { getTasks, createTask } = require("../controllers/task.controller");

const router = express.Router();

router.get("/tasks", getTasks);
router.post("/tasks", createTask); // NEW

module.exports = router;
