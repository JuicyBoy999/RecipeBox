import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import { EditIcon, TrashIcon, RefreshIcon, PlusIcon } from "../component/icons";
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
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="app-main-inner">
          <div className="pantry-header">
            <div>
              <p className="eyebrow">Inventory</p>
              <h1>Pantry</h1>
            </div>
            <div className="pantry-header-actions">
              <button className="icon-button" onClick={loadItems} title="Refresh">
                <RefreshIcon />
              </button>
              <Link to="/pantry/new" className="primary-button">
                <PlusIcon /> Add Item
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="hint">Loading...</p>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>No pantry items yet</h3>
              <p>Add ingredients you have on hand to track what's running low.</p>
            </div>
          ) : (
            <div className="pantry-grid">
              {items.map((item) => (
                <div className="pantry-card" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    {Number(item.quantity) <= 0 ? (
                      <span className="badge danger">Out of stock</span>
                    ) : (
                      <span className="badge">
                        {item.quantity} {item.unit}
                      </span>
                    )}
                  </div>
                  <div className="pantry-card-footer">
                    <Link to={`/pantry/${item.id}/edit`} title="Edit">
                      <EditIcon /> Edit
                    </Link>
                    <button onClick={() => setItemToDelete(item)} title="Delete">
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
