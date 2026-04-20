export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-shell" role="status" aria-live="polite">
      <div className="loader-spinner" />
      <p className="muted">{label}</p>
    </div>
  );
}
