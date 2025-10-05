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



async function update(id, { title, description, dueDate, priority, completed }) {
  const sql = `
    UPDATE tasks
    SET title = $1,
        description = $2,
        due_date = $3,
        priority = $4,
        completed = COALESCE($5, completed)
    WHERE id = $6
    RETURNING id, title, description, due_date AS "dueDate",
              priority, completed, created_at AS "createdAt", updated_at AS "updatedAt";
  `;
  const vals = [
    title.trim(),
    description?.trim() ?? null,
    dueDate ? new Date(dueDate) : null,
    (priority || "LOW").toUpperCase(),
    typeof completed === "boolean" ? completed : null,
    Number(id),
  ];
  const { rows } = await pool.query(sql, vals);
  return rows[0]; // undefined if not found
}



async function toggle(id) {
  const sql = `
    UPDATE tasks
    SET completed = NOT completed
    WHERE id = $1
    RETURNING id, title, description, due_date AS "dueDate",
              priority, completed, created_at AS "createdAt", updated_at AS "updatedAt";
  `;
  const { rows } = await pool.query(sql, [Number(id)]);
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query(`DELETE FROM tasks WHERE id=$1;`, [Number(id)]);
  return rowCount > 0;
}


async function list({ status="all", priority, q, sort="-created_at", page=1, limit=10 } = {}) {
  const allowedSort = new Set(["created_at", "due_date", "priority"]);
  const toDir = (s) => (String(s || "").startsWith("-") ? "DESC" : "ASC");
  const toField = (s) => String(s || "-created_at").replace("-", "");

  const clauses = [];
  const values = [];
  let i = 1;

  if (status === "active") clauses.push("completed = false");
  if (status === "completed") clauses.push("completed = true");
  if (priority) { clauses.push(`priority = $${i++}`); values.push(String(priority).toUpperCase()); }
  if (q) { clauses.push(`(title ILIKE $${i} OR description ILIKE $${i})`); values.push(`%${q}%`); i++; }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const field = allowedSort.has(toField(sort)) ? toField(sort) : "created_at";
  const dir = toDir(sort);

  const pageNum = Math.max(1, Number(page));
  const lim = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * lim;

  const itemsSql = `
    SELECT id, title, description, due_date AS "dueDate",
           priority, completed, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM tasks
    ${where}
    ORDER BY ${field} ${dir}
    LIMIT ${lim} OFFSET ${offset};
  `;
  const countSql = `SELECT COUNT(*)::int AS total FROM tasks ${where};`;

  const [itemsRes, countRes] = await Promise.all([
    pool.query(itemsSql, values),
    pool.query(countSql, values),
  ]);

  return {
    items: itemsRes.rows,
    page: pageNum,
    limit: lim,
    total: countRes.rows[0].total,
    pages: Math.ceil(countRes.rows[0].total / lim),
  };
}


module.exports = { listAll, create , update , toggle , remove , list};
