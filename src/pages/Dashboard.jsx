import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const pendingVerificationKey = "pendingVerificationEmail";

export default function Dashboard() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pageError, setPageError] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [verificationEmail, setVerificationEmail] = useState(
    location.state?.email || localStorage.getItem(pendingVerificationKey) || ""
  );
  const [verificationMessage, setVerificationMessage] = useState(
    location.state?.message || ""
  );
  const [warningMessage, setWarningMessage] = useState(
    location.state?.warningMessage || ""
  );

  useEffect(() => {
    const stateEmail = location.state?.email?.trim().toLowerCase();
    const storedEmail = localStorage.getItem(pendingVerificationKey) || "";

    if (stateEmail) {
      localStorage.setItem(pendingVerificationKey, stateEmail);
      setVerificationEmail(stateEmail);
    } else if (!user && storedEmail) {
      setVerificationEmail(storedEmail);
    }

    if (location.state?.message) {
      setVerificationMessage(location.state.message);
    }

    if (location.state?.warningMessage) {
      setWarningMessage(location.state.warningMessage);
    }

  }, [location.state, user]);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        setPageError("");
        setOverviewLoading(true);

        const requests = [
          API.get("/books"),
          user
            ? API.get("/borrowed").catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          user?.role === "admin"
            ? API.get("/users").catch(() => ({ data: { users: [] } }))
            : Promise.resolve({ data: { users: [] } }),
          user?.role === "admin"
            ? API.get("/users/transactions/all").catch(() => ({ data: { transactions: [] } }))
            : Promise.resolve({ data: { transactions: [] } }),
        ];

        const [
          { data: booksResponse },
          borrowedResponse,
          usersResponse,
          transactionsResponse,
        ] = await Promise.all(requests);

        if (!isMounted) {
          return;
        }

        setBooks(booksResponse.books || []);
        setBorrowedBooks(borrowedResponse.data || []);
        setUsers(usersResponse.data?.users || []);
        setTransactions(transactionsResponse.data?.transactions || []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPageError(
          error.response?.data?.message || "Unable to load your library overview."
        );
      } finally {
        if (isMounted) {
          setOverviewLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const availableBooks = books.filter((book) => book.available).length;
  const checkedOutBooks = books.length - availableBooks;
  const activeLoans = borrowedBooks.filter(
    (record) => record.status === "Borrowed"
  ).length;
  const returnedLoans = borrowedBooks.filter(
    (record) => record.status === "Returned"
  ).length;
  const recentBooks = books.slice(0, 4);
  const bookNameList = books.slice(0, 10);
  const overdueAlerts = (user?.role === "admin" ? transactions : borrowedBooks).filter(
    (record) => record.status === "Overdue"
  ).length;
  const notificationCount =
    overdueAlerts +
    (user ? borrowedBooks.filter((record) => record.status === "Borrowed").length : 1);
  const moduleCards = [
    {
      title: "Dashboard",
      value: books.length,
      hint: "Live shelf and circulation overview",
    },
    {
      title: "Book Search",
      value: availableBooks,
      hint: "Search, filters, and book details",
    },
    {
      title: user ? "Transactions" : "Authentication",
      value: user ? activeLoans + returnedLoans : "Login",
      hint: user ? "Issue, return, due date, and history" : "Student and admin access",
    },
    {
      title: user?.role === "admin" ? "User Management" : "Notifications",
      value: user?.role === "admin" ? users.length : notificationCount,
      hint:
        user?.role === "admin"
          ? "Roles, active and blocked status"
          : "Reminders, alerts, and reading activity",
    },
  ];
  const memberStateLabel = user
    ? "Member session"
    : "Access portals";

  return (
    <>
      <section className="page-hero dashboard-hero">
        <div className="hero-copy">
          <span className="eyebrow">Library Management System</span>
          <h1>
            Professional library management for admins, students, books, and circulation.
          </h1>
          <p>
            {loading || overviewLoading
              ? "Loading a live overview of catalog activity, member readiness, and current circulation."
              : user
                ? `Welcome back, ${user.name}. Your dashboard is ready for circulation, returns, and collection oversight.`
                : verificationEmail
                  ? "Your account is almost ready. Complete verification to unlock sign-in and borrowing."
                  : "A clean overview of collection status, availability, account activation, and recent library activity."}
          </p>
          {verificationMessage && (
            <p className="form-message success">{verificationMessage}</p>
          )}
          {warningMessage && <p className="form-message error">{warningMessage}</p>}
          {pageError && <p className="form-message error">{pageError}</p>}
        </div>

        <div className="hero-panel">
          <div className="quick-stat-grid">
            <article className="stat-card">
              <span>Total titles</span>
              <strong>{books.length}</strong>
              <p>Every title currently registered in the collection.</p>
            </article>
            <article className="stat-card">
              <span>Available now</span>
              <strong>{availableBooks}</strong>
              <p>Ready for issue from the shelf right now.</p>
            </article>
            <article className="stat-card">
              <span>Checked out</span>
              <strong>{checkedOutBooks}</strong>
              <p>Titles currently active in circulation.</p>
            </article>
            <article className="stat-card accent">
              <span>{memberStateLabel}</span>
              <strong>{user ? activeLoans : "Login"}</strong>
              <p>
                {user
                  ? `${returnedLoans} returned items in your account history.`
                  : "Use the centered login buttons below to enter the right portal."}
              </p>
            </article>
          </div>
        </div>
      </section>

      {!user && (
        <section className="dashboard-login-strip" aria-label="Login portals">
          <Link to="/student-login" className="primary-button">
            Student Login
          </Link>
          <Link to="/admin-login" className="ghost-button subtle">
            Admin Login
          </Link>
        </section>
      )}

      <section className="page-section dashboard-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Book Names</span>
              <h2>Titles visible on the dashboard</h2>
            </div>
            <Link to="/books" className="text-link">
              View full collection
            </Link>
          </div>

          {bookNameList.length === 0 ? (
            <div className="empty-state">
              <h3>No titles yet</h3>
              <p>Add books from the operations panel to start building the collection.</p>
            </div>
          ) : (
            <div className="dashboard-book-grid">
              {bookNameList.map((book) => (
                <article key={book._id} className="dashboard-book-card">
                  <div>
                    <h3>{book.title}</h3>
                    <p className="dashboard-book-meta">
                      {book.category ? `${book.author} - ${book.category}` : book.author}
                    </p>
                  </div>
                  <span
                    className={
                      book.available ? "status-pill success" : "status-pill"
                    }
                  >
                    {book.available ? "Available" : "Checked out"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </article>

        {user && (
          <article className="surface-card dashboard-member-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Member Status</span>
                <h2>Account overview</h2>
              </div>
              <span className="status-pill success">Verified session</span>
            </div>

            <div className="metric-strip three-up">
              <article className="metric-tile">
                <span>Active loans</span>
                <strong>{activeLoans}</strong>
                <p>Books currently issued to your account.</p>
              </article>
              <article className="metric-tile">
                <span>Returned</span>
                <strong>{returnedLoans}</strong>
                <p>Completed loan records in your history.</p>
              </article>
              <article className="metric-tile">
                <span>Catalog access</span>
                <strong>{books.length}</strong>
                <p>Total titles visible for your next checkout.</p>
              </article>
            </div>
          </article>
        )}
      </section>

      <section className="page-section surface-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Quick Shelf</span>
              <h2>Recent book names at a glance</h2>
            </div>
          </div>

          {recentBooks.length === 0 ? (
            <div className="empty-state">
              <h3>No recent titles</h3>
              <p>The newest book names will appear here once the collection grows.</p>
            </div>
          ) : (
            <div className="title-chip-wrap">
              {recentBooks.map((book) => (
                <div key={book._id} className="title-chip">
                  <strong>{book.title}</strong>
                  <span>{book.author}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Core Modules</span>
              <h2>Feature map in the product</h2>
            </div>
          </div>

          <div className="module-grid">
            {moduleCards.map((card) => (
              <article key={card.title} className="module-card">
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.hint}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Alerts & Activity</span>
              <h2>Notifications, reminders, and logs</h2>
            </div>
          </div>

          <div className="mini-list">
            <article className="mini-row">
              <div>
                <h3>Notifications</h3>
                <p>{notificationCount} active notification signal(s) across account and circulation modules.</p>
              </div>
              <span className="status-pill warning">Live</span>
            </article>
            <article className="mini-row">
              <div>
                <h3>Overdue alerts</h3>
                <p>{overdueAlerts} record(s) currently flagged for follow-up.</p>
              </div>
              <span className={overdueAlerts ? "status-pill" : "status-pill success"}>
                {overdueAlerts ? "Action needed" : "Clear"}
              </span>
            </article>
            <article className="mini-row">
              <div>
                <h3>Catalog visibility</h3>
                <p>Book names now stay front and center in the dashboard instead of being tucked away in a small summary.</p>
              </div>
              <span className="status-pill success">Updated</span>
            </article>
          </div>
        </article>
      </section>
    </>
  );
}
