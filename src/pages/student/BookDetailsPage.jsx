import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import libraryService from "../../services/libraryService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadBook = async () => {
    try {
      setError("");
      const response = await libraryService.getBookDetails(bookId);
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load book details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const handleBorrow = async () => {
    try {
      setBusy(true);
      const response = await libraryService.borrowBook(bookId);
      await loadBook();
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
      setBusy(false);
    }
  };

  if (loading) {
    return <Loader label="Loading book details..." />;
  }

  if (!data?.book) {
    return <div className="alert alert-danger">{error || "Book details unavailable."}</div>;
  }

  const { book } = data;

  return (
    <>
      <PageHeader
        eyebrow="Book Details"
        title={book.title}
        description={`${book.authorName} • ${book.categoryName} • Shelf ${book.shelf}`}
        actions={
          <>
            <Link to="/student/books" className="btn btn-outline-secondary">
              Back to books
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBorrow}
              disabled={book.copiesAvailable === 0 || busy}
            >
              {busy ? "Issuing..." : "Issue book"}
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <span className="book-swatch book-swatch-lg mb-4" style={{ backgroundColor: book.coverTone }} />
              <p className="text-body-secondary">{book.description}</p>
              <div className="row row-cols-1 row-cols-md-2 g-3 mt-2">
                <div className="col">
                  <div className="border rounded-3 p-3 h-100">
                    <p className="text-body-secondary small mb-1">ISBN</p>
                    <strong>{book.isbn}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="border rounded-3 p-3 h-100">
                    <p className="text-body-secondary small mb-1">Publisher</p>
                    <strong>{book.publisher}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="border rounded-3 p-3 h-100">
                    <p className="text-body-secondary small mb-1">Copies</p>
                    <strong>
                      {book.copiesAvailable} available / {book.copiesTotal} total
                    </strong>
                  </div>
                </div>
                <div className="col">
                  <div className="border rounded-3 p-3 h-100">
                    <p className="text-body-secondary small mb-1">Language</p>
                    <strong>{book.language}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Recent circulation</h3>
              <div className="d-grid gap-3">
                {data.history.slice(0, 5).map((loan) => (
                  <div key={loan.id} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between gap-3 mb-1">
                      <strong>{loan.student?.name || "Student"}</strong>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="small text-body-secondary mb-1">
                      Issued {formatDate(loan.issuedAt)} • Due {formatDate(loan.dueAt)}
                    </p>
                    <p className="small mb-0">Fine: {formatCurrency(loan.fineAmount)}</p>
                  </div>
                ))}

                {!data.history.length ? (
                  <div className="alert alert-light border mb-0">
                    No circulation history for this title yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
