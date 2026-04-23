export default function EmptyState({ title, description, action }) {
  return (
    <div className="card border-dashed shadow-sm">
      <div className="card-body py-5 text-center">
        <h3 className="h5 mb-2">{title}</h3>
        <p className="text-body-secondary mb-3">{description}</p>
        {action}
      </div>
    </div>
  );
}
