"use client";

import { X, ZoomIn } from "lucide-react";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ImageZoomModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: ImageZoomModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div className="relative max-w-5xl w-full animate-in zoom-in-95 fade-in duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title */}
          <div className="absolute -top-12 left-0 text-white font-medium">
            {title}
          </div>

          {/* Image */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
}
