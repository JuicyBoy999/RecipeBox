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
    `SELECT r.*, u.name AS author_name, TRUE AS is_own,
       EXISTS (SELECT 1 FROM recipe_favorites f WHERE f.recipe_id = r.id AND f.user_id = $1) AS is_favorite
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  );
  return result.rows;
};

const getAllRecipesForFeed = async (currentUserId) => {
  const result = await pool.query(
    `SELECT r.*, u.name AS author_name, (r.user_id = $1) AS is_own,
       EXISTS (SELECT 1 FROM recipe_favorites f WHERE f.recipe_id = r.id AND f.user_id = $1) AS is_favorite
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     ORDER BY r.created_at DESC`,
    [currentUserId],
  );
  return result.rows;
};

const getRecipeById = async (id, currentUserId) => {
  const result = await pool.query(
    `SELECT r.*, u.name AS author_name, (r.user_id = $2) AS is_own,
       EXISTS (SELECT 1 FROM recipe_favorites f WHERE f.recipe_id = r.id AND f.user_id = $2) AS is_favorite
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = $1`,
    [id, currentUserId],
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

const addFavorite = async (userId, recipeId) => {
  const result = await pool.query(
    "INSERT INTO recipe_favorites (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT (user_id, recipe_id) DO NOTHING RETURNING *",
    [userId, recipeId],
  );
  return result.rows[0];
};

const removeFavorite = async (userId, recipeId) => {
  const result = await pool.query(
    "DELETE FROM recipe_favorites WHERE user_id = $1 AND recipe_id = $2 RETURNING *",
    [userId, recipeId],
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
  getAllRecipesForFeed,
  getRecipeById,
  updateRecipeById,
  addFavorite,
  removeFavorite,
  deleteRecipeById,
};
