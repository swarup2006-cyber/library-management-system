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
    <div className="auth-shell container-fluid min-vh-100">
      <div className="row min-vh-100">
        <div className="col-lg-5 auth-hero-column d-none d-lg-flex">
          <div className={`auth-hero auth-hero-${accent}`}>
            <span className="badge text-bg-light text-uppercase">{badge}</span>
            <h1 className="display-6 fw-semibold mt-3">{asideTitle}</h1>
            <p className="lead opacity-75 mb-0">{asideCopy}</p>
          </div>
        </div>

        <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-lg-5">
          <div className="auth-card card border-0 shadow-lg w-100">
            <div className="card-body p-4 p-lg-5">
              <span className="text-uppercase text-primary small fw-semibold">{badge}</span>
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
