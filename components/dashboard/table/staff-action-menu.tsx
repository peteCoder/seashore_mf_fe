"use client";

import {
  MoreVertical,
  Edit,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StaffActionMenuProps {
  status: "active" | "deactivated" | "restricted";
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onRestrict?: () => void;
  onReassignClient?: () => void;
}

export function StaffActionMenu({
  status,
  onViewDetails,
  onEdit,
  onDeactivate,
  onReactivate,
  onRestrict,
  onReassignClient,
}: StaffActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Staff Actions
        </DropdownMenuLabel>

        {/* ✅ ALWAYS VISIBLE: View Details & Edit */}
        {onViewDetails && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="cursor-pointer"
          >
            <Eye className="w-4 h-4 mr-2 text-blue-500" />
            View details
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="cursor-pointer"
          >
            <Edit className="w-4 h-4 mr-2 text-green-500" />
            Edit staff
          </DropdownMenuItem>
        )}

        {(onViewDetails || onEdit) && <DropdownMenuSeparator />}

        {/* Active Status Actions */}
        {status === "active" && (
          <>
            {onDeactivate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate();
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deactivate account
              </DropdownMenuItem>
            )}
            {onRestrict && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRestrict();
                }}
                className="cursor-pointer text-yellow-600 dark:text-yellow-400 focus:text-yellow-600 dark:focus:text-yellow-400"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Restrict account
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Deactivated Status Actions */}
        {status === "deactivated" && onReactivate && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onReactivate();
            }}
            className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Activate account
          </DropdownMenuItem>
        )}

        {/* Restricted Status Actions */}
        {status === "restricted" && (
          <>
            {onDeactivate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate();
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deactivate account
              </DropdownMenuItem>
            )}
            {onReactivate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivate();
                }}
                className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate account
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
