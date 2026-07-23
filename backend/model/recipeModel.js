const pool = require("../database/db");

const createRecipe = async (
  title,
  description,
  ingredients,
  instructions,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  category,
  imageUrl,
  isPublic,
  userId,
) => {
  const result = await pool.query(
    `INSERT INTO recipes
       (title, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, category, image_url, is_public, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      category,
      imageUrl,
      isPublic,
      userId,
    ],
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
     WHERE r.is_public = TRUE
     ORDER BY r.created_at DESC`,
    [currentUserId],
  );
  return result.rows;
};

const getFavoriteRecipesByUser = async (userId) => {
  const result = await pool.query(
    `SELECT r.*, u.name AS author_name, (r.user_id = $1) AS is_own, TRUE AS is_favorite
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     JOIN recipe_favorites f ON f.recipe_id = r.id AND f.user_id = $1
     WHERE r.is_public = TRUE OR r.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return result.rows;
};

const getRecipeById = async (id, currentUserId) => {
  const result = await pool.query(
    `SELECT r.*, u.name AS author_name, (r.user_id = $2) AS is_own,
       EXISTS (SELECT 1 FROM recipe_favorites f WHERE f.recipe_id = r.id AND f.user_id = $2) AS is_favorite
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = $1 AND (r.is_public = TRUE OR r.user_id = $2)`,
    [id, currentUserId],
  );
  return result.rows[0];
};

const updateRecipeById = async (
  id,
  userId,
  title,
  description,
  ingredients,
  instructions,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  category,
  imageUrl,
  isPublic,
) => {
  const result = await pool.query(
    `UPDATE recipes
     SET title = $1, description = $2, ingredients = $3, instructions = $4,
         prep_time_minutes = $5, cook_time_minutes = $6, servings = $7,
         category = $8, image_url = $9, is_public = $10
     WHERE id = $11 AND user_id = $12
     RETURNING *`,
    [
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      category,
      imageUrl,
      isPublic,
      id,
      userId,
    ],
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
  getFavoriteRecipesByUser,
  getRecipeById,
  updateRecipeById,
  addFavorite,
  removeFavorite,
  deleteRecipeById,
};
