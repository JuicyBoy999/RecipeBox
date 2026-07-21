import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../service/Api";
import { BookIcon, BoxIcon, StarIcon } from "../component/icons";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      toast.success("Account created. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
          <h1>Create an account</h1>
          <p>Get started with RecipeBox</p>
          <form onSubmit={handleRegister}>
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="primary-button auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
