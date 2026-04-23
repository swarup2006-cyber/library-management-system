export const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "overdue" || normalized === "danger") {
    return "danger";
  }

  if (
    normalized === "return requested" ||
    normalized === "pending_return" ||
    normalized === "warning"
  ) {
    return "warning";
  }

  if (normalized === "returned" || normalized === "success") {
    return "success";
  }

  if (normalized === "issued" || normalized === "info") {
    return "primary";
  }

  return "secondary";
};
