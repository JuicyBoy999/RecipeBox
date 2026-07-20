import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    toast.success("Logged out");
    navigate("/login");
  };

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="navbar">
      <div className="navbar-brand">RecipeBox</div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/recipes/new" className={linkClass}>
          Add Recipe
        </NavLink>
        <NavLink to="/pantry" className={linkClass}>
          Pantry
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
