import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../service/Api";
import { BookIcon, BoxIcon, StarIcon } from "../component/icons";
import "./Auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill both password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success("Password reset successfully. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-brand">
          <span className="brand-mark">R</span>
          RecipeBox
        </div>
        <h2>Everything you cook, in one place.</h2>
        <ul className="auth-panel-list">
          <li>
            <BookIcon /> Save and organize your recipes
          </li>
          <li>
            <StarIcon filled /> Favorite the ones you'll make again
          </li>
          <li>
            <BoxIcon /> Track what's in your pantry
          </li>
        </ul>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          {!token ? (
            <>
              <h1>Invalid link</h1>
              <p>This password reset link is missing or malformed.</p>
              <p className="auth-switch">
                <Link to="/forgot-password">Request a new link</Link>
              </p>
            </>
          ) : (
            <>
              <h1>Reset password</h1>
              <p>Choose a new password for your account.</p>
              <form onSubmit={handleSubmit}>
                <label className="field">
                  <span>New password</span>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
                <button type="submit" className="primary-button auth-submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
              <p className="auth-switch">
                <Link to="/login">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
