"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { DataTable } from "@/components/dashboard/table/data-table";
import { TableActions } from "@/components/dashboard/table/table-actions";
import { Pagination } from "@/components/dashboard/table/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { useAuth } from "@/contexts/AuthContext";
import { loanAPI } from "@/lib/api";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Shield,
} from "lucide-react";

interface LoanApplication {
  id: string;
  loan_number: string;
  client_name: string;
  client_id: string;
  principal_amount: number;
  interest_rate: number;
  loan_term: number;
  payment_frequency: string;
  loan_purpose: string;
  status: string;
  created_at: string;
  applied_by?: string;
}

export default function LoanApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Check if user can approve loans (manager, director, admin only)
  const canApproveLoans = ["manager", "director", "admin"].includes(
    user?.user_role?.toLowerCase() || ""
  );

  // State
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only pending approval loans
      const params = {
        status: "pending_approval",
      };

      const result = await loanAPI.list(params);

      if (result.success) {
        let loansData: LoanApplication[] = [];

        if (result.data) {
          if (Array.isArray(result.data)) {
            loansData = result.data;
          } else if (
            result.data.results &&
            Array.isArray(result.data.results)
          ) {
            loansData = result.data.results;
          } else if (result.data.loans && Array.isArray(result.data.loans)) {
            loansData = result.data.loans;
          }
        }

        setApplications(loansData);
      } else {
        throw new Error(result.error || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Applications fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject actions
  const handleAction = (
    application: LoanApplication,
    type: "approve" | "reject"
  ) => {
    if (!canApproveLoans) {
      alert(
        "You don't have permission to approve/reject loans. Only managers, directors, and admins can approve loans."
      );
      return;
    }

    setSelectedApplication(application);
    setActionType(type);
    setConfirmModal(true);
  };

  const executeAction = async () => {
    if (!selectedApplication || !actionType) return;

    try {
      setActionLoading(true);
      setConfirmModal(false);

      const result = await loanAPI.approve(
        selectedApplication.id,
        actionType === "approve" ? "approve" : "reject"
      );

      if (result.success) {
        setSuccessMessage(
          actionType === "approve"
            ? `Loan application ${selectedApplication.loan_number} has been approved.`
            : `Loan application ${selectedApplication.loan_number} has been rejected.`
        );
        setSuccessModal(true);
        await fetchApplications();
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
    }
  };

  // Filter applications based on search
  const filteredApplications = applications.filter((app) => {
    const searchLower = searchValue.toLowerCase();
    return (
      app.loan_number?.toLowerCase().includes(searchLower) ||
      app.client_name?.toLowerCase().includes(searchLower) ||
      app.client_id?.toLowerCase().includes(searchLower)
    );
  });

  // Paginated data
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Table columns
  const columns = [
    {
      header: "Loan Number",
      accessor: "loan_number",
      className: "font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Client Name",
      accessor: "client_name",
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Amount",
      accessor: "principal_amount",
      cell: (value: number) => `NGN ${value?.toLocaleString() || "0"}`,
      className: "font-semibold text-gray-900 dark:text-white",
    },
    {
      header: "Term",
      accessor: "loan_term",
      cell: (value: number) => `${value} months`,
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Applied Date",
      accessor: "created_at",
      cell: (value: string) => new Date(value).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Status",
      accessor: "status",
      cell: () => <StatusBadge status="pending_approval" variant="warning" />,
    },
  ];

  // Stats data
  const statsData = [
    {
      icon: Clock,
      label: "Pending Applications",
      value: applications.length.toString(),
      variant: "warning" as const,
    },
  ];

  // Loading state
  if (loading && applications.length === 0) {
    return (
      <DashboardLayout title="Loan Applications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading applications...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Loan Applications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchApplications}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Loan Applications">
      {/* Welcome Section */}
      <WelcomeSection
        userName={user?.first_name || "User"}
        description="Review and approve pending loan applications."
      />

      {/* Permission Warning (for staff) */}
      {!canApproveLoans && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                View-Only Access
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                You can view loan applications, but only managers, directors,
                and admins can approve or reject them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Pending Applications
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => console.log("Filter clicked")}
          onExportClick={() => console.log("Export clicked")}
        />

        {paginatedApplications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchValue
                ? "No applications match your search"
                : "All loan applications have been reviewed"}
            </p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedApplications}
              onRowClick={(row) =>
                router.push(
                  `/loans/applications/${(row as LoanApplication).id}/review`
                )
              }
              actionMenu={(row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(
                        `/loans/applications/${
                          (row as LoanApplication).id
                        }/review`
                      )
                    }
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                  {canApproveLoans && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAction(row as LoanApplication, "approve")
                        }
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleAction(row as LoanApplication, "reject")
                        }
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredApplications.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredApplications.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={executeAction}
        title={
          actionType === "approve"
            ? "Approve Loan Application"
            : "Reject Loan Application"
        }
        description={
          actionType === "approve"
            ? `Are you sure you want to approve loan application ${selectedApplication?.loan_number}? The loan will be ready for disbursement.`
            : `Are you sure you want to reject loan application ${selectedApplication?.loan_number}? This action cannot be undone.`
        }
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        variant={actionType === "approve" ? "default" : "destructive"}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="Success!"
        description={successMessage}
      />
    </DashboardLayout>
  );
}
