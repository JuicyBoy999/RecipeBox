import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <Link to="/dashboard" className="back-link">
          ← Back
        </Link>
        <h1>{isEditMode ? "Edit Recipe" : "Add Recipe"}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Recipe title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Cook time (minutes)"
            value={cookTimeMinutes}
            onChange={(e) => setCookTimeMinutes(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category (e.g. Breakfast, Dessert)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <textarea
            placeholder="Ingredients (one per line)"
            rows={4}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <textarea
            placeholder="Instructions"
            rows={6}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Save Changes" : "Add Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditRecipe;
