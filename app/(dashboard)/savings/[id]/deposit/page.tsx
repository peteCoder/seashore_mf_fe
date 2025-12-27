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
  ArrowDownCircle,
  Wallet,
  User,
  Calendar,
  AlertCircle,
  DollarSign,
  CreditCard,
  TrendingUp,
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
}

export default function SavingsDepositPage() {
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
    deposit_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "cash",
    reference_number: "",
    deposit_notes: "",
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
          setError("This savings account is not active for deposits");
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
      const depositAmount = parseFloat(formData.amount);

      // Validation
      if (depositAmount <= 0) {
        throw new Error("Deposit amount must be greater than zero");
      }

      // Prepare payload
      const payload = {
        deposit_date: formData.deposit_date,
        amount: depositAmount,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        deposit_notes: formData.deposit_notes,
      };

      const result = await savingsAPI.deposit(savingsId, payload);

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push(`/savings/${savingsId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to record deposit");
      }
    } catch (err) {
      console.error("Deposit error:", err);
      setError(err instanceof Error ? err.message : "Failed to record deposit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate new balance after deposit
  const calculateNewBalance = () => {
    if (!account) return 0;
    const depositAmount = parseFloat(formData.amount) || 0;
    return Number(account.balance) + depositAmount;
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

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Make Deposit">
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
      <DashboardLayout title="Make Deposit">
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
  const depositAmount = parseFloat(formData.amount) || 0;
  const targetProgress = calculateTargetProgress();

  return (
    <DashboardLayout title="Make Deposit">
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
                Make Deposit
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {account.account_number}
              </p>
            </div>
            <StatusBadge status={account.status as any} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
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
                  Current Balance
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

          {/* Deposit Details */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <ArrowDownCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deposit Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Deposit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deposit Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.deposit_date}
                  onChange={(e) =>
                    setFormData({ ...formData, deposit_date: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deposit Amount (NGN) *
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

              {/* Deposit Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deposit Notes (Optional)
                </label>
                <textarea
                  value={formData.deposit_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, deposit_notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Balance Preview */}
          {depositAmount > 0 && (
            <div className="bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Deposit Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Current Balance
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    NGN {account.balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Deposit Amount
                  </p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    + NGN {depositAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    New Balance
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    NGN {newBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Target Progress */}
              {targetProgress && (
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-800 dark:text-green-300">
                      Progress to Target
                    </span>
                    <span className="font-medium text-green-900 dark:text-green-200">
                      {targetProgress.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-900/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${targetProgress.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-2">
                    Remaining: NGN {targetProgress.remaining.toLocaleString()}
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
              disabled={isSubmitting || !formData.amount}
              className="bg-green-500 hover:bg-green-600 text-white min-w-[150px]"
            >
              {isSubmitting ? (
                "Recording..."
              ) : (
                <>
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Make Deposit
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
        title="Deposit Request Submitted!"
        description={`Your deposit request of NGN ${depositAmount.toLocaleString()} for ${
          account.client_name
        }'s account has been submitted and is awaiting approval from a manager.`}
      />
    </DashboardLayout>
  );
}
