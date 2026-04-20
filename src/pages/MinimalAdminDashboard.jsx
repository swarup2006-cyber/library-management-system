import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import API from "../services/api";

const sidebarItems = [
  { label: "Dashboard", icon: "dashboard", href: "#dashboard", active: true },
  { label: "Books", icon: "books", href: "#books" },
  { label: "Users", icon: "users", href: "#users" },
  { label: "Issue & Return", icon: "issue", href: "#issue-return" },
  { label: "Reports", icon: "reports", href: "#reports" },
  { label: "Settings", icon: "settings", href: "#settings" },
];

function Icon({ name }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    books: (
      <>
        <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
        <path d="M8 4v13a3 3 0 0 0 3 3" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
        <circle cx="9.5" cy="7.5" r="3.5" />
        <path d="M21 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" />
        <path d="M16 4.3a3.5 3.5 0 0 1 0 6.4" />
      </>
    ),
    issue: (
      <>
        <path d="M7 7h10" />
        <path d="M13 3l4 4-4 4" />
        <path d="M17 17H7" />
        <path d="M11 13l-4 4 4 4" />
      </>
    ),
    reports: (
      <>
        <path d="M5 20V4h14v16H5Z" />
        <path d="M9 15V9" />
        <path d="M12 15V6" />
        <path d="M15 15v-3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="m4.9 4.9 2.1 2.1" />
        <path d="m17 17 2.1 2.1" />
        <path d="m19.1 4.9-2.1 2.1" />
        <path d="m7 17-2.1 2.1" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    statBooks: (
      <>
        <path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3V4Z" />
        <path d="M8 4v13a3 3 0 0 0 3 3" />
      </>
    ),
    statIssued: (
      <>
        <path d="M4 12h12" />
        <path d="m12 6 6 6-6 6" />
      </>
    ),
    statAvailable: (
      <>
        <path d="m5 12 4 4L19 6" />
        <path d="M20 12a8 8 0 1 1-4.7-7.3" />
      </>
    ),
    statUsers: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M3 21a6 6 0 0 1 12 0" />
        <path d="M17 11a3 3 0 0 1 0 6" />
        <path d="M19 21a5 5 0 0 0-3-4.6" />
      </>
    ),
  };

  return (
    <svg className="minimal-admin-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Card({ children, className = "" }) {
  return <section className={`minimal-admin-card ${className}`}>{children}</section>;
}

function Sidebar() {
  return (
    <aside className="minimal-admin-sidebar">
      <div className="minimal-admin-brand">
        <span className="minimal-admin-logo">L</span>
        <div>
          <strong>Library</strong>
          <span>Admin</span>
        </div>
      </div>

      <nav className="minimal-admin-nav" aria-label="Admin navigation">
        {sidebarItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={
              item.active
                ? "minimal-admin-nav-link active"
                : "minimal-admin-nav-link"
            }
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

function Navbar({ user }) {
  const initials = (user?.name || "Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="minimal-admin-topbar">
      <label className="minimal-admin-search">
        <Icon name="search" />
        <input type="search" placeholder="Search books, users, reports..." />
      </label>

      <div className="minimal-admin-topbar-actions">
        <button type="button" className="minimal-icon-button" aria-label="Notifications">
          <Icon name="bell" />
        </button>
        <div className="minimal-admin-avatar" aria-label={user?.name || "Admin user"}>
          {initials}
        </div>
      </div>
    </header>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="minimal-stat-card">
      <div className="minimal-stat-icon">
        <Icon name={icon} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </Card>
  );
}

function formatDate(value) {
  if (!value) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function MinimalAdminDashboard() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [booksResponse, usersResponse, transactionsResponse] =
          await Promise.all([
            API.get("/books"),
            API.get("/users"),
            API.get("/users/transactions/all"),
          ]);

        if (!isMounted) {
          return;
        }

        setBooks(booksResponse.data.books || []);
        setUsers(usersResponse.data.users || []);
        setTransactions(transactionsResponse.data.transactions || []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load admin dashboard data."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalBooks = books.reduce(
      (sum, book) => sum + (Number(book.totalStock) || 1),
      0
    );
    const availableBooks = books.reduce(
      (sum, book) =>
        sum +
        (typeof book.availableStock === "number"
          ? book.availableStock
          : book.available
            ? Number(book.totalStock) || 1
            : 0),
      0
    );

    return [
      {
        label: "Total Books",
        value: totalBooks,
        icon: "statBooks",
      },
      {
        label: "Issued Books",
        value: Math.max(totalBooks - availableBooks, 0),
        icon: "statIssued",
      },
      {
        label: "Available Books",
        value: availableBooks,
        icon: "statAvailable",
      },
      {
        label: "Total Users",
        value: users.length,
        icon: "statUsers",
      },
    ];
  }, [books, users.length]);

  const recentActivity = transactions.slice(0, 5);

  return (
    <div className="minimal-admin-shell" id="dashboard">
      <Sidebar />

      <div className="minimal-admin-main">
        <Navbar user={user} />

        <main className="minimal-admin-content">
          <div className="minimal-admin-heading">
            <h1>Admin Dashboard</h1>
            <p>Library Overview</p>
          </div>

          {error && <p className="minimal-admin-alert">{error}</p>}

          {loading ? (
            <Loader label="Loading admin dashboard..." />
          ) : (
            <>
              <section className="minimal-stats-grid" aria-label="Library overview">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}
              </section>

              <section className="minimal-dashboard-grid">
                <Card>
                  <div className="minimal-card-heading">
                    <h2>Recent Activity</h2>
                  </div>

                  {recentActivity.length ? (
                    <div className="minimal-activity-list">
                      {recentActivity.map((item) => (
                        <div key={item._id} className="minimal-activity-row">
                          <div>
                            <strong>{item.book?.title || "Library record"}</strong>
                            <span>{item.user?.name || "Unknown user"}</span>
                          </div>
                          <span className="minimal-status">{item.status}</span>
                          <time>{formatDate(item.updatedAt || item.createdAt)}</time>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="minimal-empty-text">No recent activity yet.</p>
                  )}
                </Card>

                <Card>
                  <div className="minimal-card-heading">
                    <h2>Quick Actions</h2>
                  </div>

                  <div className="minimal-quick-actions">
                    <button type="button">Add Book</button>
                    <button type="button">Manage Users</button>
                  </div>
                </Card>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
