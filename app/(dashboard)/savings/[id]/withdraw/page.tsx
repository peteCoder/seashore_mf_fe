"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { useAuth } from "@/contexts/AuthContext";
import { savingsAPI } from "@/lib/api";
import {
  ArrowLeft,
  ArrowUpCircle,
  Wallet,
  User,
  Calendar,
  AlertCircle,
  DollarSign,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

interface SavingsAccount {
  id: string;
  account_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  account_type: string;
  balance: number;
  target_amount?: number;
  status: string;
  created_at: string;
  maturity_date?: string;
}

export default function SavingsWithdrawPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const savingsId = params?.id as string;

  // State
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    withdrawal_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "cash",
    reference_number: "",
    withdrawal_reason: "",
    withdrawal_notes: "",
  });

  useEffect(() => {
    if (savingsId) {
      fetchAccountDetails();
    }
  }, [savingsId]);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await savingsAPI.get(savingsId);

      if (result.success && result.data) {
        // Check if account is active
        if (result.data.status !== "active") {
          setError("This savings account is not active for withdrawals");
          return;
        }

        // Check if account has sufficient balance
        if (result.data.balance <= 0) {
          setError(
            "This account has zero balance. No withdrawals can be made."
          );
          return;
        }

        setAccount(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch account details");
      }
    } catch (err) {
      console.error("Account fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load account details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const withdrawalAmount = parseFloat(formData.amount);

      // Validation
      if (withdrawalAmount <= 0) {
        throw new Error("Withdrawal amount must be greater than zero");
      }

      if (account && withdrawalAmount > account.balance) {
        throw new Error("Withdrawal amount cannot exceed available balance");
      }

      // Prepare payload
      const payload = {
        withdrawal_date: formData.withdrawal_date,
        amount: withdrawalAmount,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        withdrawal_reason: formData.withdrawal_reason,
        withdrawal_notes: formData.withdrawal_notes,
      };

      const result = await savingsAPI.withdraw(savingsId, payload);

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push(`/savings/${savingsId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to record withdrawal");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to record withdrawal"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate new balance after withdrawal
  const calculateNewBalance = () => {
    if (!account) return 0;
    const withdrawalAmount = parseFloat(formData.amount) || 0;
    return Math.max(account.balance - withdrawalAmount, 0);
  };

  // Check if withdrawal is significant (more than 50% of balance)
  const isSignificantWithdrawal = () => {
    if (!account) return false;
    const withdrawalAmount = parseFloat(formData.amount) || 0;
    return withdrawalAmount > account.balance * 0.5;
  };

  // Calculate progress to target (if applicable)
  const calculateTargetProgress = () => {
    if (!account || !account.target_amount || account.target_amount === 0)
      return null;
    const newBalance = calculateNewBalance();
    const progress = Math.min((newBalance / account.target_amount) * 100, 100);
    const remaining = Math.max(account.target_amount - newBalance, 0);
    return { progress, remaining };
  };

  // Check if withdrawal is before maturity (for fixed deposits)
  const isEarlyWithdrawal = () => {
    if (!account || !account.maturity_date) return false;
    return new Date(account.maturity_date) > new Date();
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Make Withdrawal">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading account details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <DashboardLayout title="Make Withdrawal">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unable to Process
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Account not found"}
            </p>
            <Button
              onClick={() => router.push("/savings")}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Back to Savings
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const newBalance = calculateNewBalance();
  const withdrawalAmount = parseFloat(formData.amount) || 0;
  const targetProgress = calculateTargetProgress();
  const showSignificantWarning = isSignificantWithdrawal();
  const showEarlyWithdrawalWarning = isEarlyWithdrawal();

  return (
    <DashboardLayout title="Make Withdrawal">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/savings/${savingsId}`)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account Details
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Make Withdrawal
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {account.account_number}
              </p>
            </div>
            <StatusBadge status={account.status as any} />
          </div>
        </div>

        {/* Early Withdrawal Warning */}
        {showEarlyWithdrawalWarning && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                  Early Withdrawal Notice
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
                  This is a fixed deposit account that hasn't reached maturity
                  yet (maturity date:{" "}
                  {new Date(account.maturity_date!).toLocaleDateString()}).
                  Early withdrawals may incur penalties or loss of interest.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Client Name
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {account.client_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Account Type
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                  {account.account_type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Available Balance
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  NGN {account.balance.toLocaleString()}
                </p>
              </div>
              {account.target_amount && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Target Amount
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    NGN {account.target_amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Details */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <ArrowUpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Withdrawal Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Withdrawal Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Withdrawal Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.withdrawal_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      withdrawal_date: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Withdrawal Amount (NGN) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={account.balance}
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum: NGN {account.balance.toLocaleString()}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Amounts
                </p>
                <div className="flex flex-wrap gap-2">
                  {[0.25, 0.5, 0.75, 1].map((percentage) => (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          amount: (account.balance * percentage).toFixed(2),
                        })
                      }
                      className="px-4 py-2 rounded-lg border border-blue-500 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 text-sm font-medium transition-colors"
                    >
                      {percentage === 1
                        ? "Full Balance"
                        : `${(percentage * 100).toFixed(0)}%`}{" "}
                      (NGN {(account.balance * percentage).toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>

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

              {/* Withdrawal Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Withdrawal *
                </label>
                <select
                  required
                  value={formData.withdrawal_reason}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      withdrawal_reason: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="personal_use">Personal Use</option>
                  <option value="emergency">Emergency</option>
                  <option value="business">Business Purpose</option>
                  <option value="medical">Medical Expenses</option>
                  <option value="education">Education</option>
                  <option value="investment">Investment</option>
                  <option value="maturity">Maturity/Account Closure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Withdrawal Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.withdrawal_notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      withdrawal_notes: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Balance Preview */}
          {withdrawalAmount > 0 && (
            <div
              className={`rounded-xl p-6 border ${
                showSignificantWarning
                  ? "bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800"
                  : "bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown
                  className={`w-6 h-6 ${
                    showSignificantWarning
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Withdrawal Summary
                </h3>
              </div>

              {/* Significant Withdrawal Warning */}
              {showSignificantWarning && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-300">
                      <strong>Large Withdrawal Alert:</strong> You are
                      withdrawing more than 50% of the account balance. Please
                      confirm this is intentional.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p
                    className={`text-sm mb-1 ${
                      showSignificantWarning
                        ? "text-red-800 dark:text-red-300"
                        : "text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    Current Balance
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    NGN {account.balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${
                      showSignificantWarning
                        ? "text-red-800 dark:text-red-300"
                        : "text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    Withdrawal Amount
                  </p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    - NGN {withdrawalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${
                      showSignificantWarning
                        ? "text-red-800 dark:text-red-300"
                        : "text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    New Balance
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      newBalance === 0
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    NGN {newBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Target Progress */}
              {targetProgress && (
                <div
                  className={`mt-4 pt-4 border-t ${
                    showSignificantWarning
                      ? "border-red-200 dark:border-red-700"
                      : "border-blue-200 dark:border-blue-700"
                  }`}
                >
                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={
                        showSignificantWarning
                          ? "text-red-800 dark:text-red-300"
                          : "text-blue-800 dark:text-blue-300"
                      }
                    >
                      Progress to Target After Withdrawal
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {targetProgress.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className={`w-full rounded-full h-3 overflow-hidden ${
                      showSignificantWarning
                        ? "bg-red-200 dark:bg-red-900/30"
                        : "bg-blue-200 dark:bg-blue-900/30"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        showSignificantWarning
                          ? "bg-linear-to-r from-red-500 to-red-600"
                          : "bg-linear-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${targetProgress.progress}%` }}
                    />
                  </div>
                  <p
                    className={`text-sm mt-2 ${
                      showSignificantWarning
                        ? "text-red-800 dark:text-red-300"
                        : "text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    Remaining to target: NGN{" "}
                    {targetProgress.remaining.toLocaleString()}
                  </p>
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
              onClick={() => router.push(`/savings/${savingsId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.amount || !formData.withdrawal_reason
              }
              className="bg-blue-500 hover:bg-blue-600 text-white min-w-[150px]"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Make Withdrawal
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
        title="Withdrawal Request Submitted!"
        description={`Your withdrawal request of NGN ${withdrawalAmount.toLocaleString()} from ${
          account.client_name
        }'s account has been submitted and is awaiting approval from a manager.`}
      />
    </DashboardLayout>
  );
}
