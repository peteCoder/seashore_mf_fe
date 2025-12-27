"use client";

import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  isLoading?: boolean;
  children?: React.ReactNode; // ✅ Added children support
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  children, // ✅ Added children prop
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    default:
      "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
    destructive: "bg-red-500 hover:bg-red-600",
    success: "bg-green-500 hover:bg-green-600",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1e293b] shadow-2xl transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <AlertCircle
                className={`w-6 h-6 ${
                  variant === "destructive"
                    ? "text-red-600 dark:text-red-400"
                    : variant === "success"
                    ? "text-green-600 dark:text-green-400"
                    : variant === "warning"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
              {description}
            </p>

            {/* ✅ Children Content (e.g., reject reason textarea) */}
            {children && <div className="mb-6">{children}</div>}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 text-white ${variantStyles[variant]}`}
              >
                {isLoading ? "Processing..." : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
