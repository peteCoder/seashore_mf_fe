"use client";

import { useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  autoCloseDelay?: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  autoCloseDelay = 3000,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] sm:w-full sm:max-w-[440px] animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="px-6 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center">
            {/* Success Icon with Animation */}
            <div className="relative mb-6">
              {/* Pulsing Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full animate-ping opacity-75"></div>
              </div>

              {/* Main Icon */}
              <div className="relative flex items-center justify-center w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full animate-in zoom-in duration-500 delay-100">
                <CheckCircle2
                  className="w-16 h-16 text-green-600 dark:text-green-500 animate-in zoom-in duration-700 delay-200"
                  strokeWidth={2.5}
                />
              </div>

              {/* Sparkles Effect */}
              <div className="absolute -top-2 -right-2 w-6 h-6 text-green-400 animate-in zoom-in duration-500 delay-300">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -left-2 w-4 h-4 text-green-300 animate-in zoom-in duration-500 delay-400">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              {title}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
