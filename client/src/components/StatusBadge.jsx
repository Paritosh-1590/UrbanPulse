const statusStyles = {
  Submitted: "submitted",
  "Under Review": "review",
  Assigned: "assigned",
  "In Progress": "progress",
  Resolved: "resolved",
  Rejected: "rejected",
};

export default function StatusBadge({ status = "Submitted" }) {
  const style = statusStyles[status] ?? "submitted";

  return (
    <span className={`status-badge status-badge--${style}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {status}
    </span>
  );
}
