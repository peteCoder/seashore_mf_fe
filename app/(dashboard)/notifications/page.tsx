"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/dashboard/table/pagination";
import { notificationAPI } from "@/lib/api";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: string;
  notification_type?: string;
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
  // Legacy fields
  related_loan?: string;
  related_savings?: string;
  related_client?: string;
  related_staff?: string;
  related_object_id?: string;
  related_object_type?: string;
}

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  const lowerType = type?.toLowerCase() || "";

  // Transaction approval notifications
  if (lowerType === "deposit_pending") {
    return { icon: ArrowDownCircle, color: "yellow" };
  }
  if (lowerType === "withdrawal_pending") {
    return { icon: ArrowUpCircle, color: "yellow" };
  }
  if (lowerType === "transaction_approved") {
    return { icon: CheckCircle, color: "green" };
  }
  if (lowerType === "transaction_rejected") {
    return { icon: AlertCircle, color: "red" };
  }

  if (
    lowerType.includes("loan_applied") ||
    lowerType.includes("loan_approved") ||
    lowerType.includes("loan_rejected") ||
    lowerType.includes("loan_disbursed") ||
    lowerType.includes("loan_application")
  ) {
    return { icon: DollarSign, color: "blue" };
  }
  if (lowerType.includes("payment_received")) {
    return { icon: CheckCircle, color: "green" };
  }
  if (lowerType.includes("overdue")) {
    return { icon: AlertCircle, color: "red" };
  }
  if (
    lowerType.includes("pending") ||
    lowerType.includes("reminder") ||
    lowerType.includes("due_soon")
  ) {
    return { icon: AlertTriangle, color: "yellow" };
  }
  if (
    lowerType.includes("savings") ||
    lowerType.includes("deposit") ||
    lowerType.includes("withdrawal")
  ) {
    return { icon: TrendingUp, color: "green" };
  }
  if (
    lowerType.includes("client") ||
    lowerType.includes("staff") ||
    lowerType.includes("assignment")
  ) {
    return { icon: Users, color: "purple" };
  }
  return { icon: Bell, color: "gray" };
};

// Get category from notification type
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
    return "savings";
  }
  if (
    lowerType.includes("client") ||
    lowerType.includes("staff") ||
    lowerType.includes("assignment")
  ) {
    return "users";
  }
  return "system";
};

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return format(date, "MMM d, yyyy");
};

// Icon color classes
const iconColors: Record<string, { bg: string; text: string }> = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  gray: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
  },
};

