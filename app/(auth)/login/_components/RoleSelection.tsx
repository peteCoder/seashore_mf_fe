"use client";

import { useRouter } from "next/navigation";

export default function RoleSelection() {
  const router = useRouter();

  return (
    <div className="w-full max-w-[520px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm px-8 sm:px-12 py-12">
      <div className="mb-12">
        <h1 className="text-[32px] font-bold text-black dark:text-white mb-2">
          Login
        </h1>
        <p className="text-[15px] text-gray-700 dark:text-gray-300">
          Select your role to gain access to your dashboard.
        </p>
      </div>

      <div className="space-y-4">
        {/* Admin Button */}
        <button
          onClick={() => router.push("/login/auth")}
          className="w-full h-[60px] bg-white dark:bg-[#0f172a] border-2 border-gray-900 dark:border-white rounded-xl flex items-center justify-center gap-3 text-gray-900 dark:text-white font-medium text-[16px] hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="8" r="4" fill="#9d8420" />
            <path
              d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21H4V20Z"
              fill="#9d8420"
            />
            <circle cx="18" cy="6" r="2" fill="#c7a730" />
          </svg>
          Login as Admin
        </button>

        {/* Staff Button */}
        <button
          onClick={() => router.push("/login/auth")}
          className="w-full h-[60px] bg-white dark:bg-[#0f172a] border-2 border-gray-900 dark:border-white rounded-xl flex items-center justify-center gap-3 text-gray-900 dark:text-white font-medium text-[16px] hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="8" r="3" fill="#9d8420" />
            <circle cx="17" cy="8" r="3" fill="#9d8420" />
            <path
              d="M3 20C3 17.2386 5.23858 15 8 15H10C12.7614 15 15 17.2386 15 20V21H3V20Z"
              fill="#9d8420"
            />
            <path
              d="M13 20C13 17.7909 14.7909 16 17 16H17C19.2091 16 21 17.7909 21 20V21H13V20Z"
              fill="#c7a730"
            />
          </svg>
          Login as Staff
        </button>
      </div>
    </div>
  );
}
