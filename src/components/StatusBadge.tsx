interface StatusBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    PENDING: { label: "Menunggu", className: "badge-pending", icon: "⏳" },
    APPROVED: { label: "Disetujui", className: "badge-approved", icon: "✅" },
    REJECTED: { label: "Ditolak", className: "badge-rejected", icon: "❌" },
  };

  const { label, className, icon } = config[status];

  return (
    <span className={`badge ${className}`}>
      <span>{icon}</span>
      {label}
    </span>
  );
}
