const statusClasses = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  RESOLVED: "bg-green-50 text-green-700 ring-green-200",
  CLOSED: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  REOPENED: "bg-purple-50 text-purple-700 ring-purple-200"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[status] || "bg-neutral-100 text-neutral-700 ring-neutral-200"}`}>
      {status || "UNKNOWN"}
    </span>
  );
}
