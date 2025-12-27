"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "director" | "manager" | "staff" | "client">;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // User is not authenticated
      if (!user) {
        router.push("/login");
        return;
      }

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(user.user_role)) {
        // User doesn't have required role
        router.push("/unauthorized");
        return;
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-[#0f172a] dark:to-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Pulsing Background Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full animate-ping opacity-75"></div>
              </div>

              {/* Main Logo Container */}
              <div className="relative w-20 h-20 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {/* Logo Icon - Seashore waves */}
                <svg
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                >
                  {/* Sun */}
                  <circle cx="28" cy="20" r="8" fill="white" opacity="0.9" />
                  {/* Waves */}
                  <path
                    d="M12 36C12 36 16 32 20 32C24 32 26 36 30 36C34 36 38 32 38 32"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                  <path
                    d="M12 42C12 42 16 38 20 38C24 38 26 42 30 42C34 42 38 38 38 38"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              {/* Background Circle */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
              {/* Animated Spinner */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-500 border-r-yellow-400 animate-spin"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Loading...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your access
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!user) {
    return null;
  }

  // User doesn't have required role
  if (allowedRoles && !allowedRoles.includes(user.user_role)) {
    return null;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
