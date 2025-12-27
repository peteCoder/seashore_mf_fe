"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { loanAPI } from "@/lib/api";
import {
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  Send,
  Receipt,
  Eye,
  Download,
  Search,
  X,
  CreditCard,
  MapPin,
} from "lucide-react";

// ✅ CORRECTED: Updated interface with correct field names
interface Loan {
  id: string;
  loan_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;

  principal_amount: number;
  annual_interest_rate: number;
  duration_months: number;
  repayment_frequency: string;
  purpose: string;
  total_repayment: number;
  outstanding_balance: number;
  amount_paid: number;

  status: string;
  created_at: string;
  approval_date?: string;
  disbursement_date?: string;
  final_repayment_date?: string;

  collateral_description?: string;
  collateral_value?: number;

  guarantor_name: string;
  guarantor_phone: string;
  guarantor_address: string;
  guarantor2_name: string;
  guarantor2_phone: string;
  guarantor2_address: string;

  applied_by?: string;
  approved_by?: string;
  disbursed_by?: string;
}

interface Transaction {
  id: string;
  transaction_ref: string;
  transaction_type: string;
  amount: number;
  date: string;
  payment_method?: string;
  reference?: string;
  notes?: string;
  recorded_by?: string;
  balance_before?: number;
  balance_after?: number;
}

