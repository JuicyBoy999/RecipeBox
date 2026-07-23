import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import { ArrowLeftIcon, PlusIcon, TrashIcon, GlobeIcon, LockIcon } from "../component/icons";
import { addRecipe, updateRecipe, getRecipeById } from "../service/Api";
import "./FormPage.css";

function linesToList(text) {
  const lines = (text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.length ? lines : [""];
}

function AddEditRecipe() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("");
  const [cookTimeMinutes, setCookTimeMinutes] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [ingredientsList, setIngredientsList] = useState([""]);
  const [instructionsList, setInstructionsList] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;
    const loadRecipe = async () => {
      try {
        const response = await getRecipeById(id);
        const recipe = response.data.recipe;
        setTitle(recipe.title);
        setDescription(recipe.description || "");
        setPrepTimeMinutes(String(recipe.prep_time_minutes ?? ""));
        setCookTimeMinutes(String(recipe.cook_time_minutes ?? ""));
        setServings(String(recipe.servings ?? ""));
        setCategory(recipe.category || "");
        setImageUrl(recipe.image_url || "");
        setIsPublic(recipe.is_public !== false);
        setIngredientsList(linesToList(recipe.ingredients));
        setInstructionsList(linesToList(recipe.instructions));
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id, isEditMode]);

  const updateListItem = (list, setList, index, value) => {
    setList(list.map((item, i) => (i === index ? value : item)));
  };

  const addListItem = (list, setList) => {
    setList([...list, ""]);
  };

  const removeListItem = (list, setList, index) => {
    if (list.length === 1) {
      setList([""]);
      return;
    }
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a recipe title");
      return;
    }
    const prepTimeValue = prepTimeMinutes === "" ? 0 : Number(prepTimeMinutes);
    const cookTimeValue = cookTimeMinutes === "" ? 0 : Number(cookTimeMinutes);
    const servingsValue = servings === "" ? 1 : Number(servings);
    if (Number.isNaN(prepTimeValue) || prepTimeValue < 0) {
      toast.error("Prep time must be a positive number");
      return;
    }
    if (Number.isNaN(cookTimeValue) || cookTimeValue < 0) {
      toast.error("Cook time must be a positive number");
      return;
    }
    if (Number.isNaN(servingsValue) || servingsValue < 1) {
      toast.error("Servings must be at least 1");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      prepTimeMinutes: prepTimeValue,
      cookTimeMinutes: cookTimeValue,
      servings: servingsValue,
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      isPublic,
      ingredients: ingredientsList.map((line) => line.trim()).filter(Boolean).join("\n"),
      instructions: instructionsList.map((line) => line.trim()).filter(Boolean).join("\n"),
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

              <label className="field field-full">
                <span>Description</span>
                <textarea
                  placeholder="A short description of the dish"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <div className="field-row field-row-triple">
                <label className="field">
                  <span>Prep time (minutes)</span>
                  <input
                    type="number"
                    placeholder="10"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  />
                </label>
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
                  <span>Servings</span>
                  <input
                    type="number"
                    placeholder="4"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </label>
              </div>

              <div className="field-row">
                <label className="field">
                  <span>Category</span>
                  <input
                    type="text"
                    placeholder="e.g. Breakfast, Dessert"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Image URL</span>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </label>
              </div>

              {imageUrl.trim() && (
                <img src={imageUrl.trim()} alt="Recipe preview" className="image-preview" />
              )}

              <label className="visibility-toggle">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="visibility-toggle-label">
                  {isPublic ? <GlobeIcon /> : <LockIcon />}
                  {isPublic ? "Public — visible to everyone" : "Private — only visible to you"}
                </span>
              </label>

              <div className="field field-full">
                <span>Ingredients</span>
                <div className="dynamic-list">
                  {ingredientsList.map((line, index) => (
                    <div className="dynamic-list-row" key={index}>
                      <input
                        type="text"
                        placeholder="e.g. 2 cups flour"
                        value={line}
                        onChange={(e) =>
                          updateListItem(ingredientsList, setIngredientsList, index, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removeListItem(ingredientsList, setIngredientsList, index)}
                        title="Remove ingredient"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-row-button"
                    onClick={() => addListItem(ingredientsList, setIngredientsList)}
                  >
                    <PlusIcon /> Add ingredient
                  </button>
                </div>
              </div>

              <div className="field field-full">
                <span>Instructions</span>
                <div className="dynamic-list">
                  {instructionsList.map((line, index) => (
                    <div className="dynamic-list-row" key={index}>
                      <span className="step-number">{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Describe this step"
                        value={line}
                        onChange={(e) =>
                          updateListItem(instructionsList, setInstructionsList, index, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removeListItem(instructionsList, setInstructionsList, index)}
                        title="Remove step"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-row-button"
                    onClick={() => addListItem(instructionsList, setInstructionsList)}
                  >
                    <PlusIcon /> Add step
                  </button>
                </div>
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
