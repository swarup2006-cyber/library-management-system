import { useMemo } from "react";
import DataTable from "../tables/DataTable";
import EmptyState from "../common/EmptyState";
import Loader from "../Loader";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function StudentIssuesPanel({
  student,
  issues,
  loading,
  error,
  busyId,
  onReturn,
  onApprove,
}) {
  const columns = useMemo(
    () => [
      {
        key: "book",
        label: "Book Name",
        render: (row) => (
          <div>
            <strong>{row.book?.title || "-"}</strong>
            <div className="small text-body-secondary">{row.book?.authorName || row.book?.author}</div>
          </div>
        ),
      },
      {
        key: "issueDate",
        label: "Issue Date",
        render: (row) => formatDate(row.issueDate || row.issuedAt),
      },
      { key: "dueAt", label: "Due Date", render: (row) => formatDate(row.dueAt) },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "fine",
        label: "Fine",
        render: (row) => formatCurrency(row.fineAmount ?? row.fine),
      },
      {
        key: "actions",
        label: "Action",
        render: (row) => {
          if (row.status === "Return Requested") {
            return (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={busyId === row.id}
                onClick={() => onApprove(row)}
              >
                {busyId === row.id ? "Approving..." : "Approve Return"}
              </button>
            );
          }

          if (row.status === "Issued" || row.status === "Overdue") {
            return (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={busyId === row.id}
                onClick={() => onReturn(row)}
              >
                {busyId === row.id ? "Returning..." : "Return"}
              </button>
            );
          }

          return <span className="text-body-secondary small">Completed</span>;
        },
      },
    ],
    [busyId, onApprove, onReturn]
  );

  const activeIssues = issues.filter((issue) => issue.status !== "Returned").length;
  const fineDue = issues
    .filter((issue) => issue.status !== "Returned")
    .reduce((sum, issue) => sum + (issue.fineAmount ?? issue.fine ?? 0), 0);

  return (
    <section className="card border-0 shadow-sm glass-surface">
      <div className="card-body">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
          <div>
            <h3 className="h5 mb-1">Issued books for selected student</h3>
            <p className="text-body-secondary mb-0">
              Choosing a student loads the full issue context instantly for returns and approvals.
            </p>
          </div>

          {student ? (
            <div className="d-flex flex-wrap gap-2">
              <span className="meta-pill">{student.name}</span>
              <span className="meta-pill">{student.studentId || "Student record"}</span>
              <span className="meta-pill">{activeIssues} active</span>
              <span className="meta-pill">{formatCurrency(fineDue)} fine</span>
            </div>
          ) : null}
        </div>

        {!student ? (
          <EmptyState
            title="Select a student to view issued books"
            description="The student context appears here automatically after you choose a student above."
          />
        ) : loading ? (
          <Loader label={`Loading issued books for ${student.name}...`} />
        ) : error ? (
          <div className="alert alert-danger mb-0">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            rows={issues}
            emptyTitle="No books issued for this student"
            emptyDescription="Issue a new book from the section above and it will appear here immediately."
          />
        )}
      </div>
    </section>
  );
}
