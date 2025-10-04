// models/task.model.js
const { pool } = require("./db");

// already have listAll()
async function listAll() {
  const sql = `
    SELECT id, title, description, due_date AS "dueDate",
           priority, completed, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM tasks
    ORDER BY created_at DESC;
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

// NEW: create task
async function create({ title, description, dueDate, priority }) {
  const sql = `
    INSERT INTO tasks (title, description, due_date, priority)
    VALUES ($1, $2, $3, COALESCE($4, 'LOW'))
    RETURNING id, title, description, due_date AS "dueDate",
              priority, completed, created_at AS "createdAt", updated_at AS "updatedAt";
  `;
  const vals = [
    title.trim(),
    description?.trim() || null,
    dueDate ? new Date(dueDate) : null,
    priority ? String(priority).toUpperCase() : null,
  ];
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

module.exports = { listAll, create };
