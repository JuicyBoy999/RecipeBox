import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../component/Navbar";
import { getProfile, updateProfile, deleteProfile } from "../service/Api";
import "../component/Modal.css";
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    toast.success("Logged out");
    navigate("/login");
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="profile-page">
        <h1>Profile</h1>
        <form onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input type="email" value={email} disabled />
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <button className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
        <button className="danger-button" onClick={() => setShowDeleteConfirm(true)}>
          Delete Account
        </button>
      </div>

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
