import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import ConfirmModal from "../../components/modals/ConfirmModal";
import libraryService from "../../services/libraryService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatters";

export default function AdminStudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadStudents = async () => {
    try {
      setError("");
      const response = await libraryService.getStudents();
      setStudents(response.students);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter((student) =>
      `${student.name} ${student.email} ${student.department} ${student.studentId}`
        .toLowerCase()
        .includes(search)
    );
  }, [query, students]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      return;
    }

    try {
      await libraryService.deleteStudent(confirmDelete.id);
      showToast({
        title: "Student deleted",
        message: `${confirmDelete.name} was removed successfully.`,
        variant: "success",
      });
      setConfirmDelete(null);
      await loadStudents();
    } catch (requestError) {
      showToast({
        title: "Delete failed",
        message: requestError.response?.data?.message || "Unable to delete student.",
        variant: "danger",
      });
    }
  };

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          <div className="small text-body-secondary">{row.email}</div>
        </div>
      ),
    },
    { key: "studentId", label: "Student ID" },
    { key: "department", label: "Department" },
    { key: "activeLoanCount", label: "Issued books" },
    {
      key: "fineDue",
      label: "Fine due",
      render: (row) => formatCurrency(row.fineDue),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => setConfirmDelete(row)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Student Management"
        title="Search and manage students"
        description="View students, inspect library activity, and remove inactive accounts."
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label">Search students</label>
          <input
            className="form-control"
            placeholder="Search by name, email, department, or student ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            rows={loading ? [] : filteredStudents}
            emptyTitle="No students found"
            emptyDescription="No student records match the current search."
          />
        </div>
      </div>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete student"
        description={`Delete ${confirmDelete?.name || "this student"} from the system? This only works when the student has no active issued books.`}
        confirmLabel="Delete student"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
