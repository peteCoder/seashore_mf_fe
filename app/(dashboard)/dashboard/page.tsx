"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { LoanRepaymentChart } from "@/components/dashboard/charts/loan-repayment-chart";
import { SavingsActivityChart } from "@/components/dashboard/charts/savings-activity-chart";
import { AccountDistributionChart } from "@/components/dashboard/charts/account-distribution-chart";
import { ClientGrowthChart } from "@/components/dashboard/charts/client-growth-chart";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/lib/api";

import {
  DollarSign,
  TrendingUp,
  Users,
  PiggyBank,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  total_loans_disbursed: number;
  total_repayments: number;
  total_savings_balance: number;
  total_withdrawals: number;
  total_clients: number;
  total_staff: number;
  active_loans: number;
  pending_loan_applications: number;
}

interface ChartData {
  loan_repayment?: any;
  savings_activity?: any;
  account_distribution?: any;
  client_growth?: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard overview stats
      const overviewResult = await dashboardAPI.getOverview();

      if (overviewResult.success && overviewResult.data) {
        setStats(overviewResult.data);
      } else {
        throw new Error(
          overviewResult.error || "Failed to fetch dashboard stats"
        );
      }

      // Fetch all chart data in parallel
      const [loanChart, savingsChart, accountChart, clientChart] =
        await Promise.all([
          dashboardAPI.getLoanRepaymentChart(),
          dashboardAPI.getSavingsActivityChart(),
          dashboardAPI.getAccountDistribution(),
          dashboardAPI.getClientGrowth(),
        ]);

      setChartData({
        loan_repayment: loanChart.success ? loanChart.data : null,
        savings_activity: savingsChart.success ? savingsChart.data : null,
        account_distribution: accountChart.success ? accountChart.data : null,
        client_growth: clientChart.success ? clientChart.data : null,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchDashboardData}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Stats data with real API values
  const statsData = stats
    ? [
        {
          icon: DollarSign,
          label: "Total Loans Disbursed",
          value: `NGN ${stats.total_loans_disbursed?.toLocaleString() || "0"}`,
          variant: "default" as const,
        },
        {
          icon: TrendingUp,
          label: "Total Repayments",
          value: `NGN ${stats.total_repayments?.toLocaleString() || "0"}`,
          variant: "success" as const,
        },
        {
          icon: PiggyBank,
          label: "Savings Balance",
          value: `NGN ${stats.total_savings_balance?.toLocaleString() || "0"}`,
          variant: "success" as const,
        },
        {
          icon: DollarSign,
          label: "Total Withdrawals",
          value: `NGN ${stats.total_withdrawals?.toLocaleString() || "0"}`,
          variant: "warning" as const,
        },
        {
          icon: Users,
          label: "Total Clients",
          value: stats.total_clients?.toString() || "0",
          variant: "default" as const,
        },
        {
          icon: Users,
          label: "Total Staff",
          value: stats.total_staff?.toString() || "0",
          variant: "default" as const,
        },
      ]
    : [];

  // ✅ FIX: Role-based welcome message using user_role
  const getWelcomeMessage = () => {
    if (!user) return "Welcome back!";

    const role = user.user_role?.toLowerCase();
    if (role === "admin" || role === "director") {
      return "Monitor your entire microfinance operations";
    } else if (role === "manager") {
      return "Manage your branch performance and team";
    } else if (role === "staff") {
      return "Track your clients and daily activities";
    }
    return "Welcome to your dashboard";
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <WelcomeSection
        userName={user?.first_name || "User"}
        description={getWelcomeMessage()}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions - Role Based */}
      {/* ✅ FIX: Use user.user_role instead of user.role */}
      {user?.user_role &&
        ["admin", "director", "manager"].includes(
          user.user_role.toLowerCase()
        ) && (
          <div className="bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                onClick={() => router.push("/loans/applications")}
                variant="outline"
                className="justify-start"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {stats?.pending_loan_applications || 0} Pending Approvals
              </Button>
              <Button
                onClick={() => router.push("/loans/apply")}
                variant="outline"
                className="justify-start"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                New Loan Application
              </Button>
              <Button
                onClick={() => router.push("/clients")}
                variant="outline"
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Clients
              </Button>
              <Button
                onClick={() => router.push("/reports")}
                variant="outline"
                className="justify-start"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LoanRepaymentChart data={chartData.loan_repayment} />
        <SavingsActivityChart data={chartData.savings_activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountDistributionChart data={chartData.account_distribution} />
        <ClientGrowthChart data={chartData.client_growth} />
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          className="text-sm"
        >
          Refresh Dashboard Data
        </Button>
      </div>
    </DashboardLayout>
  );
}
