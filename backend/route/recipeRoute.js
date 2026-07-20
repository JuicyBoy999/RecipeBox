const express = require("express");
const router = express.Router();
const {
  addRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  toggleFavorite,
  deleteRecipe,
} = require("../controller/recipeController");
const { verifyToken } = require("../middleware/verifyToken");

router.use(verifyToken);

router.post("/", addRecipe);
router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.put("/:id", updateRecipe);
router.patch("/:id/favorite", toggleFavorite);
router.delete("/:id", deleteRecipe);

module.exports = router;
