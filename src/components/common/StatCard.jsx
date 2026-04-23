const iconPaths = {
  books: (
    <>
      <path d="M9 7.5A2.5 2.5 0 0 1 11.5 5H26v20H11.5A2.5 2.5 0 0 0 9 27.5V7.5Z" />
      <path d="M14 11h7M14 15h7M14 19h5" />
    </>
  ),
  issue: (
    <>
      <path d="M8 16h12" />
      <path d="m16 10 6 6-6 6" />
      <path d="M6 8h6" />
    </>
  ),
  return: (
    <>
      <path d="M24 16H12" />
      <path d="m16 10-6 6 6 6" />
      <path d="M20 8h4" />
    </>
  ),
  fine: (
    <>
      <path d="M16 7v18" />
      <path d="M21 10.5a4 4 0 0 0-5-2.5A3.5 3.5 0 0 0 14 11c0 4.5 8 2.5 8 7a3.8 3.8 0 0 1-3 3.6A4.5 4.5 0 0 1 11 19.5" />
    </>
  ),
  users: (
    <>
      <path d="M16 15a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M8 25a8 8 0 0 1 16 0" />
    </>
  ),
};

function StatIcon({ icon }) {
  if (!iconPaths[icon]) {
    return null;
  }

  return (
    <span className="stat-card-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        {iconPaths[icon]}
      </svg>
    </span>
  );
}

export default function StatCard({ label, value, helper, accent = "primary", icon }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card shadow-sm border-0 stat-card stat-card-${accent} interactive-surface`}>
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <p className="text-body-secondary small text-uppercase fw-semibold mb-2">
              {label}
            </p>
            <StatIcon icon={icon} />
          </div>
          <h2 className="display-6 fw-semibold mb-1">{value}</h2>
          <p className="text-body-secondary small mb-0">{helper}</p>
        </div>
      </div>
    </div>
  );
}
