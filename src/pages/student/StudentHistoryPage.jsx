import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/tables/DataTable";
import libraryService from "../../services/libraryService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, getStatusBadge } from "../../utils/formatters";

export default function StudentHistoryPage() {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setError("");
      const response = await libraryService.getStudentHistory();
      setLoans(response.loans);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load issue history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const summary = useMemo(
    () => ({
      active: loans.filter((loan) => loan.status !== "Returned").length,
      overdue: loans.filter((loan) => loan.status === "Overdue").length,
      returned: loans.filter((loan) => loan.status === "Returned").length,
      fines: loans.reduce((sum, loan) => sum + loan.fineAmount, 0),
    }),
    [loans]
  );

  const handleReturn = async (loanId) => {
    try {
      setBusyId(loanId);
      const response = await libraryService.returnBook(loanId);
      await loadHistory();
      await refreshUser();
      showToast({
        title: "Return complete",
        message: response.message,
        variant: "success",
      });
    } catch (requestError) {
      showToast({
        title: "Return failed",
        message: requestError.response?.data?.message || "Unable to return the book.",
        variant: "danger",
      });
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <Loader label="Loading issued books..." />;
  }

  const columns = [
    {
      key: "book",
      label: "Book",
      render: (row) => (
        <div>
          <strong>{row.book?.title}</strong>
          <div className="small text-body-secondary">{row.book?.authorName}</div>
        </div>
      ),
    },
    {
      key: "issuedAt",
      label: "Issued",
      render: (row) => formatDate(row.issuedAt),
    },
    {
      key: "dueAt",
      label: "Due",
      render: (row) => formatDate(row.dueAt),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`badge text-bg-${getStatusBadge(row.status)}`}>{row.status}</span>
      ),
    },
    {
      key: "fineAmount",
      label: "Fine",
      render: (row) => formatCurrency(row.fineAmount),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) =>
        row.status === "Returned" ? (
          <span className="text-body-secondary small">Completed</span>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={busyId === row.id}
            onClick={() => handleReturn(row.id)}
          >
            {busyId === row.id ? "Returning..." : "Return"}
          </button>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Issued History"
        title="Issued and returned books"
        description="Review all issued books, due dates, return status, and fines."
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <StatCard label="Active" value={summary.active} helper="Currently issued books" />
        <StatCard
          label="Overdue"
          value={summary.overdue}
          helper="Books that need to be returned soon"
          accent="danger"
        />
        <StatCard
          label="Returned"
          value={summary.returned}
          helper="Books already checked back in"
          accent="success"
        />
        <StatCard
          label="Fine total"
          value={formatCurrency(summary.fines)}
          helper="Estimated fines across the full history"
          accent="warning"
        />
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            rows={loans}
            emptyTitle="No loan records yet"
            emptyDescription="Issue a book from the catalog and your history will appear here."
          />
        </div>
      </div>
    </>
  );
}
