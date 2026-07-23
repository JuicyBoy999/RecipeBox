import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  ShareIcon,
  GlobeIcon,
  LockIcon,
} from "../component/icons";
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, url: shareUrl });
      } catch {
        // user cancelled the share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Recipe link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
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
              {recipe.image_url && (
                <img src={recipe.image_url} alt={recipe.title} className="recipe-detail-image" />
              )}
              <div className="recipe-detail-header">
                <div>
                  <div className="recipe-detail-badges">
                    {recipe.category && <span className="badge">{recipe.category}</span>}
                    {recipe.is_own && (
                      <span className="badge">
                        {recipe.is_public ? <GlobeIcon width={13} height={13} /> : <LockIcon width={13} height={13} />}
                        {recipe.is_public ? " Public" : " Private"}
                      </span>
                    )}
                  </div>
                  <h1>{recipe.title}</h1>
                  {recipe.description && <p className="recipe-detail-description">{recipe.description}</p>}
                  <p className="recipe-detail-meta">
                    Prep {recipe.prep_time_minutes} min · Cook {recipe.cook_time_minutes} min · Serves{" "}
                    {recipe.servings}
                    {!recipe.is_own && <span className="recipe-author"> · by {recipe.author_name}</span>}
                  </p>
                </div>
                <div className="recipe-detail-actions">
                  <button className="icon-button" onClick={handleShare} title="Share">
                    <ShareIcon />
                  </button>
                  <button
                    className={recipe.is_favorite ? "icon-button active" : "icon-button"}
                    onClick={handleToggleFavorite}
                    title="Favorite"
                  >
                    <StarIcon filled={recipe.is_favorite} />
                  </button>
                  {recipe.is_own && (
                    <>
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
                    </>
                  )}
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
                    <ol className="recipe-instructions">
                      {recipe.instructions
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                    </ol>
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
