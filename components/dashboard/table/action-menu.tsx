"use client";

import { MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ActionMenuProps {
  status: "active" | "deactivated" | "restricted";
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onRestrict?: () => void;
  onRemoveRestriction?: () => void;
  onReassignClient?: () => void;
  onCreateSavings?: () => void;
}

export function ActionMenu({
  status,
  onDeactivate,
  onReactivate,
  onRestrict,
  onRemoveRestriction,
  onReassignClient,
  onCreateSavings,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void | undefined) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e293b] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* Admin Actions Header */}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Admin Actions
          </div>

          {/* Active Status */}
          {status === "active" && (
            <>
              {onDeactivate && (
                <button
                  onClick={() => handleAction(onDeactivate)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-red-500">●</span>
                  Deactivate account
                </button>
              )}
              {onRestrict && (
                <button
                  onClick={() => handleAction(onRestrict)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-yellow-500">⚠</span>
                  Restrict account
                </button>
              )}
            </>
          )}

          {/* Deactivated Status */}
          {status === "deactivated" && onReactivate && (
            <button
              onClick={() => handleAction(onReactivate)}
              className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <span className="text-green-500">✓</span>
              Activate account
            </button>
          )}

          {/* Restricted Status */}
          {status === "restricted" && (
            <>
              {onDeactivate && (
                <button
                  onClick={() => handleAction(onDeactivate)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-red-500">●</span>
                  Deactivate account
                </button>
              )}
              {onRemoveRestriction && (
                <button
                  onClick={() => handleAction(onRemoveRestriction)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-green-500">✓</span>
                  Remove restriction
                </button>
              )}
              {onReassignClient && (
                <button
                  onClick={() => handleAction(onReassignClient)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-blue-500">↻</span>
                  Reassign client
                </button>
              )}
              {onCreateSavings && (
                <button
                  onClick={() => handleAction(onCreateSavings)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-blue-500">+</span>
                  Create savings account
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
