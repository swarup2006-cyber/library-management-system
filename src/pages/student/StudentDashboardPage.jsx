import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import libraryService from "../../services/libraryService";
import { formatCurrency, formatDate, getStatusBadge } from "../../utils/formatters";

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const response = await libraryService.getStudentDashboard();

        if (mounted) {
          setData(response);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.response?.data?.message || "Unable to load the dashboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Loader label="Loading student dashboard..." />;
  }

  if (!data) {
    return <div className="alert alert-danger">{error || "Dashboard data unavailable."}</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Student Dashboard"
        title={`Welcome back, ${data.user.name}`}
        description="Track issued books, due dates, fines, recommendations, and live notifications."
        actions={
          <>
            <Link to="/student/books" className="btn btn-primary">
              Browse books
            </Link>
            <Link to="/student/history" className="btn btn-outline-secondary">
              View history
            </Link>
          </>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <StatCard
          label="Books issued"
          value={data.summary.booksIssued}
          helper="Active books currently in your account"
        />
        <StatCard
          label="Due soon"
          value={data.summary.dueSoon}
          helper="Titles that need attention in the next few days"
          accent="warning"
        />
        <StatCard
          label="Overdue"
          value={data.summary.overdue}
          helper="Books already past the due date"
          accent="danger"
        />
        <StatCard
          label="Fine due"
          value={formatCurrency(data.summary.fineDue)}
          helper="Estimated fines across active and returned loans"
          accent="success"
        />
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Current loans</h3>
                  <p className="text-body-secondary small mb-0">
                    Active books, due dates, and fines.
                  </p>
                </div>
                <Link to="/student/history" className="btn btn-sm btn-outline-secondary">
                  Full history
                </Link>
              </div>

              <div className="d-grid gap-3">
                {data.activeLoans.slice(0, 4).map((loan) => (
                  <div key={loan.id} className="card border shadow-sm">
                    <div className="card-body d-flex flex-column flex-lg-row justify-content-between gap-3">
                      <div>
                        <h4 className="h6 mb-1">{loan.book?.title}</h4>
                        <p className="text-body-secondary small mb-1">{loan.book?.authorName}</p>
                        <div className="d-flex flex-wrap gap-2">
                          <span className={`badge text-bg-${getStatusBadge(loan.status)}`}>
                            {loan.status}
                          </span>
                          <span className="badge text-bg-light">
                            Due {formatDate(loan.dueAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-lg-end">
                        <p className="small text-body-secondary mb-1">
                          Issued on {formatDate(loan.issuedAt)}
                        </p>
                        <p className="small mb-0">Fine: {formatCurrency(loan.fineAmount)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {!data.activeLoans.length ? (
                  <div className="alert alert-light border mb-0">
                    No active loans. Browse the catalog and issue a book to get started.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Notifications</h3>
                  <p className="text-body-secondary small mb-0">
                    Due reminders and library updates.
                  </p>
                </div>
                <Link to="/student/notifications" className="btn btn-sm btn-outline-secondary">
                  Open alerts
                </Link>
              </div>

              <div className="d-grid gap-3">
                {data.notifications.map((item) => (
                  <div key={item.id} className="card border shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between gap-3">
                        <div>
                          <h4 className="h6 mb-1">{item.title}</h4>
                          <p className="text-body-secondary small mb-1">{item.message}</p>
                        </div>
                        <span className={`badge text-bg-${getStatusBadge(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {!data.notifications.length ? (
                  <div className="alert alert-light border mb-0">No new notifications.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Recommended available books</h3>
                  <p className="text-body-secondary small mb-0">
                    Titles you can issue right away.
                  </p>
                </div>
                <Link to="/student/books" className="btn btn-sm btn-outline-secondary">
                  See all books
                </Link>
              </div>

              <div className="row g-3">
                {data.recommendedBooks.map((book) => (
                  <div key={book.id} className="col-md-6 col-xl-3">
                    <div className="card border shadow-sm h-100">
                      <div className="card-body">
                        <span
                          className="book-swatch mb-3"
                          style={{ backgroundColor: book.coverTone }}
                        />
                        <h4 className="h6 mb-1">{book.title}</h4>
                        <p className="text-body-secondary small mb-2">{book.authorName}</p>
                        <p className="small mb-3">{book.categoryName}</p>
                        <Link to={`/student/books/${book.id}`} className="btn btn-sm btn-primary">
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
