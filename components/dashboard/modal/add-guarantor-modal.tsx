"use client";

import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddGuarantor, useUpdateGuarantor } from "@/hooks/useClients";

interface GuarantorData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  address: string;
  occupation?: string;
  employer?: string;
  monthly_income?: number | null;
  id_type?: string;
  id_number?: string;
}

interface AddGuarantorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  existingGuarantor?: GuarantorData | null;
  onSuccess?: () => void;
}

const initialFormData: GuarantorData = {
  name: "",
  phone: "",
  email: "",
  relationship: "",
  address: "",
  occupation: "",
  employer: "",
  monthly_income: null,
  id_type: "",
  id_number: "",
};

export function AddGuarantorModal({
  isOpen,
  onClose,
  clientId,
  existingGuarantor,
  onSuccess,
}: AddGuarantorModalProps) {
  const isEditing = !!existingGuarantor?.id;

  const [formData, setFormData] = useState<GuarantorData>(initialFormData);

  const addGuarantor = useAddGuarantor();
  const updateGuarantor = useUpdateGuarantor();

  // Update form data when existingGuarantor changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingGuarantor) {
        setFormData({
          name: existingGuarantor.name || "",
          phone: existingGuarantor.phone || "",
          email: existingGuarantor.email || "",
          relationship: existingGuarantor.relationship || "",
          address: existingGuarantor.address || "",
          occupation: existingGuarantor.occupation || "",
          employer: existingGuarantor.employer || "",
          monthly_income: existingGuarantor.monthly_income || null,
          id_type: existingGuarantor.id_type || "",
          id_number: existingGuarantor.id_number || "",
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, existingGuarantor]);

  const handleChange = (
    field: keyof GuarantorData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert null to undefined for monthly_income to match API expectation
      const submitData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        relationship: formData.relationship,
        address: formData.address,
        occupation: formData.occupation,
        employer: formData.employer,
        monthly_income:
          formData.monthly_income === null
            ? undefined
            : formData.monthly_income,
        id_type: formData.id_type,
        id_number: formData.id_number,
      };

      if (isEditing && existingGuarantor?.id) {
        await updateGuarantor.mutateAsync({
          clientId,
          guarantorId: existingGuarantor.id,
          data: submitData,
        });
      } else {
        await addGuarantor.mutateAsync({
          clientId,
          data: submitData,
        });
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Failed to save guarantor:", error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  const isPending = addGuarantor.isPending || updateGuarantor.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Guarantor" : "Add Guarantor"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing
                  ? "Update guarantor information"
                  : "Add a new guarantor for this client"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+234..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => handleChange("relationship", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="brother">Brother</SelectItem>
                    <SelectItem value="sister">Sister</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="uncle">Uncle</SelectItem>
                    <SelectItem value="aunt">Aunt</SelectItem>
                    <SelectItem value="cousin">Cousin</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>

            {/* Employment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder="e.g. Teacher, Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employer">Employer</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) => handleChange("employer", e.target.value)}
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_income">Monthly Income (₦)</Label>
                <Input
                  id="monthly_income"
                  type="number"
                  value={formData.monthly_income || ""}
                  onChange={(e) =>
                    handleChange(
                      "monthly_income",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* ID Verification */}
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
                    <SelectItem value="national_id">
                      National ID (NIN)
                    </SelectItem>
                    <SelectItem value="drivers_license">
                      Driver's License
                    </SelectItem>
                    <SelectItem value="voters_card">Voter's Card</SelectItem>
                    <SelectItem value="passport">
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
                  placeholder="Enter ID number"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !formData.name ||
                  !formData.phone ||
                  !formData.relationship ||
                  !formData.address
                }
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                {isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Guarantor"
                  : "Add Guarantor"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
