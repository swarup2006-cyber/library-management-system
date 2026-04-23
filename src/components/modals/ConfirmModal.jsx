import AppModal from "./AppModal";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onCancel,
  onConfirm,
}) {
  return (
    <AppModal
      open={open}
      title={title}
      onClose={onCancel}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-secondary mb-0">{description}</p>
    </AppModal>
  );
}
