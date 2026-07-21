import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import { ArrowLeftIcon } from "../component/icons";
import { addRecipe, updateRecipe, getRecipeById } from "../service/Api";
import "./FormPage.css";

function AddEditRecipe() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [cookTimeMinutes, setCookTimeMinutes] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;
    const loadRecipe = async () => {
      try {
        const response = await getRecipeById(id);
        const recipe = response.data.recipe;
        setTitle(recipe.title);
        setCookTimeMinutes(String(recipe.cook_time_minutes ?? ""));
        setCategory(recipe.category || "");
        setIngredients(recipe.ingredients || "");
        setInstructions(recipe.instructions || "");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a recipe title");
      return;
    }
    const cookTimeValue = cookTimeMinutes === "" ? 0 : Number(cookTimeMinutes);
    if (cookTimeMinutes !== "" && (Number.isNaN(cookTimeValue) || cookTimeValue < 0)) {
      toast.error("Cook time must be a positive number");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      cookTimeMinutes: cookTimeValue,
      category: category.trim(),
      ingredients,
      instructions,
    };
    try {
      if (isEditMode) {
        await updateRecipe(id, payload);
        toast.success("Recipe updated successfully");
      } else {
        await addRecipe(payload);
        toast.success("Recipe added successfully");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save recipe");
    } finally {
      setSaving(false);
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
          <h1>{isEditMode ? "Edit Recipe" : "Add Recipe"}</h1>
          <p className="subhead">
            {isEditMode ? "Update the details below." : "Fill in the details for your new recipe."}
          </p>

          {loading ? (
            <p className="hint">Loading...</p>
          ) : (
            <form className="form-card" onSubmit={handleSubmit}>
              <label className="field field-full">
                <span>Recipe title</span>
                <input
                  type="text"
                  placeholder="e.g. Chocolate Chip Cookies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Cook time (minutes)</span>
                  <input
                    type="number"
                    placeholder="25"
                    value={cookTimeMinutes}
                    onChange={(e) => setCookTimeMinutes(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Category</span>
                  <input
                    type="text"
                    placeholder="e.g. Breakfast, Dessert"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span>Ingredients</span>
                  <textarea
                    placeholder="One per line"
                    rows={8}
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Instructions</span>
                  <textarea
                    placeholder="Step by step"
                    rows={8}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : isEditMode ? "Save Changes" : "Add Recipe"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default AddEditRecipe;
