import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../component/Navbar";
import { getPantryItems, deletePantryItem } from "../service/Api";
import "../component/Modal.css";
import "./Pantry.css";

function Pantry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getPantryItems();
      setItems(response.data.items);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load pantry items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deletePantryItem(itemToDelete.id);
      toast.success("Item deleted");
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="pantry-page">
        <div className="pantry-header">
          <h1>Pantry</h1>
          <div className="pantry-header-actions">
            <button onClick={loadItems} title="Refresh">
              ⟳
            </button>
            <Link to="/pantry/new" className="add-button" title="Add item">
              +
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">No pantry items yet. Tap + to add one.</p>
        ) : (
          <div className="pantry-list">
            {items.map((item) => (
              <div className="pantry-card" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  {Number(item.quantity) <= 0 ? (
                    <p className="out-of-stock">Out of stock</p>
                  ) : (
                    <p className="pantry-meta">
                      {item.quantity} {item.unit}
                    </p>
                  )}
                </div>
                <div className="pantry-actions">
                  <Link to={`/pantry/${item.id}/edit`} title="Edit">
                    ✎
                  </Link>
                  <button onClick={() => setItemToDelete(item)} title="Delete">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {itemToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete item?</h3>
            <p>"{itemToDelete.name}" will be permanently deleted.</p>
            <div className="modal-actions">
              <button onClick={() => setItemToDelete(null)}>Cancel</button>
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

export default Pantry;
