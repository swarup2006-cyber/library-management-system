import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const initialForm = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  description: "",
};

export default function AdminPanel() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");

  const loadOverview = async () => {
    try {
      setError("");
      const [booksResponse, usersResponse, transactionsResponse] = await Promise.all([
        API.get("/books"),
        API.get("/users"),
        API.get("/users/transactions/all"),
      ]);
      setBooks(booksResponse.data.books || []);
      setUsers(usersResponse.data.users || []);
      setTransactions(transactionsResponse.data.transactions || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load operations data.");
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const addBook = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      await API.post("/books", form);
      setForm(initialForm);
      setMessage("Book added successfully.");
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add book.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBook = async (id) => {
    const shouldDelete = window.confirm(
      "Remove this title from the catalog? This action cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await API.delete(`/books/${id}`);
      setMessage("Book deleted successfully.");
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete book.");
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      setBusyUserId(userId);
      setError("");
      setMessage("");
      const { data } = await API.put(`/users/${userId}/status`);
      setMessage(data.message || "User status updated.");
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update user status.");
    } finally {
      setBusyUserId("");
    }
  };

  const availableBooks = books.filter((book) => book.available).length;
  const checkedOutBooks = books.length - availableBooks;
  const blockedUsers = users.filter((user) => user.isBlocked).length;
  const verifiedUsers = users.filter((user) => user.isVerified).length;
  const activeTransactions = transactions.filter(
    (item) => item.status === "Borrowed" || item.status === "Overdue"
  ).length;
  const overdueTransactions = transactions.filter(
    (item) => item.status === "Overdue"
  ).length;
  const totalFine = transactions.reduce(
    (sum, item) => sum + (item.fineAmount || 0),
    0
  );

  const moduleCards = useMemo(
    () => [
      { title: "User Management", value: users.length, hint: `${blockedUsers} blocked accounts` },
      { title: "Transaction History", value: transactions.length, hint: `${overdueTransactions} overdue items` },
      { title: "Notifications", value: overdueTransactions, hint: "Overdue alerts ready for follow-up" },
      { title: "Analytics Dashboard", value: totalFine, hint: "Fine exposure across open records" },
    ],
    [blockedUsers, overdueTransactions, totalFine, transactions.length, users.length]
  );

  return (
    <>
      <section className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">Operations Desk</span>
          <h1>Run books, users, circulation, and activity from a professional admin workspace.</h1>
          <p>
            This admin module now combines catalog operations, user management,
            notifications, and transaction reporting in one clean surface.
          </p>
        </div>
        <div className="hero-panel">
          <div className="metric-strip three-up">
            <article className="metric-tile">
              <span>Total titles</span>
              <strong>{books.length}</strong>
            </article>
            <article className="metric-tile">
              <span>Users</span>
              <strong>{users.length}</strong>
            </article>
            <article className="metric-tile">
              <span>Active circulation</span>
              <strong>{activeTransactions}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section operations-grid">
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}

        <article className="surface-card form-panel">
          <span className="eyebrow">Add Title</span>
          <h2>Register a new book</h2>
          <p className="section-copy">
            Keep the catalog current with title, author, category, ISBN, and
            book detail records for stronger search and browse experiences.
          </p>

          <form onSubmit={addBook} className="form-grid">
            <label>
              <span>Book title</span>
              <input
                value={form.title}
                placeholder="For example, The Design of Everyday Things"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              <span>Author</span>
              <input
                value={form.author}
                placeholder="For example, Don Norman"
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </label>
            <label>
              <span>Category</span>
              <input
                value={form.category}
                placeholder="Design, Fiction, Science"
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>
            <label>
              <span>ISBN</span>
              <input
                value={form.isbn}
                placeholder="978..."
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </label>
            <label>
              <span>Description</span>
              <input
                value={form.description}
                placeholder="Short summary for book details"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add to Catalog"}
            </button>
          </form>
        </article>

        <article className="surface-card operations-summary-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Module Health</span>
              <h2>Live admin signals</h2>
            </div>
          </div>

          <div className="quick-stat-grid">
            <article className="stat-card">
              <span>Available titles</span>
              <strong>{availableBooks}</strong>
              <p>{checkedOutBooks} currently checked out.</p>
            </article>
            <article className="stat-card">
              <span>Verified users</span>
              <strong>{verifiedUsers}</strong>
              <p>{blockedUsers} currently blocked.</p>
            </article>
            <article className="stat-card accent">
              <span>Overdue alerts</span>
              <strong>{overdueTransactions}</strong>
              <p>Need immediate reminder follow-up.</p>
            </article>
            <article className="stat-card accent">
              <span>Fine exposure</span>
              <strong>{`Rs ${totalFine}`}</strong>
              <p>Total fine amount across tracked transactions.</p>
            </article>
          </div>
        </article>

        <article className="surface-card operations-module-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Admin Modules</span>
              <h2>Core control center</h2>
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
      </section>

      <section className="page-section operations-data-grid">
        <article className="surface-card collection-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Collection</span>
              <h2>Current catalog records</h2>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="empty-state">
              <h3>No records yet.</h3>
              <p>Add your first title from the form to start building the library.</p>
            </div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>ISBN</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category || "General"}</td>
                      <td>{book.isbn || "Pending"}</td>
                      <td>{book.available ? "Available" : "Checked out"}</td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => deleteBook(book._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">User Management</span>
              <h2>Roles and access</h2>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="empty-state">
              <h3>No users available.</h3>
              <p>Registered users will appear here for role and status review.</p>
            </div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.role === "admin" ? "Admin" : "Student"}</td>
                      <td>{item.isBlocked ? "Blocked" : "Active"}</td>
                      <td>
                        <button
                          type="button"
                          className={item.isBlocked ? "ghost-button subtle" : "secondary-button"}
                          disabled={busyUserId === item._id}
                          onClick={() => toggleUserStatus(item._id)}
                        >
                          {busyUserId === item._id
                            ? "Saving..."
                            : item.isBlocked
                              ? "Activate"
                              : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="surface-card operations-transactions-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Activity Logs</span>
              <h2>Transaction history</h2>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <h3>No circulation records yet.</h3>
              <p>Issue and return activity will appear here once members start borrowing.</p>
            </div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Book</th>
                    <th>Borrowed</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item._id}>
                      <td>{item.user?.name || "Unknown"}</td>
                      <td>{item.book?.title || "Unknown book"}</td>
                      <td>{new Date(item.borrowDate).toLocaleDateString()}</td>
                      <td>
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString()
                          : "Not set"}
                      </td>
                      <td>{item.status}</td>
                      <td>{`Rs ${item.fineAmount || 0}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
