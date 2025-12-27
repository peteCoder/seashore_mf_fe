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
import { useAddNextOfKin, useUpdateNextOfKin } from "@/hooks/useClients";

interface NextOfKinData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  address: string;
  occupation?: string;
  employer?: string;
}

interface AddNextOfKinModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  existingNextOfKin?: NextOfKinData | null;
  onSuccess?: () => void;
}

const initialFormData: NextOfKinData = {
  name: "",
  phone: "",
  email: "",
  relationship: "",
  address: "",
  occupation: "",
  employer: "",
};

export function AddNextOfKinModal({
  isOpen,
  onClose,
  clientId,
  existingNextOfKin,
  onSuccess,
}: AddNextOfKinModalProps) {
  const isEditing = !!existingNextOfKin?.id;

  const [formData, setFormData] = useState<NextOfKinData>(initialFormData);

  const addNextOfKin = useAddNextOfKin();
  const updateNextOfKin = useUpdateNextOfKin();

  // Update form data when existingNextOfKin changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingNextOfKin) {
        setFormData({
          name: existingNextOfKin.name || "",
          phone: existingNextOfKin.phone || "",
          email: existingNextOfKin.email || "",
          relationship: existingNextOfKin.relationship || "",
          address: existingNextOfKin.address || "",
          occupation: existingNextOfKin.occupation || "",
          employer: existingNextOfKin.employer || "",
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, existingNextOfKin]);

  const handleChange = (field: keyof NextOfKinData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        // Update existing next of kin
        await updateNextOfKin.mutateAsync({
          clientId,
          data: formData,
        });
      } else {
        // Add new next of kin
        await addNextOfKin.mutateAsync({
          clientId,
          data: formData,
        });
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Failed to save next of kin:", error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  const isPending = addNextOfKin.isPending || updateNextOfKin.isPending;

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
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Next of Kin" : "Add Next of Kin"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing
                  ? "Update next of kin information"
                  : "Add next of kin for this client"}
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
                    <SelectItem value="son">Son</SelectItem>
                    <SelectItem value="daughter">Daughter</SelectItem>
                    <SelectItem value="uncle">Uncle</SelectItem>
                    <SelectItem value="aunt">Aunt</SelectItem>
                    <SelectItem value="cousin">Cousin</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
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
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
              >
                {isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Next of Kin"
                  : "Add Next of Kin"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
