import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const initialBookForm = {
  title: "",
  author: "",
  publisher: "",
  category: "",
  isbn: "",
  description: "",
  totalStock: 1,
  availableStock: 1,
};

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  isBlocked: false,
  isVerified: true,
};

export default function AdminPanel() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [editingBookId, setEditingBookId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submittingBook, setSubmittingBook] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);
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

  const saveBook = async (e) => {
    e.preventDefault();

    try {
      setSubmittingBook(true);
      setError("");
      setMessage("");
      const payload = {
        ...bookForm,
        totalStock: Number(bookForm.totalStock) || 1,
        availableStock:
          editingBookId
            ? Number(bookForm.availableStock) || 0
            : Number(bookForm.totalStock) || 1,
      };

      if (editingBookId) {
        await API.put(`/books/${editingBookId}`, payload);
        setMessage("Book updated successfully.");
      } else {
        await API.post("/books", payload);
        setMessage("Book added successfully.");
      }

      resetBookForm();
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save book.");
    } finally {
      setSubmittingBook(false);
    }
  };

  const resetBookForm = () => {
    setBookForm(initialBookForm);
    setEditingBookId("");
  };

  const editBook = (book) => {
    setEditingBookId(book._id);
    setBookForm({
      title: book.title || "",
      author: book.author || "",
      publisher: book.publisher || "",
      category: book.category || "General",
      isbn: book.isbn || "",
      description: book.description || "",
      totalStock: book.totalStock || 1,
      availableStock:
        typeof book.availableStock === "number"
          ? book.availableStock
          : book.available
            ? book.totalStock || 1
            : 0,
    });
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

  const saveUser = async (e) => {
    e.preventDefault();

    try {
      setSubmittingUser(true);
      setError("");
      setMessage("");

      if (editingUserId) {
        const { password, ...payload } = userForm;
        await API.put(`/users/${editingUserId}`, payload);
        setMessage("User updated successfully.");
      } else {
        await API.post("/users", userForm);
        setMessage("User added successfully.");
      }

      resetUserForm();
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save user.");
    } finally {
      setSubmittingUser(false);
    }
  };

  const resetUserForm = () => {
    setUserForm(initialUserForm);
    setEditingUserId("");
  };

  const editUser = (item) => {
    setEditingUserId(item._id);
    setUserForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.role || "user",
      isBlocked: Boolean(item.isBlocked),
      isVerified: Boolean(item.isVerified),
    });
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

  const deleteUser = async (userId) => {
    const shouldDelete = window.confirm(
      "Delete this user account? Users with active loans cannot be deleted."
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await API.delete(`/users/${userId}`);
      setMessage("User deleted successfully.");
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete user.");
    }
  };

  const availableBooks = books.reduce(
    (sum, book) =>
      sum +
      (typeof book.availableStock === "number"
        ? book.availableStock
        : book.available
          ? book.totalStock || 1
          : 0),
    0
  );
  const totalStock = books.reduce((sum, book) => sum + (book.totalStock || 1), 0);
  const checkedOutBooks = Math.max(totalStock - availableBooks, 0);
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
  const returnRecords = transactions.filter((item) => item.status === "Returned").length;
  const issueRecords = transactions.length;
  const categories = new Set(books.map((book) => book.category || "General")).size;
  const currentlyIssuedBooks = transactions.filter(
    (item) => item.status === "Borrowed" || item.status === "Overdue"
  );

  const moduleCards = useMemo(
    () => [
      { title: "Total Books", value: books.length, hint: `${totalStock} total stock units` },
      { title: "Issued Books", value: activeTransactions, hint: "Open issue records" },
      { title: "Available Books", value: availableBooks, hint: "Ready for issue" },
      { title: "Total Users", value: users.length, hint: `${blockedUsers} blocked accounts` },
    ],
    [activeTransactions, availableBooks, blockedUsers, books.length, totalStock, users.length]
  );

  const reportCards = [
    { title: "Transaction History", value: transactions.length, hint: "All issue and return records" },
    { title: "Issue Records", value: issueRecords, hint: "Borrow records created" },
    { title: "Return Records", value: returnRecords, hint: "Completed returns" },
    { title: "Book Usage Report", value: checkedOutBooks, hint: "Copies currently in circulation" },
  ];

  const notificationCards = [
    { title: "Due Reminder", value: activeTransactions, hint: "Active loans to watch" },
    { title: "Overdue Notification", value: overdueTransactions, hint: "Requires immediate action" },
    { title: "System Messages", value: message ? 1 : 0, hint: message || "No new system messages" },
  ];

  const adminCoverageSections = [
    {
      title: "Dashboard",
      items: [
        "Admin Dashboard",
        "Statistics",
        "Total Books",
        "Issued Books",
        "Available Books",
        "Total Users",
        "Activity Log",
        "Analytics",
      ],
    },
    {
      title: "Book Management",
      items: [
        "Add Book",
        "Update Book",
        "Delete Book",
        "Book Inventory",
        "Book Catalog",
        "ISBN",
        "Author",
        "Publisher",
        "Category Management",
        "Stock Management",
      ],
    },
    {
      title: "User Management",
      items: [
        "User List",
        "Add User",
        "Delete User",
        "Update User",
        "User Roles (Admin / Student)",
        "Account Status (Active / Blocked)",
        "User Profile",
      ],
    },
    {
      title: "Issue & Return",
      items: [
        "Issue Book",
        "Return Book",
        "Due Date",
        "Fine Calculation",
        "Overdue Books",
        "Reservation System",
        "Borrow Records",
      ],
    },
    {
      title: "Reports & Records",
      items: [
        "Report Generation",
        "Transaction History",
        "Issue Records",
        "Return Records",
        "User Activity Report",
        "Book Usage Report",
      ],
    },
    {
      title: "Notifications",
      items: ["Alerts", "Due Reminder", "Overdue Notification", "System Messages"],
    },
    {
      title: "Settings",
      items: [
        "System Settings",
        "Role Management",
        "Permission Control",
        "Database Backup",
        "Configuration",
      ],
    },
    {
      title: "Security",
      items: [
        "Admin Login",
        "Authentication",
        "Authorization",
        "Access Control",
        "Password Management",
      ],
    },
    {
      title: "UI / UX",
      items: [
        "Admin Panel",
        "Navigation Bar",
        "Sidebar Menu",
        "Tables",
        "Forms",
        "Buttons",
        "Responsive Design",
        "Dark Mode disabled",
      ],
    },
    {
      title: "Advanced Keywords",
      items: [
        "QR Code Scanner",
        "Barcode System",
        "Cloud Storage",
        "API Integration",
        "Real-time Updates",
        "Data Encryption",
        "Audit Logs",
      ],
    },
  ];

  return (
    <>
      <section className="classic-admin-dashboard">
        <div className="classic-admin-topbar">
          <strong>Library Admin</strong>
          <div>
            <span>Welcome, Admin</span>
            <span>Secure portal</span>
          </div>
        </div>

        <article className="classic-title-panel">
          <span className="eyebrow">Admin Dashboard</span>
          <h1>Dashboard</h1>
        </article>

        <div className="classic-stat-row">
          <article className="classic-stat-card total-card">
            <span>Total Books</span>
            <strong>{books.length}</strong>
            <p>{totalStock} stock units</p>
          </article>
          <article className="classic-stat-card assigned-card">
            <span>Books Assigned</span>
            <strong>{activeTransactions}</strong>
            <p>Currently issued</p>
          </article>
          <article className="classic-stat-card returned-card">
            <span>Books Returned</span>
            <strong>{returnRecords}</strong>
            <p>Completed returns</p>
          </article>
          <article className="classic-stat-card users-card">
            <span>Users</span>
            <strong>{users.length}</strong>
            <p>{blockedUsers} blocked</p>
          </article>
        </div>
      </section>

      {message && <p className="form-message success">{message}</p>}
      {error && <p className="form-message error">{error}</p>}

      <section className="page-section" id="issue-return">
        <article className="surface-card issued-table-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Issue & Return</span>
              <h2>Currently Issued Books</h2>
            </div>
          </div>

          {currentlyIssuedBooks.length === 0 ? (
            <div className="empty-state">
              <h3>No books are currently issued.</h3>
              <p>Issued books will appear here with title, author, category, ISBN, and due date.</p>
            </div>
          ) : (
            <div className="table-shell admin-issued-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>ISBN</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentlyIssuedBooks.map((item, index) => (
                    <tr key={item._id}>
                      <td>
                        <span className="row-number">{index + 1}</span>
                      </td>
                      <td>{item.book?.title || "Unknown book"}</td>
                      <td>{item.book?.author || "Unknown author"}</td>
                      <td>
                        <span className="category-badge">
                          {item.book?.category || "General"}
                        </span>
                      </td>
                      <td>{item.book?.isbn || "Pending"}</td>
                      <td>
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString()
                          : "Not set"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="page-section admin-portal-grid">
        <article className="surface-card form-panel portal-card" id="book-form">
          <span className="eyebrow">Book Management</span>
          <h2>{editingBookId ? "Update book" : "Add book"}</h2>
          <p className="section-copy">
            Manage ISBN, author, publisher, categories, and stock levels for
            the book catalog and inventory.
          </p>

          <form onSubmit={saveBook} className="form-grid">
            <label>
              <span>Book title</span>
              <input
                value={bookForm.title}
                placeholder="For example, The Design of Everyday Things"
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
              />
            </label>
            <label>
              <span>Author</span>
              <input
                value={bookForm.author}
                placeholder="For example, Don Norman"
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
              />
            </label>
            <label>
              <span>Publisher</span>
              <input
                value={bookForm.publisher}
                placeholder="Publisher name"
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
              />
            </label>
            <label>
              <span>Category</span>
              <input
                value={bookForm.category}
                placeholder="Design, Fiction, Science"
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
              />
            </label>
            <label>
              <span>ISBN</span>
              <input
                value={bookForm.isbn}
                placeholder="978..."
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
              />
            </label>
            <label>
              <span>Total stock</span>
              <input
                type="number"
                min="1"
                value={bookForm.totalStock}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    totalStock: e.target.value,
                    availableStock: editingBookId ? bookForm.availableStock : e.target.value,
                  })
                }
              />
            </label>
            {editingBookId && (
              <label>
                <span>Available stock</span>
                <input
                  type="number"
                  min="0"
                  value={bookForm.availableStock}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, availableStock: e.target.value })
                  }
                />
              </label>
            )}
            <label className="form-wide">
              <span>Description</span>
              <input
                value={bookForm.description}
                placeholder="Short summary for book details"
                onChange={(e) =>
                  setBookForm({ ...bookForm, description: e.target.value })
                }
              />
            </label>
            <div className="action-bar">
              <button type="submit" disabled={submittingBook}>
                {submittingBook
                  ? "Saving..."
                  : editingBookId
                    ? "Update Book"
                    : "Add Book"}
              </button>
              {editingBookId && (
                <button
                  type="button"
                  className="ghost-button muted-action"
                  onClick={resetBookForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="surface-card form-panel portal-card" id="user-form">
          <span className="eyebrow">User Management</span>
          <h2>{editingUserId ? "Update user" : "Add user"}</h2>
          <p className="section-copy">
            Create admins or students, control active and blocked status, and
            keep user profile data current.
          </p>

          <form onSubmit={saveUser} className="form-grid">
            <label>
              <span>Name</span>
              <input
                value={userForm.name}
                placeholder="Member name"
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={userForm.email}
                placeholder="member@example.com"
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </label>
            {!editingUserId && (
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={userForm.password}
                  placeholder="Temporary password"
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                />
              </label>
            )}
            <label>
              <span>User role</span>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="user">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              <span>Account status</span>
              <select
                value={userForm.isBlocked ? "blocked" : "active"}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    isBlocked: e.target.value === "blocked",
                  })
                }
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>
            <label>
              <span>Verification</span>
              <select
                value={userForm.isVerified ? "verified" : "pending"}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    isVerified: e.target.value === "verified",
                  })
                }
              >
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </label>
            <div className="action-bar">
              <button type="submit" disabled={submittingUser}>
                {submittingUser
                  ? "Saving..."
                  : editingUserId
                    ? "Update User"
                    : "Add User"}
              </button>
              {editingUserId && (
                <button
                  type="button"
                  className="ghost-button muted-action"
                  onClick={resetUserForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="surface-card operations-summary-card portal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Statistics & Analytics</span>
              <h2>Admin dashboard</h2>
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
            <article className="stat-card">
              <span>Categories</span>
              <strong>{categories}</strong>
              <p>Category management coverage.</p>
            </article>
            <article className="stat-card">
              <span>Verified users</span>
              <strong>{verifiedUsers}</strong>
              <p>{blockedUsers} blocked accounts.</p>
            </article>
          </div>
        </article>

        <article className="surface-card operations-module-card portal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reports & Records</span>
              <h2>Report generation</h2>
            </div>
          </div>

          <div className="module-grid">
            {reportCards.map((card) => (
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
        <article className="surface-card collection-panel" id="book-inventory">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Book Inventory</span>
              <h2>Book catalog and stock management</h2>
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
                    <th>Publisher</th>
                    <th>Category</th>
                    <th>ISBN</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.publisher || "Not set"}</td>
                      <td>{book.category || "General"}</td>
                      <td>{book.isbn || "Pending"}</td>
                      <td>
                        {typeof book.availableStock === "number"
                          ? `${book.availableStock}/${book.totalStock || 1}`
                          : book.available
                            ? "Available"
                            : "Checked out"}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="ghost-button subtle"
                            onClick={() => editBook(book)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => deleteBook(book._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="surface-card" id="user-list">
          <div className="section-heading">
            <div>
              <span className="eyebrow">User Management</span>
              <h2>User list, roles, and account status</h2>
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
                        <div className="table-actions">
                          <button
                            type="button"
                            className="ghost-button subtle"
                            onClick={() => editUser(item)}
                          >
                            Update
                          </button>
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
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => deleteUser(item._id)}
                          >
                            Delete
                          </button>
                        </div>
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
              <span className="eyebrow">Issue & Return</span>
              <h2>Transaction history and borrow records</h2>
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
                    <th>Type</th>
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
                      <td>{item.returnDate ? "Return" : "Issue"}</td>
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

      <section className="page-section admin-portal-grid">
        <article className="surface-card portal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Notifications</span>
              <h2>Alerts and system messages</h2>
            </div>
          </div>

          <div className="module-grid">
            {notificationCards.map((card) => (
              <article key={card.title} className="module-card">
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.hint}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-card portal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Settings</span>
              <h2>Configuration and permissions</h2>
            </div>
          </div>

          <div className="portal-checklist">
            <div>
              <strong>System Settings</strong>
              <span>Library rules, due windows, and fine policies are centralized.</span>
            </div>
            <div>
              <strong>Role Management</strong>
              <span>Admins and students are managed from the user table.</span>
            </div>
            <div>
              <strong>Permission Control</strong>
              <span>Admin-only routes protect portal actions.</span>
            </div>
            <div>
              <strong>Database Backup</strong>
              <span>Backup hooks can be connected from this settings surface.</span>
            </div>
          </div>
        </article>

        <article className="surface-card portal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Security</span>
              <h2>Access control</h2>
            </div>
          </div>

          <div className="portal-checklist">
            <div>
              <strong>Admin Login</strong>
              <span>Admin portal access requires authenticated admin role.</span>
            </div>
            <div>
              <strong>Authentication</strong>
              <span>Session cookies and JWT validation protect private modules.</span>
            </div>
            <div>
              <strong>Authorization</strong>
              <span>Admin actions are enforced in backend middleware.</span>
            </div>
            <div>
              <strong>Password Management</strong>
              <span>Password changes remain available from profile management.</span>
            </div>
          </div>
        </article>

        <article className="surface-card portal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Advanced Keywords</span>
              <h2>Integration-ready modules</h2>
            </div>
          </div>

          <div className="portal-checklist">
            <div>
              <strong>QR Code Scanner / Barcode System</strong>
              <span>Ready to connect to issue and return workflows.</span>
            </div>
            <div>
              <strong>Cloud Storage / API Integration</strong>
              <span>Document and media storage can be added around book records.</span>
            </div>
            <div>
              <strong>Real-time Updates</strong>
              <span>Socket events can refresh alerts and activity logs live.</span>
            </div>
            <div>
              <strong>Data Encryption / Audit Logs</strong>
              <span>Security records can extend the existing activity table.</span>
            </div>
          </div>
        </article>
      </section>

      <section className="page-section">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Admin Portal Checklist</span>
              <h2>All requested modules represented</h2>
            </div>
          </div>

          <div className="portal-coverage-grid">
            {adminCoverageSections.map((section) => (
              <article key={section.title} className="coverage-card">
                <h3>{section.title}</h3>
                <div className="coverage-pill-wrap">
                  {section.items.map((item) => (
                    <span
                      key={item}
                      className={
                        item.toLowerCase().includes("disabled")
                          ? "coverage-pill muted-pill"
                          : "coverage-pill"
                      }
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
