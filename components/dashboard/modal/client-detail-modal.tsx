"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Briefcase,
  Building2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageZoomModal } from "./image-zoom-modal";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function ClientDetailModal({
  isOpen,
  onClose,
  client,
  onApprove,
  onReject,
  showActions = true,
}: ClientDetailModalProps) {
  const [zoomImage, setZoomImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  if (!isOpen) return null;

  // ✅ FIX: Use 'profile' field from UserSerializer
  const profile = client?.profile;
  const guarantors = profile?.guarantors || [];
  const nextOfKin = profile?.next_of_kin || null;

  const guarantor1 = guarantors[0] || null;
  const guarantor2 = guarantors[1] || null;

  // Image URLs from backend
  const profilePictureUrl =
    profile?.profile_picture_url || "/api/placeholder/400/400";
  const idCardFrontUrl =
    profile?.id_card_front_url || "/api/placeholder/600/400";
  const idCardBackUrl = profile?.id_card_back_url || "/api/placeholder/600/400";

  return (
    <>
      {/* Glassy Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[650px] lg:w-[750px] bg-white dark:bg-[#1e293b] shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header - Fixed */}
          <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Client Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete client information and verification details
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Badge */}
            {showActions && !client.is_approved && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Pending Approval
                </span>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <div className="space-y-8">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div
                  onClick={() =>
                    profile?.profile_picture_url &&
                    setZoomImage({
                      url: profilePictureUrl,
                      title: "Client Profile Photo",
                    })
                  }
                  className="relative group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700">
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {profile?.profile_picture_url && (
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        View
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      First Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {client.first_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Last Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {client.last_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Date of Birth
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Gender
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {profile?.gender || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Client Level
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {profile?.level || "Bronze"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Branch
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {client.branch_name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Street Address
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.address || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      City
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.city || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      State
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Postal Code
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.postal_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Country
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.country || "Nigeria"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                        Email Address
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {client.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {client.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment & Financial Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Employment & Financial Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Occupation
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.occupation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Employer
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.employer || "N/A"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Monthly Income
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {profile?.monthly_income
                        ? `₦${Number(profile.monthly_income).toLocaleString()}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Banking Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Bank Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {profile?.bank_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Account Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {profile?.account_number || "N/A"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      BVN (Bank Verification Number)
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {profile?.bvn || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID Verification */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  ID Verification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      ID Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {profile?.id_type?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      ID Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {profile?.id_number || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      profile?.id_card_front_url &&
                      setZoomImage({
                        url: idCardFrontUrl,
                        title: "ID Front",
                      })
                    }
                    className="relative group cursor-pointer"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={idCardFrontUrl}
                        alt="ID Front"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {profile?.id_card_front_url && (
                      <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          View ID Front
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ID Front
                    </p>
                  </div>
                  <div
                    onClick={() =>
                      profile?.id_card_back_url &&
                      setZoomImage({
                        url: idCardBackUrl,
                        title: "ID Back",
                      })
                    }
                    className="relative group cursor-pointer"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={idCardBackUrl}
                        alt="ID Back"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {profile?.id_card_back_url && (
                      <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          View ID Back
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ID Back
                    </p>
                  </div>
                </div>
              </div>

              {/* Guarantor 1 Details - Using Structured Data */}
              {guarantor1 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Guarantor 1 Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {guarantor1.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {guarantor1.phone}
                      </p>
                    </div>
                    {guarantor1.email && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {guarantor1.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Relationship
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {guarantor1.relationship}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Address
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {guarantor1.address}
                      </p>
                    </div>
                    {guarantor1.occupation && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Occupation
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {guarantor1.occupation}
                        </p>
                      </div>
                    )}
                    {guarantor1.employer && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Employer
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {guarantor1.employer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guarantor 2 Details */}
              {guarantor2 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Guarantor 2 Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {guarantor2.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {guarantor2.phone}
                      </p>
                    </div>
                    {guarantor2.email && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {guarantor2.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Relationship
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {guarantor2.relationship}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Address
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {guarantor2.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next of Kin Details - Using Structured Data */}
              {nextOfKin && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Next of Kin
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {nextOfKin.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {nextOfKin.phone}
                      </p>
                    </div>
                    {nextOfKin.email && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {nextOfKin.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Relationship
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {nextOfKin.relationship}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Address
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {nextOfKin.address}
                      </p>
                    </div>
                    {nextOfKin.occupation && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Occupation
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {nextOfKin.occupation}
                        </p>
                      </div>
                    )}
                    {nextOfKin.employer && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Employer
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {nextOfKin.employer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Fixed at Bottom */}
          {showActions && !client.is_approved && (
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-[#0f172a]">
              <div className="flex gap-3">
                <Button
                  onClick={onReject}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
                >
                  Reject
                </Button>
                <Button
                  onClick={onApprove}
                  className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold rounded-full shadow-lg"
                >
                  Approve Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <ImageZoomModal
          isOpen={!!zoomImage}
          onClose={() => setZoomImage(null)}
          imageUrl={zoomImage.url}
          title={zoomImage.title}
        />
      )}
    </>
  );
}
