"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Printer,
  CreditCard,
  User,
  Calendar,
  FileText,
  DollarSign,
  Building2,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

interface TransactionDetail {
  id: string;
  reference: string;
  type: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  account_holder: {
    name: string;
    id: string;
    type: "savings" | "loan";
    account_number: string;
  };
  method: string;
  date: string;
  processed_at?: string;
  recorded_by: string;
  approved_by?: string;
  branch: string;
  description?: string;
  failure_reason?: string;
  can_retry?: boolean;
  balance_before?: number;
  balance_after?: number;
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    const mockTransaction: TransactionDetail = {
      id: params.id as string,
      reference: "TXN-2024-001234",
      type: "deposit",
      amount: 50000,
      status: "completed",
      account_holder: {
        name: "John Doe",
        id: "CLT-12345",
        type: "savings",
        account_number: "SAV-0012345",
      },
      method: "Bank Transfer",
      date: "2024-12-29T10:30:00",
      processed_at: "2024-12-29T10:35:00",
      recorded_by: "Jane Smith",
      approved_by: "Admin User",
      branch: "Main Branch - Lagos",
      description: "Monthly savings deposit",
      balance_before: 150000,
      balance_after: 200000,
    };

    setTimeout(() => {
      setTransaction(mockTransaction);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Transaction approved successfully");
      if (transaction) {
        setTransaction({
          ...transaction,
          status: "completed",
          approved_by: "Current User",
        });
      }
    } catch (error) {
      toast.error("Failed to approve transaction");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Transaction rejected");
      router.push("/transactions");
    } catch (error) {
      toast.error("Failed to reject transaction");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout title="Transaction Details">
        <div className="flex items-center justify-center h-96">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout title="Transaction Details">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
          <p className="text-gray-900 dark:text-white font-semibold mb-2">
            Transaction Not Found
          </p>
          <Button onClick={() => router.push("/transactions")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusInfo = (status: string) => {
    const statuses: Record<
      string,
      { icon: any; color: string; label: string }
    > = {
      completed: {
        icon: CheckCircle,
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        label: "Completed",
      },
      pending: {
        icon: Clock,
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        label: "Pending",
      },
      failed: {
        icon: XCircle,
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        label: "Failed",
      },
    };
    return statuses[status] || statuses.pending;
  };

  const statusInfo = getStatusInfo(transaction.status);
  const StatusIcon = statusInfo.icon;

  return (
    <DashboardLayout title="Transaction Details">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm mt-1">
              {transaction.reference}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 mb-6 ${statusInfo.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">
                Transaction {statusInfo.label}
              </h3>
              <p className="text-sm mt-1">
                {transaction.status === "completed" &&
                  "This transaction has been successfully processed"}
                {transaction.status === "pending" &&
                  "This transaction is awaiting approval"}
                {transaction.status === "failed" &&
                  `Failed: ${transaction.failure_reason}`}
              </p>
            </div>
          </div>
          {transaction.status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={processing}
                className="bg-white hover:bg-gray-50"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {processing ? "Processing..." : "Approve"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">
                Transaction Amount
              </span>
            </div>
            <p className="text-4xl font-bold">
              ₦{transaction.amount.toLocaleString()}
            </p>
            <p className="text-sm opacity-90 mt-2 capitalize">
              {transaction.type.replace("_", " ")}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Transaction Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Reference Number
                </p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.reference}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Transaction Type
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {transaction.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Payment Method
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.method}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Date & Time
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(transaction.date).toLocaleString()}
                </p>
              </div>
              {transaction.processed_at && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Processed At
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(transaction.processed_at).toLocaleString()}
                  </p>
                </div>
              )}
              {transaction.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Information */}
          {transaction.balance_before !== undefined &&
            transaction.balance_after !== undefined && (
              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Balance Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Balance Before
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₦{transaction.balance_before.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Balance After
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₦{transaction.balance_after.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Change
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        transaction.balance_after > transaction.balance_before
                          ? "text-green-600"
                          : transaction.balance_after <
                            transaction.balance_before
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {transaction.balance_after > transaction.balance_before
                        ? "+"
                        : ""}
                      ₦
                      {Math.abs(
                        transaction.balance_after - transaction.balance_before
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Holder */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                Account Holder
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Name
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.account_holder.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Client ID
                </p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.account_holder.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Account Number
                </p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.account_holder.account_number}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Account Type
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {transaction.account_holder.type}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                Processing Details
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Recorded By
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.recorded_by}
                </p>
              </div>
              {transaction.approved_by && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Approved By
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.approved_by}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Branch
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.branch}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
