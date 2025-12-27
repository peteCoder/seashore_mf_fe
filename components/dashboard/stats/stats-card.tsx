import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "error";
}

const variantStyles = {
  default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  success:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  warning:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  error: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0",
            variantStyles[variant]
          )}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">
          {label}
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
