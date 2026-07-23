const {
  createRecipe,
  getAllRecipesByUser,
  getAllRecipesForFeed,
  getFavoriteRecipesByUser,
  getRecipeById,
  updateRecipeById,
  addFavorite,
  removeFavorite,
  deleteRecipeById,
} = require("../model/recipeModel");

const addRecipe = async (req, res) => {
  try {
    const {
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
    } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Recipe title is required" });
    }
    const prepTime = Number(prepTimeMinutes) || 0;
    const cookTime = Number(cookTimeMinutes) || 0;
    const servingsCount = Number(servings) || 1;
    if (prepTime < 0 || cookTime < 0) {
      return res.status(400).json({ message: "Prep and cook time must be positive numbers" });
    }
    if (servingsCount < 1) {
      return res.status(400).json({ message: "Servings must be at least 1" });
    }
    const recipe = await createRecipe(
      title,
      description || "",
      ingredients || "",
      instructions || "",
      prepTime,
      cookTime,
      servingsCount,
      category || "",
      imageUrl || "",
      isPublic !== false,
      req.user.id,
    );
    res.status(201).json({ message: "Recipe added successfully", recipe });
  } catch (e) {
    res.status(500).json({ message: "Failed to add recipe", error: e.message });
  }
};

const getRecipes = async (req, res) => {
  try {
    const { category, favorite, search, scope } = req.query;
    let recipes;
    if (scope === "all") {
      recipes = await getAllRecipesForFeed(req.user.id);
    } else if (scope === "favorites") {
      recipes = await getFavoriteRecipesByUser(req.user.id);
    } else {
      recipes = await getAllRecipesByUser(req.user.id);
    }
    if (category) {
      recipes = recipes.filter((r) => r.category === category);
    }
    if (favorite === "true") {
      recipes = recipes.filter((r) => r.is_favorite);
    }
    if (search) {
      const keyword = search.toLowerCase();
      recipes = recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(keyword) ||
          (r.description || "").toLowerCase().includes(keyword),
      );
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
    const {
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
    } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Recipe title is required" });
    }
    const prepTime = Number(prepTimeMinutes) || 0;
    const cookTime = Number(cookTimeMinutes) || 0;
    const servingsCount = Number(servings) || 1;
    if (prepTime < 0 || cookTime < 0) {
      return res.status(400).json({ message: "Prep and cook time must be positive numbers" });
    }
    if (servingsCount < 1) {
      return res.status(400).json({ message: "Servings must be at least 1" });
    }
    const recipe = await updateRecipeById(
      req.params.id,
      req.user.id,
      title,
      description || "",
      ingredients || "",
      instructions || "",
      prepTime,
      cookTime,
      servingsCount,
      category || "",
      imageUrl || "",
      isPublic !== false,
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
    const recipe = await getRecipeById(req.params.id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    if (isFavorite) {
      await addFavorite(req.user.id, req.params.id);
    } else {
      await removeFavorite(req.user.id, req.params.id);
    }
    res
      .status(200)
      .json({ message: "Favorite updated", recipe: { ...recipe, is_favorite: !!isFavorite } });
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
