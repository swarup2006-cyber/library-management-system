import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../common/BrandLogo";

export default function Sidebar({ role, navItems, open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`app-sidebar ${open ? "show" : ""}`}>
        <div>
          <div className="sidebar-brand mb-4">
            <BrandLogo inverted />
          </div>

          <div className="card border-0 shadow-sm glass-surface mb-4">
            <div className="card-body">
              <p className="text-uppercase small fw-semibold text-primary mb-2">
                Signed in as
              </p>
              <h2 className="h6 mb-1">{user?.name}</h2>
              <p className="text-body-secondary small mb-0">
                {role === "admin"
                  ? "Manages circulation, reports, and inventory"
                  : `${user?.studentId || "Student account"} - ${user?.department || "Member"}`}
              </p>
            </div>
          </div>

          <nav className="nav flex-column gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "nav-link sidebar-link active" : "nav-link sidebar-link"
                }
              >
                <span className="fw-semibold d-block">{item.label}</span>
                <small className="text-body-secondary">{item.description}</small>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="card border-0 glass-surface mt-4">
          <div className="card-body">
            <p className="text-uppercase small fw-semibold text-primary mb-2">
              {role === "admin" ? "Operations" : "Borrowing"}
            </p>
            <p className="small text-body-secondary mb-0">
              {role === "admin"
                ? "Approve return requests and manage circulation from one place."
                : "Browse books, request returns, and watch notifications without leaving the workspace."}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
