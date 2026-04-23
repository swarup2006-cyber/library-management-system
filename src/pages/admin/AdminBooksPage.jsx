import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import AppModal from "../../components/modals/AppModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import libraryService from "../../services/libraryService";
import { useToast } from "../../context/ToastContext";

const emptyBook = {
  id: "",
  title: "",
  authorId: "",
  categoryId: "",
  isbn: "",
  publisher: "",
  year: new Date().getFullYear(),
  shelf: "",
  copiesTotal: 1,
  copiesAvailable: 1,
  pages: 200,
  language: "English",
  description: "",
  coverTone: "#0d6efd",
};

export default function AdminBooksPage() {
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [taxonomy, setTaxonomy] = useState({ categories: [], authors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    try {
      setError("");
      const [booksResponse, taxonomyResponse] = await Promise.all([
        libraryService.getBooks(),
        libraryService.getTaxonomy(),
      ]);
      setBooks(booksResponse.books);
      setTaxonomy(taxonomyResponse);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const stats = useMemo(
    () => ({
      titles: books.length,
      copies: books.reduce((sum, book) => sum + book.copiesTotal, 0),
      available: books.reduce((sum, book) => sum + book.copiesAvailable, 0),
    }),
    [books]
  );

  const openCreateModal = () => {
    setBookForm(emptyBook);
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setBookForm({
      ...book,
    });
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await libraryService.saveBook({
        ...bookForm,
        title: bookForm.title || "",
        isbn: bookForm.isbn || "",
        publisher: bookForm.publisher || "",
        shelf: bookForm.shelf || "",
        language: bookForm.language || "",
        description: bookForm.description || "",
      });

      showToast({
        title: bookForm.id ? "Book updated" : "Book added",
        message: `${bookForm.title || "Book"} saved successfully.`,
        variant: "success",
      });
      setModalOpen(false);
      setBookForm(emptyBook);
      await loadPage();
    } catch (requestError) {
      showToast({
        title: "Save failed",
        message: requestError.response?.data?.message || "Unable to save book.",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      return;
    }

    try {
      await libraryService.deleteBook(confirmDelete.id);
      showToast({
        title: "Book deleted",
        message: `${confirmDelete.title} was removed.`,
        variant: "success",
      });
      setConfirmDelete(null);
      await loadPage();
    } catch (requestError) {
      showToast({
        title: "Delete failed",
        message: requestError.response?.data?.message || "Unable to delete book.",
        variant: "danger",
      });
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <div className="d-flex align-items-center gap-3">
          <span className="book-swatch" style={{ backgroundColor: row.coverTone }} />
          <div>
            <strong>{row.title}</strong>
            <div className="small text-body-secondary">{row.authorName}</div>
          </div>
        </div>
      ),
    },
    { key: "categoryName", label: "Category" },
    { key: "isbn", label: "ISBN" },
    { key: "shelf", label: "Shelf" },
    {
      key: "copies",
      label: "Copies",
      render: (row) => `${row.copiesAvailable} / ${row.copiesTotal}`,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openEditModal(row)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setConfirmDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Book Management"
        title="Add, edit, and delete books"
        description="Manage inventory, copies, metadata, shelves, and availability."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            Add book
          </button>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-body-secondary small mb-1">Titles</p>
              <h3 className="mb-0">{stats.titles}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-body-secondary small mb-1">Total copies</p>
              <h3 className="mb-0">{stats.copies}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-body-secondary small mb-1">Available now</p>
              <h3 className="mb-0">{stats.available}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            rows={loading ? [] : books}
            emptyTitle="No books in the catalog"
            emptyDescription="Add the first book to start the library inventory."
          />
        </div>
      </div>

      <AppModal
        open={modalOpen}
        title={bookForm.id ? "Edit book" : "Add new book"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" form="book-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save book"}
            </button>
          </>
        }
      >
        <form id="book-form" className="row g-3" onSubmit={handleSave}>
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={bookForm.title}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Author</label>
            <select
              className="form-select"
              value={bookForm.authorId}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, authorId: event.target.value }))
              }
            >
              <option value="">Select author</option>
              {taxonomy.authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={bookForm.categoryId}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, categoryId: event.target.value }))
              }
            >
              <option value="">Select category</option>
              {taxonomy.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">ISBN</label>
            <input
              className="form-control"
              value={bookForm.isbn}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, isbn: event.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Publisher</label>
            <input
              className="form-control"
              value={bookForm.publisher}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, publisher: event.target.value }))
              }
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Year</label>
            <input
              type="number"
              className="form-control"
              value={bookForm.year}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, year: event.target.value }))
              }
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Shelf</label>
            <input
              className="form-control"
              value={bookForm.shelf}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, shelf: event.target.value }))
              }
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Total copies</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={bookForm.copiesTotal}
              onChange={(event) =>
                setBookForm((current) => ({
                  ...current,
                  copiesTotal: event.target.value,
                }))
              }
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Available copies</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={bookForm.copiesAvailable}
              onChange={(event) =>
                setBookForm((current) => ({
                  ...current,
                  copiesAvailable: event.target.value,
                }))
              }
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Pages</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={bookForm.pages}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, pages: event.target.value }))
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Language</label>
            <input
              className="form-control"
              value={bookForm.language}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, language: event.target.value }))
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Cover color</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={bookForm.coverTone}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, coverTone: event.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              rows="4"
              className="form-control"
              value={bookForm.description}
              onChange={(event) =>
                setBookForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete book"
        description={`Delete ${confirmDelete?.title || "this book"} from the catalog?`}
        confirmLabel="Delete book"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
