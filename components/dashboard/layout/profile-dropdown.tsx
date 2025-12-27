"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAddress?: string;
  userRole?: string;
  joinDate?: string;
  profileImage?: string;
}

export function ProfileDropdown({
  userName = "User",
  userEmail = "user@example.com",
  userPhone = "Not provided",
  userAddress = "Not provided",
  userRole = "User",
  joinDate = "Recently joined",
  profileImage,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push("/settings");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-all hover:scale-105"
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt={userName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(userName)
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[calc(100vh-100px)] flex flex-col bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
          {/* Profile Header - Fixed */}
          <div className="p-6 text-center border-b border-gray-200 dark:border-gray-800 shrink-0">
            {/* Profile Image */}
            <div className="mb-4 flex justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-gray-200 dark:ring-gray-700">
                  {getInitials(userName)}
                </div>
              )}
            </div>

            {/* User Info */}
            <h3 className="text-lg font-bold capitalize text-gray-900 dark:text-white mb-1">
              {userName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {joinDate}
            </p>
            <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-full capitalize">
              {userRole}
            </span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Contact Details */}
            <div className="p-6">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Contact Details
              </h4>
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {userPhone}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {userAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Fixed at Bottom */}
          <div className="border-t border-gray-200 dark:border-gray-800 shrink-0">
            <button
              onClick={handleSettings}
              className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Settings
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-t border-gray-200 dark:border-gray-800"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