export default function NotificationsPage() {
  const router = useRouter();

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail modal
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await notificationAPI.list();
      console.log("API Result:", result);

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

      // Normalize the notification type field
      notificationsData = notificationsData.map((n) => ({
        ...n,
        notification_type: n.notification_type || n.type || "system_alert",
      }));

      console.log("Parsed Notifications:", notificationsData);
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast.success("Marked as read");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?"))
      return;

    try {
      await notificationAPI.deleteAll();
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      toast.error("Failed to clear notifications");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Show detail modal
    setSelectedNotification(notification);
    setDetailModalOpen(true);
  };

  const handleNavigateToRelated = (notification: Notification) => {
    setDetailModalOpen(false);

    const notifType = notification.notification_type?.toLowerCase() || "";

    // Handle pending transaction notifications
    if (notifType.includes("pending") || notifType.includes("transaction")) {
      router.push("/approvals");
      return;
    }

    // Navigate based on related object (backend returns *_id fields)
    if (notification.related_loan_id || notification.related_loan) {
      router.push(
        `/loans/${notification.related_loan_id || notification.related_loan}`
      );
    } else if (
      notification.related_savings_id ||
      notification.related_savings
    ) {
      router.push(
        `/savings/${
          notification.related_savings_id || notification.related_savings
        }`
      );
    } else if (notification.related_client_id || notification.related_client) {
      router.push(
        `/clients/${
          notification.related_client_id || notification.related_client
        }`
      );
    } else if (notification.related_staff) {
      router.push(`/staffs/${notification.related_staff}`);
    } else if (
      notification.related_object_id &&
      notification.related_object_type
    ) {
      const objType = notification.related_object_type.toLowerCase();
      if (objType === "loan") {
        router.push(`/loans/${notification.related_object_id}`);
      } else if (objType === "savings" || objType === "savingsaccount") {
        router.push(`/savings/${notification.related_object_id}`);
      } else if (objType === "client" || objType === "user") {
        router.push(`/clients/${notification.related_object_id}`);
      } else if (objType === "staff") {
        router.push(`/staffs/${notification.related_object_id}`);
      }
    }
  };

  // Check if notification has related link
  const hasRelatedLink = (notification: Notification) => {
    const notifType = notification.notification_type?.toLowerCase() || "";
    return (
      notifType.includes("pending") ||
      notifType.includes("transaction") ||
      notification.related_loan_id ||
      notification.related_loan ||
      notification.related_savings_id ||
      notification.related_savings ||
      notification.related_client_id ||
      notification.related_client ||
      notification.related_staff ||
      (notification.related_object_id && notification.related_object_type)
    );
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return getCategoryFromType(n.notification_type || n.type || "") === filter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Counts
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const loanCount = notifications.filter(
    (n) => getCategoryFromType(n.notification_type || n.type || "") === "loans"
  ).length;
  const savingsCount = notifications.filter(
    (n) =>
      getCategoryFromType(n.notification_type || n.type || "") === "savings"
  ).length;
  const userCount = notifications.filter(
    (n) => getCategoryFromType(n.notification_type || n.type || "") === "users"
  ).length;

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading notifications...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchNotifications}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notifications">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""} •{" "}
              {notifications.length} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchNotifications} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button
              onClick={handleClearAll}
              variant="destructive"
              size="sm"
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: "All", value: "all", count: notifications.length },
          { label: "Unread", value: "unread", count: unreadCount },
          { label: "Loans", value: "loans", count: loanCount },
          { label: "Savings", value: "savings", count: savingsCount },
          { label: "Users", value: "users", count: userCount },
          {
            label: "Read",
            value: "read",
            count: notifications.length - unreadCount,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilter(tab.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === tab.value
                ? "bg-yellow-500 text-gray-900"
                : "bg-white dark:bg-[#1e293b] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-800">
        {paginatedNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "No notifications to display."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedNotifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(
                  notification.notification_type || notification.type || ""
                );
                const colorClasses = iconColors[color];

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      !notification.is_read
                        ? "bg-yellow-50/50 dark:bg-yellow-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses.bg}`}
                      >
                        <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold mb-1 ${
                                !notification.is_read
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notification.title}
                              {!notification.is_read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {notification.description || notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                                {getCategoryFromType(
                                  notification.notification_type ||
                                    notification.type ||
                                    ""
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          title="View details"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            title="Mark as read"
                            className="h-8 w-8 p-0"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredNotifications.length > pageSize && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredNotifications.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Notification Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              Notification Details
            </DialogTitle>
            <DialogDescription>Full notification information</DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              {/* Icon and Title */}
              <div className="flex items-start gap-4">
                {(() => {
                  const { icon: Icon, color } = getNotificationIcon(
                    selectedNotification.notification_type ||
                      selectedNotification.type ||
                      ""
                  );
                  const colorClasses = iconColors[color];
                  return (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses.bg}`}
                    >
                      <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedNotification.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                      {getCategoryFromType(
                        selectedNotification.notification_type ||
                          selectedNotification.type ||
                          ""
                      )}
                    </span>
                    {!selectedNotification.is_read && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedNotification.description ||
                    selectedNotification.message}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Date & Time
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedNotification.created_at), "PPP p")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {selectedNotification.notification_type?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </Button>
                {hasRelatedLink(selectedNotification) && (
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                    onClick={() =>
                      handleNavigateToRelated(selectedNotification)
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Related
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
