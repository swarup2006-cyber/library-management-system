import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigationSections = [
    {
      title: "Core Modules",
      items: [
        { to: "/", label: "Dashboard", description: "Overview and analytics" },
        { to: "/books", label: "Book Search", description: "Browse and filter catalog" },
        user
          ? { to: "/borrow", label: "Transactions", description: "Issue, return, and dues" }
          : null,
      ].filter(Boolean),
    },
    {
      title: "Account",
      items: user
        ? [
            { to: "/profile", label: "Profile", description: "Profile and security" },
            ...(user.role === "admin"
              ? [
                  {
                    to: "/admin",
                    label: "Admin Portal",
                    description: "Books, users, reports, and settings",
                  },
                ]
              : []),
          ]
        : [
            { to: "/login", label: "Login", description: "Secure sign-in" },
            { to: "/register", label: "Signup", description: "Member onboarding" },
          ],
    },
  ];

  return (
    <aside className="navbar workspace-sidebar">
      <div className="sidebar-top">
        <NavLink to="/" className="brand-lockup">
          <span className="brand-seal">LM</span>
          <span className="brand-copy">
            <strong>Library Management</strong>
            <small>Professional circulation workspace</small>
          </span>
        </NavLink>
      </div>

      <div className="sidebar-summary">
        <span className="sidebar-kicker">Live Modules</span>
        <h2>Search, circulation, users, and book access in one place.</h2>
        <div className="sidebar-badges">
          <span className="sidebar-badge">Responsive UI</span>
          <span className="sidebar-badge">Role-Based Access</span>
          <span className="sidebar-badge">Book Names</span>
        </div>
      </div>

      <div className="sidebar-nav">
        {navigationSections.map((section) => (
          <section key={section.title} className="sidebar-section">
            <span className="sidebar-section-title">{section.title}</span>
            <div className="sidebar-links">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    isActive ? "sidebar-link active" : "sidebar-link"
                  }
                >
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="user-chip sidebar-user-chip">
              <span className="user-chip-label">Signed in</span>
              <strong>{user.name}</strong>
              <small>{user.role === "admin" ? "Administrator" : "Student / Member"}</small>
            </div>
            <div className="sidebar-footer-actions">
              <NavLink to="/profile" className="ghost-button">
                Profile
              </NavLink>
              <button
                type="button"
                className="ghost-button muted-action"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="sidebar-footer-actions">
            <NavLink to="/login" className="ghost-button">
              Login
            </NavLink>
            <NavLink to="/register" className="primary-button">
              Signup
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
