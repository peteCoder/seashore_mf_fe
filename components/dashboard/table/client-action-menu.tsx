"use client";

import {
  MoreVertical,
  UserPlus,
  XCircle,
  CheckCircle,
  PlusCircle,
  Eye,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientActionMenuProps {
  status: "active" | "deactivated" | "restricted";
  hasAssignedStaff?: boolean;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onRemoveRestriction?: () => void;
  onAssignStaff?: () => void;
  onCreateSavings?: () => void;
  onEditClient?: () => void;
}

export function ClientActionMenu({
  status,
  hasAssignedStaff = false,
  onViewDetails,
  onEdit,
  onDeactivate,
  onReactivate,
  onRemoveRestriction,
  onAssignStaff,
  onCreateSavings,
  onEditClient,
}: ClientActionMenuProps) {
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
          Client Actions
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

        {(onEdit || onEditClient) && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit();
              else if (onEditClient) onEditClient();
            }}
            className="cursor-pointer"
          >
            <Edit className="w-4 h-4 mr-2 text-green-500" />
            Edit client
          </DropdownMenuItem>
        )}

        {(onViewDetails || onEdit || onEditClient) && <DropdownMenuSeparator />}

        {/* Active Status Actions */}
        {status === "active" && (
          <>
            {onAssignStaff && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignStaff();
                }}
                className="cursor-pointer"
              >
                <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                {hasAssignedStaff ? "Reassign staff" : "Assign staff"}
              </DropdownMenuItem>
            )}
            {onCreateSavings && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSavings();
                }}
                className="cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                Create savings account
              </DropdownMenuItem>
            )}
            {(onAssignStaff || onCreateSavings) && onDeactivate && (
              <DropdownMenuSeparator />
            )}
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
            Activate user
          </DropdownMenuItem>
        )}

        {/* Restricted Status Actions */}
        {status === "restricted" && (
          <>
            {onAssignStaff && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignStaff();
                }}
                className="cursor-pointer"
              >
                <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                {hasAssignedStaff ? "Reassign staff" : "Assign staff"}
              </DropdownMenuItem>
            )}
            {onCreateSavings && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSavings();
                }}
                className="cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                Create savings account
              </DropdownMenuItem>
            )}
            {(onAssignStaff || onCreateSavings) &&
              (onRemoveRestriction || onDeactivate) && (
                <DropdownMenuSeparator />
              )}
            {onRemoveRestriction && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRestriction();
                }}
                className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Remove restriction
              </DropdownMenuItem>
            )}
            {onDeactivate && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate();
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deactivate user
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
