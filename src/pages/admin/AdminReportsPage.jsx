import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/tables/DataTable";
import libraryService from "../../services/libraryService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, getStatusBadge } from "../../utils/formatters";

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        const response = await libraryService.getReports();
        if (mounted) {
          setReports(response);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.response?.data?.message || "Unable to load reports.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  if (!reports && loading) {
    return <div className="py-5 text-center">Loading reports...</div>;
  }

  const baseColumns = [
    {
      key: "student",
      label: "Student",
      render: (row) => row.student?.name || "-",
    },
    {
      key: "book",
      label: "Book",
      render: (row) => row.book?.title || "-",
    },
    { key: "issuedAt", label: "Issued", render: (row) => formatDate(row.issuedAt) },
    { key: "dueAt", label: "Due", render: (row) => formatDate(row.dueAt) },
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
  ];

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Issued books, overdue books, and fines"
        description="Monitor borrowing activity and summary metrics without touching the backend."
        actions={
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() =>
              showToast({
                title: "Export queued",
                message: "Export is mocked for now, but the reports are ready in the UI.",
                variant: "info",
              })
            }
          >
            Export report
          </button>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {reports ? (
        <div className="row g-3 mb-4">
          <StatCard
            label="Active issues"
            value={reports.summary.activeIssues}
            helper="Currently issued and not yet returned"
          />
          <StatCard
            label="Overdue books"
            value={reports.summary.overdueCount}
            helper="Loans past the due date"
            accent="danger"
          />
          <StatCard
            label="Returned"
            value={reports.summary.returnedCount}
            helper="Completed circulation records"
            accent="success"
          />
          <StatCard
            label="Total fines"
            value={formatCurrency(reports.summary.totalFine)}
            helper="Accumulated fines across all records"
            accent="warning"
          />
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Issued books report</h3>
              <DataTable
                columns={baseColumns}
                rows={reports?.issuedLoans || []}
                emptyTitle="No issued books"
                emptyDescription="There are currently no active issued books."
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Overdue report</h3>
              <DataTable
                columns={baseColumns}
                rows={reports?.overdueLoans || []}
                emptyTitle="No overdue books"
                emptyDescription="Every issued book is currently within the due date."
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Fine report</h3>
              <DataTable
                columns={baseColumns}
                rows={reports?.fines || []}
                emptyTitle="No fines due"
                emptyDescription="No loans currently have a fine attached."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
