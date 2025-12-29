"use client";
// Dummy Data
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  XCircle,
  Search,
  Download,
  Eye,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  account_holder: string;
  method: string;
  date: string;
  failed_at: string;
  failure_reason: string;
  can_retry: boolean;
}

export default function FailedTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - replace with API call
    const mockFailedTransactions: Transaction[] = [
      {
        id: "1",
        reference: "TXN-2024-001238",
        type: "deposit",
        amount: 10000,
        account_holder: "David Lee",
        method: "Cash",
        date: "2024-12-29T14:30:00",
        failed_at: "2024-12-29T14:31:00",
        failure_reason: "Insufficient funds in account",
        can_retry: true,
      },
      {
        id: "2",
        reference: "TXN-2024-001240",
        type: "withdrawal",
        amount: 75000,
        account_holder: "Emma Brown",
        method: "Bank Transfer",
        date: "2024-12-29T16:00:00",
        failed_at: "2024-12-29T16:02:00",
        failure_reason: "Bank service unavailable",
        can_retry: true,
      },
    ];

    setTimeout(() => {
      setTransactions(mockFailedTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRetry = async (transactionId: string) => {
    setRetrying(transactionId);
    try {
      // TODO: API call to retry transaction
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Transaction retry initiated");
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (error) {
      toast.error("Failed to retry transaction");
    } finally {
      setRetrying(null);
    }
  };

  const stats = {
    total: transactions.length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
    retryable: transactions.filter((t) => t.can_retry).length,
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account_holder
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.failure_reason
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Failed Transactions">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Failed Transactions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and retry failed transactions
        </p>
      </div>

      {/* Alert */}
      {filteredTransactions.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                {filteredTransactions.length} Failed Transaction
                {filteredTransactions.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Review the failure reasons and retry eligible transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Failed Transactions
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Can Retry
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.retryable}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Failed Transactions
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <XCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No failed transactions found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Account Holder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Failure Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Failed At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize text-sm text-gray-900 dark:text-white">
                      {transaction.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.account_holder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ₦{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {transaction.failure_reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.failed_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/transactions/${transaction.id}`)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {transaction.can_retry && (
                          <Button
                            size="sm"
                            onClick={() => handleRetry(transaction.id)}
                            disabled={retrying === transaction.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <RefreshCw
                              className={`w-4 h-4 mr-1 ${
                                retrying === transaction.id
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            {retrying === transaction.id
                              ? "Retrying..."
                              : "Retry"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
