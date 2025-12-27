"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  User,
  Heart,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../status-badge";
import { DataTable } from "../table/data-table";
import { Pagination } from "../table/pagination";
import { ImageZoomModal } from "./image-zoom-modal";

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onAction?: (action: string) => void;
}

export function StaffDetailModal({
  isOpen,
  onClose,
  staff,
  onAction,
}: StaffDetailModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activeTab, setActiveTab] = useState<"info" | "clients">("info");
  const [zoomImage, setZoomImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Mock assigned clients data (TODO: Replace with real data from backend)
  const assignedClients = Array.from(
    { length: staff?.assigned_clients_count || 0 },
    (_, i) => ({
      id: `client-${i}`,
      name: "Client Name", // TODO: Get from backend
      accountType: i % 2 === 0 ? "Savings" : "Savings + Loans",
      registrationDate: "1st Jan 2025",
      status: i % 3 === 0 ? "deactivated" : "active",
    })
  );

  const clientColumns = [
    {
      header: "Name",
      accessor: "name",
      className: "font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Account Type",
      accessor: "accountType",
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Registration Date",
      accessor: "registrationDate",
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => <StatusBadge status={value as any} />,
    },
  ];

  if (!isOpen || !staff) return null;

  // ✅ FIXED: Access profile data correctly from staff.profile (not staff.staff_profile)
  const profile = staff.profile || {};

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get status from staff data
  const status = !staff.is_active
    ? "deactivated"
    : !staff.is_approved
    ? "restricted"
    : "active";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[650px] lg:w-[750px] bg-white dark:bg-[#1e293b] shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Staff details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {staff.full_name} - {profile.designation || staff.user_role}
                </p>
              </div>

              {/* Close Button & Edit Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Edit Button */}
                <button
                  onClick={() => onAction?.("edit")}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                  title="Edit staff"
                >
                  <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
              <StatusBadge status={status as any} />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 sm:px-8 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === "info"
                    ? "border-yellow-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Basic Information
              </button>
              <button
                onClick={() => setActiveTab("clients")}
                className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === "clients"
                    ? "border-yellow-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Assigned Clients ({staff.assigned_clients_count || 0})
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {activeTab === "info" ? (
              <div className="space-y-8">
                {/* Profile Image */}
                <div className="flex justify-center">
                  <div
                    onClick={() => {
                      if (profile.profile_picture_url) {
                        setZoomImage({
                          url: profile.profile_picture_url,
                          title: "Staff Profile Photo",
                        });
                      }
                    }}
                    className={`relative group ${
                      profile.profile_picture_url ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700">
                      <img
                        src={
                          profile.profile_picture_url ||
                          "/api/placeholder/400/400"
                        }
                        alt={staff.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/400/400";
                        }}
                      />
                    </div>
                    {profile.profile_picture_url && (
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          View
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information Grid */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        First Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {staff.first_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Last Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {staff.last_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Date of Birth
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(profile.date_of_birth)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Gender
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {profile.gender || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Staff ID
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {profile.employee_id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Role/Designation
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile.designation || staff.user_role}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Department
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {profile.department || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Branch
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {staff.branch_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Date Joined
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(profile.hire_date || staff.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Blood Group
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {profile.blood_group || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                          Email Address
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {staff.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                          Phone Number
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {staff.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                          Home Address
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {profile.address || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {(profile.emergency_contact_name ||
                  profile.emergency_contact_phone) && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {profile.emergency_contact_name && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Full Name
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {profile.emergency_contact_name}
                          </p>
                        </div>
                      )}
                      {profile.emergency_contact_relationship && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Relationship
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {profile.emergency_contact_relationship}
                          </p>
                        </div>
                      )}
                      {profile.emergency_contact_phone && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Phone Number
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {profile.emergency_contact_phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {(profile.bank_name || profile.bank_account) && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                      Bank Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {profile.bank_name && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Bank Name
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {profile.bank_name}
                          </p>
                        </div>
                      )}
                      {profile.bank_account && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Account Number
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white font-mono">
                            {profile.bank_account}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Salary Information - Only show if salary exists */}
                {profile.salary && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                      Compensation
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Monthly Salary
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold">
                          ₦{parseFloat(profile.salary).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Performance Summary */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-[#0f172a] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Assigned Clients
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {staff.assigned_clients_count || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0f172a] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Active Loans
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        0
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0f172a] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Active Savings
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        0
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assigned Clients Table */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Assigned Clients
                  </h3>
                  {assignedClients.length > 0 ? (
                    <>
                      <DataTable
                        columns={clientColumns}
                        data={assignedClients.slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize
                        )}
                        showActions={false}
                      />
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          assignedClients.length / pageSize
                        )}
                        pageSize={pageSize}
                        totalItems={assignedClients.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-800">
                      <User className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No clients assigned to this staff member yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <ImageZoomModal
          isOpen={!!zoomImage}
          onClose={() => setZoomImage(null)}
          imageUrl={zoomImage.url}
          title={zoomImage.title}
        />
      )}
    </>
  );
}
