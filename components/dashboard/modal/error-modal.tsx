// components/dashboard/modal/error-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  errors?: string | string[];
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorModal({
  isOpen,
  onClose,
  title = "Error",
  description,
  errors,
  actionButton,
}: ErrorModalProps) {
  // Convert errors to array for consistent rendering
  const errorList = Array.isArray(errors) ? errors : errors ? [errors] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-left text-red-900 dark:text-red-200">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-left text-red-700 dark:text-red-400">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {errorList.length > 0 && (
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              {errorList.length === 1 ? (
                <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-line">
                  {errorList[0]}
                </p>
              ) : (
                <ul className="space-y-2">
                  {errorList.map((error, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm text-red-800 dark:text-red-300"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line">{error}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {actionButton && (
            <Button
              variant="outline"
              onClick={actionButton.onClick}
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {actionButton.label}
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
