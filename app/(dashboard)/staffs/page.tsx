"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { TableActions } from "@/components/dashboard/table/table-actions";
import { DataTable } from "@/components/dashboard/table/data-table";
import { Pagination } from "@/components/dashboard/table/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserCheck, AlertTriangle, UserX } from "lucide-react";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import { AddStaffModal } from "@/components/dashboard/modal/add-staff-modal";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { StaffActionMenu } from "@/components/dashboard/table/staff-action-menu";
import {
  useStaff,
  useActivateStaff,
  useCreateStaff,
  StaffMember,
} from "@/hooks/useStaff";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";

// Define profile type
interface StaffProfile {
  employee_id?: string;
  designation?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  [key: string]: any;
}

export default function StaffsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch real data
  const { data, isLoading, refetch } = useStaff({
    status: "active",
  });
  const staffList: StaffMember[] = data?.staff || [];
  const statsData = data?.stats || {
    total: 0,
    active: 0,
    suspended: 0,
    deactivated: 0,
  };

  // Mutations
  const createStaffMutation = useCreateStaff();
  const activateStaffMutation = useActivateStaff();

  const {
    data: branchesData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranches();

  // Modal states
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [reactivateModal, setReactivateModal] = useState(false);
  const [restrictModal, setRestrictModal] = useState(false);
  const [addStaffModal, setAddStaffModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    description: "",
  });
  const [selectedRow, setSelectedRow] = useState<StaffMember | null>(null);
  const [actionType, setActionType] = useState<string>("");

  // Helper function to safely get profile data with proper typing
  const getProfileData = (row: StaffMember): StaffProfile => {
    return (row.profile || row.staff_profile || {}) as StaffProfile;
  };

  const handleRowClick = (row: StaffMember) => {
    router.push(`/staffs/${row.id}`);
  };

  const handleRowAction = (row: StaffMember, action: string) => {
    setSelectedRow(row);
    setActionType(action);

    switch (action) {
      case "view":
        router.push(`/staffs/${row.id}`);
        break;
      case "edit":
        router.push(`/staffs/${row.id}/edit`);
        break;
      case "deactivate":
        setDeactivateModal(true);
        break;
      case "reactivate":
        setReactivateModal(true);
        break;
      case "restrict":
        setRestrictModal(true);
        break;
    }
  };

  // Confirm action (Deactivate/Reactivate)
  const handleConfirmAction = async () => {
    if (!selectedRow) return;

    try {
      if (actionType === "deactivate") {
        await activateStaffMutation.mutateAsync({
          id: selectedRow.id,
          action: "deactivate",
        });
      } else if (actionType === "reactivate") {
        await activateStaffMutation.mutateAsync({
          id: selectedRow.id,
          action: "activate",
        });
      }

      // Close modals
      setDeactivateModal(false);
      setReactivateModal(false);
      setRestrictModal(false);

      // Show success
      let title = "";
      let description = "";

      switch (actionType) {
        case "deactivate":
          title = `Staff ${selectedRow?.full_name} deactivated successfully`;
          description =
            "The staff account has been deactivated and access has been revoked.";
          break;
        case "reactivate":
          title = `Staff ${selectedRow?.full_name} reactivated successfully`;
          description =
            "The staff account has been reactivated and access has been restored.";
          break;
      }

      setSuccessMessage({ title, description });
      setSuccessModal(true);

      // Refetch data
      refetch();
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  // Add staff
  const handleAddStaff = async (data: FormData) => {
    try {
      await createStaffMutation.mutateAsync(data);
      setAddStaffModal(false);

      const firstName = data.get("first_name");
      const lastName = data.get("last_name");

      setSuccessMessage({
        title: `Staff member ${firstName} ${lastName} added successfully`,
        description: "New staff account has been created and is now active.",
      });
      setSuccessModal(true);
      refetch();
    } catch (error) {
      console.error("Add staff failed:", error);
    }
  };

  // Columns with proper profile access
  const columns = [
    {
      header: "Staff ID",
      accessor: (row: StaffMember) => {
        const profile = getProfileData(row);
        return profile.employee_id || "N/A";
      },
      className: "font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Name",
      accessor: "full_name",
      className: "font-medium text-gray-900 dark:text-white capitalize",
    },
    {
      header: "Role",
      accessor: (row: StaffMember) => {
        const profile = getProfileData(row);
        return profile.designation || row.user_role || "N/A";
      },
      className: "text-gray-600 dark:text-gray-400 capitalize",
    },
    {
      header: "Department",
      accessor: (row: StaffMember) => {
        const profile = getProfileData(row);
        return profile.department?.replace("_", " ") || "N/A";
      },
      className: "text-gray-600 dark:text-gray-400 capitalize",
    },
    {
      header: "Branch",
      accessor: "branch_name",
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Assigned Clients",
      accessor: (row: StaffMember) => row.assigned_clients_count || 0,
      className: "text-gray-900 dark:text-white font-semibold",
    },
    {
      header: "Status",
      accessor: (row: StaffMember) => {
        if (!row.is_active) return "deactivated";
        if (!row.is_approved) return "restricted";
        return "active";
      },
      cell: (value: string) => <StatusBadge status={value as any} />,
    },
  ];

  // Stats cards with real data
  const statsCards = [
    {
      icon: Users,
      label: "Total Staffs",
      value: statsData.total.toString(),
      variant: "default" as const,
    },
    {
      icon: UserCheck,
      label: "Active Staffs",
      value: statsData.active.toString(),
      variant: "success" as const,
    },
    {
      icon: AlertTriangle,
      label: "Suspended Staffs",
      value: statsData.suspended.toString(),
      variant: "warning" as const,
    },
    {
      icon: UserX,
      label: "Deactivated Staffs",
      value: statsData.deactivated.toString(),
      variant: "error" as const,
    },
  ];

  // Filter and paginate
  const filteredStaff = staffList.filter((staff) => {
    const searchLower = searchValue.toLowerCase();
    const profile = getProfileData(staff);
    return (
      staff.full_name?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      profile.employee_id?.toLowerCase().includes(searchLower) ||
      profile.designation?.toLowerCase().includes(searchLower)
    );
  });

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <DashboardLayout title="Staff Management">
      {/* Welcome Section */}
      <WelcomeSection
        userName={user?.first_name || "User"}
        description="Welcome to your staff dashboard, where you can see stats of all the staffs below."
        actionButton={
          <Button
            onClick={() => setAddStaffModal(true)}
            className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add new staff</span>
            <span className="sm:hidden">Add staff</span>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Staffs lists
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => console.log("Filter clicked")}
          onExportClick={() => console.log("Export clicked")}
        />

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Loading staff...
            </p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedStaff}
              onRowClick={handleRowClick}
              actionMenu={(row) => (
                <StaffActionMenu
                  status={row.is_active ? "active" : "deactivated"}
                  onViewDetails={() => handleRowAction(row, "view")}
                  onEdit={() => handleRowAction(row, "edit")}
                  onDeactivate={() => handleRowAction(row, "deactivate")}
                  onReactivate={() => handleRowAction(row, "reactivate")}
                  onRestrict={() => handleRowAction(row, "restrict")}
                />
              )}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredStaff.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredStaff.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={deactivateModal}
        onClose={() => setDeactivateModal(false)}
        onConfirm={handleConfirmAction}
        title="Deactivate this staff account?"
        description="Are you sure you would like to deactivate this account? This action would prevent the staff member from having access."
        confirmText="Yes, Deactivate"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={reactivateModal}
        onClose={() => setReactivateModal(false)}
        onConfirm={handleConfirmAction}
        title="Reactivate this staff account?"
        description="Are you sure you would like to reactivate this account? This action would grant the staff member access."
        confirmText="Yes, Reactivate"
        variant="success"
      />

      <AddStaffModal
        isOpen={addStaffModal}
        onClose={() => setAddStaffModal(false)}
        onSubmit={handleAddStaff}
        branches={branchesData}
      />

      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title={successMessage.title}
        description={successMessage.description}
      />
    </DashboardLayout>
  );
}
