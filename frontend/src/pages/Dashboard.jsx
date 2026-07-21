import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../component/Navbar";
import { getRecipes, deleteRecipe, toggleFavorite } from "../service/Api";
import "./Dashboard.css";

function Dashboard() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const userName = localStorage.getItem("userName");

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const response = await getRecipes();
      setRecipes(response.data.recipes);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(recipes.filter((r) => r.category).map((r) => r.category));
    return [...set];
  }, [recipes]);

  const visibleRecipes = useMemo(() => {
    return recipes
      .filter((r) => !selectedCategory || r.category === selectedCategory)
      .filter((r) => !showFavoritesOnly || r.is_favorite)
      .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()));
  }, [recipes, selectedCategory, showFavoritesOnly, search]);

  const handleToggleFavorite = async (recipe) => {
    try {
      await toggleFavorite(recipe.id, !recipe.is_favorite);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? { ...r, is_favorite: !r.is_favorite } : r)),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update favorite");
    }
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      await deleteRecipe(recipeToDelete.id);
      toast.success("Recipe deleted");
      setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete recipe");
    } finally {
      setRecipeToDelete(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <p className="greeting">Hello, {userName || "there"}!</p>
          <h1>What would you like to cook?</h1>
        </div>

        <div className="category-chips">
          <button
            className={!selectedCategory ? "chip active" : "chip"}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? "chip active" : "chip"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="dashboard-toolbar">
          <input
            type="text"
            placeholder="Search recipes by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={loadRecipes} title="Refresh">
            ⟳
          </button>
          <button
            className={showFavoritesOnly ? "favorite-toggle active" : "favorite-toggle"}
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            title="Show favorites only"
          >
            {showFavoritesOnly ? "★" : "☆"}
          </button>
        </div>

        <div className="recipe-count">Popular Recipes ({recipes.length})</div>

        {loading ? (
          <p>Loading...</p>
        ) : visibleRecipes.length === 0 ? (
          <p className="empty-state">
            {recipes.length === 0
              ? "No recipes yet. Add your first one!"
              : "No recipes match your filters."}
          </p>
        ) : (
          <div className="recipe-list">
            {visibleRecipes.map((recipe) => (
              <div className="recipe-card" key={recipe.id}>
                <div>
                  <h3>{recipe.title}</h3>
                  <p className="recipe-meta">
                    {recipe.category ? `${recipe.category} · ` : ""}
                    {recipe.cook_time_minutes} min
                  </p>
                </div>
                <div className="recipe-actions">
                  <button onClick={() => handleToggleFavorite(recipe)} title="Favorite">
                    {recipe.is_favorite ? "★" : "☆"}
                  </button>
                  <Link to={`/recipes/${recipe.id}/edit`} title="Edit">
                    ✎
                  </Link>
                  <button onClick={() => setRecipeToDelete(recipe)} title="Delete">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {recipeToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete recipe?</h3>
            <p>"{recipeToDelete.title}" will be permanently deleted.</p>
            <div className="modal-actions">
              <button onClick={() => setRecipeToDelete(null)}>Cancel</button>
              <button className="danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
