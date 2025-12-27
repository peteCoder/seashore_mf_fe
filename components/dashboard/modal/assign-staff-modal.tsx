"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStaff, useAssignStaff } from "@/hooks/useStaff";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    full_name: string;
    branch?: string;
    branch_name?: string;
    profile?: {
      assigned_staff?: string;
      assigned_staff_name?: string;
    };
  };
  onSuccess?: () => void;
}

export function AssignStaffModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: AssignStaffModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    client.profile?.assigned_staff || null
  );

  // ✅ FIXED: Only fetch users with role='staff', not managers/directors/admins
  const { data: staffData, isLoading } = useStaff({
    status: "active",
    role: "staff", // ✅ Only get staff members
  });

  const staffList = staffData?.staff || [];
  const assignStaffMutation = useAssignStaff();

  const canAssignAcrossBranches =
    user?.user_role === "admin" || user?.user_role === "director";

  // ✅ Filter staff based on branch (if not admin/director)
  const filteredStaff = canAssignAcrossBranches
    ? staffList
    : staffList.filter((s: any) => s.branch === client.branch);

  // ✅ Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStaffId(client.profile?.assigned_staff || null);
    }
  }, [isOpen, client.profile?.assigned_staff]);

  const handleAssign = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      await assignStaffMutation.mutateAsync({
        clientId: client.id, // ✅ This is the User.id (UUID) of the client
        staffId: selectedStaffId, // ✅ This is the User.id (UUID) of the staff
      });

      toast.success("Staff assigned successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to assign staff:", error);
      toast.error(error.message || "Failed to assign staff");
    }
  };

  const handleUnassign = async () => {
    try {
      await assignStaffMutation.mutateAsync({
        clientId: client.id,
        staffId: null,
      });

      toast.success("Staff unassigned successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to unassign staff:", error);
      toast.error(error.message || "Failed to unassign staff");
    }
  };

  if (!isOpen) return null;

  const isReassigning = !!client.profile?.assigned_staff;
  const selectedStaff = staffList.find((s: any) => s.id === selectedStaffId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1e293b] shadow-2xl transition-all">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isReassigning ? "Reassign Staff" : "Assign Staff"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {client.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Current Assignment */}
            {isReassigning ? (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Currently assigned to:
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {client.profile?.assigned_staff || "Unknown Staff"}
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/10 border border-gray-200 dark:border-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: <span className="font-semibold">Unassigned</span>
                </p>
              </div>
            )}

            {/* Client Branch Info */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Client Branch:</span>
              <span className="text-gray-900 dark:text-white">
                {client.branch_name || "N/A"}
              </span>
            </div>
          </div>

          {/* Combobox */}
          <div className="px-6 py-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Staff Member
            </label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-11"
                >
                  {selectedStaff ? (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {selectedStaff.full_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedStaff.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Select staff member...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search staff by name, email, or ID..."
                    className="h-11"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? "Loading..." : "No staff found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredStaff.map((staff: any) => (
                        <CommandItem
                          key={staff.id}
                          value={`${staff.full_name} ${staff.email} ${
                            staff.profile?.employee_id || ""
                          }`}
                          onSelect={() => {
                            setSelectedStaffId(staff.id);
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStaffId === staff.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {staff.full_name}
                              </span>
                              {staff.profile?.employee_id && (
                                <span className="text-xs text-gray-500">
                                  #{staff.profile.employee_id}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 truncate">
                              {staff.email}
                            </span>
                            {canAssignAcrossBranches && staff.branch_name && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {staff.branch_name}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Staff Count Info */}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {filteredStaff.length} staff member
              {filteredStaff.length !== 1 ? "s" : ""} available
              {!canAssignAcrossBranches && " in your branch"}
            </p>

            {/* Admin/Director Info */}
            {canAssignAcrossBranches && (
              <div className="mt-3 p-2.5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                  ✓ You can assign staff from any branch
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f172a]">
            <div className="flex gap-3">
              {isReassigning && (
                <Button
                  variant="outline"
                  onClick={handleUnassign}
                  disabled={assignStaffMutation.isPending}
                  className="flex-1 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {assignStaffMutation.isPending
                    ? "Unassigning..."
                    : "Unassign"}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={onClose}
                disabled={assignStaffMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                onClick={handleAssign}
                disabled={
                  !selectedStaffId ||
                  selectedStaffId === client.profile?.assigned_staff ||
                  assignStaffMutation.isPending
                }
                className="flex-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {assignStaffMutation.isPending
                  ? "Assigning..."
                  : isReassigning
                  ? "Reassign"
                  : "Assign"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
