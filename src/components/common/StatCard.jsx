export default function StatCard({ label, value, helper, accent = "primary" }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card shadow-sm border-0 stat-card stat-card-${accent}`}>
        <div className="card-body">
          <p className="text-body-secondary small text-uppercase fw-semibold mb-2">
            {label}
          </p>
          <h2 className="display-6 fw-semibold mb-1">{value}</h2>
          <p className="text-body-secondary small mb-0">{helper}</p>
        </div>
      </div>
    </div>
  );
}
