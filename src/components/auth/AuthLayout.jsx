import BrandLogo from "../common/BrandLogo";

export default function AuthLayout({
  badge,
  title,
  description,
  accent = "student",
  asideTitle,
  asideCopy,
  children,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <div className="auth-hero-column">
          <div className={`auth-hero auth-hero-${accent}`}>
            <BrandLogo inverted />
            <span className="badge text-bg-light text-uppercase">{badge}</span>
            <h1 className="display-6 fw-semibold mt-3">{asideTitle}</h1>
            <p className="lead opacity-75 mb-0">{asideCopy}</p>
          </div>
        </div>

        <div className="auth-main">
          <div className="auth-card card border-0 shadow-lg w-100">
            <div className="card-body p-4 p-lg-5">
              <BrandLogo compact />
              <span className="text-uppercase text-primary small fw-semibold d-inline-block mt-4">
                {badge}
              </span>
              <h2 className="h2 mt-2 mb-2">{title}</h2>
              <p className="text-body-secondary mb-4">{description}</p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
