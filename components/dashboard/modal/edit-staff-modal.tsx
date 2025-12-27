"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "./image-dropzone";

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: FormData) => void;
  staff: any; // Staff member data
  isLoading?: boolean;
}

export function EditStaffModal({
  isOpen,
  onClose,
  onSubmit,
  staff,
  isLoading = false,
}: EditStaffModalProps) {
  const [formData, setFormData] = useState<any>({});

  // ✅ FIXED: Populate form when staff data changes - using correct paths
  useEffect(() => {
    if (staff && isOpen) {
      // ✅ Access profile data correctly
      const profile = staff.profile || {};

      setFormData({
        firstName: staff.first_name || "",
        lastName: staff.last_name || "",
        email: staff.email || "",
        phoneNumber: staff.phone || "",
        dateOfBirth: profile.date_of_birth || "",
        gender: profile.gender || "",
        homeAddress: profile.address || "",
        bloodGroup: profile.blood_group || "",
        staffId: profile.employee_id || "",
        role: profile.designation || staff.user_role || "",
        department: profile.department || "",
        salary: profile.salary || "",
        emergencyContactName: profile.emergency_contact_name || "",
        emergencyContactRelationship:
          profile.emergency_contact_relationship || "",
        emergencyContactPhone: profile.emergency_contact_phone || "",
        bankName: profile.bank_name || "",
        accountNumber: profile.bank_account || "",
        accountName: staff.full_name || "",
      });
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    onSubmit(staff.id, formDataObj);
  };

  if (!isOpen || !staff) return null;

  // ✅ Get profile reference
  const profile = staff.profile || {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[600px] lg:w-[720px] bg-white dark:bg-[#1e293b] shadow-2xl transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit staff member
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update the information for {staff.full_name}
                </p>
              </div>

              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="space-y-8">
                {/* Profile Image */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                    Profile Image
                  </h3>
                  {/* ✅ FIXED: Use correct path for profile picture */}
                  {profile.profile_picture_url && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Current Photo:
                      </p>
                      <img
                        src={profile.profile_picture_url}
                        alt="Current profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/400/400";
                        }}
                      />
                    </div>
                  )}
                  <ImageDropzone
                    label="Update Profile Photo (Optional)"
                    name="profileImage"
                    description="Clear passport photograph, PNG or JPG up to 5MB"
                  />
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        defaultValue={formData.firstName}
                        placeholder="Enter first name"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        defaultValue={formData.lastName}
                        placeholder="Enter last name"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={formData.email}
                        placeholder="Enter email address"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        defaultValue={formData.phoneNumber}
                        placeholder="Enter phone number"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        defaultValue={formData.dateOfBirth}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Gender
                      </label>
                      {/* ✅ FIXED: Use key prop to force re-render when formData changes */}
                      <select
                        key={`gender-${formData.gender}`}
                        name="gender"
                        defaultValue={formData.gender}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Home Address
                      </label>
                      <input
                        type="text"
                        name="homeAddress"
                        defaultValue={formData.homeAddress}
                        placeholder="Enter home address"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Blood Group
                      </label>
                      {/* ✅ FIXED: Use key prop */}
                      <select
                        key={`bloodGroup-${formData.bloodGroup}`}
                        name="bloodGroup"
                        defaultValue={formData.bloodGroup}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select blood group (Optional)</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Staff ID
                      </label>
                      <input
                        type="text"
                        name="staffId"
                        defaultValue={formData.staffId}
                        placeholder="Enter staff ID"
                        disabled
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Role/Designation
                      </label>
                      <input
                        type="text"
                        name="role"
                        defaultValue={formData.role}
                        placeholder="Enter role"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Department
                      </label>
                      {/* ✅ FIXED: Use key prop */}
                      <select
                        key={`department-${formData.department}`}
                        name="department"
                        defaultValue={formData.department}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select department</option>
                        <option value="operations">Operations</option>
                        <option value="loans">Loans</option>
                        <option value="savings">Savings</option>
                        <option value="customer_service">
                          Customer Service
                        </option>
                        <option value="accounts">Accounts</option>
                        <option value="IT">IT/Technical</option>
                        <option value="management">Management</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Salary
                      </label>
                      <input
                        type="number"
                        name="salary"
                        defaultValue={formData.salary}
                        placeholder="Enter salary"
                        step="0.01"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        defaultValue={formData.emergencyContactName}
                        placeholder="Enter contact name"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Relationship
                      </label>
                      {/* ✅ FIXED: Use key prop */}
                      <select
                        key={`relationship-${formData.emergencyContactRelationship}`}
                        name="emergencyContactRelationship"
                        defaultValue={formData.emergencyContactRelationship}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        defaultValue={formData.emergencyContactPhone}
                        placeholder="Enter contact phone number"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                    Bank Details (For Salary Payment)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        defaultValue={formData.bankName}
                        placeholder="Enter bank name"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        defaultValue={formData.accountNumber}
                        placeholder="Enter account number"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        defaultValue={formData.accountName}
                        placeholder="Account name (should match staff name)"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-[#0f172a]">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[200px] h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all"
                >
                  {isLoading ? "Updating..." : "Update staff"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
