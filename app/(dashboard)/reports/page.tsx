"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  PiggyBank,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
} from "lucide-react";
import { LoanRepaymentChart } from "@/components/dashboard/charts/loan-repayment-chart";
import { SavingsActivityChart } from "@/components/dashboard/charts/savings-activity-chart";
import { AccountDistributionChart } from "@/components/dashboard/charts/account-distribution-chart";
import { ClientGrowthChart } from "@/components/dashboard/charts/client-growth-chart";

// Mock stats data
const statsData = [
  {
    icon: DollarSign,
    label: "Total Revenue",
    value: "NGN 45,726,000",
    variant: "success" as const,
  },
  {
    icon: Users,
    label: "Active Clients",
    value: "1,845",
    variant: "default" as const,
  },
  {
    icon: TrendingUp,
    label: "Loan Portfolio",
    value: "NGN 125,450,000",
    variant: "default" as const,
  },
  {
    icon: PiggyBank,
    label: "Savings Balance",
    value: "NGN 425,726,000",
    variant: "success" as const,
  },
];

// Mock report templates
const reportTemplates = [
  {
    id: 1,
    title: "Loan Performance Report",
    description: "Comprehensive analysis of loan disbursements and repayments",
    icon: TrendingUp,
    color: "blue",
  },
  {
    id: 2,
    title: "Savings Activity Report",
    description: "Overview of deposits, withdrawals, and account balances",
    icon: PiggyBank,
    color: "green",
  },
  {
    id: 3,
    title: "Client Analytics Report",
    description: "Client demographics, growth trends, and engagement metrics",
    icon: Users,
    color: "purple",
  },
  {
    id: 4,
    title: "Financial Summary Report",
    description: "Complete financial overview including income and expenses",
    icon: DollarSign,
    color: "yellow",
  },
  {
    id: 5,
    title: "Branch Performance Report",
    description: "Comparative analysis of branch operations and metrics",
    icon: BarChart3,
    color: "orange",
  },
  {
    id: 6,
    title: "Portfolio Risk Report",
    description: "Risk assessment of loan portfolio and overdue accounts",
    icon: PieChart,
    color: "red",
  },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("this_month");
  const [reportType, setReportType] = useState("all");

  const handleGenerateReport = (reportId: number) => {
    console.log(`Generating report ${reportId}`);
    // Simulate report generation
    alert(
      "Report generation started! You'll receive a notification when it's ready."
    );
  };

  const handleExportReport = () => {
    console.log("Exporting report");
    // Simulate export
    alert("Report exported successfully!");
  };

  return (
    <DashboardLayout title="Reports & Monitoring">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Reports & Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate comprehensive reports and monitor business performance
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="loans">Loan Reports</option>
              <option value="savings">Savings Reports</option>
              <option value="clients">Client Reports</option>
              <option value="financial">Financial Reports</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleExportReport}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Report Templates */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Report Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((template) => (
            <div
              key={template.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    template.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900/20"
                      : template.color === "green"
                      ? "bg-green-100 dark:bg-green-900/20"
                      : template.color === "purple"
                      ? "bg-purple-100 dark:bg-purple-900/20"
                      : template.color === "yellow"
                      ? "bg-yellow-100 dark:bg-yellow-900/20"
                      : template.color === "orange"
                      ? "bg-orange-100 dark:bg-orange-900/20"
                      : "bg-red-100 dark:bg-red-900/20"
                  }`}
                >
                  <template.icon
                    className={`w-5 h-5 ${
                      template.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : template.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : template.color === "purple"
                        ? "text-purple-600 dark:text-purple-400"
                        : template.color === "yellow"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : template.color === "orange"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleGenerateReport(template.id)}
                className="w-full mt-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LoanRepaymentChart />
        <SavingsActivityChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountDistributionChart />
        <ClientGrowthChart />
      </div>
    </DashboardLayout>
  );
}
