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
import { loanAPI } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  AlertCircle,
} from "lucide-react";

// ✅ CORRECTED: Match backend response structure
interface Loan {
  id: string;
  loan_number: string;

  // Client info
  client_id: string;
  client_name: string;

  // Core loan details (what backend returns)
  principal_amount: number;
  repayment_frequency: "daily" | "weekly" | "biweekly" | "monthly";
  duration_value: number;

  // Calculated fields (from backend)
  monthly_interest_rate: number; // Decimal (0.05 = 5%)
  annual_interest_rate: number; // Percentage (60 = 60%)
  total_interest: number;
  total_repayment: number;
  installment_amount: number;
  number_of_installments: number;

  // Payment tracking
  amount_paid: number;
  outstanding_balance: number;

  // Status
  status:
    | "pending_approval"
    | "approved"
    | "rejected"
    | "active"
    | "overdue"
    | "completed";

  // Dates
  application_date: string;
  disbursement_date: string | null;
  next_repayment_date: string | null;

  // Legacy fields (for backward compatibility)
  total_amount: number; // Same as total_repayment
  balance: number; // Same as outstanding_balance
  interest_rate: number; // Same as annual_interest_rate
  loan_term: number; // Duration in months
  payment_frequency: string; // Same as repayment_frequency

  // Computed
  days_overdue: number;
  created_at: string;
}

interface LoanStats {
  total_disbursed: number;
  total_repayments: number;
  active_loans: number;
  pending_approval: number;
  total_outstanding: number;
}

export default function LoansPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchLoans();
  }, [filterStatus]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params: Record<string, string> = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const result = await loanAPI.list(params);

      console.log("Loans API Response:", result);

      if (result.success) {
        // ✅ CORRECTED: Backend returns { success: true, data: [...] }
        const loansData = Array.isArray(result.data) ? result.data : [];
        setLoans(loansData);

        // Fetch statistics
        await fetchStatistics();
      } else {
        throw new Error(result.error || "Failed to fetch loans");
      }
    } catch (err) {
      console.error("Loans fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await loanAPI.getStatistics();

      if (result.success && result.data) {
        setStats({
          total_disbursed: result.data.total_disbursed || 0,
          total_repayments: result.data.total_repayments || 0,
          active_loans: result.data.active || 0,
          pending_approval: result.data.pending_approval || 0,
          total_outstanding: result.data.total_outstanding || 0,
        });
      }
    } catch (err) {
      console.error("Statistics fetch error:", err);
      // Fallback: calculate from loans
      calculateStatsFromLoans(loans);
    }
  };

  const calculateStatsFromLoans = (loansData: Loan[]) => {
    const totalDisbursed = loansData
      .filter((l) => ["active", "overdue", "completed"].includes(l.status))
      .reduce((sum, loan) => sum + (loan.principal_amount || 0), 0);

    const totalRepayments = loansData.reduce(
      (sum, loan) => sum + (loan.amount_paid || 0),
      0
    );

    const activeLoans = loansData.filter(
      (l) => l.status === "active" || l.status === "overdue"
    ).length;

    const pendingApproval = loansData.filter(
      (l) => l.status === "pending_approval"
    ).length;

    const totalOutstanding = loansData
      .filter((l) => ["active", "overdue"].includes(l.status))
      .reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);

    setStats({
      total_disbursed: totalDisbursed,
      total_repayments: totalRepayments,
      active_loans: activeLoans,
      pending_approval: pendingApproval,
      total_outstanding: totalOutstanding,
    });
  };

  // Filter loans based on search
  const filteredLoans = loans.filter((loan) => {
    const searchLower = searchValue.toLowerCase();
    return (
      loan.loan_number?.toLowerCase().includes(searchLower) ||
      loan.client_name?.toLowerCase().includes(searchLower) ||
      loan.client_id?.toLowerCase().includes(searchLower)
    );
  });

  // Paginated data
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get status badge variant
  const getStatusVariant = (
    status: string
  ): "default" | "success" | "warning" | "error" => {
    switch (status) {
      case "active":
      case "completed":
        return "success";
      case "pending_approval":
      case "approved":
        return "warning";
      case "rejected":
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  // ✅ CORRECTED: Table columns matching backend fields
  const columns = [
    {
      header: "Loan Number",
      accessor: "loan_number",
      className: "font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Client Name",
      accessor: "client_name",
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Principal Amount",
      accessor: "principal_amount",
      cell: (value: number) => `₦${value?.toLocaleString() || "0"}`,
      className: "font-semibold text-gray-900 dark:text-white",
    },
    {
      header: "Balance",
      accessor: "outstanding_balance",
      cell: (value: number) => `₦${value?.toLocaleString() || "0"}`,
      className: "text-gray-900 dark:text-white",
    },
    {
      header: "Payment Plan",
      accessor: "repayment_frequency",
      cell: (value: string, row: Loan) => (
        <div className="text-sm">
          <span className="font-medium capitalize">{value}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 block">
            {row.number_of_installments} payments
          </span>
        </div>
      ),
    },
    {
      header: "Rate",
      accessor: "monthly_interest_rate",
      cell: (value: number) => {
        const monthlyRate = (value * 100).toFixed(2);
        return <span className="text-sm">{monthlyRate}%/mo</span>;
      },
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
          icon: DollarSign,
          label: "Total Disbursed",
          value: `₦${stats.total_disbursed.toLocaleString()}`,
          variant: "default" as const,
        },
        {
          icon: TrendingUp,
          label: "Total Repayments",
          value: `₦${stats.total_repayments.toLocaleString()}`,
          variant: "success" as const,
        },
        {
          icon: CheckCircle,
          label: "Active Loans",
          value: stats.active_loans.toString(),
          variant: "success" as const,
        },
        {
          icon: Clock,
          label: "Pending Approval",
          value: stats.pending_approval.toString(),
          variant: "warning" as const,
        },
      ]
    : [];

  // Loading state
  if (loading && loans.length === 0) {
    return (
      <DashboardLayout title="Loan Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading loans...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Loan Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Loans
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchLoans}
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
    <DashboardLayout title="Loan Management">
      {/* Welcome Section */}
      <WelcomeSection
        userName={user?.first_name || "User"}
        description="Manage loan applications, approvals, and repayments."
        actionButton={
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/loans/applications")}
              variant="outline"
              className="h-11 px-6"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Applications ({stats?.pending_approval || 0})
            </Button>
            <Button
              onClick={() => router.push("/loans/apply")}
              className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Apply for Loan
            </Button>
          </div>
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
          { label: "All Loans", value: "all" },
          { label: "Active", value: "active" },
          { label: "Pending Approval", value: "pending_approval" },
          { label: "Approved", value: "approved" },
          { label: "Completed", value: "completed" },
          { label: "Overdue", value: "overdue" },
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
          All Loans
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => console.log("Filter clicked")}
          onExportClick={() => console.log("Export clicked")}
        />

        {paginatedLoans.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Loans Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchValue
                ? "Try adjusting your search criteria"
                : loans.length === 0
                ? "Get started by creating your first loan application"
                : "No loans match the selected filter"}
            </p>
            {loans.length === 0 && (
              <Button
                onClick={() => router.push("/loans/apply")}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Apply for Loan
              </Button>
            )}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedLoans}
              onRowClick={(row) => router.push(`/loans/${(row as Loan).id}`)}
              actionMenu={(row) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/loans/${(row as Loan).id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              )}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredLoans.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredLoans.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
