import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import { StarIcon, EditIcon, TrashIcon, RefreshIcon, SearchIcon } from "../component/icons";
import { getRecipes, deleteRecipe, toggleFavorite } from "../service/Api";
import "../component/Modal.css";
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
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="app-main-inner">
          <div className="dashboard-header">
            <div>
              <p className="eyebrow">Hello, {userName || "there"}</p>
              <h1>What would you like to cook?</h1>
            </div>
            <div className="dashboard-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search recipes by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard-toolbar">
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
            <div className="dashboard-toolbar-actions">
              <span className="recipe-count">{recipes.length} recipes</span>
              <button className="icon-button" onClick={loadRecipes} title="Refresh">
                <RefreshIcon />
              </button>
              <button
                className={showFavoritesOnly ? "icon-button active" : "icon-button"}
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                title="Show favorites only"
              >
                <StarIcon filled={showFavoritesOnly} />
              </button>
            </div>
          </div>

          {loading ? (
            <p className="hint">Loading...</p>
          ) : visibleRecipes.length === 0 ? (
            <div className="empty-state">
              <h3>{recipes.length === 0 ? "No recipes yet" : "No recipes match"}</h3>
              <p>
                {recipes.length === 0
                  ? "Add your first recipe to get started."
                  : "Try a different category, search, or clear filters."}
              </p>
            </div>
          ) : (
            <div className="recipe-grid">
              {visibleRecipes.map((recipe) => (
                <div className="recipe-card" key={recipe.id}>
                  <div className="recipe-card-top">
                    {recipe.category && <span className="badge">{recipe.category}</span>}
                    <button
                      className={recipe.is_favorite ? "star-button active" : "star-button"}
                      onClick={() => handleToggleFavorite(recipe)}
                      title="Favorite"
                    >
                      <StarIcon filled={recipe.is_favorite} />
                    </button>
                  </div>
                  <Link to={`/recipes/${recipe.id}`} className="recipe-card-title">
                    <h3>{recipe.title}</h3>
                  </Link>
                  <p className="recipe-meta">{recipe.cook_time_minutes} min</p>
                  <div className="recipe-card-footer">
                    <Link to={`/recipes/${recipe.id}/edit`} title="Edit">
                      <EditIcon /> Edit
                    </Link>
                    <button onClick={() => setRecipeToDelete(recipe)} title="Delete">
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
