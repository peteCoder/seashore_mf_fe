"use client";
// Dummy Data
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
  requires_approval: boolean;
  approval_level: string;
}

export default function PendingTransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - replace with API call
    const mockPendingTransactions: Transaction[] = [
      {
        id: "1",
        reference: "TXN-2024-001236",
        type: "withdrawal",
        amount: 25000,
        account_holder: "Peter Brown",
        method: "Mobile Money",
        date: "2024-12-29T12:00:00",
        requires_approval: true,
        approval_level: "manager",
      },
      {
        id: "2",
        reference: "TXN-2024-001239",
        type: "withdrawal",
        amount: 50000,
        account_holder: "Alice Johnson",
        method: "Bank Transfer",
        date: "2024-12-29T15:00:00",
        requires_approval: true,
        approval_level: "manager",
      },
    ];

    setTimeout(() => {
      setTransactions(mockPendingTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (transactionId: string) => {
    setProcessing(transactionId);
    try {
      // TODO: API call to approve transaction
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Transaction approved successfully");
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (error) {
      toast.error("Failed to approve transaction");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    setProcessing(transactionId);
    try {
      // TODO: API call to reject transaction
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Transaction rejected");
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (error) {
      toast.error("Failed to reject transaction");
    } finally {
      setProcessing(null);
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account_holder
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Pending Transactions">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pending Transactions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve pending transactions requiring authorization
        </p>
      </div>

      {/* Alert Banner */}
      {filteredTransactions.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                {filteredTransactions.length} Transaction
                {filteredTransactions.length !== 1 ? "s" : ""} Awaiting Approval
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Please review and take action on pending transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Pending Approval
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {transactions.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                ₦
                {transactions
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Your Authority
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.user_role === "admin"
                  ? "Full Access"
                  : user?.user_role === "manager"
                  ? "Manager"
                  : "Staff"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by reference or account holder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Pending Approvals
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Loading pending transactions...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <p className="text-gray-900 dark:text-white font-semibold mb-1">
              All Clear!
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              No pending transactions require approval
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
                    Date
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.reference}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900 dark:text-white">
                        {transaction.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.account_holder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ₦{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/transactions/${transaction.id}`)
                          }
                          disabled={processing === transaction.id}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(transaction.id)}
                          disabled={processing === transaction.id}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(transaction.id)}
                          disabled={processing === transaction.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {processing === transaction.id
                            ? "Processing..."
                            : "Approve"}
                        </Button>
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
