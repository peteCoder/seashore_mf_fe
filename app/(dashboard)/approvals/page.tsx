"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { DataTable } from "@/components/dashboard/table/data-table";
import { TableActions } from "@/components/dashboard/table/table-actions";
import { Pagination } from "@/components/dashboard/table/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { useAuth } from "@/contexts/AuthContext";
// import {
//   usePendingTransactions,
//   useApproveTransaction,
//   useRejectTransaction,
//   PendingTransaction,
// } from "@/hooks/useTransactions";
import {
  ClipboardCheck,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  User,
  Building2,
  Wallet,
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
import { format } from "date-fns";
import { PendingTransaction, useApproveTransaction, usePendingTransactions, useRejectTransaction } from "@/hooks/useTransactions";

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterType, setFilterType] = useState<string>("all");

  // Approval/Rejection modal state
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    transaction: PendingTransaction | null;
    action: "approve" | "reject" | null;
  }>({ open: false, transaction: null, action: null });
  const [rejectionReason, setRejectionReason] = useState("");

  // Detail modal state
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    transaction: PendingTransaction | null;
  }>({ open: false, transaction: null });

  // Build query params
  const queryParams: Record<string, string> = {};
  if (filterType !== "all") {
    queryParams.type = filterType;
  }

  // Fetch pending transactions
  const { data, isLoading, error, refetch } =
    usePendingTransactions(queryParams);
  const approveTransaction = useApproveTransaction();
  const rejectTransaction = useRejectTransaction();

  const transactions = data?.transactions || [];
  const counts = data?.counts || {
    total_pending: 0,
    pending_deposits: 0,
    pending_withdrawals: 0,
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter((t) => {
    const searchLower = searchValue.toLowerCase();
    return (
      t.client_name?.toLowerCase().includes(searchLower) ||
      t.account_number?.toLowerCase().includes(searchLower) ||
      t.transaction_ref?.toLowerCase().includes(searchLower) ||
      t.branch_name?.toLowerCase().includes(searchLower)
    );
  });

  // Paginated data
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle approval
  const handleApprove = async () => {
    if (!actionModal.transaction) return;

    try {
      await approveTransaction.mutateAsync(actionModal.transaction.id);
      setActionModal({ open: false, transaction: null, action: null });
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!actionModal.transaction || !rejectionReason.trim()) return;

    try {
      await rejectTransaction.mutateAsync({
        transactionId: actionModal.transaction.id,
        reason: rejectionReason,
      });
      setActionModal({ open: false, transaction: null, action: null });
      setRejectionReason("");
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  // Get transaction type badge
  const getTransactionTypeBadge = (type: string) => {
    if (type === "deposit") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
          <ArrowDownCircle className="w-3 h-3" />
          Deposit
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
        <ArrowUpCircle className="w-3 h-3" />
        Withdrawal
      </Badge>
    );
  };

  // Table columns
  const columns = [
    {
      header: "Transaction Ref",
      accessor: "transaction_ref",
      className: "font-mono text-xs text-gray-600 dark:text-gray-400",
    },
    {
      header: "Type",
      accessor: "transaction_type",
      cell: (value: string) => getTransactionTypeBadge(value),
    },
    {
      header: "Client",
      accessor: "client_name",
      cell: (value: string, row: PendingTransaction) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.account_number}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      cell: (value: number, row: PendingTransaction) => (
        <span
          className={`font-semibold ${
            row.transaction_type === "deposit"
              ? "text-green-600 dark:text-green-400"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {row.transaction_type === "deposit" ? "+" : "-"}₦
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Current Balance",
      accessor: "account_balance",
      cell: (value: number | null) => (
        <span className="text-gray-900 dark:text-white">
          ₦{(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Branch",
      accessor: "branch_name",
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Requested By",
      accessor: "requested_by",
      cell: (value: string | null) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value || "System"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "created_at",
      cell: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(value), "MMM d, yyyy h:mm a")}
        </span>
      ),
    },
  ];

  // Stats data
  const statsData = [
    {
      icon: Clock,
      label: "Total Pending",
      value: counts.total_pending.toString(),
      variant: "warning" as const,
    },
    {
      icon: ArrowDownCircle,
      label: "Pending Deposits",
      value: counts.pending_deposits.toString(),
      variant: "success" as const,
    },
    {
      icon: ArrowUpCircle,
      label: "Pending Withdrawals",
      value: counts.pending_withdrawals.toString(),
      variant: "default" as const,
    },
  ];

  // Check if user has permission
  const canApprove =
    user?.user_role &&
    ["manager", "director", "admin"].includes(user.user_role);

  if (!canApprove) {
    return (
      <DashboardLayout title="Transaction Approvals">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Only managers, directors, and admins can approve transactions.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Transaction Approvals">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading pending transactions...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Transaction Approvals">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button
              onClick={() => refetch()}
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
    <DashboardLayout title="Transaction Approvals">
      {/* Welcome Section */}
      <WelcomeSection
        userName={user?.first_name || "Manager"}
        description="Review and approve pending deposits and withdrawals."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: "All Pending", value: "all" },
          { label: "Deposits", value: "deposit" },
          { label: "Withdrawals", value: "withdrawal" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setFilterType(filter.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filterType === filter.value
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
          Pending Transactions
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => console.log("Filter clicked")}
          onExportClick={() => console.log("Export clicked")}
        />

        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Transactions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchValue
                ? "Try adjusting your search criteria"
                : "All transactions have been processed. Great job!"}
            </p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedTransactions}
              onRowClick={(row) => {
                setDetailModal({
                  open: true,
                  transaction: row as PendingTransaction,
                });
              }}
              actionMenu={(row) => {
                const transaction = row as PendingTransaction;
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
                          setDetailModal({ open: true, transaction });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionModal({
                            open: true,
                            transaction,
                            action: "approve",
                          });
                        }}
                        className="text-green-600 dark:text-green-400"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionModal({
                            open: true,
                            transaction,
                            action: "reject",
                          });
                        }}
                        className="text-red-600 dark:text-red-400"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredTransactions.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredTransactions.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Dialog
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-yellow-600" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Review the transaction details before making a decision
            </DialogDescription>
          </DialogHeader>

          {detailModal.transaction && (
            <div className="space-y-6">
              {/* Transaction Type Badge */}
              <div className="flex justify-center">
                {getTransactionTypeBadge(
                  detailModal.transaction.transaction_type
                )}
              </div>

              {/* Amount */}
              <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Transaction Amount
                </p>
                <p
                  className={`text-3xl font-bold ${
                    detailModal.transaction.transaction_type === "deposit"
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {detailModal.transaction.transaction_type === "deposit"
                    ? "+"
                    : "-"}
                  ₦{detailModal.transaction.amount.toLocaleString()}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    Client
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {detailModal.transaction.client_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {detailModal.transaction.client_email}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Wallet className="w-4 h-4" />
                    Account
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {detailModal.transaction.account_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    Balance: ₦
                    {(
                      detailModal.transaction.account_balance || 0
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    Branch
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {detailModal.transaction.branch_name}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    Requested By
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {detailModal.transaction.requested_by || "System"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    Date Requested
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(
                      new Date(detailModal.transaction.created_at),
                      "PPP p"
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reference
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {detailModal.transaction.transaction_ref}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {detailModal.transaction.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {detailModal.transaction.notes}
                  </p>
                </div>
              )}

              {/* Balance Preview for Withdrawals */}
              {detailModal.transaction.transaction_type === "withdrawal" && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                    Balance After Approval
                  </p>
                  <div className="flex justify-between">
                    <span className="text-yellow-700 dark:text-yellow-400">
                      Current: ₦
                      {(
                        detailModal.transaction.account_balance || 0
                      ).toLocaleString()}
                    </span>
                    <span className="text-yellow-700 dark:text-yellow-400">
                      →
                    </span>
                    <span className="font-bold text-yellow-900 dark:text-yellow-200">
                      New: ₦
                      {(
                        (detailModal.transaction.account_balance || 0) -
                        detailModal.transaction.amount
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setDetailModal({ open: false, transaction: null })
                  }
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    setDetailModal({ open: false, transaction: null });
                    setActionModal({
                      open: true,
                      transaction: detailModal.transaction,
                      action: "reject",
                    });
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    setDetailModal({ open: false, transaction: null });
                    setActionModal({
                      open: true,
                      transaction: detailModal.transaction,
                      action: "approve",
                    });
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Confirmation Modal */}
      <Dialog
        open={actionModal.open}
        onOpenChange={(open) => {
          if (!approveTransaction.isPending && !rejectTransaction.isPending) {
            setActionModal({ ...actionModal, open });
            if (!open) setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.action === "approve"
                ? "Approve Transaction"
                : "Reject Transaction"}
            </DialogTitle>
            <DialogDescription>
              {actionModal.action === "approve"
                ? "This will process the transaction and update the account balance."
                : "Please provide a reason for rejecting this transaction."}
            </DialogDescription>
          </DialogHeader>

          {actionModal.transaction && (
            <div className="space-y-4">
              {/* Transaction Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Type:
                  </span>
                  <span className="font-medium capitalize">
                    {actionModal.transaction.transaction_type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Amount:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₦{actionModal.transaction.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Client:
                  </span>
                  <span className="font-medium">
                    {actionModal.transaction.client_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Account:
                  </span>
                  <span className="font-medium">
                    {actionModal.transaction.account_number}
                  </span>
                </div>
              </div>

              {/* Rejection Reason Input */}
              {actionModal.action === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionModal({
                  open: false,
                  transaction: null,
                  action: null,
                });
                setRejectionReason("");
              }}
              disabled={
                approveTransaction.isPending || rejectTransaction.isPending
              }
            >
              Cancel
            </Button>
            <Button
              onClick={
                actionModal.action === "approve" ? handleApprove : handleReject
              }
              disabled={
                approveTransaction.isPending ||
                rejectTransaction.isPending ||
                (actionModal.action === "reject" && !rejectionReason.trim())
              }
              className={
                actionModal.action === "approve"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }
            >
              {approveTransaction.isPending || rejectTransaction.isPending
                ? "Processing..."
                : actionModal.action === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
