export default function BrandLogo({ compact = false, inverted = false }) {
  return (
    <div className={`brand-logo ${compact ? "compact" : ""} ${inverted ? "inverted" : ""}`}>
      <span className="brand-logo-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img" focusable="false">
          <path
            d="M12 10.5C12 8.57 13.57 7 15.5 7H34a2 2 0 0 1 2 2v25.5A3.5 3.5 0 0 0 32.5 31H15.5A3.5 3.5 0 0 0 12 34.5v-24Z"
            fill="rgba(8, 15, 29, 0.55)"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18 16h12M18 22h12M18 28h8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M15.5 7C13.57 7 12 8.57 12 10.5v24a3.5 3.5 0 0 1 3.5-3.5H32.5"
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="1.4"
          />
        </svg>
      </span>
      <span className="brand-logo-copy">
        <strong>BookHeaven</strong>
        {!compact ? <small>Modern library workspace</small> : null}
      </span>
    </div>
  );
}
