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
  Receipt,
  DollarSign,
  Calendar,
  AlertCircle,
  User,
  TrendingUp,
  CheckCircle,
  CreditCard,
} from "lucide-react";

// ✅ CORRECTED: Updated interface with correct field names
interface Loan {
  id: string;
  loan_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;

  // ✅ CORRECTED: Use backend field names
  principal_amount: number;
  annual_interest_rate: number;
  duration_months: number;
  repayment_frequency: string;
  total_repayment: number; // ✅ NOT total_amount
  amount_paid: number;
  outstanding_balance: number; // ✅ NOT balance

  status: string;
  created_at: string;
  disbursement_date?: string;
}

export default function LoanRepaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const loanId = params?.id as string;

  // State
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "cash",
    reference_number: "",
    payment_notes: "",
  });

  // Quick amount buttons
  const [quickAmounts, setQuickAmounts] = useState<number[]>([]);

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  useEffect(() => {
    // Calculate quick payment amounts
    if (loan) {
      const balance = loan.outstanding_balance;
      const amounts: number[] = [];

      // Add common fractions of balance
      if (balance > 1000) {
        amounts.push(Math.round(balance * 0.25)); // 25%
        amounts.push(Math.round(balance * 0.5)); // 50%
        amounts.push(Math.round(balance * 0.75)); // 75%
        amounts.push(balance); // Full balance
      } else {
        amounts.push(balance);
      }

      setQuickAmounts(amounts.filter((a) => a > 0));
    }
  }, [loan]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await loanAPI.get(loanId);

      if (result.success && result.data) {
        // Check if loan is active or disbursed
        if (
          result.data.status !== "active" &&
          result.data.status !== "disbursed"
        ) {
          setError("This loan is not active for repayment");
          return;
        }

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

  const handleQuickAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const paymentAmount = parseFloat(formData.amount);

      // Validation
      if (paymentAmount <= 0) {
        throw new Error("Payment amount must be greater than zero");
      }

      // ✅ CORRECTED: Allow overpayment (backend will handle it)
      // Remove the max restriction so users can make any payment
      // The backend will handle overpayment validation

      // Prepare payload
      const payload = {
        payment_date: formData.payment_date,
        amount: paymentAmount,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        payment_notes: formData.payment_notes,
      };

      console.log("Submitting payment:", payload);

      const result = await loanAPI.repay(loanId, payload);

      console.log("Payment response:", result);

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push(`/loans/${loanId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to record payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ CORRECTED: Calculate progress percentage
  const calculateProgress = () => {
    if (!loan || loan.total_repayment === 0) return 0;
    return Math.min((loan.amount_paid / loan.total_repayment) * 100, 100);
  };

  // ✅ CORRECTED: Calculate new balance after payment
  const calculateNewBalance = () => {
    if (!loan) return 0;
    const paymentAmount = parseFloat(formData.amount) || 0;
    return Math.max(loan.outstanding_balance - paymentAmount, 0);
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Record Payment">
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
  if (error && !loan) {
    return (
      <DashboardLayout title="Record Payment">
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

  if (!loan) {
    return (
      <DashboardLayout title="Record Payment">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600 dark:text-gray-400">Loan not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();
  const newBalance = calculateNewBalance();
  const paymentAmount = parseFloat(formData.amount) || 0;

  return (
    <DashboardLayout title="Record Payment">
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
                Record Loan Payment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loan.loan_number}
              </p>
            </div>
            <StatusBadge status={loan.status as any} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>
          </div>

          {/* Loan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Summary
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                  ₦{loan.total_repayment.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
                  Amount Paid
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₦{loan.amount_paid.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
                  Outstanding Balance
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ₦{loan.outstanding_balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-800 dark:text-blue-300">
                  Repayment Progress
                </span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Payment Amount - ✅ REMOVED max RESTRICTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Outstanding balance: ₦
                  {loan.outstanding_balance.toLocaleString()}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              {quickAmounts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Amounts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickAmount(amount)}
                        className="px-4 py-2 rounded-lg border border-yellow-500 hover:bg-yellow-500 hover:text-gray-900 text-yellow-600 dark:text-yellow-400 text-sm font-medium transition-colors"
                      >
                        ₦{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="pos">POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reference_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Transaction reference (optional)"
                  />
                </div>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Notes (Optional)
                </label>
                <textarea
                  value={formData.payment_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* New Balance Preview */}
          {paymentAmount > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Current Balance
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₦{loan.outstanding_balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Payment Amount
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    - ₦{paymentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    New Balance
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₦{newBalance.toLocaleString()}
                  </p>
                </div>
              </div>
              {newBalance === 0 && (
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-medium">
                      This payment will fully settle the loan!
                    </p>
                  </div>
                </div>
              )}
              {paymentAmount > loan.outstanding_balance && (
                <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">
                      Overpayment of ₦
                      {(
                        paymentAmount - loan.outstanding_balance
                      ).toLocaleString()}{" "}
                      will be recorded.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

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
              disabled={isSubmitting || !formData.amount}
              className="bg-green-500 hover:bg-green-600 text-white min-w-[150px]"
            >
              {isSubmitting ? (
                "Recording..."
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Record Payment
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
        title="Payment Recorded Successfully!"
        description={`₦${paymentAmount.toLocaleString()} has been recorded for ${
          loan.client_name
        }.${newBalance === 0 ? " The loan is now fully paid!" : ""}`}
      />
    </DashboardLayout>
  );
}
