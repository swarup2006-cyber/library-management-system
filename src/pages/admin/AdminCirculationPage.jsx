import { useCallback, useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import StudentIssuesPanel from "../../components/admin/StudentIssuesPanel";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import DataTable from "../../components/tables/DataTable";
import libraryService from "../../services/libraryService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function AdminCirculationPage() {
  const { showToast } = useToast();
  const [data, setData] = useState({ students: [], books: [], loans: [] });
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentIssues, setStudentIssues] = useState([]);
  const [studentIssuesLoading, setStudentIssuesLoading] = useState(false);
  const [studentIssuesError, setStudentIssuesError] = useState("");
  const [issueForm, setIssueForm] = useState({ bookId: "" });
  const [busyId, setBusyId] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");

  const loadCirculation = useCallback(async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      setError("");
      const response = await libraryService.getCirculationData();
      setData(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load circulation data.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  const loadStudentIssues = useCallback(async (studentId) => {
    if (!studentId) {
      setStudentIssues([]);
      setStudentIssuesError("");
      setStudentIssuesLoading(false);
      return;
    }

    try {
      setStudentIssuesLoading(true);
      setStudentIssuesError("");
      const response = await libraryService.getStudentIssues(studentId);
      setStudentIssues(response.issues);
    } catch (requestError) {
      setStudentIssues([]);
      setStudentIssuesError(
        requestError.response?.data?.message || "Unable to load issued books for this student."
      );
    } finally {
      setStudentIssuesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCirculation({ showLoader: true });
  }, [loadCirculation]);

  useEffect(() => {
    // Student selection is the trigger for loading the full issue context below.
    loadStudentIssues(selectedStudentId);
  }, [loadStudentIssues, selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }

    const studentStillExists = data.students.some((student) => student.id === selectedStudentId);

    if (!studentStillExists) {
      setSelectedStudentId("");
      setIssueForm({ bookId: "" });
      setStudentIssues([]);
    }
  }, [data.students, selectedStudentId]);

  const selectedStudent = useMemo(
    () => data.students.find((student) => student.id === selectedStudentId) || null,
    [data.students, selectedStudentId]
  );

  const activeLoans = useMemo(
    () => data.loans.filter((loan) => ["Issued", "Overdue", "Return Requested"].includes(loan.status)),
    [data.loans]
  );

  const pendingIssueRequests = useMemo(
    () => data.loans.filter((loan) => loan.status === "Issue Requested"),
    [data.loans]
  );

  const pendingReturnRequests = useMemo(
    () => data.loans.filter((loan) => loan.status === "Return Requested"),
    [data.loans]
  );

  const pendingApprovals = useMemo(
    () => [...pendingIssueRequests, ...pendingReturnRequests],
    [pendingIssueRequests, pendingReturnRequests]
  );

  useEffect(() => {
    if (selectedStudentId || !pendingApprovals.length) {
      return;
    }

    const firstPendingStudentId =
      pendingApprovals[0].student?.id || pendingApprovals[0].studentId || "";

    if (firstPendingStudentId) {
      setSelectedStudentId(firstPendingStudentId);
    }
  }, [pendingApprovals, selectedStudentId]);

  const selectedActiveBookIds = useMemo(
    () =>
      new Set(
        studentIssues
          .filter((loan) => loan.status !== "Returned")
          .map((loan) => loan.bookId || loan.book?.id || loan.book?._id)
      ),
    [studentIssues]
  );

  const availableBooks = useMemo(
    () =>
      data.books.filter(
        (book) => book.copiesAvailable > 0 && !selectedActiveBookIds.has(book.id)
      ),
    [data.books, selectedActiveBookIds]
  );

  const refreshAdminContext = useCallback(
    async (studentId = selectedStudentId) => {
      // Keep counts, book availability, and the selected student's issue list in sync.
      await loadCirculation();
      await loadStudentIssues(studentId);
    },
    [loadCirculation, loadStudentIssues, selectedStudentId]
  );

  const handleStudentChange = (event) => {
    const nextStudentId = event.target.value;
    setSelectedStudentId(nextStudentId);
    setIssueForm({ bookId: "" });
  };

  const handleReviewStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setIssueForm({ bookId: "" });
  };

  const handleIssue = async (event) => {
    event.preventDefault();

    if (!selectedStudentId) {
      return;
    }

    try {
      setIssuing(true);
      await libraryService.issueBookAsAdmin({
        studentId: selectedStudentId,
        bookId: issueForm.bookId,
      });
      showToast({
        title: "Book issued",
        message: "Book issued to the selected student.",
        variant: "success",
      });
      setIssueForm({ bookId: "" });
      await refreshAdminContext(selectedStudentId);
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

  const handleReturn = async (loan) => {
    try {
      setBusyId(loan.id);
      const response = await libraryService.returnBook(loan.id);
      showToast({
        title: "Book returned",
        message: response.message,
        variant: "success",
      });
      await refreshAdminContext(selectedStudentId);
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

  const handleApprove = async (loan) => {
    try {
      setBusyId(loan.id);
      const response = await libraryService.approveReturn(loan.id);
      showToast({
        title: "Return approved",
        message: response.message,
        variant: "success",
      });
      await refreshAdminContext(selectedStudentId);
    } catch (requestError) {
      showToast({
        title: "Approval failed",
        message: requestError.response?.data?.message || "Unable to approve the return.",
        variant: "danger",
      });
    } finally {
      setBusyId("");
    }
  };

  const handleApproveIssue = async (loan) => {
    try {
      setBusyId(loan.id);
      const response = await libraryService.approveIssue(loan.id);
      showToast({
        title: "Issue approved",
        message: response.message,
        variant: "success",
      });
      await refreshAdminContext(selectedStudentId);
    } catch (requestError) {
      showToast({
        title: "Approval failed",
        message: requestError.response?.data?.message || "Unable to approve the issue request.",
        variant: "danger",
      });
    } finally {
      setBusyId("");
    }
  };

  const pendingApprovalColumns = [
    {
      key: "student",
      label: "Student",
      render: (row) => (
        <div>
          <strong>{row.student?.name || "Student"}</strong>
          <div className="small text-body-secondary">
            {row.student?.studentId || row.studentId || "Student record"}
          </div>
        </div>
      ),
    },
    {
      key: "book",
      label: "Book",
      render: (row) => (
        <div>
          <strong>{row.book?.title || "-"}</strong>
          <div className="small text-body-secondary">{row.book?.authorName || "-"}</div>
        </div>
      ),
    },
    {
      key: "requestedAt",
      label: "Requested",
      render: (row) =>
        formatDate(row.status === "Issue Requested" ? row.issueRequestedAt : row.returnRequestedAt),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleReviewStudent(row.student?.id || row.studentId)}
          >
            Review student
          </button>
          {row.status === "Issue Requested" ? (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={busyId === row.id}
              onClick={() => handleApproveIssue(row)}
            >
              {busyId === row.id ? "Approving..." : "Approve Issue"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={busyId === row.id}
              onClick={() => handleApprove(row)}
            >
              {busyId === row.id ? "Approving..." : "Approve Return"}
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader label="Loading circulation data..." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Issue / Return"
        title="Manage circulation"
        description="Student issue requests now wait for admin approval, and the full circulation context stays in one view."
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <section className="card border-0 shadow-sm glass-surface">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <h3 className="h5 mb-1">Select student</h3>
              <p className="text-body-secondary mb-0">
                Choosing a student loads every request and issued book for that student automatically.
              </p>
            </div>
            {selectedStudent ? (
              <div className="d-flex flex-wrap gap-2">
                <span className="meta-pill">{selectedStudent.name}</span>
                <span className="meta-pill">{selectedStudent.studentId || "Student record"}</span>
                <span className="meta-pill">{selectedStudent.activeLoanCount} open items</span>
                <span className="meta-pill">{formatCurrency(selectedStudent.fineDue)} fine due</span>
              </div>
            ) : null}
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={handleStudentChange}
              >
                <option value="">Select student</option>
                {data.students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm glass-surface h-100">
            <div className="card-body">
              <h3 className="h5 mb-3">Issue new book</h3>
              <form className="form-grid" onSubmit={handleIssue}>
                <div className="form-field full-width">
                  <label className="form-label">Student</label>
                  <input
                    className="form-control"
                    value={
                      selectedStudent
                        ? `${selectedStudent.name} (${selectedStudent.studentId || "Student"})`
                        : "Select a student above"
                    }
                    readOnly
                  />
                </div>
                <div className="form-field full-width">
                  <label className="form-label">Book</label>
                  <select
                    className="form-select"
                    value={issueForm.bookId}
                    disabled={!selectedStudentId || issuing}
                    onChange={(event) => setIssueForm({ bookId: event.target.value })}
                  >
                    <option value="">
                      {selectedStudentId ? "Select available book" : "Select a student first"}
                    </option>
                    {availableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.copiesAvailable} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions full-width">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!selectedStudentId || !issueForm.bookId || issuing}
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
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm glass-surface">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Active loans</p>
                  <h3 className="mb-0">{activeLoans.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm glass-surface">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Issue requests</p>
                  <h3 className="mb-0">{pendingIssueRequests.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm glass-surface">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Return requests</p>
                  <h3 className="mb-0">{pendingReturnRequests.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm glass-surface">
                <div className="card-body">
                  <p className="text-body-secondary small mb-1">Books available</p>
                  <h3 className="mb-0">
                    {data.books.reduce((sum, book) => sum + book.copiesAvailable, 0)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          {pendingApprovals.length ? (
            <p className="text-body-secondary small mt-3 mb-0">
              {pendingApprovals.length} approval request{pendingApprovals.length === 1 ? "" : "s"} waiting across the desk.
            </p>
          ) : null}
        </div>
      </div>

      <section className="card border-0 shadow-sm glass-surface mt-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <h3 className="h5 mb-1">Pending approval requests</h3>
              <p className="text-body-secondary mb-0">
                Student issue and return requests appear here as soon as they are submitted.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="meta-pill">{pendingIssueRequests.length} issue requests</span>
              <span className="meta-pill">{pendingReturnRequests.length} return requests</span>
            </div>
          </div>

          <DataTable
            columns={pendingApprovalColumns}
            rows={pendingApprovals}
            emptyTitle="No pending requests"
            emptyDescription="New student issue and return requests will show up here automatically."
          />
        </div>
      </section>

      <StudentIssuesPanel
        student={selectedStudent}
        issues={studentIssues}
        loading={studentIssuesLoading}
        error={studentIssuesError}
        busyId={busyId}
        onApproveIssue={handleApproveIssue}
        onReturn={handleReturn}
        onApprove={handleApprove}
      />
    </>
  );
}
