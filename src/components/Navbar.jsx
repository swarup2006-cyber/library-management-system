import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { initials } from "../utils/formatters";
import BrandLogo from "./common/BrandLogo";

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="topbar-icon"
    >
      <path
        d="M9 18h6M10.5 21h3M6 17.5h12c-1.2-1.3-2-3.2-2-5.2V10a4 4 0 1 0-8 0v2.3c0 2-.8 3.9-2 5.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar({ title, subtitle, onMenuToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const notificationsPath =
    user?.role === "admin" ? "/admin/notifications" : "/student/notifications";
  const profilePath = user?.role === "admin" ? "/admin/profile" : "/student/profile";
  const unreadLabel = user?.unreadCount
    ? `${user.unreadCount} unread notifications`
    : "Notifications";

  const handleLogout = async () => {
    await logout();
    navigate(user?.role === "admin" ? "/admin/login" : "/student/login");
  };

  return (
    <header className="app-topbar">
      <div className="topbar-heading">
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
        <div className="topbar-copy">
          <p className="text-body-secondary small mb-1">{subtitle}</p>
          <h2 className="h5 mb-0">{title}</h2>
        </div>
      </div>

      <div className="topbar-actions">
        {user ? (
          <Link
            to={notificationsPath}
            className={`btn btn-outline-secondary position-relative topbar-control topbar-icon-button ${
              user.unreadCount ? "has-unread" : ""
            }`}
            aria-label={unreadLabel}
            title={unreadLabel}
          >
            <BellIcon />
            {user.unreadCount ? (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger topbar-notification-badge">
                {user.unreadCount > 99 ? "99+" : user.unreadCount}
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
            <Link to={profilePath} className="avatar-pill" aria-label="Open profile" title="Open profile">
              <span>{initials(user.name)}</span>
            </Link>
            <button type="button" className="btn btn-primary topbar-control" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
