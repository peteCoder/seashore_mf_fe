"use client";
// Dummy Data
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Search,
  Download,
  Eye,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  account_holder: string;
  method: string;
  date: string;
  completed_at: string;
  approved_by?: string;
}

export default function CompletedTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    // Mock data - replace with API call
    const mockCompletedTransactions: Transaction[] = [
      {
        id: "1",
        reference: "TXN-2024-001234",
        type: "deposit",
        amount: 50000,
        account_holder: "John Doe",
        method: "Bank Transfer",
        date: "2024-12-29T10:30:00",
        completed_at: "2024-12-29T10:35:00",
        approved_by: "Admin User",
      },
      {
        id: "2",
        reference: "TXN-2024-001235",
        type: "loan_disbursement",
        amount: 200000,
        account_holder: "Mary Johnson",
        method: "Cash",
        date: "2024-12-29T11:15:00",
        completed_at: "2024-12-29T11:20:00",
        approved_by: "Manager User",
      },
      {
        id: "3",
        reference: "TXN-2024-001237",
        type: "loan_repayment",
        amount: 15000,
        account_holder: "Sarah Wilson",
        method: "Bank Transfer",
        date: "2024-12-29T13:45:00",
        completed_at: "2024-12-29T13:50:00",
        approved_by: "Admin User",
      },
    ];

    setTimeout(() => {
      setTransactions(mockCompletedTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = {
    total: transactions.length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
    today: transactions.filter(
      (t) =>
        new Date(t.completed_at).toDateString() === new Date().toDateString()
    ).length,
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account_holder
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (dateFilter === "today") {
      return (
        matchesSearch &&
        new Date(transaction.completed_at).toDateString() ===
          new Date().toDateString()
      );
    }
    if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && new Date(transaction.completed_at) >= weekAgo;
    }
    return matchesSearch;
  });

  return (
    <DashboardLayout title="Completed Transactions">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Completed Transactions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all successfully completed transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Completed
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
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
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Today
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.today}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Completed Transactions
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No completed transactions found
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
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Approved By
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() =>
                      router.push(`/transactions/${transaction.id}`)
                    }
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.completed_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {transaction.approved_by || "System"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/transactions/${transaction.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
