import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Books() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyBookId, setBusyBookId] = useState("");
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [category, setCategory] = useState("all");
  const [author, setAuthor] = useState("all");
  const [isbnQuery, setIsbnQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [selectedBookId, setSelectedBookId] = useState("");

  const loadBooks = async () => {
    try {
      setError("");
      const { data } = await API.get("/books");
      setBooks(data.books || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load books.");
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (!selectedBookId && books[0]?._id) {
      setSelectedBookId(books[0]._id);
    }
  }, [books, selectedBookId]);

  const borrowBook = async (bookId) => {
    if (!user) {
      navigate("/login", { state: { from: "/books" } });
      return;
    }

    try {
      setBusyBookId(bookId);
      setMessage("");
      setError("");
      await API.post("/borrow", { bookId });
      setMessage("Book issued successfully.");
      await loadBooks();
    } catch (borrowError) {
      setError(
        borrowError.response?.data?.message || "Unable to issue this book."
      );
    } finally {
      setBusyBookId("");
    }
  };

  const categories = useMemo(
    () => ["all", ...new Set(books.map((book) => book.category || "General"))],
    [books]
  );
  const authors = useMemo(
    () => ["all", ...new Set(books.map((book) => book.author || "Unknown"))],
    [books]
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return books
      .filter((book) => {
        const searchableText = `${book.title} ${book.author} ${book.isbn || ""}`.toLowerCase();
        return searchableText.includes(query.trim().toLowerCase());
      })
      .slice(0, 5);
  }, [books, query]);

  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const searchSource = [
          book.title,
          book.author,
          book.category || "General",
          book.isbn || "",
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = searchSource.includes(query.trim().toLowerCase());
        const matchesAvailability =
          availability === "all" ||
          (availability === "available" && book.available) ||
          (availability === "borrowed" && !book.available);
        const matchesCategory =
          category === "all" || (book.category || "General") === category;
        const matchesAuthor = author === "all" || book.author === author;
        const matchesIsbn = (book.isbn || "")
          .toLowerCase()
          .includes(isbnQuery.trim().toLowerCase());

        return (
          matchesQuery &&
          matchesAvailability &&
          matchesCategory &&
          matchesAuthor &&
          matchesIsbn
        );
      }),
    [author, availability, books, category, isbnQuery, query]
  );

  const selectedBook =
    filteredBooks.find((book) => book._id === selectedBookId) ||
    filteredBooks[0] ||
    books.find((book) => book._id === selectedBookId) ||
    null;
  const availableCount = books.filter((book) => book.available).length;
  const categoryCount = new Set(books.map((book) => book.category || "General")).size;

  return (
    <>
      <section className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">Book Search & Browse</span>
          <h1>Search faster, filter deeper, and open book details from a cleaner catalog desk.</h1>
          <p>
            The catalog now supports search suggestions, author and category filters,
            ISBN lookup, availability status, and card or table views for different workflows.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/borrow" className="ghost-button subtle">
                Review My Loans
              </Link>
            ) : (
              <Link to="/login" className="ghost-button subtle">
                Sign in to issue books
              </Link>
            )}
          </div>
        </div>
        <div className="hero-panel">
          <div className="metric-strip three-up">
            <article className="metric-tile">
              <span>Titles in catalog</span>
              <strong>{books.length}</strong>
            </article>
            <article className="metric-tile">
              <span>Available now</span>
              <strong>{availableCount}</strong>
            </article>
            <article className="metric-tile">
              <span>Categories</span>
              <strong>{categoryCount}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section book-explorer-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Search & Filtering</span>
              <h2>Find the right book</h2>
            </div>
            <div className="view-toggle-group">
              <button
                type="button"
                className={viewMode === "cards" ? "ghost-button subtle" : "ghost-button muted-action"}
                onClick={() => setViewMode("cards")}
              >
                Card Layout
              </button>
              <button
                type="button"
                className={viewMode === "table" ? "ghost-button subtle" : "ghost-button muted-action"}
                onClick={() => setViewMode("table")}
              >
                Table View
              </button>
            </div>
          </div>

          <div className="catalog-toolbar advanced-toolbar">
            <label className="control-shell search-control">
              <span>Search bar</span>
              <input
                value={query}
                placeholder="Search title, author, category, or ISBN"
                onChange={(event) => setQuery(event.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="suggestion-list">
                  {suggestions.map((book) => (
                    <button
                      key={book._id}
                      type="button"
                      className="suggestion-item"
                      onClick={() => {
                        setQuery(book.title);
                        setSelectedBookId(book._id);
                      }}
                    >
                      <strong>{book.title}</strong>
                      <small>
                        {book.author} • {book.category || "General"}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </label>

            <label className="control-shell">
              <span>Availability status</span>
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
              >
                <option value="all">All books</option>
                <option value="available">Available only</option>
                <option value="borrowed">Checked out only</option>
              </select>
            </label>

            <label className="control-shell">
              <span>Category filter</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="control-shell">
              <span>Author search</span>
              <select
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              >
                {authors.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All authors" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="control-shell">
              <span>ISBN search</span>
              <input
                value={isbnQuery}
                placeholder="Type ISBN"
                onChange={(event) => setIsbnQuery(event.target.value)}
              />
            </label>
          </div>

          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}

          {filteredBooks.length === 0 ? (
            <div className="empty-state">
              <h3>No titles match the current filters.</h3>
              <p>Try a broader search or reset one of the active filters.</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="catalog-grid">
              {filteredBooks.map((book, index) => (
                <article
                  key={book._id}
                  className={`catalog-card ${selectedBookId === book._id ? "catalog-card-selected" : ""}`}
                >
                  <div className="catalog-card-header">
                    <span className="catalog-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        book.available ? "status-pill success" : "status-pill"
                      }
                    >
                      {book.available ? "Available" : "Checked out"}
                    </span>
                  </div>

                  <div className="catalog-card-body">
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <div className="catalog-meta-group">
                      <span>{book.category || "General"}</span>
                      <span>{book.isbn || "ISBN pending"}</span>
                    </div>
                  </div>

                  <div className="catalog-card-footer">
                    <button
                      type="button"
                      className="ghost-button muted-action"
                      onClick={() => setSelectedBookId(book._id)}
                    >
                      View Details
                    </button>
                    {book.available ? (
                      <button
                        type="button"
                        className="primary-button"
                        disabled={busyBookId === book._id}
                        onClick={() => borrowBook(book._id)}
                      >
                        {busyBookId === book._id ? "Issuing..." : "Issue Book"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="ghost-button muted-action"
                        disabled
                      >
                        Reservation Soon
                      </button>
                    )}
                  </div>
                </article>
              ))}
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
                  {filteredBooks.map((book) => (
                    <tr key={book._id}>
                      <td>
                        <button
                          type="button"
                          className="table-link"
                          onClick={() => setSelectedBookId(book._id)}
                        >
                          {book.title}
                        </button>
                      </td>
                      <td>{book.author}</td>
                      <td>{book.category || "General"}</td>
                      <td>{book.isbn || "Pending"}</td>
                      <td>{book.available ? "Available" : "Checked out"}</td>
                      <td>
                        {book.available ? (
                          <button
                            type="button"
                            className="ghost-button subtle"
                            disabled={busyBookId === book._id}
                            onClick={() => borrowBook(book._id)}
                          >
                            {busyBookId === book._id ? "Issuing..." : "Issue"}
                          </button>
                        ) : (
                          <span className="muted">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="surface-card book-details-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Book Details</span>
              <h2>{selectedBook?.title || "Select a title"}</h2>
            </div>
          </div>

          {selectedBook ? (
            <div className="details-stack">
              <div className="detail-hero-card">
                <span
                  className={
                    selectedBook.available ? "status-pill success" : "status-pill"
                  }
                >
                  {selectedBook.available ? "Available" : "Checked out"}
                </span>
                <p>{selectedBook.author}</p>
                <div className="book-feature-grid">
                  <div>
                    <span>Category</span>
                    <strong>{selectedBook.category || "General"}</strong>
                  </div>
                  <div>
                    <span>ISBN</span>
                    <strong>{selectedBook.isbn || "Not assigned"}</strong>
                  </div>
                </div>
              </div>

              <div className="detail-copy">
                <span className="eyebrow">Description</span>
                <p>
                  {selectedBook.description ||
                    "No long-form description has been added for this book yet. Admins can enrich this record from the operations desk."}
                </p>
              </div>

              <div className="detail-copy">
                <span className="eyebrow">Actions</span>
                <div className="hero-actions">
                  {selectedBook.available ? (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={busyBookId === selectedBook._id}
                      onClick={() => borrowBook(selectedBook._id)}
                    >
                      {busyBookId === selectedBook._id ? "Issuing..." : "Issue Book"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ghost-button muted-action"
                      disabled
                    >
                      Reservation System Next
                    </button>
                  )}
                  {!user && (
                    <Link to="/login" className="ghost-button">
                      Login for borrowing
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No book selected.</h3>
              <p>Pick a title from the catalog to inspect its details here.</p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
