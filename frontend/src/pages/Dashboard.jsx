import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import {
  StarIcon,
  EditIcon,
  TrashIcon,
  RefreshIcon,
  SearchIcon,
  PantryFilterIcon,
  LockIcon,
} from "../component/icons";
import { getRecipes, deleteRecipe, toggleFavorite, getPantryItems } from "../service/Api";
import "../component/Modal.css";
import "./Dashboard.css";

function matchPercent(recipe, pantryNames) {
  const lines = (recipe.ingredients || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return 0;
  const matched = lines.filter((line) =>
    pantryNames.some((name) => line.toLowerCase().includes(name)),
  ).length;
  return Math.round((matched / lines.length) * 100);
}

function Dashboard() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("mine");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [useMyPantry, setUseMyPantry] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);
  const [search, setSearch] = useState("");
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const userName = localStorage.getItem("userName");

  const loadRecipes = async (activeScope) => {
    setLoading(true);
    try {
      const response = await getRecipes({ scope: activeScope });
      setRecipes(response.data.recipes);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory(null);
    loadRecipes(scope);
  }, [scope]);

  useEffect(() => {
    getPantryItems()
      .then((response) => setPantryItems(response.data.items))
      .catch(() => setPantryItems([]));
  }, []);

  const pantryNames = useMemo(
    () => pantryItems.map((item) => item.name.toLowerCase()),
    [pantryItems],
  );

  const categories = useMemo(() => {
    const set = new Set(recipes.filter((r) => r.category).map((r) => r.category));
    return [...set];
  }, [recipes]);

  const visibleRecipes = useMemo(() => {
    let list = recipes
      .filter((r) => !selectedCategory || r.category === selectedCategory)
      .filter((r) => !showFavoritesOnly || r.is_favorite)
      .filter(
        (r) =>
          !search ||
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          (r.description || "").toLowerCase().includes(search.toLowerCase()),
      );
    if (useMyPantry) {
      list = list
        .map((r) => ({ ...r, matchPercent: matchPercent(r, pantryNames) }))
        .filter((r) => r.matchPercent > 0)
        .sort((a, b) => b.matchPercent - a.matchPercent);
    }
    return list;
  }, [recipes, selectedCategory, showFavoritesOnly, search, useMyPantry, pantryNames]);

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
                placeholder="Search recipes by title or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="scope-toggle">
            <button
              className={scope === "mine" ? "scope-tab active" : "scope-tab"}
              onClick={() => setScope("mine")}
            >
              My Recipes
            </button>
            <button
              className={scope === "all" ? "scope-tab active" : "scope-tab"}
              onClick={() => setScope("all")}
            >
              Everyone
            </button>
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
              <span className="recipe-count">{visibleRecipes.length} recipes</span>
              <button className="icon-button" onClick={() => loadRecipes(scope)} title="Refresh">
                <RefreshIcon />
              </button>
              <button
                className={showFavoritesOnly ? "icon-button active" : "icon-button"}
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                title="Show favorites only"
              >
                <StarIcon filled={showFavoritesOnly} />
              </button>
              <button
                className={useMyPantry ? "icon-button active" : "icon-button"}
                onClick={() => setUseMyPantry((prev) => !prev)}
                title="Use my pantry — only show recipes I can make"
              >
                <PantryFilterIcon />
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
                  : useMyPantry
                    ? "None of your recipes match what's in your pantry right now."
                    : "Try a different category, search, or clear filters."}
              </p>
            </div>
          ) : (
            <div className="recipe-grid">
              {visibleRecipes.map((recipe) => (
                <div className="recipe-card" key={recipe.id}>
                  {recipe.image_url && (
                    <img src={recipe.image_url} alt={recipe.title} className="recipe-card-image" />
                  )}
                  <div className="recipe-card-top">
                    <div className="recipe-card-badges">
                      {recipe.category && <span className="badge">{recipe.category}</span>}
                      {useMyPantry && (
                        <span className="badge">{recipe.matchPercent}% match</span>
                      )}
                      {recipe.is_own && !recipe.is_public && (
                        <span className="badge" title="Private">
                          <LockIcon width={12} height={12} />
                        </span>
                      )}
                    </div>
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
                  {recipe.description && <p className="recipe-description">{recipe.description}</p>}
                  <p className="recipe-meta">
                    {recipe.cook_time_minutes} min
                    {!recipe.is_own && <span className="recipe-author"> · by {recipe.author_name}</span>}
                  </p>
                  {recipe.is_own && (
                    <div className="recipe-card-footer">
                      <Link to={`/recipes/${recipe.id}/edit`} title="Edit">
                        <EditIcon /> Edit
                      </Link>
                      <button onClick={() => setRecipeToDelete(recipe)} title="Delete">
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  )}
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
