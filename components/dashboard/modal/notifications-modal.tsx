"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationAPI } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  category?: string;
  title: string;
  description: string; // Backend returns 'description' not 'message'
  message?: string; // Keep for backwards compatibility
  time?: string;
  created_at: string;
  is_read: boolean;
  is_urgent?: boolean;
  related_client_id?: string;
  related_loan_id?: string;
  related_savings_id?: string;
  // Legacy fields for backwards compatibility
  related_object_id?: string;
  related_object_type?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  const lowerType = type?.toLowerCase() || "";

  // Transaction approval specific icons
  if (lowerType === "deposit_pending") {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
        <ArrowDownCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      </div>
    );
  }
  if (lowerType === "withdrawal_pending") {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
        <ArrowUpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      </div>
    );
  }
  if (lowerType === "transaction_approved") {
    return (
      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (lowerType === "transaction_rejected") {
    return (
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
    );
  }

  switch (lowerType) {
    case "loan_application":
    case "loan_applied":
    case "loan_approved":
    case "loan_rejected":
    case "loan_disbursed":
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      );
    case "payment_received":
    case "payment_due":
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      );
    case "payment_overdue":
    case "loan_overdue":
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
      );
    case "payment_reminder":
    case "loan_due_soon":
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
      );
    case "savings_deposit":
    case "savings_withdrawal":
    case "savings_interest":
    case "deposit_made":
    case "withdrawal_made":
    case "savings_created":
    case "savings_approved":
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      );
    case "client_registered":
    case "client_approved":
    case "client_rejected":
    case "staff_created":
    case "staff_deactivated":
    case "assignment_changed":
      return (
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
      );
  }
};

const getCategoryFromType = (type: string): string => {
  const lowerType = type?.toLowerCase() || "";
  if (
    lowerType.includes("loan") ||
    lowerType.includes("payment") ||
    lowerType.includes("overdue")
  ) {
    return "loans";
  }
  if (
    lowerType.includes("savings") ||
    lowerType.includes("deposit") ||
    lowerType.includes("withdrawal") ||
    lowerType.includes("transaction")
  ) {
    return "deposits";
  }
  if (
    lowerType.includes("client") ||
    lowerType.includes("staff") ||
    lowerType.includes("assignment")
  ) {
    return "users";
  }
  return "others";
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export function NotificationsModal({
  isOpen,
  onClose,
}: NotificationsModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "all" | "loans" | "deposits" | "users" | "others"
  >("all");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationAPI.list();
      console.log("Modal API Result:", result);

      let notificationsData: Notification[] = [];

      // Handle paginated response format from Django REST Framework
      // Response: { count, next, previous, results: { success, notifications: [...] } }
      if (
        result.results?.notifications &&
        Array.isArray(result.results.notifications)
      ) {
        notificationsData = result.results.notifications;
      }
      // Direct format: { success: true, notifications: [...] }
      else if (result.notifications && Array.isArray(result.notifications)) {
        notificationsData = result.notifications;
      }
      // Nested in data: { success: true, data: { notifications: [...] } }
      else if (
        result.data?.notifications &&
        Array.isArray(result.data.notifications)
      ) {
        notificationsData = result.data.notifications;
      }
      // Paginated in data.results
      else if (
        result.data?.results?.notifications &&
        Array.isArray(result.data.results.notifications)
      ) {
        notificationsData = result.data.results.notifications;
      }
      // Array directly in data
      else if (Array.isArray(result.data)) {
        notificationsData = result.data;
      }
      // results is an array (standard DRF pagination)
      else if (Array.isArray(result.results)) {
        notificationsData = result.results;
      }

      console.log("Modal Parsed Notifications:", notificationsData);
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const category = activeTab === "all" ? undefined : activeTab;
      await notificationAPI.markAllAsRead(category);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => {
          if (activeTab === "all") {
            return { ...n, is_read: true };
          }
          const notifCategory = getCategoryFromType(n.type);
          if (notifCategory === activeTab) {
            return { ...n, is_read: true };
          }
          return n;
        })
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on type
    const notifType = notification.type?.toLowerCase() || "";

    // Handle pending transaction notifications - go to approvals page
    if (notifType === "deposit_pending" || notifType === "withdrawal_pending") {
      onClose();
      router.push("/approvals");
      return;
    }

    // Handle transaction approved/rejected - go to savings account
    if (
      notifType === "transaction_approved" ||
      notifType === "transaction_rejected"
    ) {
      if (notification.related_savings_id) {
        onClose();
        router.push(`/savings/${notification.related_savings_id}`);
        return;
      }
    }

    // Navigate based on related objects (backend format)
    if (notification.related_loan_id) {
      onClose();
      router.push(`/loans/${notification.related_loan_id}`);
      return;
    }

    if (notification.related_savings_id) {
      onClose();
      router.push(`/savings/${notification.related_savings_id}`);
      return;
    }

    if (notification.related_client_id) {
      onClose();
      router.push(`/clients/${notification.related_client_id}`);
      return;
    }

    // Legacy support for related_object_type/related_object_id
    if (notification.related_object_type && notification.related_object_id) {
      onClose();
      switch (notification.related_object_type.toLowerCase()) {
        case "loan":
          router.push(`/loans/${notification.related_object_id}`);
          break;
        case "savings":
        case "savingsaccount":
          router.push(`/savings/${notification.related_object_id}`);
          break;
        case "client":
        case "user":
          router.push(`/clients/${notification.related_object_id}`);
          break;
        case "staff":
          router.push(`/staffs/${notification.related_object_id}`);
          break;
        case "transaction":
          router.push(`/approvals`);
          break;
        default:
          break;
      }
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => getCategoryFromType(n.type) === activeTab);

  if (!isOpen) return null;

  return (
    <>
      {/* Glassy Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-100 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-150 w-full sm:w-[450px] lg:w-[500px] bg-white dark:bg-[#1e293b] shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header - Fixed */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/notifications");
                  }}
                  className="text-xs text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors font-medium"
                >
                  View all
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Mark all as read
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Fixed */}
          <div className="flex gap-2 px-6 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto">
            {["all", "loans", "deposits", "users", "others"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Notifications List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      !notification.is_read
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`text-sm font-semibold ${
                              !notification.is_read
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.description || notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
