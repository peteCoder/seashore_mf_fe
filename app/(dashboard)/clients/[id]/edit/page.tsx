"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  useClient,
  useUpdateClient,
  useUploadClientImages,
} from "@/hooks/useClients";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Save,
  X,
  Upload,
  User,
  MapPin,
  IdCard,
  Briefcase,
  CreditCard,
  Camera,
  FileImage,
  Trash2,
} from "lucide-react";
import { ConfirmationModal } from "@/components/dashboard/modal/confirmation-modal";
import toast from "react-hot-toast";

export default function ClientEditPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const { data: client, isLoading, refetch } = useClient(clientId);
  const updateClient = useUpdateClient();
  const uploadImages = useUploadClientImages();

  const [showSaveModal, setShowSaveModal] = useState(false);

  // Image states
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  // File refs
  const profileImageRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  // Files to upload
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    id_type: "",
    id_number: "",
    occupation: "",
    employer: "",
    monthly_income: "",
    bank_name: "",
    account_number: "",
    bvn: "",
  });

  // Populate form when client data loads
  useEffect(() => {
    if (client) {
      const profile = client.profile || {};
      setFormData({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        email: client.email || "",
        phone: client.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "Nigeria",
        id_type: profile.id_type || "",
        id_number: profile.id_number || "",
        occupation: profile.occupation || "",
        employer: profile.employer || "",
        monthly_income: profile.monthly_income?.toString() || "",
        bank_name: profile.bank_name || "",
        account_number: profile.account_number || "",
        bvn: profile.bvn || "",
      });

      // Set existing image URLs as previews
      if (profile.profile_picture_url) {
        setProfileImagePreview(profile.profile_picture_url);
      }
      if (profile.id_card_front_url) {
        setIdFrontPreview(profile.id_card_front_url);
      }
      if (profile.id_card_back_url) {
        setIdBackPreview(profile.id_card_back_url);
      }
    }
  }, [client]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle image selection
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "id_front" | "id_back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      switch (type) {
        case "profile":
          setProfileImagePreview(preview);
          setProfileImageFile(file);
          break;
        case "id_front":
          setIdFrontPreview(preview);
          setIdFrontFile(file);
          break;
        case "id_back":
          setIdBackPreview(preview);
          setIdBackFile(file);
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = (type: "profile" | "id_front" | "id_back") => {
    switch (type) {
      case "profile":
        setProfileImagePreview(null);
        setProfileImageFile(null);
        if (profileImageRef.current) profileImageRef.current.value = "";
        break;
      case "id_front":
        setIdFrontPreview(null);
        setIdFrontFile(null);
        if (idFrontRef.current) idFrontRef.current.value = "";
        break;
      case "id_back":
        setIdBackPreview(null);
        setIdBackFile(null);
        if (idBackRef.current) idBackRef.current.value = "";
        break;
    }
  };

  const handleSave = async () => {
    try {
      // First update the client data
      await updateClient.mutateAsync({
        id: clientId,
        data: formData,
      });

      // Then upload images if any were changed
      if (profileImageFile || idFrontFile || idBackFile) {
        const imageFormData = new FormData();

        if (profileImageFile) {
          imageFormData.append("profile_image", profileImageFile);
        }
        if (idFrontFile) {
          imageFormData.append("id_front_image", idFrontFile);
        }
        if (idBackFile) {
          imageFormData.append("id_back_image", idBackFile);
        }

        await uploadImages.mutateAsync({
          clientId,
          formData: imageFormData,
        });
      }

      setShowSaveModal(false);
      router.push(`/clients/${clientId}`);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-200 dark:border-yellow-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading client...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout title="Edit Client">
        <BackButton href="/clients" />
        <Card className="mt-6 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load client</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const isPending = updateClient.isPending || uploadImages.isPending;

  return (
    <DashboardLayout title="Edit Client">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <BackButton href={`/clients/${clientId}`} />
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/clients/${clientId}`)}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={() => setShowSaveModal(true)}
            className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            disabled={isPending}
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Image */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Picture */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profileImagePreview || undefined} />
                  <AvatarFallback className="text-3xl bg-yellow-500 text-gray-900">
                    {formData.first_name?.[0]}
                    {formData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {profileImagePreview && (
                  <button
                    onClick={() => handleRemoveImage("profile")}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, "profile")}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => profileImageRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {profileImagePreview ? "Change Photo" : "Upload Photo"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </CardContent>
          </Card>

          {/* ID Documents */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="w-5 h-5" />
                ID Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ID Front */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ID Card Front</Label>
                <div className="relative">
                  {idFrontPreview ? (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={idFrontPreview}
                        alt="ID Front"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage("id_front")}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => idFrontRef.current?.click()}
                      className="aspect-[4/3] rounded-lg bg-muted border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors"
                    >
                      <FileImage className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload
                      </span>
                    </div>
                  )}
                  <input
                    ref={idFrontRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, "id_front")}
                    className="hidden"
                  />
                </div>
              </div>

              {/* ID Back */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ID Card Back</Label>
                <div className="relative">
                  {idBackPreview ? (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={idBackPreview}
                        alt="ID Back"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage("id_back")}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => idBackRef.current?.click()}
                      className="aspect-[4/3] rounded-lg bg-muted border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors"
                    >
                      <FileImage className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload
                      </span>
                    </div>
                  )}
                  <input
                    ref={idBackRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, "id_back")}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) =>
                      handleChange("postal_code", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Verification */}
          <Card className="bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="w-5 h-5" />
                ID Verification
              </CardTitle>
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
                      <SelectItem value="nin">NIN</SelectItem>
                      <SelectItem value="drivers_license">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="voters_card">Voter's Card</SelectItem>
                      <SelectItem value="international_passport">
                        International Passport
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
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    value={formData.employer}
                    onChange={(e) => handleChange("employer", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="monthly_income">Monthly Income (₦)</Label>
                  <Input
                    id="monthly_income"
                    type="number"
                    value={formData.monthly_income}
                    onChange={(e) =>
                      handleChange("monthly_income", e.target.value)
                    }
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => handleChange("bank_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) =>
                      handleChange("account_number", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bvn">BVN</Label>
                  <Input
                    id="bvn"
                    value={formData.bvn}
                    onChange={(e) => handleChange("bvn", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSave}
        title="Save Changes"
        description="Are you sure you want to save these changes to the client profile?"
        confirmText="Save"
        isLoading={isPending}
      />
    </DashboardLayout>
  );
}
