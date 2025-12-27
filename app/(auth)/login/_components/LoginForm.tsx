"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      // Call login from AuthContext
      // This automatically handles cookies and redirect
      await login(data.email, data.password);
    } catch (error: any) {
      // Handle different error messages from backend
      let errorMessage = "Login failed. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      }

      // Map specific backend errors to user-friendly messages
      if (errorMessage.includes("Account is locked")) {
        errorMessage =
          "Your account has been temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.";
      } else if (errorMessage.includes("not approved")) {
        errorMessage =
          "Your account is pending approval. Please wait for an administrator to approve your account.";
      } else if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("incorrect")
      ) {
        errorMessage =
          "Incorrect password! Check and ensure that the password is correct.";
      } else if (errorMessage.includes("not active")) {
        errorMessage =
          "Your account has been deactivated. Please contact support.";
      } else if (errorMessage.includes("No active account")) {
        errorMessage = "No account found with this email address.";
      }

      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isValid && isDirty && !isLoading;

  return (
    <div className="w-full max-w-[580px] bg-white dark:bg-[#1e293b] p-3 rounded-2xl shadow-sm px-8 sm:px-12 py-12 mx-4">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-black dark:text-white mb-2">
          Welcome back
        </h1>
        <p className="text-[15px] text-gray-700 dark:text-gray-300">
          Login to your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div>
          <div className="relative">
            <input
              type="email"
              {...register("email")}
              placeholder=" "
              disabled={isLoading}
              className={`w-full h-16 px-5 pt-6 pb-2 rounded-xl text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.email
                  ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                  : "bg-[#f5f5f5] dark:bg-[#0f172a] border border-transparent focus:border-transparent focus:shadow-[0_0_0_3px_rgba(250,204,21,0.3)] dark:focus:shadow-[0_0_0_3px_rgba(255,255,255,0.2)]"
              }`}
            />
            <label className="absolute left-5 top-1/2 -translate-y-1/2 text-[15px] text-gray-400 dark:text-gray-500 transition-all pointer-events-none peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-gray-600 dark:peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-gray-600 dark:peer-[:not(:placeholder-shown)]:text-gray-400">
              Email address
            </label>
          </div>
          {errors.email && (
            <div className="flex items-start gap-2 mt-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 mt-0.5"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M8 4V9"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="11.5" r="0.75" fill="#EF4444" />
              </svg>
              <p className="text-[13px] text-red-500 leading-snug">
                {errors.email.message}
              </p>
            </div>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder=" "
              disabled={isLoading}
              className={`w-full h-16 px-5 pt-6 pb-2 pr-14 rounded-xl text-[15px] text-gray-900 dark:text-white focus:outline-none transition-all peer disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password || serverError
                  ? "bg-white dark:bg-[#0f172a] border-2 border-red-500"
                  : "bg-[#f5f5f5] dark:bg-[#0f172a] border border-transparent focus:border-transparent focus:shadow-[0_0_0_3px_rgba(250,204,21,0.3)] dark:focus:shadow-[0_0_0_3px_rgba(255,255,255,0.2)]"
              }`}
            />
            <label className="absolute left-5 top-1/2 -translate-y-1/2 text-[15px] text-gray-400 dark:text-gray-500 transition-all pointer-events-none peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-gray-600 dark:peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-gray-600 dark:peer-[:not(:placeholder-shown)]:text-gray-400">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6C11.6569 6 13 7.34315 13 9C13 10.6569 11.6569 12 10 12C8.34315 12 7 10.6569 7 9C7 7.34315 8.34315 6 10 6Z"
                  fill="currentColor"
                />
                <path
                  d="M10 4C5.58172 4 2 9 2 9C2 9 5.58172 14 10 14C14.4183 14 18 9 18 9C18 9 14.4183 4 10 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          {/* Field Validation Error */}
          {errors.password && (
            <div className="flex items-start gap-2 mt-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 mt-0.5"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M8 4V9"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="11.5" r="0.75" fill="#EF4444" />
              </svg>
              <p className="text-[13px] text-red-500 leading-snug">
                {errors.password.message}
              </p>
            </div>
          )}

          {/* Server Error (e.g., wrong password) */}
          {serverError && !errors.password && (
            <div className="flex items-start gap-2 mt-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 mt-0.5"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M8 4V9"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="11.5" r="0.75" fill="#EF4444" />
              </svg>
              <p className="text-[13px] text-red-500 leading-snug">
                {serverError}
              </p>
            </div>
          )}
        </div>

        {/* Sign In Button */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full h-14 rounded-full text-[16px] font-medium transition-all flex items-center justify-center gap-2 ${
              isFormValid
                ? "bg-[#1a2332] dark:bg-white text-white dark:text-[#1a2332] hover:bg-[#0f1821] dark:hover:bg-gray-100"
                : "bg-[#f5f5f5] dark:bg-[#2d3b4e] text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>

        {/* Go Back Link */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-[15px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Go back
          </button>
        </div>
      </form>
    </div>
  );
}
