"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "./image-dropzone";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  branches?: any[];
  isLoading?: boolean;
}

export function AddStaffModal({
  isOpen,
  onClose,
  onSubmit,
  branches,
  isLoading = false,
}: AddStaffModalProps) {
  const [setPassword, setSetPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Remove password fields if not setting password
    if (!setPassword) {
      formData.delete("password");
      formData.delete("passwordConfirm");
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

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
                  Add new staff
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the required information to add a new staff member.
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
                  <ImageDropzone
                    label="Staff Profile Photo"
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
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="Enter first name"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Enter last name"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
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
                        name="date_of_birth"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Gender
                      </label>
                      <select
                        name="gender"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Home Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Enter home address"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Blood Group
                      </label>
                      <select
                        name="blood_group"
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
                        Role/Designation *
                      </label>
                      <input
                        type="text"
                        name="designation"
                        placeholder="e.g., Account Officer"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        User Role *
                      </label>
                      <select
                        name="user_role"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select role</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="director">Director</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Department *
                      </label>
                      <select
                        name="department"
                        required
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
                        Branch *
                      </label>
                      <select
                        name="branch_id"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select branch</option>
                        {branches?.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Date of Employment *
                      </label>
                      <input
                        type="date"
                        name="hire_date"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Salary *
                      </label>
                      <input
                        type="number"
                        name="salary"
                        placeholder="Enter salary"
                        required
                        step="0.01"
                        min="0"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
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
                        name="emergency_contact_name"
                        placeholder="Enter contact name"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Relationship
                      </label>
                      <input
                        type="text"
                        name="emergency_contact_relationship"
                        placeholder="e.g., Spouse, Parent"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="emergency_contact_phone"
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
                        name="bank_name"
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
                        name="bank_account"
                        placeholder="Enter account number"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Setup */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                    Password Setup
                  </h3>

                  {/* Toggle Password Setup */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setPassword}
                        onChange={(e) => setSetPassword(e.target.checked)}
                        className="w-4 h-4 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Set password now (Staff can set later if not provided)
                      </span>
                    </label>
                  </div>

                  {setPassword && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="password_confirm"
                          placeholder="Confirm password"
                          className="w-full h-11 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}
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
                  className="w-full sm:w-auto min-w-[200px] h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all"
                >
                  {isLoading ? "Adding staff..." : "Add staff"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
