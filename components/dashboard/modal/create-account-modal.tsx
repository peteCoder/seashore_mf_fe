"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "./image-dropzone";
import { clientKeys, useCreateClient } from "@/hooks/useClients";
import { useBranches } from "@/hooks/useBranches";
import { useQueryClient } from "@tanstack/react-query";
import { clientAPI } from "@/lib/api";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClientFormData {
  // Basic Info
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  
  // Address (EXPANDED ✅)
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  
  // ID Verification
  id_type: string;
  id_number: string;
  
  // Employment & Financial (NEW ✅)
  occupation?: string;
  employer?: string;
  monthly_income?: string;
  
  // Banking Details (NEW ✅)
  bank_name?: string;
  account_number?: string;
  bvn?: string;
  
  // Branch & Account
  branch: string;
  account_type: string;
  
  // Images
  profile_image?: File;
  id_front_image?: File;
  id_back_image?: File;
  
  // Guarantor 1
  guarantor1_name: string;
  guarantor1_phone: string;
  guarantor1_relationship: string;
  guarantor1_address: string;
  
  // Guarantor 2 (for loans)
  guarantor2_name?: string;
  guarantor2_phone?: string;
  guarantor2_relationship?: string;
  guarantor2_address?: string;
  
  // Next of Kin
  nok_name: string;
  nok_phone: string;
  nok_relationship: string;
  nok_address: string;
  
  // Loan Details (for loan accounts)
  loan_amount?: string;
  loan_duration?: string;
  loan_purpose?: string;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAccountModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<ClientFormData>({
    defaultValues: {
      account_type: "savings",
      gender: "",
      id_type: "",
      branch: "",
      city: "",
      state: "",
    },
  });

  const accountType = watch("account_type");
  const queryClient = useQueryClient();

  const createClientMutation = useCreateClient();
  const {
    data: branchesData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranches();

  const branches = Array.isArray(branchesData) ? branchesData : [];

  // Image states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [idFrontImage, setIdFrontImage] = useState<File | null>(null);
  const [idBackImage, setIdBackImage] = useState<File | null>(null);

  const onSubmit = async (data: ClientFormData) => {
    const payload: any = {
      // Basic info
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      
      // Address (COMPLETE ✅)
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code || '',
      
      // ID verification
      branch_id: data.branch,
      id_type: data.id_type,
      id_number: data.id_number,
      
      // Employment & Financial (NEW ✅)
      occupation: data.occupation || '',
      employer: data.employer || '',
      monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
      
      // Banking Details (NEW ✅)
      bank_name: data.bank_name || '',
      account_number: data.account_number || '',
      bvn: data.bvn || '',
      
      // Guarantor 1
      guarantor1_name: data.guarantor1_name,
      guarantor1_phone: data.guarantor1_phone,
      guarantor1_relationship: data.guarantor1_relationship,
      guarantor1_address: data.guarantor1_address,
      
      // Next of Kin
      nok_name: data.nok_name,
      nok_phone: data.nok_phone,
      nok_relationship: data.nok_relationship,
      nok_address: data.nok_address,
    };

    // Loan-specific fields
    if (data.account_type === "loan") {
      payload.guarantor2_name = data.guarantor2_name;
      payload.guarantor2_phone = data.guarantor2_phone;
      payload.guarantor2_relationship = data.guarantor2_relationship;
      payload.guarantor2_address = data.guarantor2_address;
      payload.loan_amount = parseFloat(data.loan_amount || "0");
      payload.loan_duration = parseInt(data.loan_duration || "0");
      payload.loan_purpose = data.loan_purpose;
    }

    try {
      // 1. Create client
      const clientResponse = await createClientMutation.mutateAsync(payload);

      if (clientResponse.success && clientResponse.data?.id) {
        // 2. Upload images if any
        if (profileImage || idFrontImage || idBackImage) {
          const formData = new FormData();
          if (profileImage) formData.append("profile_image", profileImage);
          if (idFrontImage) formData.append("id_front_image", idFrontImage);
          if (idBackImage) formData.append("id_back_image", idBackImage);
          await clientAPI.uploadImages(clientResponse.data.id, formData);
        }

        // 3. Success
        await queryClient.refetchQueries({ queryKey: clientKeys.lists() });
        onSuccess();
        reset();
      }
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  const handleClose = () => {
    reset();
    setProfileImage(null);
    setIdFrontImage(null);
    setIdBackImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[600px] md:w-[720px] bg-white dark:bg-[#1e293b] shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <User className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Client Account
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete client registration with all details
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Backend Errors */}
            {createClientMutation.isError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Failed to create client
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap">
                      {createClientMutation.error?.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Branches Error */}
            {branchesError && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Failed to load branches
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    {branchesError.message}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Profile Image
                </h3>
                <Controller
                  name="profile_image"
                  control={control}
                  render={({ field }) => (
                    <ImageDropzone
                      onImageSelect={(file) => {
                        setProfileImage(file);
                        field.onChange(file);
                      }}
                      currentImage={profileImage}
                      error={errors.profile_image?.message}
                    />
                  )}
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  {...register("account_type", {
                    required: "Account type is required",
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="savings">Savings Account</option>
                  <option value="loan">Loan Account</option>
                </select>
                {errors.account_type && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.account_type.message}
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register("first_name", {
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters",
                        },
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register("last_name", {
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters",
                        },
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\-() ]+$/,
                          message: "Invalid phone number",
                        },
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      {...register("date_of_birth", {
                        required: "Date of birth is required",
                        validate: (value) => {
                          const date = new Date(value);
                          const today = new Date();
                          const age = today.getFullYear() - date.getFullYear();
                          return age >= 18 || "Must be at least 18 years old";
                        },
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.date_of_birth.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register("gender", {
                        required: "Gender is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information (EXPANDED ✅) */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <textarea
                      {...register("address", {
                        required: "Address is required",
                        minLength: {
                          value: 10,
                          message: "Address must be at least 10 characters",
                        },
                      })}
                      rows={2}
                      placeholder="House number, street name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register("city", {
                        required: "City is required",
                      })}
                      placeholder="e.g., Lagos"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      {...register("state", {
                        required: "State is required",
                      })}
                      placeholder="e.g., Lagos State"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.state && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      {...register("postal_code")}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Employment & Financial Information (NEW ✅) */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Employment & Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      {...register("occupation")}
                      placeholder="e.g., Teacher, Trader"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Employer
                    </label>
                    <input
                      type="text"
                      {...register("employer")}
                      placeholder="Company/Business name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Income (NGN)
                    </label>
                    <input
                      type="number"
                      {...register("monthly_income")}
                      placeholder="e.g., 50000"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Details (NEW ✅) */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Banking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      {...register("bank_name")}
                      placeholder="e.g., First Bank"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      {...register("account_number")}
                      placeholder="10-digit account number"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      BVN (Bank Verification Number)
                    </label>
                    <input
                      type="text"
                      {...register("bvn", {
                        minLength: {
                          value: 11,
                          message: "BVN must be 11 digits",
                        },
                        maxLength: {
                          value: 11,
                          message: "BVN must be 11 digits",
                        },
                      })}
                      placeholder="11-digit BVN"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.bvn && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.bvn.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ID Verification */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  ID Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Type *
                    </label>
                    <select
                      {...register("id_type", {
                        required: "ID type is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="">Select ID type</option>
                      <option value="national_id">National ID (NIN)</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="voters_card">Voter's Card</option>
                      <option value="passport">International Passport</option>
                    </select>
                    {errors.id_type && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.id_type.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      {...register("id_number", {
                        required: "ID number is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.id_number && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.id_number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Controller
                      name="id_front_image"
                      control={control}
                      rules={{
                        required: "ID front image is required",
                      }}
                      render={({ field }) => (
                        <ImageDropzone
                          label="ID Front Image"
                          required
                          onImageSelect={(file) => {
                            setIdFrontImage(file);
                            field.onChange(file);
                          }}
                          currentImage={idFrontImage}
                          error={errors.id_front_image?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      name="id_back_image"
                      control={control}
                      rules={{
                        required: "ID back image is required",
                      }}
                      render={({ field }) => (
                        <ImageDropzone
                          label="ID Back Image"
                          required
                          onImageSelect={(file) => {
                            setIdBackImage(file);
                            field.onChange(file);
                          }}
                          currentImage={idBackImage}
                          error={errors.id_back_image?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch *
                </label>
                <select
                  {...register("branch", {
                    required: "Branch is required",
                  })}
                  disabled={branchesLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">
                    {branchesLoading ? "Loading branches..." : "Select branch"}
                  </option>
                  {branches.map((branch: any) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.branch.message}
                  </p>
                )}
              </div>

              {/* Guarantor 1 */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Guarantor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guarantor Name *
                    </label>
                    <input
                      type="text"
                      {...register("guarantor1_name", {
                        required: "Guarantor name is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.guarantor1_name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.guarantor1_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guarantor Phone *
                    </label>
                    <input
                      type="tel"
                      {...register("guarantor1_phone", {
                        required: "Guarantor phone is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.guarantor1_phone && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.guarantor1_phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      {...register("guarantor1_relationship", {
                        required: "Relationship is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.guarantor1_relationship && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.guarantor1_relationship.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guarantor Address *
                    </label>
                    <input
                      type="text"
                      {...register("guarantor1_address", {
                        required: "Guarantor address is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.guarantor1_address && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.guarantor1_address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Next of Kin
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register("nok_name", {
                        required: "Next of kin name is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.nok_name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.nok_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      {...register("nok_phone", {
                        required: "Next of kin phone is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.nok_phone && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.nok_phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      {...register("nok_relationship", {
                        required: "Relationship is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.nok_relationship && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.nok_relationship.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      {...register("nok_address", {
                        required: "Next of kin address is required",
                      })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    {errors.nok_address && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.nok_address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Loan-specific fields */}
              {accountType === "loan" && (
                <>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      Second Guarantor (Required for Loans)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Guarantor 2 Name *
                        </label>
                        <input
                          type="text"
                          {...register("guarantor2_name", {
                            required:
                              accountType === "loan"
                                ? "Second guarantor name is required"
                                : false,
                          })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.guarantor2_name && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.guarantor2_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Guarantor 2 Phone *
                        </label>
                        <input
                          type="tel"
                          {...register("guarantor2_phone", {
                            required:
                              accountType === "loan"
                                ? "Second guarantor phone is required"
                                : false,
                          })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.guarantor2_phone && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.guarantor2_phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Relationship *
                        </label>
                        <input
                          type="text"
                          {...register("guarantor2_relationship", {
                            required:
                              accountType === "loan"
                                ? "Relationship is required"
                                : false,
                          })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.guarantor2_relationship && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.guarantor2_relationship.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Guarantor 2 Address *
                        </label>
                        <input
                          type="text"
                          {...register("guarantor2_address", {
                            required:
                              accountType === "loan"
                                ? "Second guarantor address is required"
                                : false,
                          })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.guarantor2_address && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.guarantor2_address.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      Loan Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Loan Amount (NGN) *
                        </label>
                        <input
                          type="number"
                          {...register("loan_amount", {
                            required:
                              accountType === "loan"
                                ? "Loan amount is required"
                                : false,
                            min: {
                              value: 1000,
                              message: "Minimum loan amount is ₦1,000",
                            },
                          })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.loan_amount && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.loan_amount.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duration (months) *
                        </label>
                        <input
                          type="number"
                          {...register("loan_duration", {
                            required:
                              accountType === "loan"
                                ? "Loan duration is required"
                                : false,
                            min: {
                              value: 1,
                              message: "Minimum duration is 1 month",
                            },
                            max: {
                              value: 60,
                              message: "Maximum duration is 60 months",
                            },
                          })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.loan_duration && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.loan_duration.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Loan Purpose *
                        </label>
                        <textarea
                          {...register("loan_purpose", {
                            required:
                              accountType === "loan"
                                ? "Loan purpose is required"
                                : false,
                            minLength: {
                              value: 10,
                              message: "Purpose must be at least 10 characters",
                            },
                          })}
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        {errors.loan_purpose && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {errors.loan_purpose.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={createClientMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={createClientMutation.isPending || branchesLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              >
                {createClientMutation.isPending
                  ? "Creating..."
                  : "Create Account"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}