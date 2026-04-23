import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import libraryService from "../../services/libraryService";
import { formatCurrency, formatDate, getStatusBadge } from "../../utils/formatters";

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

    return () => {
      mounted = false;
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
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Library management overview"
        description="Monitor titles, students, circulation, overdue books, and fines from one workspace."
        actions={
          <>
            <Link to="/admin/books" className="btn btn-primary">
              Manage books
            </Link>
            <Link to="/admin/circulation" className="btn btn-outline-secondary">
              Issue / return
            </Link>
          </>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <StatCard
          label="Total titles"
          value={data.stats.totalTitles}
          helper={`${data.stats.totalBooks} total copies in stock`}
        />
        <StatCard
          label="Students"
          value={data.stats.totalStudents}
          helper="Registered student accounts"
          accent="success"
        />
        <StatCard
          label="Issued books"
          value={data.stats.issuedBooks}
          helper="Currently active circulation"
          accent="warning"
        />
        <StatCard
          label="Overdue + fines"
          value={`${data.stats.overdueBooks} / ${formatCurrency(data.stats.finesCollected)}`}
          helper="Overdue items and total fine exposure"
          accent="danger"
        />
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Recent circulation</h3>
                  <p className="text-body-secondary small mb-0">
                    Latest issue and return activity across the library.
                  </p>
                </div>
                <Link to="/admin/reports" className="btn btn-sm btn-outline-secondary">
                  Open reports
                </Link>
              </div>

              <div className="d-grid gap-3">
                {data.recentLoans.map((loan) => (
                  <div key={loan.id} className="border rounded-3 p-3">
                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                      <div>
                        <h4 className="h6 mb-1">{loan.book?.title}</h4>
                        <p className="text-body-secondary small mb-1">
                          {loan.student?.name} • Due {formatDate(loan.dueAt)}
                        </p>
                      </div>
                      <div className="text-lg-end">
                        <span className={`badge text-bg-${getStatusBadge(loan.status)}`}>
                          {loan.status}
                        </span>
                        <p className="small text-body-secondary mt-2 mb-0">
                          Fine {formatCurrency(loan.fineAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h3 className="h5 mb-3">Students added recently</h3>
              <div className="d-grid gap-3">
                {data.recentStudents.map((student) => (
                  <div key={student.id} className="border rounded-3 p-3">
                    <strong>{student.name}</strong>
                    <p className="text-body-secondary small mb-1">{student.email}</p>
                    <p className="small mb-0">
                      {student.department} • {student.activeLoanCount} active loans
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Popular titles</h3>
              <div className="d-grid gap-3">
                {data.popularBooks.map((book) => (
                  <div key={book.id} className="d-flex justify-content-between gap-3">
                    <div>
                      <strong>{book.title}</strong>
                      <p className="text-body-secondary small mb-0">{book.authorName}</p>
                    </div>
                    <span className="badge text-bg-light">{book.activeBorrowCount} loans</span>
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
