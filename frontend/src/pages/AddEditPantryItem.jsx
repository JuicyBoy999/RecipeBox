import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { addPantryItem, updatePantryItem, getPantryItemById } from "../service/Api";
import "./FormPage.css";

function AddEditPantryItem() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;
    const loadItem = async () => {
      try {
        const response = await getPantryItemById(id);
        const item = response.data.item;
        setName(item.name);
        setQuantity(String(item.quantity ?? ""));
        setUnit(item.unit || "");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    const quantityValue = quantity === "" ? 0 : Number(quantity);
    if (quantity !== "" && (Number.isNaN(quantityValue) || quantityValue < 0)) {
      toast.error("Quantity must be a positive number");
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      quantity: quantityValue,
      unit: unit.trim(),
    };
    try {
      if (isEditMode) {
        await updatePantryItem(id, payload);
        toast.success("Item updated successfully");
      } else {
        await addPantryItem(payload);
        toast.success("Item added successfully");
      }
      navigate("/pantry");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="form-page">
      <Link to="/pantry" className="back-link">
        ← Back
      </Link>
      <h1>{isEditMode ? "Edit Pantry Item" : "Add Pantry Item"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="text"
          placeholder="Unit (e.g. cups, g, pcs)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditMode ? "Save Changes" : "Add Item"}
        </button>
      </form>
    </div>
  );
}

export default AddEditPantryItem;
