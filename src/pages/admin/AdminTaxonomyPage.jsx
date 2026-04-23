import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import AppModal from "../../components/modals/AppModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import libraryService from "../../services/libraryService";
import { useToast } from "../../context/ToastContext";

const emptyEditor = {
  type: "category",
  item: {
    id: "",
    name: "",
    description: "",
    country: "",
  },
};

export default function AdminTaxonomyPage() {
  const { showToast } = useToast();
  const [taxonomy, setTaxonomy] = useState({ categories: [], authors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(emptyEditor);
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadTaxonomy = async () => {
    try {
      setError("");
      const response = await libraryService.getTaxonomy();
      setTaxonomy(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load taxonomy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const openEditor = (type, item = null) => {
    setEditor({
      type,
      item: item
        ? { ...item }
        : {
            id: "",
            name: "",
            description: "",
            country: "",
          },
    });
    setEditorOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      if (editor.type === "category") {
        await libraryService.saveCategory(editor.item);
      } else {
        await libraryService.saveAuthor(editor.item);
      }

      showToast({
        title: `${editor.type === "category" ? "Category" : "Author"} saved`,
        message: `${editor.item.name || "Item"} updated successfully.`,
        variant: "success",
      });
      setEditorOpen(false);
      await loadTaxonomy();
    } catch (requestError) {
      showToast({
        title: "Save failed",
        message: requestError.response?.data?.message || "Unable to save item.",
        variant: "danger",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      return;
    }

    try {
      if (confirmDelete.type === "category") {
        await libraryService.deleteCategory(confirmDelete.item.id);
      } else {
        await libraryService.deleteAuthor(confirmDelete.item.id);
      }

      showToast({
        title: `${confirmDelete.type === "category" ? "Category" : "Author"} deleted`,
        message: `${confirmDelete.item.name} removed successfully.`,
        variant: "success",
      });
      setConfirmDelete(null);
      await loadTaxonomy();
    } catch (requestError) {
      showToast({
        title: "Delete failed",
        message: requestError.response?.data?.message || "Unable to delete item.",
        variant: "danger",
      });
    }
  };

  const categoryColumns = [
    { key: "name", label: "Category" },
    { key: "description", label: "Description" },
    { key: "bookCount", label: "Books" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openEditor("category", row)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setConfirmDelete({ type: "category", item: row })}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const authorColumns = [
    { key: "name", label: "Author" },
    { key: "country", label: "Country" },
    { key: "description", label: "About" },
    { key: "bookCount", label: "Books" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openEditor("author", row)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setConfirmDelete({ type: "author", item: row })}
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
        eyebrow="Categories & Authors"
        title="Manage taxonomy"
        description="Keep book categories and author records organized for the full catalog."
        actions={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => openEditor("author")}
            >
              Add author
            </button>
            <button type="button" className="btn btn-primary" onClick={() => openEditor("category")}>
              Add category
            </button>
          </>
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Categories</h3>
              <DataTable
                columns={categoryColumns}
                rows={loading ? [] : taxonomy.categories}
                emptyTitle="No categories yet"
                emptyDescription="Add the first category to organize the catalog."
              />
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Authors</h3>
              <DataTable
                columns={authorColumns}
                rows={loading ? [] : taxonomy.authors}
                emptyTitle="No authors yet"
                emptyDescription="Add the first author to complete the catalog metadata."
              />
            </div>
          </div>
        </div>
      </div>

      <AppModal
        open={editorOpen}
        title={`${editor.item.id ? "Edit" : "Add"} ${editor.type}`}
        onClose={() => setEditorOpen(false)}
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" form="taxonomy-form" className="btn btn-primary">
              Save
            </button>
          </>
        }
      >
        <form id="taxonomy-form" className="form-grid" onSubmit={handleSave}>
          <div className="form-field full-width">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={editor.item.name}
              onChange={(event) =>
                setEditor((current) => ({
                  ...current,
                  item: { ...current.item, name: event.target.value },
                }))
              }
            />
          </div>

          {editor.type === "author" ? (
            <div className="form-field full-width">
              <label className="form-label">Country</label>
              <input
                className="form-control"
                value={editor.item.country || ""}
                onChange={(event) =>
                  setEditor((current) => ({
                    ...current,
                    item: { ...current.item, country: event.target.value },
                  }))
                }
              />
            </div>
          ) : null}

          <div className="form-field full-width">
            <label className="form-label">
              {editor.type === "category" ? "Description" : "Author bio"}
            </label>
            <textarea
              rows="4"
              className="form-control"
              value={editor.item.description || ""}
              onChange={(event) =>
                setEditor((current) => ({
                  ...current,
                  item: { ...current.item, description: event.target.value },
                }))
              }
            />
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title={`Delete ${confirmDelete?.type || "item"}`}
        description={`Delete ${confirmDelete?.item?.name || "this item"} from the library taxonomy?`}
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