export default function LoanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const loanId = params?.id as string;

  const canManageLoans = ["manager", "director", "admin"].includes(
    user?.user_role?.toLowerCase() || ""
  );

  const [loan, setLoan] = useState<Loan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Transaction table state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    if (loanId) {
      fetchLoanData();
    }
  }, [loanId]);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await loanAPI.get(loanId);

      if (result.success && result.data) {
        setLoan(result.data);

        if (
          result.data.status === "active" ||
          result.data.status === "completed" ||
          result.data.status === "disbursed"
        ) {
          await fetchTransactions();
        }
      } else {
        throw new Error(result.error || "Failed to fetch loan details");
      }
    } catch (err) {
      console.error("Loan fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load loan details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
        }/loans/${loanId}/transactions/`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTransactions(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  // Helper functions - defined before use
  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      loan_repayment: "Loan Repayment",
      loan_disbursement: "Loan Disbursement",
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      fee: "Fee/Charge",
      reversal: "Reversal",
    };
    return labels[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      loan_repayment:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      loan_disbursement:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      deposit:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      withdrawal: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      fee: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
      reversal:
        "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20",
    };
    return (
      colors[type] ||
      "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
    );
  };

  // Filter and paginate transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(txn.date).toLocaleDateString().toLowerCase();
    const amountStr = txn.amount.toString();
    const typeStr = getTransactionTypeLabel(txn.transaction_type).toLowerCase();

    return (
      txn.transaction_ref?.toLowerCase().includes(searchLower) ||
      amountStr.includes(searchLower) ||
      txn.payment_method?.toLowerCase().includes(searchLower) ||
      txn.recorded_by?.toLowerCase().includes(searchLower) ||
      dateStr.includes(searchLower) ||
      typeStr.includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const calculateProgress = () => {
    if (!loan || loan.total_repayment === 0) return 0;
    return Math.min((loan.amount_paid / loan.total_repayment) * 100, 100);
  };

  if (loading) {
    return (
      <DashboardLayout title="Loan Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading loan details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !loan) {
    return (
      <DashboardLayout title="Loan Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Loan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Loan not found"}
            </p>
            <Button
              onClick={() => router.push("/loans")}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Back to Loans
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();

  return (
    <DashboardLayout title="Loan Details">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/loans")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Loan Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loan.loan_number}
              </p>
            </div>
            <StatusBadge status={loan.status as any} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {loan.status === "approved" && canManageLoans && (
            <Button
              onClick={() => router.push(`/loans/${loan.id}/disburse`)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Disburse Loan
            </Button>
          )}

          {(loan.status === "active" || loan.status === "disbursed") && (
            <Button
              onClick={() => router.push(`/loans/${loan.id}/repay`)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showSchedule ? "Hide" : "View"} Schedule
          </Button>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    Principal Amount
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  ₦{loan.principal_amount.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                    Total Payable
                  </p>
                </div>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                  ₦{loan.total_repayment.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Balance
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  ₦{loan.outstanding_balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Progress */}
            {(loan.status === "active" || loan.status === "completed") && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Repayment Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Amount Paid
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₦{loan.amount_paid.toLocaleString()} / ₦
                        {loan.total_repayment.toLocaleString()}
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
                        Amount Paid
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₦{loan.amount_paid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Remaining Balance
                      </p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        ₦{loan.outstanding_balance.toLocaleString()}
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
                    {loan.client_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Client ID
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.client_id}
                  </p>
                </div>
                {loan.client_email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {loan.client_email}
                    </p>
                  </div>
                )}
                {loan.client_phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {loan.client_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Loan Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Interest Rate
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.annual_interest_rate}% per annum
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Loan Term
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.duration_months} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Payment Frequency
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {loan.repayment_frequency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Application Date
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(loan.created_at).toLocaleDateString()}
                  </p>
                </div>
                {loan.approval_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Approval Date
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(loan.approval_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {loan.disbursement_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Disbursement Date
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(loan.disbursement_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {loan.final_repayment_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Final Repayment Date
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(loan.final_repayment_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Purpose */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Loan Purpose
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {loan.purpose}
              </p>
            </div>

            {/* ✅ ENHANCED Payment History with Data Table */}
            {(loan.status === "active" ||
              loan.status === "completed" ||
              loan.status === "disbursed") && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Payment History
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredTransactions.length} transaction(s)
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No payment records yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    {/* Table */}
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                          No transactions match your search
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  Date
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap min-w-[140px]">
                                  Type
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  Amount
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  Method
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                  Reference
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedTransactions.map((txn) => (
                                <tr
                                  key={txn.id}
                                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                    {new Date(txn.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </td>
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTransactionTypeColor(
                                        txn.transaction_type
                                      )}`}
                                    >
                                      {getTransactionTypeLabel(
                                        txn.transaction_type
                                      )}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                    ₦{txn.amount.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize whitespace-nowrap">
                                    {txn.payment_method || "N/A"}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    {txn.transaction_ref}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleViewTransaction(txn)}
                                      className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    >
                                      <Eye className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Show
                              </span>
                              <select
                                value={pageSize}
                                onChange={(e) => {
                                  setPageSize(Number(e.target.value));
                                  setCurrentPage(1);
                                }}
                                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                              </select>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                per page
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCurrentPage(
                                    Math.min(totalPages, currentPage + 1)
                                  )
                                }
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Collateral */}
            {(loan.collateral_description || loan.collateral_value) && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Collateral
                  </h3>
                </div>
                {loan.collateral_description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {loan.collateral_description}
                    </p>
                  </div>
                )}
                {loan.collateral_value && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Value
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₦{loan.collateral_value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Guarantors */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Guarantors
                </h3>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                  First Guarantor
                </p>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {loan.guarantor_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loan.guarantor_phone}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loan.guarantor_address}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Second Guarantor
                </p>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {loan.guarantor2_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loan.guarantor2_phone}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loan.guarantor2_address}
                </p>
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
                      Application Submitted
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(loan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {loan.approval_date && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Approved
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(loan.approval_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {loan.disbursement_date && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {loan.status !== "completed" && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Disbursed
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(loan.disbursement_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {loan.status === "completed" && loan.final_repayment_date && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Completed
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(
                          loan.final_repayment_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Transaction Type Badge */}
              <div className="text-center">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getTransactionTypeColor(
                    selectedTransaction.transaction_type
                  )}`}
                >
                  {getTransactionTypeLabel(
                    selectedTransaction.transaction_type
                  )}
                </span>
              </div>

              {/* Amount */}
              <div className="text-center py-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                  Amount
                </p>
                <p className="text-4xl font-bold text-green-900 dark:text-green-200">
                  ₦{selectedTransaction.amount.toLocaleString()}
                </p>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reference
                    </p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedTransaction.transaction_ref}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedTransaction.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(selectedTransaction.date).toLocaleTimeString()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Payment Method
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedTransaction.payment_method || "N/A"}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recorded By
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedTransaction.recorded_by || "System"}
                  </p>
                </div>
              </div>

              {/* Balance Changes */}
              {selectedTransaction.balance_before !== null &&
                selectedTransaction.balance_before !== undefined &&
                selectedTransaction.balance_after !== null &&
                selectedTransaction.balance_after !== undefined && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
                      Balance Changes
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">
                          Before
                        </p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                          ₦
                          {Number(
                            selectedTransaction.balance_before
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">
                          After
                        </p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                          ₦
                          {Number(
                            selectedTransaction.balance_after
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-800 dark:text-blue-300">
                          Change
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            Number(selectedTransaction.balance_after) >
                            Number(selectedTransaction.balance_before)
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {Number(selectedTransaction.balance_after) >
                          Number(selectedTransaction.balance_before)
                            ? "+"
                            : ""}
                          ₦
                          {(
                            Number(selectedTransaction.balance_after) -
                            Number(selectedTransaction.balance_before)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedTransaction.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <Button
                onClick={() => setShowTransactionModal(false)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
