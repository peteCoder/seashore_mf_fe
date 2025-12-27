"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable } from "@/components/dashboard/table/data-table";
import { Pagination } from "@/components/dashboard/table/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { savingsAPI } from "@/lib/api";
import {
  ArrowLeft,
  Wallet,
  User,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertCircle,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Download,
  Clock,
  Percent,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SavingsAccount {
  id: string;
  account_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  account_type: string;
  balance: number;
  total_deposits: number;
  total_withdrawals: number;
  interest_earned: number;
  interest_rate?: number;
  status: string;
  created_at: string;
  start_date?: string;
  maturity_date?: string;
  target_amount?: number;
  contribution_frequency?: string;
  account_description?: string;
  last_transaction_date?: string;
}

interface Transaction {
  id: string;
  transaction_type: "deposit" | "withdrawal" | "interest";
  type?: string;
  amount: number;
  balance_after?: number;
  balance_before?: number;
  date: string;
  payment_method?: string;
  reference?: string;
  transaction_ref?: string;
  notes?: string;
  recorded_by?: string;
  processed_by?: string;
  description?: string;
  status?: string;
}

export default function SavingsDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const savingsId = params?.id as string;

  // State
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction pagination
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize, setTransactionPageSize] = useState(10);

  // Transaction detail modal
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    if (savingsId) {
      fetchAccountData();
    }
  }, [savingsId]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch account details
      const result = await savingsAPI.get(savingsId);

      if (result.success && result.data) {
        setAccount(result.data);

        // Fetch transactions
        await fetchTransactions();
      } else {
        throw new Error(result.error || "Failed to fetch account details");
      }
    } catch (err) {
      console.error("Account fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load account details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const result = await savingsAPI.getTransactions(savingsId);

      if (result.success) {
        let transactionsData: Transaction[] = [];

        // Handle different response structures
        if (Array.isArray(result.data)) {
          transactionsData = result.data;
        } else if (
          result.data?.transactions &&
          Array.isArray(result.data.transactions)
        ) {
          transactionsData = result.data.transactions;
        } else if (result.data?.results && Array.isArray(result.data.results)) {
          transactionsData = result.data.results;
        } else if (result.transactions && Array.isArray(result.transactions)) {
          transactionsData = result.transactions;
        }

        // Add safety defaults
        transactionsData = transactionsData.map((t) => ({
          ...t,
          balance_after: t.balance_after ?? 0,
          payment_method: t.payment_method || "Cash", // Default to Cash since not stored in backend
        }));

        setTransactions(transactionsData);
      }
    } catch (err) {
      console.error("Transactions fetch error:", err);
      setTransactions([]);
    }
  };

  // Calculate progress for target savings
  const calculateProgress = () => {
    if (!account || !account.target_amount || account.target_amount === 0)
      return 0;
    return Math.min((account.balance / account.target_amount) * 100, 100);
  };

  // Get transaction type badge
  const getTransactionTypeBadge = (type: string) => {
    const colors = {
      deposit:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      withdrawal:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      interest:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };

    const icons = {
      deposit: ArrowDownCircle,
      withdrawal: ArrowUpCircle,
      interest: TrendingUp,
    };

    const Icon = icons[type as keyof typeof icons] || DollarSign;
    const colorClass =
      colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        <Icon className="w-3 h-3" />
        <span className="capitalize">{type}</span>
      </span>
    );
  };

  // Transaction table columns
  const transactionColumns = [
    {
      header: "Date",
      accessor: "date",
      cell: (value: string) => new Date(value).toLocaleDateString(),
      className: "text-gray-900 dark:text-white font-medium",
    },
    {
      header: "Reference",
      accessor: "transaction_ref",
      className: "text-gray-600 dark:text-gray-400 font-mono text-xs",
    },
    {
      header: "Type",
      accessor: "transaction_type",
      cell: (value: string) => getTransactionTypeBadge(value),
    },
    {
      header: "Description",
      accessor: "description",
      cell: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {value || "N/A"}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      cell: (value: number, row: Transaction) => {
        const isDebit = row.transaction_type === "withdrawal";
        return (
          <span
            className={`font-semibold ${
              isDebit
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {isDebit ? "-" : "+"}NGN {(value || 0).toLocaleString()}
          </span>
        );
      },
      className: "text-right",
    },
    {
      header: "Balance After",
      accessor: "balance_after",
      cell: (value: number) => (
        <span className="text-gray-900 dark:text-white font-medium">
          NGN {(value || 0).toLocaleString()}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Processed By",
      accessor: "processed_by",
      cell: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
          {value || "System"}
        </span>
      ),
    },
  ];

  // Paginated transactions
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * transactionPageSize,
    transactionPage * transactionPageSize
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Account Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading account details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <DashboardLayout title="Account Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Account
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Account not found"}
            </p>
            <Button
              onClick={() => router.push("/savings")}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Back to Savings
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();

  return (
    <DashboardLayout title="Savings Account Details">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/savings")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Savings
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Savings Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {account.account_number}
              </p>
            </div>
            <StatusBadge status={account.status as any} />
          </div>
        </div>

        {/* Action Buttons */}
        {account.status === "active" && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              onClick={() => router.push(`/savings/${account.id}/deposit`)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Make Deposit
            </Button>

            <Button
              onClick={() => router.push(`/savings/${account.id}/withdraw`)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Withdraw
            </Button>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Current Balance
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  NGN {account.balance.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    Total Deposits
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  NGN {account.total_deposits.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                    Total Withdrawals
                  </p>
                </div>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                  NGN {account.total_withdrawals.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Target Progress (for target savings) */}
            {account.target_amount && account.target_amount > 0 && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Target Progress
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress to Target
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        NGN {account.balance.toLocaleString()} / NGN{" "}
                        {account.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {progress.toFixed(1)}% Complete
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Amount Saved
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        NGN {account.balance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Remaining
                      </p>
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        NGN{" "}
                        {(
                          account.target_amount - account.balance
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Information */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Client Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Client Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {account.client_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Client ID
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {account.client_id}
                  </p>
                </div>
                {account.client_email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {account.client_email}
                    </p>
                  </div>
                )}
                {account.client_phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {account.client_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Account Type
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {account.account_type.replace("_", " ")}
                  </p>
                </div>
                {account.contribution_frequency && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Contribution Frequency
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                      {account.contribution_frequency}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Date Created
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(account.created_at).toLocaleDateString()}
                  </p>
                </div>
                {account.start_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Start Date
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(account.start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {account.maturity_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Maturity Date
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(account.maturity_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {account.last_transaction_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Last Transaction
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(
                        account.last_transaction_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Description */}
            {account.account_description && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Account Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {account.account_description}
                </p>
              </div>
            )}

            {/* Transaction History Table */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Receipt className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction History
                </h3>
                <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                  {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <>
                  <DataTable
                    columns={transactionColumns}
                    data={paginatedTransactions}
                    onRowClick={(row) => {
                      setSelectedTransaction(row as Transaction);
                      setShowTransactionModal(true);
                    }}
                    actionMenu={(row) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(row as Transaction);
                          setShowTransactionModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    )}
                  />

                  <Pagination
                    currentPage={transactionPage}
                    totalPages={Math.ceil(
                      transactions.length / transactionPageSize
                    )}
                    pageSize={transactionPageSize}
                    totalItems={transactions.length}
                    onPageChange={setTransactionPage}
                    onPageSizeChange={(size) => {
                      setTransactionPageSize(size);
                      setTransactionPage(1);
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Interest Information */}
            {(account.interest_rate || account.interest_earned > 0) && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Percent className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Interest
                  </h3>
                </div>
                {account.interest_rate && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Interest Rate
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {account.interest_rate}% per annum
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Interest Earned
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    NGN {account.interest_earned.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Quick Stats
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Transactions
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {transactions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Net Change
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      account.total_deposits - account.total_withdrawals >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    NGN{" "}
                    {(
                      account.total_deposits - account.total_withdrawals
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg. Deposit
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    NGN{" "}
                    {transactions.filter(
                      (t) => t.transaction_type === "deposit"
                    ).length > 0
                      ? (
                          account.total_deposits /
                          transactions.filter(
                            (t) => t.transaction_type === "deposit"
                          ).length
                        ).toLocaleString()
                      : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Timeline
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Account Created
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {account.start_date && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {account.maturity_date && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Savings Started
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(account.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {account.maturity_date && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          new Date(account.maturity_date) < new Date()
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(account.maturity_date) < new Date()
                          ? "Matured"
                          : "Maturity Date"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(account.maturity_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Dialog
        open={showTransactionModal}
        onOpenChange={setShowTransactionModal}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6 pb-2">
              {/* Added pb-2 for bottom spacing */}
              {/* Transaction Type Badge */}
              <div className="flex items-center justify-center">
                {getTransactionTypeBadge(selectedTransaction.transaction_type)}
              </div>

              {/* Amount Section */}
              <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Transaction Amount
                </p>
                <p
                  className={`text-3xl font-bold ${
                    selectedTransaction.transaction_type === "withdrawal"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {selectedTransaction.transaction_type === "withdrawal"
                    ? "-"
                    : "+"}
                  NGN {(selectedTransaction.amount || 0).toLocaleString()}
                </p>
              </div>

              {/* Transaction Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Transaction Reference
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {selectedTransaction.transaction_ref || "N/A"}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Transaction Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTransaction.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Transaction Type
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedTransaction.type ||
                      selectedTransaction.transaction_type}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedTransaction.payment_method &&
                    selectedTransaction.payment_method !== "N/A"
                      ? selectedTransaction.payment_method.replace("_", " ")
                      : "Cash"}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Balance Before
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    NGN{" "}
                    {(selectedTransaction.balance_before || 0).toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Balance After
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    NGN{" "}
                    {(selectedTransaction.balance_after || 0).toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Processed By
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedTransaction.processed_by || "System"}
                  </p>
                </div>

                {selectedTransaction.status && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {selectedTransaction.status}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedTransaction.description && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {selectedTransaction.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {selectedTransaction.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Print transaction receipt
                    window.print();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                  onClick={() => setShowTransactionModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
