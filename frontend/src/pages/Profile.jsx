import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../component/Sidebar";
import { getProfile, updateProfile, deleteProfile } from "../service/Api";
import "../component/Modal.css";
import "./FormPage.css";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile(userId);
        setName(response.data.user.name);
        setEmail(response.data.user.email);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(userId, { name: name.trim() });
      localStorage.setItem("userName", name.trim());
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteProfile(userId);
      toast.success("Account deleted successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="app-main-inner form-page-inner form-page-narrow">
          <p className="eyebrow">Account</p>
          <h1>Profile</h1>
          <p className="subhead">Manage your name and account.</p>

          {loading ? (
            <p className="hint">Loading...</p>
          ) : (
            <>
              <form className="form-card" onSubmit={handleSave}>
                <div className="profile-avatar">{name.charAt(0).toUpperCase() || "?"}</div>
                <label className="field field-full">
                  <span>Name</span>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="field field-full">
                  <span>Email</span>
                  <input type="email" value={email} disabled />
                </label>
                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

              <div className="danger-zone">
                <div>
                  <h3>Delete account</h3>
                  <p>Permanently remove your account, recipes, and pantry items.</p>
                </div>
                <button className="danger-button" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete account?</h3>
            <p>This permanently deletes your account and profile. This cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="danger" onClick={confirmDeleteAccount}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
