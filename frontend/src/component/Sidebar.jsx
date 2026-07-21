import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HomeIcon, PlusIcon, BoxIcon, UserIcon, LogoutIcon } from "./icons";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    toast.success("Logged out");
    navigate("/login");
  };

  const linkClass = ({ isActive }) => "sidebar-link" + (isActive ? " active" : "");

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">R</span>
        RecipeBox
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>
          <HomeIcon /> Dashboard
        </NavLink>
        <NavLink to="/recipes/new" className={linkClass}>
          <PlusIcon /> Add Recipe
        </NavLink>
        <NavLink to="/pantry" className={linkClass}>
          <BoxIcon /> Pantry
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <UserIcon /> Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{userName || "Account"}</div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogoutIcon /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
