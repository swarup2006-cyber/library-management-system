export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? (
          <span className="text-uppercase text-primary small fw-semibold">{eyebrow}</span>
        ) : null}
        <h1 className="h3 mb-1 mt-1">{title}</h1>
        <p className="text-body-secondary mb-0">{description}</p>
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  );
}
