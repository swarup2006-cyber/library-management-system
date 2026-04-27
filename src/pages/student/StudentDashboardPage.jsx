import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import DashboardHero from "../../components/common/DashboardHero";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import libraryService from "../../services/libraryService";
import { formatCurrency, formatDate } from "../../utils/formatters";

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
      <DashboardHero
        eyebrow="Student Dashboard"
        title="Discover Your Next Great Read"
        description="Search the full BookHeaven catalog, keep due dates under control, and track fines and returns from a cleaner dark workspace."
        actions={
          <>
            <Link to="/student/books" className="btn btn-primary hero-button">
              Explore books
            </Link>
            <Link to="/student/history" className="btn btn-outline-light hero-button">
              Open issue history
            </Link>
          </>
        }
        aside={
          <div className="glass-panel">
            <p className="text-uppercase small fw-semibold text-info mb-2">Live snapshot</p>
            <h2 className="h4 mb-3">{data.user.name}</h2>
            <div className="d-grid gap-3">
              {data.activeLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="glass-list-item">
                  <div>
                    <strong>{loan.book?.title}</strong>
                    <p className="small text-body-secondary mb-0">
                      {loan.status === "Issue Requested"
                        ? `Requested ${formatDate(loan.issueRequestedAt)}`
                        : `Due ${formatDate(loan.dueAt)}`}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              ))}
              {!data.activeLoans.length ? (
                <div className="glass-list-item">
                  <p className="small mb-0 text-body-secondary">
                    No open requests or issued books right now. The catalog is ready when you are.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        }
      />

      {error ? <div className="alert alert-danger mt-4">{error}</div> : null}

      <div className="row g-3 mt-1 mb-4">
        <StatCard
          label="Total Books"
          value={data.summary.totalBooks}
          helper="Titles available in the BookHeaven catalog"
          accent="primary"
          icon="books"
        />
        <StatCard
          label="Open Items"
          value={data.summary.booksIssued}
          helper="Issue requests and active loans still in progress"
          accent="warning"
          icon="issue"
        />
        <StatCard
          label="Returned Books"
          value={data.summary.returnedBooks}
          helper="Books completed in your reading history"
          accent="success"
          icon="return"
        />
        <StatCard
          label="Fine Amount"
          value={formatCurrency(data.summary.fineDue)}
          helper="Current fine snapshot across your records"
          accent="danger"
          icon="fine"
        />
      </div>

      <div className="row g-4">
        <div className="col-xl-7">
          <div className="card border-0 shadow-sm glass-surface interactive-surface h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Current reading desk</h3>
                  <p className="text-body-secondary small mb-0">
                    Issue requests, active loans, return requests, due dates, and frozen fines.
                  </p>
                </div>
                <Link to="/student/history" className="btn btn-sm btn-outline-secondary">
                  Full history
                </Link>
              </div>

              <div className="d-grid gap-3">
                {data.activeLoans.slice(0, 4).map((loan) => (
                  <div key={loan.id} className="glass-list-item">
                    <div>
                      <strong>{loan.book?.title}</strong>
                      <p className="small text-body-secondary mb-1">{loan.book?.authorName}</p>
                      <div className="d-flex flex-wrap gap-2">
                        <StatusBadge status={loan.status} />
                        {loan.status === "Issue Requested" ? (
                          <span className="meta-pill">Requested {formatDate(loan.issueRequestedAt)}</span>
                        ) : (
                          <>
                            <span className="meta-pill">Issued {formatDate(loan.issuedAt)}</span>
                            <span className="meta-pill">Due {formatDate(loan.dueAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-lg-end">
                      <p className="small text-body-secondary mb-1">Fine</p>
                      <strong>{formatCurrency(loan.fineAmount)}</strong>
                    </div>
                  </div>
                ))}
                {!data.activeLoans.length ? (
                  <div className="glass-list-item">
                    <p className="small mb-0 text-body-secondary">
                      Your open requests and active loans will appear here.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="card border-0 shadow-sm glass-surface interactive-surface h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Alerts and notifications</h3>
                  <p className="text-body-secondary small mb-0">
                    Quick signals from the library desk.
                  </p>
                </div>
                <Link to="/student/notifications" className="btn btn-sm btn-outline-secondary">
                  Open alerts
                </Link>
              </div>

              <div className="d-grid gap-3">
                {data.notifications.map((item) => (
                  <div key={item.id} className="glass-list-item">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="small text-body-secondary mb-0">{item.message}</p>
                    </div>
                    <StatusBadge status={item.type} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm glass-surface interactive-surface">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Recommended available books</h3>
                  <p className="text-body-secondary small mb-0">
                    A more visual shelf with clean spacing, subtle motion, and fast access.
                  </p>
                </div>
                <Link to="/student/books" className="btn btn-sm btn-outline-secondary">
                  View full shelf
                </Link>
              </div>

              <div className="row g-3">
                {data.recommendedBooks.map((book) => (
                  <div key={book.id} className="col-md-6 col-xl-3">
                    <div className="card border-0 h-100 recommendation-card interactive-surface">
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
