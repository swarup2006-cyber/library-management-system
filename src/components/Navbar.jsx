import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { initials } from "../utils/formatters";
import BrandLogo from "./common/BrandLogo";

export default function Navbar({ title, subtitle, onMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate(user?.role === "admin" ? "/admin/login" : "/student/login");
  };

  return (
    <header className="app-topbar border-bottom">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary d-lg-none topbar-control"
          onClick={onMenuToggle}
        >
          Menu
        </button>
        <Link to={user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
          <BrandLogo compact />
        </Link>
        <div>
          <p className="text-body-secondary small mb-1">{subtitle}</p>
          <h2 className="h5 mb-0">{title}</h2>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-sm-3">
        {user ? (
          <Link
            to={user.role === "admin" ? "/admin/profile" : "/student/notifications"}
            className="btn btn-outline-secondary position-relative topbar-control"
          >
            {user.role === "admin" ? "Profile" : "Alerts"}
            {user.unreadCount ? (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {user.unreadCount}
              </span>
            ) : null}
          </Link>
        ) : null}

        <button
          type="button"
          className="btn btn-outline-secondary topbar-control"
          onClick={toggleTheme}
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        {user ? (
          <>
            <div className="avatar-pill">
              <span>{initials(user.name)}</span>
            </div>
            <button type="button" className="btn btn-primary topbar-control" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
