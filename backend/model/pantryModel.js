const pool = require("../database/db");

const createItem = async (name, quantity, unit, userId) => {
  const result = await pool.query(
    "INSERT INTO pantry_items (name, quantity, unit, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, quantity, unit, userId],
  );
  return result.rows[0];
};

const getAllItemsByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM pantry_items WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
};

const getItemById = async (id, userId) => {
  const result = await pool.query(
    "SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return result.rows[0];
};

const updateItemById = async (id, userId, name, quantity, unit) => {
  const result = await pool.query(
    "UPDATE pantry_items SET name = $1, quantity = $2, unit = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
    [name, quantity, unit, id, userId],
  );
  return result.rows[0];
};

const deleteItemById = async (id, userId) => {
  const result = await pool.query(
    "DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId],
  );
  return result.rows[0];
};

module.exports = {
  createItem,
  getAllItemsByUser,
  getItemById,
  updateItemById,
  deleteItemById,
};
