import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const token = localStorage.getItem("token");

  return (
    <div className="not-found-page">
      <div className="brand-mark not-found-mark">R</div>
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to={token ? "/dashboard" : "/login"} className="primary-button">
        {token ? "Back to Dashboard" : "Back to Sign In"}
      </Link>
    </div>
  );
}

export default NotFound;
