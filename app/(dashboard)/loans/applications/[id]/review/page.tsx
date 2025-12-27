"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { useAuth } from "@/contexts/AuthContext";
import { loanAPI } from "@/lib/api";
import {
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calculator,
  Package,
} from "lucide-react";

interface LoanApplication {
  id: string;
  loan_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;

  // ✅ CORRECTED: Use correct field names
  principal_amount: number;
  annual_interest_rate: number; // ✅ NOT interest_rate
  duration_months: number; // ✅ NOT loan_term
  repayment_frequency: string; // ✅ NOT payment_frequency
  purpose: string; // ✅ NOT loan_purpose
  total_repayment: number; // ✅ NOT total_amount

  status: string;
  created_at: string;
  collateral_description?: string;
  collateral_value?: number;

  // ✅ CRITICAL FIX: Correct guarantor field names
  guarantor_name: string; // ✅ NOT guarantor1_name
  guarantor_phone: string; // ✅ NOT guarantor1_phone
  guarantor_address: string; // ✅ NOT guarantor1_address
  guarantor2_name: string; // ✅ CORRECT
  guarantor2_phone: string;
  guarantor2_address: string;

  applied_by?: string;
  applied_by_name?: string;
}

export default function LoanReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const loanId = params?.id as string;

  const canApproveLoans = ["manager", "director", "admin"].includes(
    user?.user_role?.toLowerCase() || ""
  );

  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await loanAPI.get(loanId);

      if (result.success && result.data) {
        setLoan(result.data);
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

  const handleAction = (type: "approve" | "reject") => {
    if (!canApproveLoans) {
      alert("You don't have permission to approve/reject loans.");
      return;
    }

    setActionType(type);
    setConfirmModal(true);
  };

  const executeAction = async () => {
    if (!loan || !actionType) return;

    try {
      setActionLoading(true);
      setConfirmModal(false);

      const payload: any = {
        action: actionType === "approve" ? "approve" : "reject",
      };

      if (actionType === "reject" && rejectReason) {
        payload.rejection_reason = rejectReason;
      }

      const result = await loanAPI.approve(
        loan.id,
        payload.action,
        payload.rejection_reason
      );

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push("/loans/applications");
        }, 2000);
      } else {
        throw new Error(result.error || "Action failed");
      }
    } catch (err) {
      console.error("Action error:", err);
      alert(
        `Failed to ${actionType} loan: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
      setRejectReason("");
    }
  };

  // ✅ CORRECTED: Calculate loan details using correct field names
  const calculateLoanDetails = () => {
    if (!loan) return null;

    const totalInterest = loan.total_repayment - loan.principal_amount;
    const totalPayable = loan.total_repayment;

    let periods = loan.duration_months;
    if (loan.repayment_frequency === "weekly") {
      periods = loan.duration_months * 4;
    } else if (loan.repayment_frequency === "daily") {
      periods = loan.duration_months * 30;
    }

    const periodPayment = periods > 0 ? totalPayable / periods : 0;

    return {
      totalInterest,
      totalPayable,
      periodPayment,
    };
  };

  const loanDetails = calculateLoanDetails();

  if (loading) {
    return (
      <DashboardLayout title="Review Loan Application">
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
      <DashboardLayout title="Review Loan Application">
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
              onClick={() => router.push("/loans/applications")}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Review Loan Application">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/loans/applications")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Loan Application Review
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loan.loan_number}
              </p>
            </div>
            <StatusBadge status={loan.status as any} />
          </div>
        </div>

        {!canApproveLoans && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  View-Only Access
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  You can view this application, but only managers, directors,
                  and admins can approve or reject it.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
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
              <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Principal Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{loan.principal_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Interest Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Application Date
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {new Date(loan.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Loan Calculation */}
          {loanDetails && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Loan Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Interest
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₦{loanDetails.totalInterest.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Payable
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₦{loanDetails.totalPayable.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {loan.repayment_frequency.charAt(0).toUpperCase() +
                      loan.repayment_frequency.slice(1)}{" "}
                    Payment
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₦{loanDetails.periodPayment.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loan Purpose */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Purpose
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {loan.purpose}
            </p>
          </div>

          {/* Collateral */}
          {(loan.collateral_description || loan.collateral_value) && (
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Collateral Information
                </h2>
              </div>
              <div className="space-y-3">
                {loan.collateral_description && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {loan.collateral_description}
                    </p>
                  </div>
                )}
                {loan.collateral_value && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Estimated Value
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ₦{loan.collateral_value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ CORRECTED: Guarantors with correct field names */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Guarantors
              </h2>
            </div>

            {/* First Guarantor */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                First Guarantor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.guarantor_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Phone
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.guarantor_phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Address
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.guarantor_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Second Guarantor */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                Second Guarantor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.guarantor2_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Phone
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.guarantor2_phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Address
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {loan.guarantor2_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Info */}
          {loan.applied_by_name && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Applied by:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {loan.applied_by_name}
                </span>{" "}
                on {new Date(loan.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {loan.status === "pending_approval" && canApproveLoans && (
            <div className="flex gap-4 justify-end pt-4">
              <Button
                variant="destructive"
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
                className="min-w-[120px]"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleAction("approve")}
                disabled={actionLoading}
                className="bg-green-500 hover:bg-green-600 text-white min-w-[120px]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal}
        onClose={() => {
          setConfirmModal(false);
          setRejectReason("");
        }}
        onConfirm={executeAction}
        title={
          actionType === "approve"
            ? "Approve Loan Application"
            : "Reject Loan Application"
        }
        description={
          actionType === "approve"
            ? `Are you sure you want to approve loan application ${loan.loan_number}? The loan will be ready for disbursement.`
            : `Are you sure you want to reject loan application ${loan.loan_number}? This action cannot be undone.`
        }
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        variant={actionType === "approve" ? "default" : "destructive"}
      >
        {actionType === "reject" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Rejection (Optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter reason for rejection..."
            />
          </div>
        )}
      </ConfirmationModal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title={actionType === "approve" ? "Loan Approved!" : "Loan Rejected"}
        description={
          actionType === "approve"
            ? "The loan application has been approved successfully."
            : "The loan application has been rejected."
        }
      />
    </DashboardLayout>
  );
}
