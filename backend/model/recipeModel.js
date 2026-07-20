const pool = require("../database/db");

const createRecipe = async (
  title,
  ingredients,
  instructions,
  cookTimeMinutes,
  category,
  userId,
) => {
  const result = await pool.query(
    "INSERT INTO recipes (title, ingredients, instructions, cook_time_minutes, category, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [title, ingredients, instructions, cookTimeMinutes, category, userId],
  );
  return result.rows[0];
};

const getAllRecipesByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
};

const getRecipeById = async (id, userId) => {
  const result = await pool.query(
    "SELECT * FROM recipes WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return result.rows[0];
};

const updateRecipeById = async (
  id,
  userId,
  title,
  ingredients,
  instructions,
  cookTimeMinutes,
  category,
) => {
  const result = await pool.query(
    "UPDATE recipes SET title = $1, ingredients = $2, instructions = $3, cook_time_minutes = $4, category = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
    [title, ingredients, instructions, cookTimeMinutes, category, id, userId],
  );
  return result.rows[0];
};

const updateFavoriteById = async (id, userId, isFavorite) => {
  const result = await pool.query(
    "UPDATE recipes SET is_favorite = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [isFavorite, id, userId],
  );
  return result.rows[0];
};

const deleteRecipeById = async (id, userId) => {
  const result = await pool.query(
    "DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId],
  );
  return result.rows[0];
};

module.exports = {
  createRecipe,
  getAllRecipesByUser,
  getRecipeById,
  updateRecipeById,
  updateFavoriteById,
  deleteRecipeById,
};
