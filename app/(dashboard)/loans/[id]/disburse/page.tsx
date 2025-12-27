"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { useAuth } from "@/contexts/AuthContext";
import { loanAPI } from "@/lib/api";
import {
  ArrowLeft,
  Send,
  DollarSign,
  Calendar,
  AlertCircle,
  User,
  FileText,
  CreditCard,
  Building,
  Shield,
} from "lucide-react";

interface Loan {
  id: string;
  loan_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  principal_amount: number;
  interest_rate: number;
  loan_term: number;
  payment_frequency: string;
  total_amount: number;
  status: string;
  created_at: string;
  approved_at?: string;
}

export default function LoanDisbursePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const loanId = params?.id as string;

  // Check if user can disburse loans
  const canDisburseLoans = ["manager", "director", "admin"].includes(
    user?.user_role?.toLowerCase() || ""
  );

  // State
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    disbursement_date: new Date().toISOString().split("T")[0],
    disbursement_method: "bank_transfer",
    bank_name: "",
    account_number: "",
    account_name: "",
    transaction_reference: "",
    disbursement_notes: "",
    deduction_amount: "",
    deduction_reason: "",
    net_disbursement: "",
  });

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  useEffect(() => {
    // Calculate net disbursement when principal or deduction changes
    if (loan) {
      const deduction = parseFloat(formData.deduction_amount) || 0;
      const netAmount = loan.principal_amount - deduction;
      setFormData((prev) => ({
        ...prev,
        net_disbursement: netAmount.toString(),
      }));
    }
  }, [formData.deduction_amount, loan]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await loanAPI.get(loanId);

      if (result.success && result.data) {
        // Check if loan is approved
        if (result.data.status !== "approved") {
          setError("This loan is not approved for disbursement");
          return;
        }

        setLoan(result.data);

        // Pre-fill account name with client name
        setFormData((prev) => ({
          ...prev,
          account_name: result.data.client_name || "",
        }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canDisburseLoans) {
      alert(
        "You don't have permission to disburse loans. Only managers, directors, and admins can disburse loans."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare payload
      const payload: any = {
        disbursement_date: formData.disbursement_date,
        disbursement_method: formData.disbursement_method,
        transaction_reference: formData.transaction_reference,
        disbursement_notes: formData.disbursement_notes,
      };

      // Add bank details if method is bank transfer
      if (formData.disbursement_method === "bank_transfer") {
        if (
          !formData.bank_name ||
          !formData.account_number ||
          !formData.account_name
        ) {
          throw new Error("Bank details are required for bank transfer");
        }
        payload.bank_name = formData.bank_name;
        payload.account_number = formData.account_number;
        payload.account_name = formData.account_name;
      }

      // Add deductions if any
      if (
        formData.deduction_amount &&
        parseFloat(formData.deduction_amount) > 0
      ) {
        payload.deduction_amount = parseFloat(formData.deduction_amount);
        payload.deduction_reason = formData.deduction_reason;
      }

      const result = await loanAPI.disburse(loanId, payload);

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push(`/loans/${loanId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to disburse loan");
      }
    } catch (err) {
      console.error("Disbursement error:", err);
      setError(err instanceof Error ? err.message : "Failed to disburse loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check permission
  if (!canDisburseLoans) {
    return (
      <DashboardLayout title="Disburse Loan">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to disburse loans. Only managers,
              directors, and admins can disburse loans.
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

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Disburse Loan">
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

  // Error state
  if (error || !loan) {
    return (
      <DashboardLayout title="Disburse Loan">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unable to Process
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

  const netDisbursement =
    parseFloat(formData.net_disbursement) || loan.principal_amount;

  return (
    <DashboardLayout title="Disburse Loan">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/loans/${loanId}`)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loan Details
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Disburse Loan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loan.loan_number}
              </p>
            </div>
            <StatusBadge status={loan.status as any} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Summary */}
          <div className="bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Summary
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                  Principal Amount
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  NGN {loan.principal_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                  Total Payable
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  NGN {loan.total_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                  Loan Term
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {loan.loan_term} months
                </p>
              </div>
            </div>
          </div>

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

          {/* Disbursement Details */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Disbursement Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disbursement Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.disbursement_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disbursement_date: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disbursement Method *
                </label>
                <select
                  required
                  value={formData.disbursement_method}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disbursement_method: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Details (if bank transfer) */}
          {formData.disbursement_method === "bank_transfer" && (
            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bank Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_name}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        account_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter account number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.account_name}
                    onChange={(e) =>
                      setFormData({ ...formData, account_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter account name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transaction Reference */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaction Reference
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Number *
              </label>
              <input
                type="text"
                required
                value={formData.transaction_reference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transaction_reference: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter transaction reference"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bank reference, cheque number, or transaction ID
              </p>
            </div>
          </div>

          {/* Deductions (Optional) */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deductions (Optional)
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deduction Amount (NGN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={loan.principal_amount}
                    value={formData.deduction_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deduction_amount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deduction Reason
                  </label>
                  <input
                    type="text"
                    value={formData.deduction_reason}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deduction_reason: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Processing fee, insurance, etc."
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Common deductions: Processing fees, insurance, administrative
                charges
              </p>
            </div>
          </div>

          {/* Net Disbursement */}
          <div className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
                  Net Disbursement Amount
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                  NGN {netDisbursement.toLocaleString()}
                </p>
              </div>
              <Send className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            {formData.deduction_amount &&
              parseFloat(formData.deduction_amount) > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Principal: NGN {loan.principal_amount.toLocaleString()} -
                    Deduction: NGN{" "}
                    {parseFloat(formData.deduction_amount).toLocaleString()}
                  </p>
                </div>
              )}
          </div>

          {/* Disbursement Notes */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disbursement Notes (Optional)
            </label>
            <textarea
              value={formData.disbursement_notes}
              onChange={(e) =>
                setFormData({ ...formData, disbursement_notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Add any additional notes about this disbursement..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/loans/${loanId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white min-w-[150px]"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Disburse Loan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="Loan Disbursed Successfully!"
        description={`NGN ${netDisbursement.toLocaleString()} has been disbursed to ${
          loan.client_name
        }.`}
      />
    </DashboardLayout>
  );
}
