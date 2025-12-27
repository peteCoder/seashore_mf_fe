"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { branchAPI } from "@/lib/api";

const registerSchema = z
  .object({
    // Personal Information
    first_name: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"),

    // Password
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirm: z.string().min(1, "Please confirm your password"),

    // Role and Branch
    user_role: z.enum(["staff", "manager", "director", "admin"], {
      error: () => ({ message: "Please select a valid role" }),
    }),
    branch: z.string().min(1, "Please select a branch"),

    // Employment Information
    designation: z
      .string()
      .min(1, "Designation is required")
      .min(2, "Designation must be at least 2 characters"),
    department: z.enum(
      [
        "operations",
        "loans",
        "savings",
        "customer_service",
        "accounts",
        "IT",
        "management",
        "board",
      ],
      {
        error: () => ({ message: "Please select a valid department" }),
      }
    ),
    hire_date: z
      .string()
      .min(1, "Hire date is required")
      .refine(
        (date) => {
          const hireDate = new Date(date);
          const today = new Date();
          return hireDate <= today;
        },
        { message: "Hire date cannot be in the future" }
      ),
    salary: z
      .string()
      .min(1, "Salary is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Salary must be a positive number",
      }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const result = await branchAPI.list();

        if (result.success && result.branches) {
          setBranches(result.branches);
        } else {
          setServerError(result.error || "Failed to load branches");
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        setServerError("Failed to load branches. Please refresh the page.");
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/auth/register/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle different error formats
        let errorMessage = "Registration failed";

        if (result.error) {
          errorMessage = result.error;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.email) {
          errorMessage = `Email: ${
            Array.isArray(result.email) ? result.email[0] : result.email
          }`;
        } else if (result.non_field_errors) {
          errorMessage = Array.isArray(result.non_field_errors)
            ? result.non_field_errors[0]
            : result.non_field_errors;
        }

        setServerError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        result.message ||
          "Registration successful! Your account is pending approval. You'll be able to login once an administrator approves your account."
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login/staff");
      }, 3000);
    } catch (error: any) {
      setServerError(error.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const isFormValid = isValid && isDirty && !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f172a] dark:to-[#1e293b] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[900px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl p-8 sm:p-12">
        {/* Logo & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-[26px] font-bold text-black dark:text-white">
              Seashore MFB
            </h1>
          </div>
          <h2 className="text-[32px] font-bold text-black dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-[15px] text-gray-700 dark:text-gray-300">
            Register for staff, manager, director, or admin access.
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2">
            Note: Employee ID will be auto-generated upon approval
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 mt-0.5"
              >
                <circle cx="10" cy="10" r="9" fill="#22C55E" />
                <path
                  d="M6 10L9 13L14 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-[14px] text-green-700 dark:text-green-300 leading-relaxed">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 mt-0.5"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#EF4444"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M10 6V11"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="14" r="1" fill="#EF4444" />
              </svg>
              <p className="text-[14px] text-red-700 dark:text-red-300 leading-relaxed">
                {serverError}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* REST OF YOUR EXISTING FORM FIELDS... */}
          {/* Copy all the form sections from your existing register page */}
          {/* I'll continue with the submit button and login link */}

          {/* Personal Information Section */}
          <div>
            <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                  1
                </span>
              </div>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    {...register("first_name")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.first_name
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    First Name
                  </label>
                </div>
                {errors.first_name && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    {...register("last_name")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.last_name
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Last Name
                  </label>
                </div>
                {errors.last_name && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <input
                    type="email"
                    {...register("email")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.email
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Email Address
                  </label>
                </div>
                {errors.email && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <div className="relative">
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.phone
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Phone Number (+234...)
                  </label>
                </div>
                {errors.phone && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div>
            <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                  2
                </span>
              </div>
              Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 pr-12 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.password
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("password_confirm")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 pr-12 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.password_confirm
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password_confirm && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.password_confirm.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role and Branch Section */}
          <div>
            <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                  3
                </span>
              </div>
              Role & Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Role */}
              <div>
                <select
                  {...register("user_role")}
                  disabled={isLoading}
                  className={`w-full h-14 px-4 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all disabled:opacity-50 ${
                    errors.user_role
                      ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                      : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                  }`}
                >
                  <option value="">Select Role</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="director">Director</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.user_role && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.user_role.message}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div>
                <select
                  {...register("branch")}
                  disabled={isLoading || loadingBranches}
                  className={`w-full h-14 px-4 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all disabled:opacity-50 ${
                    errors.branch
                      ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                      : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                  }`}
                >
                  <option value="">
                    {loadingBranches ? "Loading branches..." : "Select Branch"}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code}) - {branch.city},{" "}
                      {branch.state}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.branch.message}
                  </p>
                )}
                {!loadingBranches && branches.length === 0 && (
                  <p className="text-[13px] text-amber-600 mt-2">
                    No branches available. Please contact administrator.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div>
            <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                  4
                </span>
              </div>
              Employment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designation */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    {...register("designation")}
                    placeholder=" "
                    disabled={isLoading}
                    className={`w-full h-14 px-4 pt-5 pb-1 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.designation
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Designation (e.g., Loan Officer)
                  </label>
                </div>
                {errors.designation && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.designation.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <select
                  {...register("department")}
                  disabled={isLoading}
                  className={`w-full h-14 px-4 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all disabled:opacity-50 ${
                    errors.department
                      ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                      : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="operations">Operations</option>
                  <option value="loans">Loans</option>
                  <option value="savings">Savings</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="accounts">Accounts</option>
                  <option value="IT">IT</option>
                  <option value="management">Management</option>
                  <option value="board">Board of Directors</option>
                </select>
                {errors.department && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Hire Date */}
              <div>
                <input
                  type="date"
                  {...register("hire_date")}
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full h-14 px-4 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all disabled:opacity-50 ${
                    errors.hire_date
                      ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                      : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                  }`}
                />
                {errors.hire_date && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.hire_date.message}
                  </p>
                )}
              </div>

              {/* Salary */}
              <div>
                <div className="relative">
                  <input
                    type="number"
                    {...register("salary")}
                    placeholder=" "
                    disabled={isLoading}
                    step="0.01"
                    className={`w-full h-14 px-4 pt-5 pb-1 rounded-lg text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 ${
                      errors.salary
                        ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                        : "bg-[#f5f5f5] dark:bg-[#0f172a] border-2 border-transparent focus:border-yellow-500"
                    }`}
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 transition-all pointer-events-none peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]">
                    Salary (₦)
                  </label>
                </div>
                {errors.salary && (
                  <p className="text-[13px] text-red-500 mt-2">
                    {errors.salary.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full h-14 rounded-full text-[16px] font-semibold transition-all flex items-center justify-center gap-2 ${
                isFormValid
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30"
                  : "bg-[#f5f5f5] dark:bg-[#2d3b4e] text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 8V14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M23 11H17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-[15px] text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login/staff"
                className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
