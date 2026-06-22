const priorityClasses = {
  LOW: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  MEDIUM: "bg-blue-50 text-blue-700 ring-blue-200",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-200",
  CRITICAL: "bg-red-50 text-red-700 ring-red-200"
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${priorityClasses[priority] || "bg-neutral-100 text-neutral-700 ring-neutral-200"}`}>
      {priority || "UNKNOWN"}
    </span>
  );
}
