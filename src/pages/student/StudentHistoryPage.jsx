import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import libraryService from "../../services/libraryService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

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
      active: loans.filter((loan) => loan.status === "Issued" || loan.status === "Overdue").length,
      requested: loans.filter((loan) => loan.status === "Return Requested").length,
      returned: loans.filter((loan) => loan.status === "Returned").length,
      fines: loans.reduce((sum, loan) => sum + loan.fineAmount, 0),
    }),
    [loans]
  );

  const handleRequestReturn = async (loanId) => {
    try {
      setBusyId(loanId);
      const response = await libraryService.requestReturn(loanId);
      await loadHistory();
      await refreshUser();
      showToast({
        title: "Return requested",
        message: response.message,
        variant: "success",
      });
    } catch (requestError) {
      showToast({
        title: "Request failed",
        message: requestError.response?.data?.message || "Unable to request the return.",
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
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "fineAmount",
      label: "Fine",
      render: (row) => formatCurrency(row.fineAmount),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => {
        if (row.status === "Returned") {
          return <StatusBadge status="Returned" />;
        }

        if (row.status === "Return Requested") {
          return <span className="text-body-secondary small">Waiting for admin approval</span>;
        }

        return (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={busyId === row.id}
            onClick={() => handleRequestReturn(row.id)}
          >
            {busyId === row.id ? "Sending..." : "Request Return"}
          </button>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Issue History"
        title="Issued and returned books"
        description="Students now send a return request first. Admin approval closes the loan."
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <StatCard label="Issued" value={summary.active} helper="Books still in progress" accent="primary" icon="issue" />
        <StatCard
          label="Return Requested"
          value={summary.requested}
          helper="Awaiting admin approval"
          accent="warning"
          icon="return"
        />
        <StatCard
          label="Returned"
          value={summary.returned}
          helper="Loans already approved and completed"
          accent="success"
          icon="return"
        />
        <StatCard
          label="Fine Amount"
          value={formatCurrency(summary.fines)}
          helper="Frozen at request time when applicable"
          accent="danger"
          icon="fine"
        />
      </div>

      <div className="card border-0 shadow-sm glass-surface">
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
