export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card border-${toast.variant}`}>
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h6 className="mb-1">{toast.title}</h6>
              <p className="mb-0 text-body-secondary small">{toast.message}</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-body-secondary p-0"
              onClick={() => onDismiss(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
