"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

interface ImageDropzoneProps {
  label?: string;
  name?: string;
  required?: boolean;
  accept?: string;
  description?: string;
  onImageSelect?: (file: File | null) => void;
  currentImage?: File | null;
  error?: string; // ✅ ADD ERROR PROP
}

export function ImageDropzone({
  label,
  name,
  required = false,
  accept = "image/*",
  description,
  onImageSelect,
  currentImage,
  error, // ✅ ACCEPT ERROR PROP
}: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(currentImage);
    } else {
      setPreview(null);
    }
  }, [currentImage]);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      // If onImageSelect callback is provided, use it
      if (onImageSelect) {
        onImageSelect(file);
      }

      // Update preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);

    // If onImageSelect callback is provided, use it
    if (onImageSelect) {
      onImageSelect(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          isDragging
            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
            : error // ✅ RED BORDER IF ERROR
            ? "border-red-500 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10"
            : preview
            ? "border-green-500 dark:border-green-600"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        } ${
          preview
            ? "bg-gray-50 dark:bg-gray-800/50"
            : "bg-white dark:bg-gray-800/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          required={required}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full p-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain rounded"
            />
            <button
              onClick={handleRemove}
              type="button"
              className="absolute top-3 right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div
              className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center ${
                error
                  ? "bg-red-100 dark:bg-red-900/20"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Upload
                className={`w-6 h-6 ${
                  error
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
            </div>
            <p
              className={`text-sm font-medium mb-1 ${
                error
                  ? "text-red-700 dark:text-red-300"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description || "PNG, JPG, JPEG up to 5MB"}
            </p>
          </div>
        )}
      </div>

      {/* ✅ SHOW ERROR MESSAGE */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
