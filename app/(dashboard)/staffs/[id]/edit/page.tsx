"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStaffMember, useUpdateStaff } from "@/hooks/useStaff";
import { useBranches } from "@/hooks/useBranches";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { BackButton } from "@/components/dashboard/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Upload, Eye, Trash2 } from "lucide-react";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import { ImageZoomModal } from "@/components/dashboard/image-zoom-modal";
import toast from "react-hot-toast";

export default function StaffEditPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const { data: staff, isLoading } = useStaffMember(staffId);
  const { data: branches } = useBranches();
  const updateStaff = useUpdateStaff();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // User fields
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_role: "",
    branch: "",

    // StaffProfile fields
    date_of_birth: "",
    gender: "",
    address: "",
    blood_group: "",
    employee_id: "",
    designation: "",
    department: "",
    hire_date: "",
    salary: "",
    bank_name: "",
    bank_account: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    id_type: "",
    id_number: "",
  });

  // Image files for upload
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [idFrontImage, setIdFrontImage] = useState<File | null>(null);
  const [idBackImage, setIdBackImage] = useState<File | null>(null);

  // Preview URLs for new images
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  // Populate form when staff data loads
  useEffect(() => {
    if (staff) {
      const profile = staff.profile || staff.staff_profile || {};
      setFormData({
        // User fields
        first_name: staff.first_name || "",
        last_name: staff.last_name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        user_role: staff.user_role || "",
        branch: staff.branch?.id || staff.branch || "",

        // StaffProfile fields
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        address: profile.address || "",
        blood_group: profile.blood_group || "",
        employee_id: profile.employee_id || "",
        designation: profile.designation || "",
        department: profile.department || "",
        hire_date: profile.hire_date || "",
        salary: profile.salary?.toString() || "",
        bank_name: profile.bank_name || "",
        bank_account: profile.bank_account || "",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        emergency_contact_relationship:
          profile.emergency_contact_relationship || "",
        id_type: profile.id_type || "",
        id_number: profile.id_number || "",
      });
    }
  }, [staff]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "id_front" | "id_back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    switch (type) {
      case "profile":
        setProfileImage(file);
        setProfilePreview(previewUrl);
        break;
      case "id_front":
        setIdFrontImage(file);
        setIdFrontPreview(previewUrl);
        break;
      case "id_back":
        setIdBackImage(file);
        setIdBackPreview(previewUrl);
        break;
    }
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formDataToSend.append(key, value);
        }
      });

      // Add images if selected
      if (profileImage) {
        formDataToSend.append("profile_picture", profileImage);
      }
      if (idFrontImage) {
        formDataToSend.append("id_card_front", idFrontImage);
      }
      if (idBackImage) {
        formDataToSend.append("id_card_back", idBackImage);
      }

      await updateStaff.mutateAsync({
        id: staffId,
        data: formDataToSend,
      });

      setShowSaveModal(false);
      router.push(`/staffs/${staffId}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update staff");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Staff">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading staff...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!staff) {
    return (
      <DashboardLayout title="Edit Staff">
        <BackButton href="/staffs" />
        <Card className="mt-6 bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load staff member</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const profile = staff.profile || staff.staff_profile || {};

  // Get current image URLs
  const currentProfilePic =
    profile.profile_picture_url || profile.profile_picture || null;
  const currentIdFront =
    profile.id_card_front_url || profile.id_card_front || null;
  const currentIdBack =
    profile.id_card_back_url || profile.id_card_back || null;

  return (
    <DashboardLayout title="Edit Staff">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <BackButton href={`/staffs/${staffId}`} />
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/staffs/${staffId}`)}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={() => setShowSaveModal(true)}
            className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Images Section */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Images & Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <ImageUploadField
                label="Profile Picture"
                currentImage={currentProfilePic}
                previewImage={profilePreview}
                onImageChange={(e) => handleImageChange(e, "profile")}
                onView={() =>
                  (profilePreview || currentProfilePic) &&
                  setZoomImage({
                    url: profilePreview || currentProfilePic!,
                    title: "Profile Picture",
                  })
                }
                onClear={() => {
                  setProfileImage(null);
                  setProfilePreview(null);
                }}
              />

              {/* ID Front */}
              <ImageUploadField
                label="ID Card Front"
                currentImage={currentIdFront}
                previewImage={idFrontPreview}
                onImageChange={(e) => handleImageChange(e, "id_front")}
                onView={() =>
                  (idFrontPreview || currentIdFront) &&
                  setZoomImage({
                    url: idFrontPreview || currentIdFront!,
                    title: "ID Card Front",
                  })
                }
                onClear={() => {
                  setIdFrontImage(null);
                  setIdFrontPreview(null);
                }}
              />

              {/* ID Back */}
              <ImageUploadField
                label="ID Card Back"
                currentImage={currentIdBack}
                previewImage={idBackPreview}
                onImageChange={(e) => handleImageChange(e, "id_back")}
                onView={() =>
                  (idBackPreview || currentIdBack) &&
                  setZoomImage({
                    url: idBackPreview || currentIdBack!,
                    title: "ID Card Back",
                  })
                }
                onClear={() => {
                  setIdBackImage(null);
                  setIdBackPreview(null);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_role">Role *</Label>
                <Select
                  value={formData.user_role}
                  onValueChange={(value) => handleChange("user_role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => handleChange("branch", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleChange("date_of_birth", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => handleChange("blood_group", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter full address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleChange("employee_id", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="loans">Loans</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="customer_service">
                      Customer Service
                    </SelectItem>
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="IT">IT/Technical</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleChange("hire_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary (₦)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Information */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_type">ID Type</Label>
                <Select
                  value={formData.id_type}
                  onValueChange={(value) => handleChange("id_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="drivers_license">
                      Driver&apos;s License
                    </SelectItem>
                    <SelectItem value="passport">
                      International Passport
                    </SelectItem>
                    <SelectItem value="voters_card">
                      Voter&apos;s Card
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">ID Number</Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => handleChange("id_number", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Banking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleChange("bank_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account">Account Number</Label>
                <Input
                  id="bank_account"
                  value={formData.bank_account}
                  onChange={(e) => handleChange("bank_account", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) =>
                    handleChange("emergency_contact_name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) =>
                    handleChange("emergency_contact_phone", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergency_contact_relationship">
                  Relationship
                </Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) =>
                    handleChange(
                      "emergency_contact_relationship",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSave}
        title="Save Changes"
        description="Are you sure you want to save these changes?"
        confirmText="Save"
        isLoading={updateStaff.isPending}
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

// Image Upload Field Component
function ImageUploadField({
  label,
  currentImage,
  previewImage,
  onImageChange,
  onView,
  onClear,
}: {
  label: string;
  currentImage: string | null;
  previewImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onView: () => void;
  onClear: () => void;
}) {
  const displayImage = previewImage || currentImage;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onView}
                className="gap-1"
              >
                <Eye className="w-3 h-3" />
                View
              </Button>
              {previewImage && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={onClear}
                  className="gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </Button>
              )}
            </div>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center h-full cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      {displayImage && (
        <label className="block">
          <span className="text-xs text-yellow-600 hover:text-yellow-700 cursor-pointer">
            Change image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
