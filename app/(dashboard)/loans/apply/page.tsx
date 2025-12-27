"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { ErrorModal } from "@/components/dashboard/modal/error-modal";
import { useAuth } from "@/contexts/AuthContext";
import { loanAPI, clientAPI } from "@/lib/api";
import {
  ArrowLeft,
  DollarSign,
  Calculator,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Info,
  AlertCircle,
} from "lucide-react";

interface Client {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  branch_name?: string;
  profile?: {
    level?: string;
    occupation?: string;
  };
}

interface LoanCalculation {
  principal_amount: number;
  monthly_interest_rate: number;
  annual_interest_rate: number;
  duration_value: number;
  duration_months: number;
  repayment_frequency: string;
  total_interest: number;
  total_repayment: number;
  installment_amount: number;
  number_of_installments: number;
}

interface RateTier {
  range: string;
  monthly_rate: string;
  annual_rate: string;
}

export default function LoanApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const clientIdFromQuery = searchParams?.get("client_id");

  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    description?: string;
    errors: string[];
  }>({
    open: false,
    title: "",
    errors: [],
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    client_id: clientIdFromQuery || "",
    principal_amount: "",
    repayment_frequency: "monthly",
    duration_value: "",
    purpose: "",
    purpose_details: "",
    collateral_type: "",
    collateral_value: "",
    collateral_description: "",
    guarantor_name: "",
    guarantor_phone: "",
    guarantor_address: "",
    guarantor2_name: "",
    guarantor2_phone: "",
    guarantor2_address: "",
  });

  // Live calculation state
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [showRateTiers, setShowRateTiers] = useState(false);

  // Rate tiers for display
  const RATE_TIERS: Record<string, RateTier[]> = {
    daily: [
      { range: "1-30 days", monthly_rate: "10%", annual_rate: "120%" },
      { range: "31-90 days", monthly_rate: "8%", annual_rate: "96%" },
      { range: "91-180 days", monthly_rate: "7%", annual_rate: "84%" },
      { range: "181+ days", monthly_rate: "6%", annual_rate: "72%" },
    ],
    weekly: [
      { range: "1-12 weeks", monthly_rate: "9%", annual_rate: "108%" },
      { range: "13-26 weeks", monthly_rate: "7%", annual_rate: "84%" },
      { range: "27-52 weeks", monthly_rate: "6%", annual_rate: "72%" },
      { range: "53+ weeks", monthly_rate: "5%", annual_rate: "60%" },
    ],
    monthly: [
      { range: "1-3 months", monthly_rate: "8%", annual_rate: "96%" },
      { range: "4-6 months", monthly_rate: "6%", annual_rate: "72%" },
      { range: "7-12 months", monthly_rate: "5%", annual_rate: "60%" },
      { range: "13+ months", monthly_rate: "4%", annual_rate: "48%" },
    ],
    biweekly: [
      { range: "1-12 periods", monthly_rate: "8%", annual_rate: "96%" },
      { range: "13-24 periods", monthly_rate: "6%", annual_rate: "72%" },
      { range: "25+ periods", monthly_rate: "5%", annual_rate: "60%" },
    ],
  };

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Auto-select client if ID in URL
  useEffect(() => {
    if (clientIdFromQuery && clients.length > 0) {
      const client = clients.find((c) => c.id === clientIdFromQuery);
      if (client) {
        setSelectedClient(client);
        setFormData((prev) => ({ ...prev, client_id: client.id }));
      }
    }
  }, [clientIdFromQuery, clients]);

  // Live calculation when principal, frequency, or duration changes
  useEffect(() => {
    const { principal_amount, repayment_frequency, duration_value } = formData;

    if (
      principal_amount &&
      duration_value &&
      parseFloat(principal_amount) > 0 &&
      parseInt(duration_value) > 0
    ) {
      calculateLoan();
    } else {
      setCalculation(null);
    }
  }, [
    formData.principal_amount,
    formData.repayment_frequency,
    formData.duration_value,
  ]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const params = {
        is_active: "true",
        is_approved: "true",
      };

      const result = await clientAPI.list(params);

      if (result.success && result.data) {
        let clientsData: Client[] = [];

        if (Array.isArray(result.data)) {
          clientsData = result.data;
        } else if (result.data.results && Array.isArray(result.data.results)) {
          clientsData = result.data.results;
        } else if (result.data.clients && Array.isArray(result.data.clients)) {
          clientsData = result.data.clients;
        }

        setClients(clientsData);

        if (clientsData.length === 0) {
          setErrorModal({
            open: true,
            title: "No Clients Available",
            description: "You need approved clients to create loans.",
            errors: [
              "No active clients found in the system.",
              "Please create and approve at least one client first.",
            ],
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setErrorModal({
        open: true,
        title: "Failed to Load Clients",
        errors: ["Unable to fetch clients from the server."],
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const calculateLoan = async () => {
    try {
      setCalculationLoading(true);

      const result = await loanAPI.calculatePreview({
        principal_amount: parseFloat(formData.principal_amount),
        repayment_frequency: formData.repayment_frequency,
        duration_value: parseInt(formData.duration_value),
      });

      if (result.success && result.data) {
        setCalculation(result.data.calculation || result.data);
      } else {
        setCalculation(null);
      }
    } catch (err) {
      console.error("Calculation error:", err);
      setCalculation(null);
    } finally {
      setCalculationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.client_id) {
        setErrorModal({
          open: true,
          title: "Client Required",
          description: "Please select a client to create the loan.",
          errors: ["You must select a client before proceeding."],
        });
        setIsLoading(false);
        return;
      }

      if (
        !formData.principal_amount ||
        parseFloat(formData.principal_amount) <= 0
      ) {
        setErrorModal({
          open: true,
          title: "Invalid Amount",
          errors: ["Principal amount must be greater than zero."],
        });
        setIsLoading(false);
        return;
      }

      if (!formData.duration_value || parseInt(formData.duration_value) <= 0) {
        setErrorModal({
          open: true,
          title: "Invalid Duration",
          errors: ["Duration must be greater than zero."],
        });
        setIsLoading(false);
        return;
      }

      if (
        !formData.guarantor_name ||
        !formData.guarantor_phone ||
        !formData.guarantor_address
      ) {
        setErrorModal({
          open: true,
          title: "Guarantor Required",
          errors: ["Please provide complete guarantor information."],
        });
        setIsLoading(false);
        return;
      }

      if (
        !formData.guarantor2_name ||
        !formData.guarantor2_phone ||
        !formData.guarantor2_address
      ) {
        setErrorModal({
          open: true,
          title: "Second Guarantor Required",
          errors: ["Please provide complete second guarantor information."],
        });
        setIsLoading(false);
        return;
      }

      // Prepare payload
      const payload: any = {
        client_id: formData.client_id,
        principal_amount: parseFloat(formData.principal_amount),
        repayment_frequency: formData.repayment_frequency,
        duration_value: parseInt(formData.duration_value),
        purpose: formData.purpose,
      };

      if (formData.purpose_details) {
        payload.purpose_details = formData.purpose_details;
      }

      if (formData.collateral_type) {
        payload.collateral_type = formData.collateral_type;
      }

      if (formData.collateral_value) {
        payload.collateral_value = parseFloat(formData.collateral_value);
      }

      if (formData.collateral_description) {
        payload.collateral_description = formData.collateral_description;
      }

      payload.guarantor_name = formData.guarantor_name;
      payload.guarantor_phone = formData.guarantor_phone;
      payload.guarantor_address = formData.guarantor_address;
      payload.guarantor2_name = formData.guarantor2_name;
      payload.guarantor2_phone = formData.guarantor2_phone;
      payload.guarantor2_address = formData.guarantor2_address;

      console.log("Submitting loan payload:", payload);

      const result = await loanAPI.apply(payload);

      console.log("Loan API Response:", result);

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push("/loans/applications");
        }, 2000);
      } else {
        // Handle API errors
        handleApiErrors(result);
      }
    } catch (err) {
      console.error("Loan application error:", err);
      setErrorModal({
        open: true,
        title: "Unexpected Error",
        errors: [
          err instanceof Error ? err.message : "Failed to submit application.",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ IMPROVED: Better error handling to show backend validation errors
  const handleApiErrors = (result: any) => {
    const errors: string[] = [];
    let title = "Unable to Create Loan";
    let description = "";

    console.log("Handling API errors:", result);

    // ✅ CRITICAL FIX: Check result.errors FIRST (this is where Django validation errors are)
    if (result.errors && typeof result.errors === "object") {
      Object.keys(result.errors).forEach((field) => {
        const fieldErrors = Array.isArray(result.errors[field])
          ? result.errors[field]
          : [result.errors[field]];

        fieldErrors.forEach((err: string) => {
          // Special handling for principal_amount (tier limit errors)
          if (field === "principal_amount") {
            title = "Amount Exceeds Tier Limit";
            description =
              "The requested loan amount exceeds the client's current tier limit.";
            errors.push(err);
          }
          // Special handling for client_id
          else if (field === "client_id") {
            title = "Invalid Client";
            errors.push(err);
          }
          // Special handling for guarantor fields
          else if (
            field === "guarantor_name" ||
            field === "guarantor_phone" ||
            field === "guarantor_address"
          ) {
            title = "Guarantor Information Required";
            errors.push(`First Guarantor: ${err}`);
          } else if (
            field === "guarantor2_name" ||
            field === "guarantor2_phone" ||
            field === "guarantor2_address"
          ) {
            title = "Guarantor Information Required";
            errors.push(`Second Guarantor: ${err}`);
          }
          // Special handling for non-field errors
          else if (field === "non_field_errors") {
            errors.push(err);
          }
          // Generic field errors - format field name nicely
          else {
            const fieldName = field
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            errors.push(`${fieldName}: ${err}`);
          }
        });
      });
    }
    // Check for data object (alternative error format)
    else if (result.data && typeof result.data === "object") {
      Object.keys(result.data).forEach((field) => {
        const fieldErrors = Array.isArray(result.data[field])
          ? result.data[field]
          : [result.data[field]];

        fieldErrors.forEach((err: string) => {
          if (field === "principal_amount") {
            title = "Amount Exceeds Tier Limit";
            description =
              "The requested loan amount exceeds the client's current tier limit.";
            errors.push(err);
          } else if (field === "client_id") {
            title = "Invalid Client";
            errors.push(err);
          } else {
            const fieldName = field
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            errors.push(`${fieldName}: ${err}`);
          }
        });
      });
    }
    // Check for message field
    else if (result.message) {
      errors.push(result.message);
    }
    // Check for error field
    else if (result.error) {
      errors.push(result.error);
    }
    // Fallback
    else {
      errors.push(
        "Failed to create loan application. Please check your information and try again."
      );
    }

    // If no errors were collected, add a generic message
    if (errors.length === 0) {
      errors.push("An unknown error occurred. Please try again.");
    }

    setErrorModal({
      open: true,
      title,
      description,
      errors,
    });
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: "day",
      weekly: "week",
      monthly: "month",
      biweekly: "bi-weekly period",
    };
    return labels[freq] || freq;
  };

  return (
    <DashboardLayout title="Apply for Loan">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Apply for Loan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new loan application with automatic interest calculation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Client Selection
              </h2>
            </div>

            {loadingClients ? (
              <div className="text-sm text-gray-600 dark:text-gray-400 py-4">
                Loading clients...
              </div>
            ) : clients.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  No active clients available. Please{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/clients")}
                    className="underline font-medium hover:text-yellow-900"
                  >
                    create and approve a client
                  </button>{" "}
                  first.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Client *
                </label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value);
                    setSelectedClient(client || null);
                    setFormData({ ...formData, client_id: e.target.value });
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} - {client.email}
                      {client.profile?.level
                        ? ` (${client.profile.level})`
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedClient && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-200">
                          {selectedClient.full_name}
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          {selectedClient.email}
                        </p>
                        {selectedClient.profile?.level && (
                          <p className="text-blue-700 dark:text-blue-300 capitalize">
                            Tier: {selectedClient.profile.level}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loan Details with Live Calculation */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Loan Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRateTiers(!showRateTiers)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                {showRateTiers ? "Hide" : "View"} Rate Tiers
              </button>
            </div>

            {/* Rate Tiers Display */}
            {showRateTiers && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                  Interest Rate Tiers for{" "}
                  {formData.repayment_frequency.charAt(0).toUpperCase() +
                    formData.repayment_frequency.slice(1)}{" "}
                  Payments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RATE_TIERS[formData.repayment_frequency].map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded text-xs"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {tier.range}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {tier.monthly_rate}/month
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  💡 Longer commitments get lower rates automatically!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Principal Amount */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="100"
                  value={formData.principal_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      principal_amount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter amount (e.g., 100000)"
                />
              </div>

              {/* Repayment Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Frequency *
                </label>
                <select
                  required
                  value={formData.repayment_frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      repayment_frequency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How often the client will make payments
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Duration *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_value: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter number"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                    {getFrequencyLabel(formData.repayment_frequency)}
                    {formData.duration_value &&
                    parseInt(formData.duration_value) > 1
                      ? "s"
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of payment periods
                </p>
              </div>
            </div>
          </div>

          {/* Live Calculation Display */}
          {calculation && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Loan Calculation
                </h3>
                <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 font-medium">
                  Auto-calculated
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                    Interest Rate
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calculation.monthly_interest_rate.toFixed(2)}%/mo
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ({calculation.annual_interest_rate.toFixed(1)}% annual)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                    Total Interest
                  </p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    ₦{calculation.total_interest.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                    Total Repayment
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₦{calculation.total_repayment.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                    Per Payment
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₦{calculation.installment_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-green-200 dark:border-green-700">
                <div className="flex items-start gap-2 text-sm text-green-800 dark:text-green-300">
                  <TrendingUp className="w-4 h-4 mt-0.5" />
                  <p>
                    Client will make{" "}
                    <strong>
                      {calculation.number_of_installments} payments
                    </strong>{" "}
                    of{" "}
                    <strong>
                      ₦{calculation.installment_amount.toLocaleString()}
                    </strong>{" "}
                    each over{" "}
                    <strong>
                      {calculation.duration_months.toFixed(1)} months
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {calculationLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Calculating...
              </p>
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., Business expansion, School fees, Medical bills"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose Details (Optional)
                </label>
                <textarea
                  value={formData.purpose_details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purpose_details: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Provide more details about how the loan will be used..."
                />
              </div>
            </div>
          </div>

          {/* Collateral (Optional) */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Collateral Information (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collateral Type
                </label>
                <input
                  type="text"
                  value={formData.collateral_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collateral_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., Property, Vehicle, Equipment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Value (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.collateral_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collateral_value: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.collateral_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collateral_description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Describe the collateral..."
                />
              </div>
            </div>
          </div>

          {/* Guarantors */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Guarantor Information
              </h2>
            </div>

            {/* First Guarantor */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                First Guarantor *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guarantor_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.guarantor_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor_phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guarantor_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor_address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Second Guarantor */}
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                Second Guarantor *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guarantor2_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor2_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.guarantor2_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor2_phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guarantor2_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guarantor2_address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !selectedClient ||
                clients.length === 0 ||
                !calculation
              }
              className="bg-green-500 hover:bg-green-600 text-white min-w-[150px]"
            >
              {isLoading ? (
                "Submitting..."
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Submit Application
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
        title="Loan Application Submitted!"
        description="The loan application has been submitted successfully and is pending review."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
        title={errorModal.title}
        description={errorModal.description}
        errors={errorModal.errors}
      />
    </DashboardLayout>
  );
}
