export default function Loader({ label = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
      <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      <p className="text-body-secondary mb-0">{label}</p>
    </div>
  );
}
