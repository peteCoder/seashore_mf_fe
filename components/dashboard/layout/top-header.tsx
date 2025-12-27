"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { ModeToggle } from "@/components/themes/theme-toggler";
import { ProfileDropdown } from "./profile-dropdown";
import { NotificationsModal } from "../modal/notifications-modal";
import { useAuth } from "@/contexts/AuthContext";
import { notificationAPI } from "@/lib/api";

interface TopHeaderProps {
  title: string;
  actionButton?: React.ReactNode;
  profileImage?: string;
}

export function TopHeader({ title, profileImage }: TopHeaderProps) {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const result = await notificationAPI.getUnreadCount();
      if (result.success && result.data) {
        setUnreadCount(result.data.count || result.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Format user data for ProfileDropdown
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "Recently joined";
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // Extract staff profile data (staff-only app)
  const staffProfile = user?.staff_profile;
  const profilePicture = staffProfile?.profile_picture || profileImage;
  const address = staffProfile?.address || "Not provided";

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
          {title}
        </h1>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* Profile Dropdown */}
          <ProfileDropdown
            userName={user?.full_name || user?.email || "User"}
            userEmail={user?.email}
            userPhone={user?.phone || "Not provided"}
            userAddress={address}
            userRole={user?.user_role || "User"}
            joinDate={formatJoinDate(user?.created_at)}
            profileImage={profilePicture}
          />
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          // Refresh unread count when modal closes
          fetchUnreadCount();
        }}
      />
    </>
  );
}
