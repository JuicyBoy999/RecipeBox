import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../service/Api";
import { BookIcon, BoxIcon, StarIcon } from "../component/icons";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      toast.success(response.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
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
          <h1>Forgot password</h1>
          <p>We'll email you a link to reset it.</p>

          {sent ? (
            <p className="hint">
              Check your inbox for the reset link. It expires in 15 minutes.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" className="primary-button auth-submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
