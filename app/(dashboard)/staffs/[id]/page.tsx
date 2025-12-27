"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  useStaffMember,
  useDeleteStaff,
  AssignedClient,
} from "@/hooks/useStaff";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { BackButton } from "@/components/dashboard/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ImageZoomModal } from "@/components/dashboard/image-zoom-modal";
import { Pagination } from "@/components/dashboard/table/pagination";
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  User,
  Building2,
  Shield,
  Users,
  FileText,
  Eye,
  Calendar,
  IdCard,
  Heart,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const { data: staff, isLoading, error } = useStaffMember(staffId);
  const deleteStaff = useDeleteStaff();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Pagination state for assigned clients
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsPageSize, setClientsPageSize] = useState(10);

  // Get profile data - must use optional chaining since staff might be undefined
  const profile = staff?.profile || staff?.staff_profile || {};
  const assignedClients: AssignedClient[] = staff?.assigned_clients || [];

  // Pagination logic for assigned clients - ALL HOOKS MUST BE BEFORE CONDITIONAL RETURNS
  const paginatedClients = useMemo(() => {
    const startIndex = (clientsPage - 1) * clientsPageSize;
    const endIndex = startIndex + clientsPageSize;
    return assignedClients.slice(startIndex, endIndex);
  }, [assignedClients, clientsPage, clientsPageSize]);

  const totalClientsPages = Math.max(
    1,
    Math.ceil(assignedClients.length / clientsPageSize)
  );

  // Get image URLs - check multiple possible field names
  const profilePictureUrl =
    profile.profile_picture_url || profile.profile_picture || null;
  const idCardFrontUrl =
    profile.id_card_front_url || profile.id_card_front || null;
  const idCardBackUrl =
    profile.id_card_back_url || profile.id_card_back || null;

  const handleDelete = async () => {
    try {
      await deleteStaff.mutateAsync(staffId);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleClientsPageChange = (page: number) => {
    setClientsPage(page);
  };

  const handleClientsPageSizeChange = (size: number) => {
    setClientsPageSize(size);
    setClientsPage(1); // Reset to first page when page size changes
  };

  // NOW we can have conditional returns after all hooks are called
  if (isLoading) {
    return (
      <DashboardLayout title="Staff Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading staff details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !staff) {
    return (
      <DashboardLayout title="Staff Details">
        <BackButton href="/staffs" />
        <Card className="mt-6 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load staff details</p>
            <p className="text-sm text-gray-500 mt-2">{error?.message}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Staff Details">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <BackButton href="/staffs" />
        <div className="flex gap-3">
          <Button
            onClick={() => router.push(`/staffs/${staffId}/edit`)}
            className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            <Edit className="w-4 h-4" />
            Edit Staff
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
          {/* Profile Card */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="relative cursor-pointer group"
                  onClick={() =>
                    profilePictureUrl &&
                    setZoomImage({
                      url: profilePictureUrl,
                      title: "Profile Picture",
                    })
                  }
                >
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={profilePictureUrl || undefined} />
                    <AvatarFallback className="text-2xl bg-yellow-500 text-gray-900">
                      {staff.first_name?.[0]}
                      {staff.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {profilePictureUrl && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staff.first_name} {staff.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Employee ID: {profile.employee_id || "N/A"}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  <Badge variant={staff.is_active ? "default" : "secondary"}>
                    {staff.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {staff.user_role}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Quick Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {staff.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {staff.phone || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {staff.branch?.name || staff.branch_name || "No Branch"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Role & Permissions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Role & Permissions
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="outline" className="capitalize">
                      {staff.user_role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Assigned Clients:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {staff.assigned_clients_count ||
                        assignedClients.length ||
                        0}
                    </span>
                  </div>
                  {profile.can_approve_loans && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Can Approve Loans:
                      </span>
                      <Badge variant="default" className="bg-green-500">
                        Yes
                      </Badge>
                    </div>
                  )}
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
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* ID Front */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    ID Front
                  </p>
                  {idCardFrontUrl ? (
                    <div
                      className="relative aspect-[3/2] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                      onClick={() =>
                        setZoomImage({
                          url: idCardFrontUrl,
                          title: "ID Card Front",
                        })
                      }
                    >
                      <img
                        src={idCardFrontUrl}
                        alt="ID Front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/2] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        Not uploaded
                      </span>
                    </div>
                  )}
                </div>

                {/* ID Back */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    ID Back
                  </p>
                  {idCardBackUrl ? (
                    <div
                      className="relative aspect-[3/2] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                      onClick={() =>
                        setZoomImage({
                          url: idCardBackUrl,
                          title: "ID Card Back",
                        })
                      }
                    >
                      <img
                        src={idCardBackUrl}
                        alt="ID Back"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/2] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        Not uploaded
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Details */}
              {(profile.id_type || profile.id_number) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ID Type:</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {profile.id_type?.replace("_", " ") || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ID Number:</span>
                    <span className="text-gray-900 dark:text-white">
                      {profile.id_number || "N/A"}
                    </span>
                  </div>
                </div>
              )}
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
                <InfoItem
                  label="Date of Birth"
                  value={
                    profile.date_of_birth
                      ? format(new Date(profile.date_of_birth), "PPP")
                      : null
                  }
                />
                <InfoItem
                  label="Gender"
                  value={profile.gender}
                  className="capitalize"
                />
                <InfoItem label="Blood Group" value={profile.blood_group} />
                <InfoItem
                  label="Joined Date"
                  value={
                    staff.created_at
                      ? format(new Date(staff.created_at), "PPP")
                      : null
                  }
                />
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
              <InfoItem
                label="Address"
                value={profile.address}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Employee ID" value={profile.employee_id} />
                <InfoItem label="Designation" value={profile.designation} />
                <InfoItem
                  label="Department"
                  value={profile.department}
                  className="capitalize"
                />
                <InfoItem
                  label="Hire Date"
                  value={
                    profile.hire_date
                      ? format(new Date(profile.hire_date), "PPP")
                      : null
                  }
                />
                <InfoItem
                  label="Salary"
                  value={
                    profile.salary
                      ? `₦${Number(profile.salary).toLocaleString()}`
                      : null
                  }
                />
                <InfoItem
                  label="Employment Status"
                  value={
                    profile.employment_status !== false
                      ? "Active"
                      : "Terminated"
                  }
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
                <InfoItem label="Account Number" value={profile.bank_account} />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Contact Name"
                  value={profile.emergency_contact_name}
                />
                <InfoItem
                  label="Contact Phone"
                  value={profile.emergency_contact_phone}
                />
                <InfoItem
                  label="Relationship"
                  value={profile.emergency_contact_relationship}
                  className="md:col-span-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assigned Clients Table */}
          {staff.user_role === "staff" && (
            <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Assigned Clients ({assignedClients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedClients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-muted-foreground">
                      No clients assigned to this staff member
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Phone
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Level
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedClients.map((client) => (
                            <tr
                              key={client.id}
                              className="border-b text-xs border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                              onClick={() => handleClientClick(client.id)}
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium  text-gray-900 dark:text-white">
                                  {client.full_name}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {client.email}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {client.phone || "N/A"}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant="outline"
                                  className="capitalize text-xs"
                                >
                                  {client.level}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <StatusBadge
                                  status={
                                    client.is_active ? "active" : "deactivated"
                                  }
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-yellow-600 hover:text-yellow-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClientClick(client.id);
                                  }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {assignedClients.length > 0 && (
                      <Pagination
                        currentPage={clientsPage}
                        totalPages={totalClientsPages}
                        pageSize={clientsPageSize}
                        totalItems={assignedClients.length}
                        onPageChange={handleClientsPageChange}
                        onPageSizeChange={handleClientsPageSizeChange}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* CV Document */}
          {profile.cv_url && (
            <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  CV / Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{profile.cv_filename || "Download CV"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${staff.first_name} ${staff.last_name}? This action will deactivate their account.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteStaff.isPending}
      />

      {/* Image Zoom Modal */}
      {zoomImage && (
        <ImageZoomModal
          isOpen={!!zoomImage}
          onClose={() => setZoomImage(null)}
          imageUrl={zoomImage.url}
          title={zoomImage.title}
        />
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
      <dd className="text-sm text-gray-900 dark:text-white">
        {value || "N/A"}
      </dd>
    </div>
  );
}
