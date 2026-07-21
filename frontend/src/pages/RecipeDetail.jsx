import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import { ArrowLeftIcon, EditIcon, TrashIcon, StarIcon } from "../component/icons";
import { getRecipeById, deleteRecipe, toggleFavorite } from "../service/Api";
import "../component/Modal.css";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true);
      try {
        const response = await getRecipeById(id);
        setRecipe(response.data.recipe);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(recipe.id, !recipe.is_favorite);
      setRecipe((prev) => ({ ...prev, is_favorite: !prev.is_favorite }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update favorite");
    }
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteRecipe(id);
      toast.success("Recipe deleted");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete recipe");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="app-main-inner form-page-inner">
          <Link to="/dashboard" className="back-link">
            <ArrowLeftIcon /> Back to Dashboard
          </Link>

          {loading ? (
            <p className="hint">Loading...</p>
          ) : !recipe ? (
            <p className="hint">Recipe not found.</p>
          ) : (
            <div className="recipe-detail-card">
              <div className="recipe-detail-header">
                <div>
                  {recipe.category && <span className="badge">{recipe.category}</span>}
                  <h1>{recipe.title}</h1>
                  <p className="recipe-detail-meta">{recipe.cook_time_minutes} min</p>
                </div>
                <div className="recipe-detail-actions">
                  <button
                    className={recipe.is_favorite ? "icon-button active" : "icon-button"}
                    onClick={handleToggleFavorite}
                    title="Favorite"
                  >
                    <StarIcon filled={recipe.is_favorite} />
                  </button>
                  <Link to={`/recipes/${recipe.id}/edit`} className="icon-button" title="Edit">
                    <EditIcon />
                  </Link>
                  <button
                    className="icon-button"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="recipe-detail-body">
                <section>
                  <h3>Ingredients</h3>
                  {recipe.ingredients ? (
                    <ul>
                      {recipe.ingredients
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                    </ul>
                  ) : (
                    <p className="hint">No ingredients added.</p>
                  )}
                </section>
                <section>
                  <h3>Instructions</h3>
                  {recipe.instructions ? (
                    <p className="recipe-instructions">{recipe.instructions}</p>
                  ) : (
                    <p className="hint">No instructions added.</p>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete recipe?</h3>
            <p>"{recipe.title}" will be permanently deleted.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
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

export default RecipeDetail;
