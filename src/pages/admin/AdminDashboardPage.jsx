import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import DashboardHero from "../../components/common/DashboardHero";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import libraryService from "../../services/libraryService";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const response = await libraryService.getAdminDashboard();

        if (mounted) {
          setData(response);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.response?.data?.message || "Unable to load admin dashboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const handleRefresh = () => {
      loadDashboard();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboard();
      }
    };

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return <Loader label="Loading admin dashboard..." />;
  }

  if (!data) {
    return <div className="alert alert-danger">{error || "Dashboard data unavailable."}</div>;
  }

  return (
    <>
      <DashboardHero
        eyebrow="Admin Dashboard"
        title="Operate BookHeaven from one premium control deck"
        description="Monitor circulation, approve issue and return requests, track fines, and manage the collection in a darker, quieter workspace."
        actions={
          <>
            <Link to="/admin/circulation" className="btn btn-primary hero-button">
              Review circulation
            </Link>
            <Link to="/admin/books" className="btn btn-outline-light hero-button">
              Manage books
            </Link>
          </>
        }
        aside={
          <div className="glass-panel">
            <p className="text-uppercase small fw-semibold text-info mb-2">Pending focus</p>
            <h2 className="h4 mb-2">{data.stats.pendingApprovals} approvals awaiting action</h2>
            <p className="small text-body-secondary mb-3">
              {data.stats.pendingIssues} issue requests and {data.stats.pendingReturns} return requests are waiting.
            </p>
            <div className="d-grid gap-3">
              {data.overdueLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="glass-list-item">
                  <div>
                    <strong>{loan.student?.name}</strong>
                    <p className="small text-body-secondary mb-0">
                      {loan.book?.title} - due {formatDate(loan.dueAt)}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              ))}
              {!data.overdueLoans.length ? (
                <div className="glass-list-item">
                  <p className="small mb-0 text-body-secondary">
                    No overdue books right now. The floor is quiet.
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
          value={data.stats.totalTitles}
          helper={`${data.stats.totalBooks} copies currently in stock`}
          accent="primary"
          icon="books"
        />
        <StatCard
          label="Issued Books"
          value={data.stats.issuedBooks}
          helper="Loans still active on the circulation desk"
          accent="warning"
          icon="issue"
        />
        <StatCard
          label="Returned Books"
          value={data.stats.returnedBooks}
          helper="Completed loans already approved by admin"
          accent="success"
          icon="return"
        />
        <StatCard
          label="Fine Amount"
          value={formatCurrency(data.stats.finesCollected)}
          helper="Frozen fine exposure across all tracked records"
          accent="danger"
          icon="fine"
        />
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm glass-surface interactive-surface">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Recent circulation</h3>
                  <p className="text-body-secondary small mb-0">
                    Loans, return requests, and approvals flowing through the desk.
                  </p>
                </div>
                <Link to="/admin/reports" className="btn btn-sm btn-outline-secondary">
                  Open reports
                </Link>
              </div>

              <div className="d-grid gap-3">
                {data.recentLoans.map((loan) => (
                  <div key={loan.id} className="glass-list-item">
                    <div>
                      <strong>{loan.book?.title}</strong>
                      <p className="small text-body-secondary mb-1">
                        {loan.status === "Issue Requested"
                          ? `${loan.student?.name} - requested ${formatDate(loan.issueRequestedAt)}`
                          : `${loan.student?.name} - due ${formatDate(loan.dueAt)}`}
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        <StatusBadge status={loan.status} />
                        <span className="meta-pill">
                          {loan.status === "Issue Requested"
                            ? `Requested ${formatDate(loan.issueRequestedAt)}`
                            : `Issued ${formatDate(loan.issuedAt)}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-lg-end">
                      <p className="small text-body-secondary mb-1">Fine</p>
                      <strong>{formatCurrency(loan.fineAmount)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm glass-surface interactive-surface mb-4">
            <div className="card-body p-4">
              <h3 className="h5 mb-3">Students added recently</h3>
              <div className="d-grid gap-3">
                {data.recentStudents.map((student) => (
                  <div key={student.id} className="glass-list-item">
                    <div>
                      <strong>{student.name}</strong>
                      <p className="small text-body-secondary mb-0">{student.email}</p>
                    </div>
                    <span className="meta-pill">{student.activeLoanCount} active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm glass-surface interactive-surface">
            <div className="card-body p-4">
              <h3 className="h5 mb-3">Popular titles</h3>
              <div className="d-grid gap-3">
                {data.popularBooks.map((book) => (
                  <div key={book.id} className="glass-list-item">
                    <div>
                      <strong>{book.title}</strong>
                      <p className="small text-body-secondary mb-0">{book.authorName}</p>
                    </div>
                    <span className="meta-pill">{book.activeBorrowCount} loans</span>
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
