"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { DataTable } from "@/components/dashboard/table/data-table";
import { TableActions } from "@/components/dashboard/table/table-actions";
import { Pagination } from "@/components/dashboard/table/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { useAuth } from "@/contexts/AuthContext";
import { savingsAPI } from "@/lib/api";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  Eye,
  AlertCircle,
  MoreVertical,
  CheckCircle,
  XCircle,
  Pause,
  Play,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface SavingsAccount {
  id: string;
  account_number: string;
  client_id: string;
  client_name: string;
  account_type: string;
  balance: number;
  total_deposits?: number;
  total_withdrawals?: number;
  interest_earned?: number;
  status: string;
  created_at: string;
  target_amount?: number;
  maturity_date?: string;
}

interface SavingsStats {
  total_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  active_accounts: number;
}

type StatusAction = "activate" | "suspend" | "close" | "pending";

export default function SavingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [stats, setStats] = useState<SavingsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status change modal
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    account: SavingsAccount | null;
    action: StatusAction | null;
  }>({ open: false, account: null, action: null });
  const [statusLoading, setStatusLoading] = useState(false);

  // Pagination & Filters
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch savings on mount and filter change
  useEffect(() => {
    fetchSavings();
  }, [filterStatus]);

  const fetchSavings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params: Record<string, string> = {};

      if (filterStatus === "active") {
        params.status = "active";
      } else if (filterStatus === "inactive") {
        params.status = "inactive";
      } else if (filterStatus === "pending") {
        params.status = "pending";
      } else if (filterStatus === "suspended") {
        params.status = "suspended";
      }

      const result = await savingsAPI.list(params);

      if (result.success) {
        let savingsData: SavingsAccount[] = [];

        if (Array.isArray(result.data)) {
          savingsData = result.data;
        } else if (result.data?.results && Array.isArray(result.data.results)) {
          savingsData = result.data.results;
        } else if (
          result.data?.accounts &&
          Array.isArray(result.data.accounts)
        ) {
          savingsData = result.data.accounts;
        }

        // Add safety defaults for calculated fields
        savingsData = savingsData.map((acc) => ({
          ...acc,
          total_deposits: acc.total_deposits ?? 0,
          total_withdrawals: acc.total_withdrawals ?? 0,
          interest_earned: acc.interest_earned ?? 0,
        }));

        setAccounts(savingsData);

        console.log("Savings Data: ", savingsData);

        // Fetch statistics
        await fetchStatistics();
      } else {
        throw new Error(result.error || "Failed to fetch savings accounts");
      }
    } catch (err) {
      console.error("Savings fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load savings accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await savingsAPI.getStatistics();

      if (result.success) {
        // Check different possible response structures
        const statsData =
          result.data?.statistics || result.statistics || result.data;

        if (statsData) {
          setStats({
            total_balance: statsData.total_balance || 0,
            total_deposits: statsData.total_deposits || 0,
            total_withdrawals: statsData.total_withdrawals || 0,
            active_accounts: statsData.active || statsData.active_accounts || 0,
          });
        } else {
          calculateStatsFromAccounts(accounts);
        }
      } else {
        calculateStatsFromAccounts(accounts);
      }
    } catch (err) {
      console.error("Statistics fetch error:", err);
      calculateStatsFromAccounts(accounts);
    }
  };

  const calculateStatsFromAccounts = (accountsData: SavingsAccount[]) => {
    if (!Array.isArray(accountsData)) {
      setStats({
        total_balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        active_accounts: 0,
      });
      return;
    }

    const totalBalance = accountsData.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );

    const totalDeposits = accountsData.reduce(
      (sum, acc) => sum + (acc.total_deposits || 0),
      0
    );

    const totalWithdrawals = accountsData.reduce(
      (sum, acc) => sum + (acc.total_withdrawals || 0),
      0
    );

    const activeAccounts = accountsData.filter(
      (acc) => acc.status === "active"
    ).length;

    setStats({
      total_balance: totalBalance,
      total_deposits: totalDeposits,
      total_withdrawals: totalWithdrawals,
      active_accounts: activeAccounts,
    });
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!statusModal.account || !statusModal.action) return;

    try {
      setStatusLoading(true);

      // Map action to backend status
      const statusMap: Record<StatusAction, string> = {
        activate: "active",
        suspend: "suspended",
        close: "closed",
        pending: "pending",
      };

      const newStatus = statusMap[statusModal.action];

      // For now, we'll need to create a status update endpoint in the backend
      // This is a placeholder - you'll need to add the endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/savings/${statusModal.account.id}/status/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success(`Account ${statusModal.action}d successfully`);
        setStatusModal({ open: false, account: null, action: null });
        await fetchSavings();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update account status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update account status");
    } finally {
      setStatusLoading(false);
    }
  };

  // Check if user can manage accounts
  // const canManageAccounts = user?.user_role in ["admin", "director", "manager"];
  const canManageAccounts = true;

  // Filter accounts based on search
  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchValue.toLowerCase();
    return (
      account.account_number?.toLowerCase().includes(searchLower) ||
      account.client_name?.toLowerCase().includes(searchLower) ||
      account.client_id?.toLowerCase().includes(searchLower)
    );
  });

  // Paginated data
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get status variant
  const getStatusVariant = (
    status: string
  ): "default" | "success" | "warning" | "error" => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "warning";
      case "inactive":
      case "closed":
        return "error";
      default:
        return "default";
    }
  };

  // Table columns
  const columns = [
    {
      header: "Client Name",
      accessor: "client_name",
      className: "text-gray-600 dark:text-white",
    },
    {
      header: "Account Number",
      accessor: "account_number",
      className: "font-medium text-gray-900 dark:text-white",
    },

    {
      header: "Account Type",
      accessor: "account_type",
      cell: (value: string) => (
        <span className="capitalize">{value?.replace("_", " ")}</span>
      ),
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Balance",
      accessor: "balance",
      cell: (value: number) => `NGN ${(value || 0).toLocaleString()}`,
      className: "font-semibold text-gray-900 dark:text-white",
    },
    {
      header: "Total Deposits",
      accessor: "total_deposits",
      cell: (value: number) => `NGN ${(value || 0).toLocaleString()}`,
      className: "text-green-600 dark:text-green-400",
    },
    {
      header: "Date Created",
      accessor: "date_opened",
      cell: (value: string) => new Date(value).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => (
        <StatusBadge status={value as any} variant={getStatusVariant(value)} />
      ),
    },
  ];

  // Stats data
  const statsData = stats
    ? [
        {
          icon: Wallet,
          label: "Total Balance",
          value: `NGN ${stats.total_balance.toLocaleString()}`,
          variant: "default" as const,
        },
        {
          icon: TrendingUp,
          label: "Total Deposits",
          value: `NGN ${stats.total_deposits.toLocaleString()}`,
          variant: "success" as const,
        },
        {
          icon: TrendingDown,
          label: "Total Withdrawals",
          value: `NGN ${stats.total_withdrawals.toLocaleString()}`,
          variant: "warning" as const,
        },
        {
          icon: Users,
          label: "Active Accounts",
          value: stats.active_accounts.toString(),
          variant: "success" as const,
        },
      ]
    : [];

  // Loading state
  if (loading && accounts.length === 0) {
    return (
      <DashboardLayout title="Savings Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading savings accounts...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Savings Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Savings Accounts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchSavings}
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
    <DashboardLayout title="Savings Management">
      {/* Welcome Section */}
      <WelcomeSection
        userName={user?.first_name || "User"}
        description="Manage savings accounts, deposits, and withdrawals."
        actionButton={
          <Button
            onClick={() => router.push("/savings/create")}
            className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Savings Account
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: "All Accounts", value: "all" },
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Suspended", value: "suspended" },
          { label: "Closed", value: "inactive" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setFilterStatus(filter.value);
              setCurrentPage(1);
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

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Savings Accounts
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => console.log("Filter clicked")}
          onExportClick={() => console.log("Export clicked")}
        />

        {paginatedAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Savings Accounts Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchValue
                ? "Try adjusting your search criteria"
                : accounts.length === 0
                ? "Get started by creating your first savings account"
                : "No accounts match the selected filter"}
            </p>
            {accounts.length === 0 && (
              <Button
                onClick={() => router.push("/savings/create")}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Savings Account
              </Button>
            )}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedAccounts}
              onRowClick={(row) =>
                router.push(`/savings/${(row as SavingsAccount).id}`)
              }
              actionMenu={(row) => {
                const account = row as SavingsAccount;
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/savings/${account.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>

                      {canManageAccounts && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>
                            Status Management
                          </DropdownMenuLabel>

                          {account.status !== "active" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusModal({
                                  open: true,
                                  account,
                                  action: "activate",
                                });
                              }}
                              className="text-green-600 dark:text-green-400"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}

                          {account.status === "active" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusModal({
                                  open: true,
                                  account,
                                  action: "suspend",
                                });
                              }}
                              className="text-orange-600 dark:text-orange-400"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}

                          {account.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusModal({
                                  open: true,
                                  account,
                                  action: "activate",
                                });
                              }}
                              className="text-green-600 dark:text-green-400"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          )}

                          {account.status !== "closed" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusModal({
                                  open: true,
                                  account,
                                  action: "close",
                                });
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Close Account
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAccounts.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredAccounts.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Status Change Modal */}
      <Dialog
        open={statusModal.open}
        onOpenChange={(open) =>
          !statusLoading && setStatusModal({ ...statusModal, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusModal.action === "activate" && "Activate Account"}
              {statusModal.action === "suspend" && "Suspend Account"}
              {statusModal.action === "close" && "Close Account"}
              {statusModal.action === "pending" && "Set to Pending"}
            </DialogTitle>
            <DialogDescription>
              {statusModal.action === "activate" &&
                "This will activate the account and allow transactions."}
              {statusModal.action === "suspend" &&
                "This will temporarily suspend the account. No transactions will be allowed."}
              {statusModal.action === "close" &&
                "This will permanently close the account. This action cannot be undone."}
              {statusModal.action === "pending" &&
                "This will set the account back to pending approval status."}
            </DialogDescription>
          </DialogHeader>

          {statusModal.account && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Account Number:
                </span>
                <span className="font-medium">
                  {statusModal.account.account_number}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Client:
                </span>
                <span className="font-medium">
                  {statusModal.account.client_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Current Status:
                </span>
                <StatusBadge
                  status={statusModal.account.status as any}
                  variant={getStatusVariant(statusModal.account.status)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusModal({ open: false, account: null, action: null })
              }
              disabled={statusLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={statusLoading}
              className={
                statusModal.action === "close"
                  ? "bg-red-600 hover:bg-red-700"
                  : statusModal.action === "suspend"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {statusLoading
                ? "Processing..."
                : `Confirm ${statusModal.action
                    ?.charAt(0)
                    .toUpperCase()}${statusModal.action?.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
