const {
  createRecipe,
  getAllRecipesByUser,
  getRecipeById,
  updateRecipeById,
  updateFavoriteById,
  deleteRecipeById,
} = require("../model/recipeModel");

const addRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, cookTimeMinutes, category } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Recipe title is required" });
    }
    const cookTime = Number(cookTimeMinutes) || 0;
    if (cookTime < 0) {
      return res.status(400).json({ message: "Cook time must be a positive number" });
    }
    const recipe = await createRecipe(
      title,
      ingredients || "",
      instructions || "",
      cookTime,
      category || "",
      req.user.id,
    );
    res.status(201).json({ message: "Recipe added successfully", recipe });
  } catch (e) {
    res.status(500).json({ message: "Failed to add recipe", error: e.message });
  }
};

const getRecipes = async (req, res) => {
  try {
    const { category, favorite, search } = req.query;
    let recipes = await getAllRecipesByUser(req.user.id);
    if (category) {
      recipes = recipes.filter((r) => r.category === category);
    }
    if (favorite === "true") {
      recipes = recipes.filter((r) => r.is_favorite);
    }
    if (search) {
      const keyword = search.toLowerCase();
      recipes = recipes.filter((r) => r.title.toLowerCase().includes(keyword));
    }
    res.status(200).json({ message: "Recipes fetched", recipes });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch recipes", error: e.message });
  }
};

const getRecipe = async (req, res) => {
  try {
    const recipe = await getRecipeById(req.params.id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe fetched", recipe });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch recipe", error: e.message });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, cookTimeMinutes, category } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Recipe title is required" });
    }
    const cookTime = Number(cookTimeMinutes) || 0;
    if (cookTime < 0) {
      return res.status(400).json({ message: "Cook time must be a positive number" });
    }
    const recipe = await updateRecipeById(
      req.params.id,
      req.user.id,
      title,
      ingredients || "",
      instructions || "",
      cookTime,
      category || "",
    );
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe updated successfully", recipe });
  } catch (e) {
    res.status(500).json({ message: "Failed to update recipe", error: e.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { isFavorite } = req.body;
    const recipe = await updateFavoriteById(req.params.id, req.user.id, !!isFavorite);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Favorite updated", recipe });
  } catch (e) {
    res.status(500).json({ message: "Failed to update favorite", error: e.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await deleteRecipeById(req.params.id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete recipe", error: e.message });
  }
};

module.exports = {
  addRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  toggleFavorite,
  deleteRecipe,
};
