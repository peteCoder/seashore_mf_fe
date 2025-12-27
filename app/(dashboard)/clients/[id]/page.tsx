"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useClient,
  useDeleteClient,
  useDeleteGuarantor,
  useDeleteNextOfKin,
} from "@/hooks/useClients";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { BackButton } from "@/components/dashboard/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  User,
  Users,
  UserCheck,
  Building2,
  Plus,
  Heart,
  FileImage,
  IdCard,
  X,
  ZoomIn,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import { AssignStaffModal } from "@/components/dashboard/modal/assign-staff-modal";
import { SuccessModal } from "@/components/dashboard/modal/success-modal";
import { AddGuarantorModal } from "@/components/dashboard/modal/add-guarantor-modal";
import { AddNextOfKinModal } from "@/components/dashboard/modal/add-next-of-kin-modal";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const { data: client, isLoading, error, refetch } = useClient(clientId);
  const deleteClient = useDeleteClient();
  const deleteGuarantor = useDeleteGuarantor();
  const deleteNextOfKin = useDeleteNextOfKin();

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Guarantor & NOK modals
  const [showAddGuarantorModal, setShowAddGuarantorModal] = useState(false);
  const [showAddNokModal, setShowAddNokModal] = useState(false);
  const [editingGuarantor, setEditingGuarantor] = useState<any>(null);
  const [editingNok, setEditingNok] = useState<any>(null);

  // Delete confirmations
  const [guarantorToDelete, setGuarantorToDelete] = useState<any>(null);
  const [showDeleteNokModal, setShowDeleteNokModal] = useState(false);

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteClient.mutateAsync(clientId);
      setShowDeleteModal(false);
      router.push("/clients");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDeleteGuarantor = async () => {
    if (!guarantorToDelete) return;
    try {
      await deleteGuarantor.mutateAsync({
        clientId,
        guarantorId: guarantorToDelete.id,
      });
      setGuarantorToDelete(null);
      refetch();
    } catch (error) {
      console.error("Delete guarantor failed:", error);
    }
  };

  const handleDeleteNok = async () => {
    try {
      await deleteNextOfKin.mutateAsync({ clientId });
      setShowDeleteNokModal(false);
      refetch();
    } catch (error) {
      console.error("Delete next of kin failed:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Client Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading client details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout title="Client Details">
        <BackButton href="/clients" />
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load client details</p>
            <p className="text-sm text-gray-500 mt-2">{error?.message}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const profile = client.profile || {};

  // Get guarantors from profile or client object
  const guarantors = profile.guarantors || client.guarantors || [];

  // Get next of kin from profile or client object
  const nextOfKin = profile.next_of_kin || client.next_of_kin || null;

  return (
    <DashboardLayout title="Client Details">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <BackButton href="/clients" />
        <div className="flex gap-3">
          <Button
            onClick={() => router.push(`/clients/${clientId}/edit`)}
            className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center text-center">
                <Avatar
                  className="w-24 h-24 mb-4 cursor-pointer hover:ring-4 hover:ring-yellow-500/50 transition-all"
                  onClick={() =>
                    profile.profile_picture_url &&
                    setZoomedImage(profile.profile_picture_url)
                  }
                >
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-2xl bg-yellow-500 text-gray-900">
                    {client.first_name?.[0]}
                    {client.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">
                  {client.first_name} {client.last_name}
                </h2>
                <p className="text-sm text-muted-foreground uppercase">
                  Level:{" "}
                  <span className="font-medium text-yellow-600">
                    {profile.level || "Bronze"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  Loan Limit: ₦{(profile.loan_limit || 50000).toLocaleString()}
                </p>

                <div className="flex gap-2 mt-3">
                  <Badge variant={client.is_active ? "default" : "secondary"}>
                    {client.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={client.is_approved ? "default" : "outline"}>
                    {client.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Quick Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{client.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {client.branch?.name || client.branch_name || "No Branch"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Assigned Staff */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Assigned Staff</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReassignModal(true)}
                    className="h-7 text-xs"
                  >
                    <UserCheck className="w-3 h-3 mr-1" />
                    {profile.assigned_staff ? "Reassign" : "Assign"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile.assigned_staff || "Unassigned"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Documents Card */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="w-5 h-5" />
                ID Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  ID Type:{" "}
                  <span className="font-medium text-foreground uppercase">
                    {profile.id_type?.replace("_", " ") || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ID Number:{" "}
                  <span className="font-medium text-foreground">
                    {profile.id_number || "N/A"}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* ID Front */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    ID Front
                  </p>
                  {profile.id_card_front_url ? (
                    <div
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                      onClick={() => setZoomedImage(profile.id_card_front_url)}
                    >
                      <img
                        src={profile.id_card_front_url}
                        alt="ID Front"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center">
                      <FileImage className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* ID Back */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    ID Back
                  </p>
                  {profile.id_card_back_url ? (
                    <div
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                      onClick={() => setZoomedImage(profile.id_card_back_url)}
                    >
                      <img
                        src={profile.id_card_back_url}
                        alt="ID Back"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center">
                      <FileImage className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Date of Birth" value={profile.date_of_birth} />
                <InfoItem label="Gender" value={profile.gender} />
                <InfoItem
                  label="Member Since"
                  value={
                    client.created_at
                      ? format(new Date(client.created_at), "PPP")
                      : "N/A"
                  }
                />
                <InfoItem
                  label="Credit Score"
                  value={profile.credit_score?.toString()}
                />
                <InfoItem label="Risk Rating" value={profile.risk_rating} />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Street Address"
                  value={profile.address}
                  className="md:col-span-2"
                />
                <InfoItem label="City" value={profile.city} />
                <InfoItem label="State" value={profile.state} />
                <InfoItem label="Postal Code" value={profile.postal_code} />
                <InfoItem label="Country" value={profile.country} />
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Occupation" value={profile.occupation} />
                <InfoItem label="Employer" value={profile.employer} />
                <InfoItem
                  label="Monthly Income"
                  value={
                    profile.monthly_income
                      ? `₦${Number(profile.monthly_income).toLocaleString()}`
                      : "N/A"
                  }
                  className="md:col-span-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Banking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Bank Name" value={profile.bank_name} />
                <InfoItem
                  label="Account Number"
                  value={profile.account_number}
                />
                <InfoItem label="BVN" value={profile.bvn} />
              </div>
            </CardContent>
          </Card>

          {/* Guarantors */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Guarantors ({guarantors.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingGuarantor(null);
                    setShowAddGuarantorModal(true);
                  }}
                  className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                >
                  <Plus className="w-4 h-4" />
                  Add Guarantor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {guarantors.length > 0 ? (
                <div className="space-y-4">
                  {guarantors.map((guarantor: any, index: number) => (
                    <div
                      key={guarantor.id || index}
                      className="p-4 border rounded-lg relative group"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditingGuarantor(guarantor);
                            setShowAddGuarantorModal(true);
                          }}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                          onClick={() => setGuarantorToDelete(guarantor)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <h4 className="font-medium mb-2">{guarantor.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          {guarantor.phone}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Relationship:
                          </span>{" "}
                          <span className="capitalize">
                            {guarantor.relationship}
                          </span>
                        </div>
                        {guarantor.email && (
                          <div>
                            <span className="text-muted-foreground">
                              Email:
                            </span>{" "}
                            {guarantor.email}
                          </div>
                        )}
                        {guarantor.occupation && (
                          <div>
                            <span className="text-muted-foreground">
                              Occupation:
                            </span>{" "}
                            {guarantor.occupation}
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">
                            Address:
                          </span>{" "}
                          {guarantor.address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    No guarantors added yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingGuarantor(null);
                      setShowAddGuarantorModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Guarantor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next of Kin */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Next of Kin
                </CardTitle>
                {!nextOfKin && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingNok(null);
                      setShowAddNokModal(true);
                    }}
                    className="gap-1 bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Next of Kin
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {nextOfKin ? (
                <div className="p-4 border rounded-lg relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setEditingNok(nextOfKin);
                        setShowAddNokModal(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => setShowDeleteNokModal(true)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <h4 className="font-medium mb-2">{nextOfKin.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {nextOfKin.phone}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Relationship:
                      </span>{" "}
                      <span className="capitalize">
                        {nextOfKin.relationship}
                      </span>
                    </div>
                    {nextOfKin.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {nextOfKin.email}
                      </div>
                    )}
                    {nextOfKin.occupation && (
                      <div>
                        <span className="text-muted-foreground">
                          Occupation:
                        </span>{" "}
                        {nextOfKin.occupation}
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Address:</span>{" "}
                      {nextOfKin.address}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    No next of kin added yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingNok(null);
                      setShowAddNokModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Next of Kin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Client Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        description={`Are you sure you want to delete ${client.first_name} ${client.last_name}? This action will deactivate their account.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteClient.isPending}
      />

      {/* Delete Guarantor Modal */}
      <ConfirmationModal
        isOpen={!!guarantorToDelete}
        onClose={() => setGuarantorToDelete(null)}
        onConfirm={handleDeleteGuarantor}
        title="Delete Guarantor"
        description={`Are you sure you want to remove ${guarantorToDelete?.name} as a guarantor?`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteGuarantor.isPending}
      />

      {/* Delete Next of Kin Modal */}
      <ConfirmationModal
        isOpen={showDeleteNokModal}
        onClose={() => setShowDeleteNokModal(false)}
        onConfirm={handleDeleteNok}
        title="Delete Next of Kin"
        description={`Are you sure you want to remove ${nextOfKin?.name} as next of kin?`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteNextOfKin.isPending}
      />

      {/* Assign Staff Modal */}
      <AssignStaffModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        client={client}
        onSuccess={() => {
          setShowReassignModal(false);
          setSuccessMessage("Staff assignment updated successfully!");
          setShowSuccessModal(true);
          refetch();
        }}
      />

      {/* Add/Edit Guarantor Modal */}
      <AddGuarantorModal
        isOpen={showAddGuarantorModal}
        onClose={() => {
          setShowAddGuarantorModal(false);
          setEditingGuarantor(null);
        }}
        clientId={clientId}
        existingGuarantor={editingGuarantor}
        onSuccess={() => {
          setShowAddGuarantorModal(false);
          setEditingGuarantor(null);
          refetch();
        }}
      />

      {/* Add/Edit Next of Kin Modal */}
      <AddNextOfKinModal
        isOpen={showAddNokModal}
        onClose={() => {
          setShowAddNokModal(false);
          setEditingNok(null);
        }}
        clientId={clientId}
        existingNextOfKin={editingNok}
        onSuccess={() => {
          setShowAddNokModal(false);
          setEditingNok(null);
          refetch();
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage("");
        }}
        title="Success!"
        description={successMessage}
      />

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

// Helper component for displaying info items
function InfoItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="text-sm capitalize">{value || "N/A"}</dd>
    </div>
  );
}
