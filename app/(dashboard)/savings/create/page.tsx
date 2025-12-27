"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { ErrorModal } from "@/components/dashboard/modal/error-modal";
import { useAuth } from "@/contexts/AuthContext";
import { savingsAPI, clientAPI } from "@/lib/api";
import {
  ArrowLeft,
  Wallet,
  User,
  DollarSign,
  Calendar,
  Check,
  ChevronsUpDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  UserCircle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    employer?: string;
    address?: string;
    city?: string;
    state?: string;
    assigned_staff?: string;
    assigned_staff_name?: string;
  };
}

export default function CreateSavingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get client_id from URL query params
  const clientIdFromQuery = searchParams?.get("client_id");

  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    description?: string;
    errors: string[];
    actionButton?: { label: string; onClick: () => void };
  }>({
    open: false,
    title: "",
    errors: [],
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    client_id: clientIdFromQuery || "",
    account_type: "daily",
    initial_deposit: "",
    target_amount: "",
    contribution_frequency: "daily",
    start_date: new Date().toISOString().split("T")[0],
    maturity_date: "",
    notes: "",
  });

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Auto-select client if ID is in URL
  useEffect(() => {
    if (clientIdFromQuery && clients.length > 0) {
      const client = clients.find((c) => c.id === clientIdFromQuery);
      if (client) {
        setSelectedClient(client);
        setFormData((prev) => ({ ...prev, client_id: client.id }));
      }
    }
  }, [clientIdFromQuery, clients]);

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
            description:
              "You need to create and approve clients before creating savings accounts.",
            errors: [
              "No active clients found in the system.",
              "Please create and approve at least one client account first.",
            ],
            actionButton: {
              label: "Go to Clients",
              onClick: () => {
                setErrorModal({ ...errorModal, open: false });
                router.push("/clients");
              },
            },
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setErrorModal({
        open: true,
        title: "Failed to Load Clients",
        description: "An error occurred while loading the client list.",
        errors: [
          err instanceof Error
            ? err.message
            : "Unable to fetch clients from the server.",
          "Please refresh the page and try again.",
        ],
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData({ ...formData, client_id: client.id });
    setOpen(false);
  };

  // Replace the handleApiErrors and handleSubmit functions with these improved versions:

  // Helper function to parse API errors
  const handleApiErrors = (result: any) => {
    console.log("Full API result:", result); // Debug log

    const errors: string[] = [];
    let title = "Unable to Create Account";
    let description = "";
    let actionButton: { label: string; onClick: () => void } | undefined;

    // Check multiple possible error locations in the response
    const errorData = result.data || result.response?.data || result;

    console.log("Error data:", errorData); // Debug log

    // Check if errorData has validation errors (Django format)
    if (
      errorData &&
      typeof errorData === "object" &&
      !Array.isArray(errorData)
    ) {
      let hasErrors = false;

      Object.keys(errorData).forEach((field) => {
        // Skip success and message fields
        if (field === "success" || field === "message") return;

        const fieldErrors = Array.isArray(errorData[field])
          ? errorData[field]
          : [errorData[field]];

        fieldErrors.forEach((err: string) => {
          hasErrors = true;

          if (field === "account_type") {
            title = "Duplicate Account Type";
            description = `This client already has a ${formData.account_type.replace(
              "_",
              " "
            )} savings account.`;
            errors.push(
              "Please choose a different account type:",
              "• Weekly Savings",
              "• Monthly Savings",
              "• Fixed Deposit"
            );
            actionButton = {
              label: "View Existing Accounts",
              onClick: () => {
                setErrorModal({ ...errorModal, open: false });
                router.push("/savings");
              },
            };
          } else if (field === "client_id") {
            title = "Invalid Client";
            description =
              "The selected client could not be found or is inactive.";
            errors.push(
              "Please verify the client selection:",
              "• Make sure the client is active and approved",
              "• Try selecting a different client",
              "• Refresh the page if the client list seems outdated"
            );
          } else if (
            field === "initial_deposit" ||
            field === "minimum_balance"
          ) {
            title = "Invalid Deposit Amount";
            description = "The initial deposit amount is not valid.";
            errors.push(err, "Please enter a valid amount greater than zero.");
          } else if (field === "target_amount") {
            title = "Invalid Target Amount";
            description = "The target amount you entered is not valid.";
            errors.push(
              err,
              "Target amount should be greater than the initial deposit."
            );
          } else if (field === "maturity_date") {
            title = "Invalid Maturity Date";
            description = "The maturity date is not valid for this account.";
            errors.push(
              err,
              "Please select a valid maturity date in the future (minimum 6 months)."
            );
          } else if (field === "non_field_errors") {
            errors.push(err);
          } else {
            // Generic field error
            errors.push(`${field}: ${err}`);
          }
        });
      });

      // If we parsed errors successfully, show them
      if (hasErrors) {
        setErrorModal({
          open: true,
          title,
          description,
          errors,
          actionButton,
        });
        return;
      }
    }

    // Check for error message string
    if (result.error) {
      errors.push(result.error);
    } else if (result.message) {
      errors.push(result.message);
    } else if (errorData?.error) {
      errors.push(errorData.error);
    } else if (errorData?.message) {
      errors.push(errorData.message);
    }

    // If we still don't have errors, use generic message
    if (errors.length === 0) {
      errors.push(
        "Failed to create savings account.",
        "Please check all fields and try again.",
        "If the problem persists, contact support."
      );
    }

    setErrorModal({
      open: true,
      title,
      description,
      errors,
      actionButton,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate client selection
      if (!formData.client_id) {
        setErrorModal({
          open: true,
          title: "Client Required",
          description: "You must select a client to create a savings account.",
          errors: [
            "Please select a client from the dropdown above before proceeding.",
          ],
        });
        setIsLoading(false);
        return;
      }

      // Validate initial deposit
      if (
        !formData.initial_deposit ||
        parseFloat(formData.initial_deposit) <= 0
      ) {
        setErrorModal({
          open: true,
          title: "Invalid Deposit Amount",
          description: "Please enter a valid initial deposit amount.",
          errors: [
            "Initial deposit must be greater than zero.",
            "Please enter a valid amount to proceed.",
          ],
        });
        setIsLoading(false);
        return;
      }

      // Prepare payload
      const payload: any = {
        client_id: formData.client_id,
        account_type: formData.account_type,
        initial_deposit: parseFloat(formData.initial_deposit),
      };

      if (formData.target_amount) {
        payload.target_amount = parseFloat(formData.target_amount);
      }

      if (formData.maturity_date) {
        payload.maturity_date = formData.maturity_date;
      }

      if (formData.notes) {
        payload.notes = formData.notes;
      }

      console.log("Submitting payload:", payload); // Debug log

      const result = await savingsAPI.create(payload);

      console.log("API result:", result); // Debug log

      if (result.success) {
        setSuccessModal(true);
        setTimeout(() => {
          router.push("/savings");
        }, 2000);
      } else {
        // Parse backend validation errors
        handleApiErrors(result);
      }
    } catch (err) {
      console.error("Create savings error:", err);

      // Try to extract error from caught exception
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";

      setErrorModal({
        open: true,
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the account.",
        errors: [
          errorMessage,
          "Please try again or contact support if the problem persists.",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate estimated maturity date based on account type
  const calculateMaturityDate = () => {
    if (formData.account_type === "fixed" && formData.start_date) {
      const startDate = new Date(formData.start_date);
      // Default 12 months for fixed deposit
      startDate.setMonth(startDate.getMonth() + 12);
      return startDate.toISOString().split("T")[0];
    }
    return "";
  };

  useEffect(() => {
    if (formData.account_type === "fixed" && !formData.maturity_date) {
      const estimatedDate = calculateMaturityDate();
      if (estimatedDate) {
        setFormData((prev) => ({ ...prev, maturity_date: estimatedDate }));
      }
    }
  }, [formData.account_type, formData.start_date]);

  return (
    <DashboardLayout title="Create Savings Account">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Savings
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Create Savings Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Open a new savings account for a client
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
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
                    className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-200"
                  >
                    create and approve a client
                  </button>{" "}
                  first.
                </p>
              </div>
            ) : clientIdFromQuery && selectedClient ? (
              // Show client details if coming from client page
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {selectedClient.first_name?.[0] ||
                          selectedClient.full_name[0]}
                        {selectedClient.last_name?.[0] || ""}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedClient.full_name}
                        </h3>
                        {selectedClient.profile?.level && (
                          <div className="flex items-center gap-2 mt-1">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {selectedClient.profile.level} Member
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedClient.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                    {selectedClient.branch_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.branch_name}</span>
                      </div>
                    )}
                    {selectedClient.profile?.occupation && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.profile.occupation}</span>
                      </div>
                    )}
                  </div>

                  {selectedClient.profile?.assigned_staff_name && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <UserCircle className="w-4 h-4 text-gray-500" />
                        <span>
                          Assigned Staff:{" "}
                          <strong>
                            {selectedClient.profile.assigned_staff_name}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedClient(null);
                    setFormData({ ...formData, client_id: "" });
                    router.push("/savings/create");
                  }}
                  className="w-full"
                >
                  Select Different Client
                </Button>
              </div>
            ) : (
              // Show client selector combobox
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search and Select Client *
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-auto py-3"
                    >
                      {selectedClient ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {selectedClient.first_name?.[0] ||
                              selectedClient.full_name[0]}
                            {selectedClient.last_name?.[0] || ""}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {selectedClient.full_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedClient.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          Select a client...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search clients by name, email, or phone..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={`${client.full_name} ${client.email} ${
                                client.phone || ""
                              }`}
                              onSelect={() => handleClientSelect(client)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                  {client.first_name?.[0] ||
                                    client.full_name[0]}
                                  {client.last_name?.[0] || ""}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                      {client.full_name}
                                    </div>
                                    {client.profile?.level && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 capitalize">
                                        {client.profile.level}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {client.email}
                                  </div>
                                  {client.phone && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      {client.phone}
                                    </div>
                                  )}
                                </div>
                                <Check
                                  className={`ml-2 h-4 w-4 ${
                                    selectedClient?.id === client.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Only approved and active clients are shown ({clients.length}{" "}
                  available)
                </p>

                {/* Show selected client details below combobox */}
                {selectedClient && !clientIdFromQuery && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Selected Client Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {selectedClient.branch_name && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{selectedClient.branch_name}</span>
                        </div>
                      )}
                      {selectedClient.profile?.occupation && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span>{selectedClient.profile.occupation}</span>
                        </div>
                      )}
                      {selectedClient.profile?.assigned_staff_name && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 md:col-span-2">
                          <UserCircle className="w-4 h-4 text-gray-500" />
                          <span>
                            Assigned Staff:{" "}
                            <strong>
                              {selectedClient.profile.assigned_staff_name}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  required
                  value={formData.account_type}
                  onChange={(e) =>
                    setFormData({ ...formData, account_type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="daily">Daily Savings</option>
                  <option value="weekly">Weekly Savings</option>
                  <option value="monthly">Monthly Savings</option>
                  <option value="fixed">Fixed Deposit</option>
                </select>
              </div>

              {/* Initial Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Deposit (NGN) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.initial_deposit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initial_deposit: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount (NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, target_amount: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Optional target"
                />
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Date Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Maturity Date (for fixed deposits) */}
              {formData.account_type === "fixed" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maturity Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.maturity_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maturity_date: e.target.value,
                      })
                    }
                    min={formData.start_date}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum 6 months from start date
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Notes */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value,
                })
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Add any notes about this savings account..."
            />
          </div>

          {/* Summary Preview */}
          {formData.initial_deposit && selectedClient && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Client
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {selectedClient.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Account Type
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {formData.account_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                    Initial Deposit
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    NGN {parseFloat(formData.initial_deposit).toLocaleString()}
                  </p>
                </div>
                {formData.target_amount && (
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                      Target Amount
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      NGN {parseFloat(formData.target_amount).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
              disabled={isLoading || !selectedClient || clients.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white min-w-[150px]"
            >
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Create Account
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
        title="Savings Account Created!"
        description="The savings account has been created successfully and is pending approval."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
        title={errorModal.title}
        description={errorModal.description}
        errors={errorModal.errors}
        actionButton={errorModal.actionButton}
      />
    </DashboardLayout>
  );
}
