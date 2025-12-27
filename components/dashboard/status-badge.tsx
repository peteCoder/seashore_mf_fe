import { cn } from "@/lib/utils";

type StatusType =
  // Client statuses
  | "active"
  | "deactivated"
  | "restricted"
  | "suspended"
  // Loan statuses
  | "pending_approval"
  | "approved"
  | "rejected"
  | "disbursed"
  | "completed"
  | "overdue"
  | "defaulted"
  // Savings statuses
  | "active_savings"
  | "inactive_savings"
  | "closed";

interface StatusBadgeProps {
  status: StatusType;
  variant?: "default" | "success" | "warning" | "error";
}

const statusStyles = {
  // Client statuses
  active:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  deactivated: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  restricted:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  suspended:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",

  // Loan statuses
  pending_approval:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  approved: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  rejected: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  disbursed:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  completed:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  overdue: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  defaulted: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",

  // Savings statuses
  active_savings:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  inactive_savings:
    "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400",
  closed: "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400",
};

const variantStyles = {
  default: "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400",
  success:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  warning:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  error: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
};

const statusLabels: Record<StatusType, string> = {
  // Client statuses
  active: "Active",
  deactivated: "Deactivated",
  restricted: "Restricted",
  suspended: "Suspended",

  // Loan statuses
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
  completed: "Completed",
  overdue: "Overdue",
  defaulted: "Defaulted",

  // Savings statuses
  active_savings: "Active",
  inactive_savings: "Inactive",
  closed: "Closed",
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  // Use variant style if provided, otherwise use status-specific style
  const styleClass = variant ? variantStyles[variant] : statusStyles[status];
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium",
        styleClass
      )}
    >
      {label}
    </span>
  );
}
