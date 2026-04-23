export default function AppModal({ open, title, children, footer, onClose, size = "lg" }) {
  if (!open) {
    return null;
  }

  return (
    <div className="app-modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal-dialog modal-dialog-centered modal-${size}`}>
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">{children}</div>
          {footer ? <div className="modal-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
