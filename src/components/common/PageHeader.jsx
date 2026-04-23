export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
      <div>
        {eyebrow ? (
          <span className="text-uppercase text-primary small fw-semibold">{eyebrow}</span>
        ) : null}
        <h1 className="h3 mb-1 mt-1">{title}</h1>
        <p className="text-body-secondary mb-0">{description}</p>
      </div>
      {actions ? <div className="d-flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
