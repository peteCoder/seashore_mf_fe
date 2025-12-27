"use client";

import { useState } from "react";
import { Upload, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  label: string;
  name: string;
  currentImage?: string;
  onImageChange?: (file: File | null) => void;
  onViewImage?: () => void;
  accept?: string;
  description?: string;
  required?: boolean;
}

export function ImageUpload({
  label,
  name,
  currentImage,
  onImageChange,
  onViewImage,
  accept = "image/*",
  description,
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (onImageChange) {
        onImageChange(file);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    const fileInput = document.getElementById(name) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {onViewImage && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onViewImage}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
          {fileName && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {fileName}
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            id={name}
            name={name}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            required={required && !currentImage}
          />
          <label
            htmlFor={name}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {description || "PNG, JPG up to 5MB"}
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
