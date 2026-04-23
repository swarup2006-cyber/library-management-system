export default function DashboardHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className = "",
}) {
  return (
    <section className={`dashboard-hero premium-surface ${className}`.trim()}>
      <div className="dashboard-hero-copy">
        <span className="hero-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {actions ? <div className="d-flex flex-wrap gap-2 mt-4">{actions}</div> : null}
      </div>
      {aside ? <div className="dashboard-hero-aside">{aside}</div> : null}
    </section>
  );
}
