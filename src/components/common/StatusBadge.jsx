import { getStatusBadge } from "../../utils/formatters";

export default function StatusBadge({ status, className = "" }) {
  const tone = getStatusBadge(status);
  const label = String(status || "")
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");

  return <span className={`status-badge status-${tone} ${className}`.trim()}>{label}</span>;
}
