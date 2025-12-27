"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { DataTable } from "@/components/dashboard/table/data-table";
import { TableActions } from "@/components/dashboard/table/table-actions";
import { Pagination } from "@/components/dashboard/table/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { CreateAccountModal } from "@/components/dashboard/modal/create-account-modal";
import { ClientDetailModal } from "@/components/dashboard/modal/client-detail-modal";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { ClientActionMenu } from "@/components/dashboard/table/client-action-menu";
import {
  FilterModal,
  FilterOptions,
} from "@/components/dashboard/modal/filter-modal";
import { useAuth } from "@/contexts/AuthContext";
import { Users, UserCheck, UserX, AlertCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { AssignStaffModal } from "@/components/dashboard/modal/assign-staff-modal";

// ✅ REACT QUERY HOOKS
import {
  useClients,
  useApproveClient,
  useActivateClient,
} from "@/hooks/useClients";

interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  user_role: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  branch?: string;
  branch_name?: string;
  profile?: {
    level?: string;
    assigned_staff?: string;
    assigned_staff_name?: string;
    loan_limit?: number;
  };
}

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Pagination & Filters
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");

  // ✅ Filter Modal State
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({});

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Selected client & action
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    description: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [assignStaffModalOpen, setAssignStaffModalOpen] = useState(false);

  // ✅ BUILD QUERY PARAMS
  const queryParams: Record<string, string> = {};

  if (filterStatus === "active") {
    queryParams.is_active = "true";
    queryParams.is_approved = "true";
  } else if (filterStatus === "restricted") {
    queryParams.is_active = "false";
    queryParams.is_approved = "true";
  } else if (filterStatus === "deactivated") {
    queryParams.is_approved = "false";
  }

  if (
    filterStatus === "all" &&
    appliedFilters.status &&
    appliedFilters.status !== "all"
  ) {
    if (appliedFilters.status === "active") {
      queryParams.is_active = "true";
      queryParams.is_approved = "true";
    } else if (appliedFilters.status === "restricted") {
      queryParams.is_active = "false";
      queryParams.is_approved = "true";
    } else if (appliedFilters.status === "deactivated") {
      queryParams.is_approved = "false";
    }
  }

  // ✅ REACT QUERY
  const { data, isLoading, error } = useClients(queryParams);
  const approveMutation = useApproveClient();
  const activateMutation = useActivateClient();

  const clients = Array.isArray(data) ? data : [];

  // ✅ Apply date filters
  let dateFilteredClients = clients;
  if (appliedFilters.dateFrom || appliedFilters.dateTo) {
    dateFilteredClients = clients.filter((client) => {
      const clientDate = new Date(client.created_at);

      if (appliedFilters.dateFrom) {
        const fromDate = new Date(appliedFilters.dateFrom);
        if (clientDate < fromDate) return false;
      }

      if (appliedFilters.dateTo) {
        const toDate = new Date(appliedFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (clientDate > toDate) return false;
      }

      return true;
    });
  }

  // ✅ CALCULATE STATS
  const stats = {
    total_clients: dateFilteredClients.length,
    active_clients: dateFilteredClients.filter(
      (c) => c.is_active && c.is_approved
    ).length,
    restricted_clients: dateFilteredClients.filter(
      (c) => !c.is_active && c.is_approved
    ).length,
    deactivated_clients: dateFilteredClients.filter((c) => !c.is_approved)
      .length,
  };

  const statsData = [
    {
      label: "Total Clients",
      value: stats.total_clients.toString(),
      icon: Users,
      variant: "default" as const,
    },
    {
      label: "Active Clients",
      value: stats.active_clients.toString(),
      icon: UserCheck,
      variant: "success" as const,
    },
    {
      label: "Restricted",
      value: stats.restricted_clients.toString(),
      icon: AlertCircle,
      variant: "warning" as const,
    },
    {
      label: "Deactivated",
      value: stats.deactivated_clients.toString(),
      icon: UserX,
      variant: "error" as const,
    },
  ];

  // ✅ Filter clients based on search
  const filteredClients = dateFilteredClients.filter((client) => {
    const searchLower = searchValue.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Paginated data
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ✅ HANDLE FILTER APPLICATION
  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
    setCurrentPage(1);

    if (filters.status && filters.status !== "all") {
      setFilterStatus("all");
    }

    toast.success("Filters applied successfully!");
  };

  // ✅ EXPORT TO CSV
  const handleExport = () => {
    try {
      if (filteredClients.length === 0) {
        toast.error("No clients to export");
        return;
      }

      const headers = [
        "Name",
        "Email",
        "Phone",
        "Branch",
        "Assigned Staff",
        "Status",
        "Created Date",
      ];

      const rows = filteredClients.map((client) => [
        client.full_name || "",
        client.email || "",
        client.phone || "",
        client.branch_name || "",
        client.profile?.assigned_staff || "Unassigned",
        getClientStatus(client),
        new Date(client.created_at).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clients_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredClients.length} clients successfully!`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export clients");
    }
  };

  // ✅ HANDLE CLIENT ACTIONS
  const handleClientAction = (client: Client, action: string) => {
    setSelectedClient(client);

    switch (action) {
      case "view":
        router.push(`/clients/${client.id}`); // ✅ Navigate to detail page
        break;
      case "edit":
        router.push(`/clients/${client.id}/edit`); // ✅ Navigate to edit page
        break;
      case "approve":
        setConfirmAction({
          type: "approve",
          title: "Approve Client",
          description: `Are you sure you want to approve ${client.full_name}? They will be able to access their account.`,
        });
        setConfirmModalOpen(true);
        break;
      case "deactivate":
        setConfirmAction({
          type: "deactivate",
          title: "Deactivate Client",
          description: `Are you sure you want to deactivate ${client.full_name}? They will not be able to access their account.`,
        });
        setConfirmModalOpen(true);
        break;
      case "reactivate":
        setConfirmAction({
          type: "reactivate",
          title: "Reactivate Client",
          description: `Are you sure you want to reactivate ${client.full_name}?`,
        });
        setConfirmModalOpen(true);
        break;
      case "remove_restriction":
        setConfirmAction({
          type: "remove_restriction",
          title: "Remove Restriction",
          description: `Are you sure you want to remove the restriction from ${client.full_name}?`,
        });
        setConfirmModalOpen(true);
        break;
      case "assign_staff":
        setAssignStaffModalOpen(true);
        break;
      case "create_savings":
        router.push(`/savings/create?client_id=${client.id}`);
        break;
    }
  };

  const executeAction = async () => {
    if (!selectedClient || !confirmAction) return;

    setConfirmModalOpen(false);

    try {
      const actionType = confirmAction.type;

      switch (actionType) {
        case "approve":
          await approveMutation.mutateAsync({
            id: selectedClient.id,
            action: "approve",
          });
          break;

        case "deactivate":
          await activateMutation.mutateAsync({
            id: selectedClient.id,
            action: "deactivate",
          });
          break;

        case "reactivate":
          if (!selectedClient.is_approved) {
            await approveMutation.mutateAsync({
              id: selectedClient.id,
              action: "approve",
            });
          } else {
            await activateMutation.mutateAsync({
              id: selectedClient.id,
              action: "activate",
            });
          }
          break;

        case "remove_restriction":
          await activateMutation.mutateAsync({
            id: selectedClient.id,
            action: "activate",
          });
          break;
      }

      const actionLabel =
        actionType === "reactivate" ? "activated" : `${actionType}d`;
      setSuccessMessage(`Client ${actionLabel} successfully!`);
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Action failed:", err);
      toast.error(`Failed to ${confirmAction.type} client`);
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    setSuccessMessage("Client account created successfully!");
    setSuccessModalOpen(true);
  };

  const getClientStatus = (client: Client) => {
    if (!client.is_approved) return "deactivated";
    if (!client.is_active) return "restricted";
    return "active";
  };

  // Table columns
  const columns = [
    {
      header: "Name",
      accessor: "full_name",
      cell: (value: any, row: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.full_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      cell: (value: any) => value || "N/A",
    },
    {
      header: "Branch",
      accessor: "branch_name",
      cell: (value: any) => value || "N/A",
    },
    {
      header: "Assigned Staff",
      accessor: "profile",
      cell: (value: any) => value?.assigned_staff || "Unassigned",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (_: any, row: any) => {
        const status = getClientStatus(row);
        return <StatusBadge status={status} />;
      },
    },
    {
      header: "Joined",
      accessor: "created_at",
      cell: (value: any) => new Date(value).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Client Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading clients...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Client Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Clients
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Client Management">
      <WelcomeSection
        userName={user?.first_name || "User"}
        description="Manage client accounts, approvals, and assignments."
        actionButton={
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Client Account
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: "All Clients", value: "all" },
          { label: "Active", value: "active" },
          { label: "Restricted", value: "restricted" },
          { label: "Deactivated", value: "deactivated" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setFilterStatus(filter.value);
              setCurrentPage(1);
              if (filter.value !== "all") {
                setAppliedFilters({});
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === filter.value
                ? "bg-yellow-500 text-gray-900"
                : "bg-white dark:bg-[#1e293b] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Client List
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => setFilterModalOpen(true)}
          onExportClick={handleExport}
        />

        {paginatedClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Clients Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchValue
                ? "Try adjusting your search criteria"
                : clients.length === 0
                ? "Get started by creating your first client account"
                : "No clients match the selected filter"}
            </p>
            {clients.length === 0 && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Client
              </Button>
            )}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedClients}
              onRowClick={(row) => {
                const client = row as Client;
                router.push(`/clients/${client.id}`); // ✅ Navigate to detail page on row click
              }}
              actionMenu={(row) => {
                const client = row as Client;
                const status = getClientStatus(client);

                return (
                  <ClientActionMenu
                    status={status}
                    hasAssignedStaff={!!client.profile?.assigned_staff}
                    onViewDetails={() => handleClientAction(client, "view")} // ✅ NEW
                    onEdit={() => handleClientAction(client, "edit")} // ✅ NEW
                    onDeactivate={
                      status === "active" || status === "restricted"
                        ? () => handleClientAction(client, "deactivate")
                        : undefined
                    }
                    onReactivate={
                      status === "deactivated"
                        ? () => handleClientAction(client, "reactivate")
                        : undefined
                    }
                    onRemoveRestriction={
                      status === "restricted"
                        ? () => handleClientAction(client, "remove_restriction")
                        : undefined
                    }
                    onAssignStaff={() =>
                      handleClientAction(client, "assign_staff")
                    }
                    onCreateSavings={() =>
                      handleClientAction(client, "create_savings")
                    }
                  />
                );
              }}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredClients.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredClients.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <CreateAccountModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedClient && (
        <AssignStaffModal
          isOpen={assignStaffModalOpen}
          onClose={() => setAssignStaffModalOpen(false)}
          client={selectedClient}
          onSuccess={() => {
            setSuccessMessage("Staff assignment updated successfully!");
            setSuccessModalOpen(true);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={executeAction}
        title={confirmAction?.title || ""}
        description={confirmAction?.description || ""}
        confirmText="Confirm"
        variant={
          confirmAction?.type === "deactivate" ? "destructive" : "default"
        }
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          setSuccessMessage("");
        }}
        title="Success!"
        description={successMessage}
      />

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </DashboardLayout>
  );
}
