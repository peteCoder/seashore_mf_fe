"use client";

import { useState, useEffect } from "react";
import { useAssignStaff } from "@/hooks/useClients";
import { useStaff } from "@/hooks/useStaff";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, Users, Loader2 } from "lucide-react";

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    profile?: {
      assigned_staff?: string;
      assigned_staff_name?: string;
      profile_picture?: string;
    };
  };
  onSuccess?: () => void; // ✅ Added success callback
}

export function AssignStaffModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: AssignStaffModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // Fetch staff members with role='staff'
  const { data: staffData, isLoading: isLoadingStaff } = useStaff({
    role: "staff",
  });

  const assignStaffMutation = useAssignStaff();

  // Get staff list from response
  const staffList = staffData?.staff || [];

  // Get current assigned staff ID from client profile
  const currentStaffName =
    client.profile?.assigned_staff_name || client.profile?.assigned_staff;

  useEffect(() => {
    if (isOpen) {
      // Reset to empty when modal opens
      setSelectedStaffId("");
    }
  }, [isOpen]);

  const handleAssign = async () => {
    try {
      // If selectedStaffId is "unassign" or empty, pass null to unassign
      const staffId =
        selectedStaffId === "unassign" || !selectedStaffId
          ? null
          : selectedStaffId;

      await assignStaffMutation.mutateAsync({
        clientId: client.id,
        staffId: staffId,
      });

      onClose();

      // ✅ Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to assign staff:", error);
    }
  };

  // Check if selection has changed
  const hasChanges = selectedStaffId !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-yellow-500" />
            Assign Staff Member
          </DialogTitle>
          <DialogDescription>
            Assign or reassign a staff member to manage this client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={client.profile?.profile_picture} />
              <AvatarFallback className="bg-yellow-500 text-gray-900">
                {client.first_name?.[0]}
                {client.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {client.full_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {client.email}
              </p>
            </div>
          </div>

          {/* Current Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Assignment
            </label>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-900 dark:text-blue-300">
                  {currentStaffName || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign to Staff Member *
            </label>
            <Select
              value={selectedStaffId}
              onValueChange={setSelectedStaffId}
              disabled={isLoadingStaff}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                {/* ✅ Use a special value "unassign" instead of empty string */}
                <SelectItem value="unassign">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-gray-600">Unassign Staff</span>
                  </div>
                </SelectItem>

                {isLoadingStaff ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">
                      Loading staff...
                    </span>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    No staff members available
                  </div>
                ) : (
                  staffList
                    // ✅ Filter out any staff with empty/null IDs
                    .filter((staff: any) => staff.id && staff.id.trim() !== "")
                    .map((staff: any) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              staff.is_active ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                          <span>{staff.full_name}</span>
                          {staff.id === client.profile?.assigned_staff && (
                            <span className="text-xs text-gray-500 ml-1">
                              (Current)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only active staff members with role "Staff" are shown
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={assignStaffMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!hasChanges || assignStaffMutation.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {assignStaffMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Staff
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
