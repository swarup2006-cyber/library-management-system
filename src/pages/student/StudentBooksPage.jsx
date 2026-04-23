import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import libraryService from "../../services/libraryService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function StudentBooksPage() {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyBookId, setBusyBookId] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    availability: "all",
  });

  const loadBooks = async () => {
    try {
      setError("");
      const response = await libraryService.getBooks();
      setBooks(response.books);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(books.map((book) => book.categoryName))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return books.filter((book) => {
      const searchMatch =
        !search ||
        `${book.title} ${book.authorName} ${book.isbn} ${book.categoryName}`
          .toLowerCase()
          .includes(search);
      const categoryMatch =
        filters.category === "all" || book.categoryName === filters.category;
      const availabilityMatch =
        filters.availability === "all" ||
        (filters.availability === "available" && book.copiesAvailable > 0) ||
        (filters.availability === "issued" && book.copiesAvailable === 0);

      return searchMatch && categoryMatch && availabilityMatch;
    });
  }, [books, filters]);

  const handleBorrow = async (bookId) => {
    try {
      setBusyBookId(bookId);
      const response = await libraryService.borrowBook(bookId);
      await loadBooks();
      await refreshUser();
      showToast({
        title: "Book issued",
        message: response.message,
        variant: "success",
      });
    } catch (requestError) {
      showToast({
        title: "Issue failed",
        message: requestError.response?.data?.message || "Unable to issue this book.",
        variant: "danger",
      });
    } finally {
      setBusyBookId("");
    }
  };

  if (loading) {
    return <Loader label="Loading books..." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Book Catalog"
        title="Browse all available books"
        description="Search by title, author, ISBN, category, and availability."
        actions={
          <Link to="/student/history" className="btn btn-outline-secondary">
            My issued books
          </Link>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Search title, author, ISBN, category"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, search: event.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, category: event.target.value }))
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All categories" : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                value={filters.availability}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, availability: event.target.value }))
                }
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="issued">Fully issued</option>
              </select>
            </div>
            <div className="form-actions full-width">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setFilters({
                    search: "",
                    category: "all",
                    availability: "all",
                  })
                }
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredBooks.map((book) => (
          <div key={book.id} className="col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                  <span className="book-swatch" style={{ backgroundColor: book.coverTone }} />
                  <span
                    className={`badge ${
                      book.copiesAvailable > 0 ? "text-bg-success" : "text-bg-secondary"
                    }`}
                  >
                    {book.copiesAvailable > 0
                      ? `${book.copiesAvailable} available`
                      : "Fully issued"}
                  </span>
                </div>

                <h3 className="h5 mb-1">{book.title}</h3>
                <p className="text-body-secondary mb-2">{book.authorName}</p>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge text-bg-light">{book.categoryName}</span>
                  <span className="badge text-bg-light">{book.shelf}</span>
                </div>
                <p className="text-body-secondary small flex-grow-1">{book.description}</p>

                <div className="d-flex gap-2 mt-3">
                  <Link to={`/student/books/${book.id}`} className="btn btn-outline-secondary w-100">
                    Details
                  </Link>
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    disabled={book.copiesAvailable === 0 || busyBookId === book.id}
                    onClick={() => handleBorrow(book.id)}
                  >
                    {busyBookId === book.id ? "Issuing..." : "Issue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!filteredBooks.length ? (
          <div className="col-12">
            <div className="alert alert-light border">
              No books match the current search and filters.
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
