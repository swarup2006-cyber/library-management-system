import { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    const targetLoginPath = user?.role === "admin" ? "/admin-login" : "/student-login";

    await logout();
    navigate(targetLoginPath);
  };

  const isAdmin = user?.role === "admin";
  const navigationSections = isAdmin
    ? [
        {
          title: "Library",
          items: [
            { to: "/admin", label: "Dashboard", description: "Admin dashboard" },
            { href: "/admin#issue-return", label: "Assign Book", description: "Issue book" },
            { href: "/admin#issue-return", label: "Return Book", description: "Return workflow" },
            { href: "/admin#book-inventory", label: "Books", description: "Book catalog" },
            { href: "/admin#book-form", label: "Add Book", description: "New inventory" },
            { href: "/admin#user-list", label: "Users", description: "User list" },
            { href: "/admin#user-form", label: "Add User", description: "New account" },
          ],
        },
        {
          title: "Account",
          items: [
            { to: "/", label: "Main Dashboard", description: "Reader overview" },
            { to: "/profile", label: "Profile", description: "Profile and security" },
          ],
        },
      ]
    : [
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
              ]
            : [
                { to: "/student-login", label: "Student Login", description: "Reader access" },
                { to: "/admin-login", label: "Admin Login", description: "Staff portal" },
                { to: "/admin-signup", label: "Admin Signup", description: "Create staff account" },
                { to: "/register", label: "Signup", description: "Member onboarding" },
              ],
        },
      ];

  return (
    <aside className={`navbar workspace-sidebar ${isAdmin ? "admin-sidebar" : ""}`}>
      <div className="sidebar-top">
        <NavLink to="/" className="brand-lockup">
          <span className="brand-seal">LM</span>
          <span className="brand-copy">
            <strong>{isAdmin ? "Library" : "Library Management"}</strong>
            <small>{isAdmin ? "Admin dashboard" : "Professional circulation workspace"}</small>
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
                item.href ? (
                  <a key={item.href + item.label} href={item.href} className="sidebar-link">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </a>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      isActive || (item.to === "/admin" && location.pathname === "/admin")
                        ? "sidebar-link active"
                        : "sidebar-link"
                    }
                  >
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </NavLink>
                )
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
            <NavLink to="/student-login" className="ghost-button">
              Student Login
            </NavLink>
            <NavLink to="/admin-login" className="ghost-button muted-action">
              Admin Login
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
