"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LoanRepaymentChartProps {
  data?: {
    monthly_data: Array<{
      month: string;
      disbursed: number;
      repayments: number;
    }>;
  } | null;
}

export function LoanRepaymentChart({ data }: LoanRepaymentChartProps) {
  // Transform API data or use empty state
  const chartData = data?.monthly_data || [];

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Loan Disbursement vs Repayment
        </h3>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Loan Disbursement vs Repayment
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#EAB308" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorRepayments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
            formatter={(value: number) => `NGN ${value.toLocaleString()}`}
          />
          <Area
            type="monotone"
            dataKey="disbursed"
            stroke="#EAB308"
            fillOpacity={1}
            fill="url(#colorDisbursed)"
            name="Disbursed"
          />
          <Area
            type="monotone"
            dataKey="repayments"
            stroke="#22C55E"
            fillOpacity={1}
            fill="url(#colorRepayments)"
            name="Repayments"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Disbursed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Repayments
          </span>
        </div>
      </div>
    </div>
  );
}
