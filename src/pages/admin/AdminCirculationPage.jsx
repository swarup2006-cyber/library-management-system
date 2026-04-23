import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import libraryService from "../../services/libraryService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, getStatusBadge } from "../../utils/formatters";

export default function AdminCirculationPage() {
  const { showToast } = useToast();
  const [data, setData] = useState({ students: [], books: [], loans: [] });
  const [loading, setLoading] = useState(true);
  const [issueForm, setIssueForm] = useState({
    studentId: "",
    bookId: "",
  });
  const [busyId, setBusyId] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");

  const loadCirculation = async () => {
    try {
      setError("");
      const response = await libraryService.getCirculationData();
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load circulation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCirculation();
  }, []);

  const activeLoans = useMemo(
    () => data.loans.filter((loan) => loan.status !== "Returned"),
    [data.loans]
  );

  const availableBooks = useMemo(
    () => data.books.filter((book) => book.copiesAvailable > 0),
    [data.books]
  );

  const handleIssue = async (event) => {
    event.preventDefault();

    try {
      setIssuing(true);
      await libraryService.issueBookAsAdmin(issueForm);
      showToast({
        title: "Book issued",
        message: "Book issued to the selected student.",
        variant: "success",
      });
      setIssueForm({ studentId: "", bookId: "" });
      await loadCirculation();
    } catch (requestError) {
      showToast({
        title: "Issue failed",
        message: requestError.response?.data?.message || "Unable to issue the book.",
        variant: "danger",
      });
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = async (loanId) => {
    try {
      setBusyId(loanId);
      const response = await libraryService.returnBook(loanId);
      showToast({
        title: "Return processed",
        message: response.message,
        variant: "success",
      });
      await loadCirculation();
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

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (row) => (
        <div>
          <strong>{row.student?.name}</strong>
          <div className="small text-body-secondary">{row.student?.studentId}</div>
        </div>
      ),
    },
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
    {
      key: "actions",
      label: "Action",
      render: (row) => (
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
        eyebrow="Issue / Return"
        title="Manage circulation"
        description="Issue books to students, monitor active loans, and process returns."
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4 mb-4">
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h3 className="h5 mb-3">Issue a book</h3>
              <form className="row g-3" onSubmit={handleIssue}>
                <div className="col-12">
                  <label className="form-label">Student</label>
                  <select
                    className="form-select"
                    value={issueForm.studentId}
                    onChange={(event) =>
                      setIssueForm((current) => ({ ...current, studentId: event.target.value }))
                    }
                  >
                    <option value="">Select student</option>
                    {data.students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Book</label>
                  <select
                    className="form-select"
                    value={issueForm.bookId}
                    onChange={(event) =>
                      setIssueForm((current) => ({ ...current, bookId: event.target.value }))
                    }
                  >
                    <option value="">Select book</option>
                    {availableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.copiesAvailable} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!issueForm.studentId || !issueForm.bookId || issuing}
                  >
                    {issuing ? "Issuing..." : "Issue book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Active loans</p>
                  <h3 className="mb-0">{activeLoans.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Students</p>
                  <h3 className="mb-0">{data.students.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Books available</p>
                  <h3 className="mb-0">{availableBooks.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            rows={loading ? [] : activeLoans}
            emptyTitle="No active loans"
            emptyDescription="Issued books will appear here for return processing."
          />
        </div>
      </div>
    </>
  );
}
