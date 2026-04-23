import EmptyState from "../common/EmptyState";

export default function DataTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  keyField = "id",
}) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle table-hover mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.headerClassName}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
