import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffAPI, userAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface StaffProfile {
  employee_id: string;
  designation: string;
  department: string;
  hire_date: string;
  termination_date: string | null;
  employment_status: boolean;
  salary: number;
  bank_account: string;
  bank_name: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  reports_to: string | null;
  reports_to_id: string | null;
  can_approve_loans: boolean;
  can_approve_accounts: boolean;
  max_approval_amount: number | null;
  id_type: string;
  id_number: string;
  profile_picture: string | null;
  profile_picture_url: string | null;
  id_card_front: string | null;
  id_card_front_url: string | null;
  id_card_back: string | null;
  id_card_back_url: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AssignedClient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  level: string;
  is_active: boolean;
  branch_name: string;
  created_at: string;
}

export interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  user_role: string;
  branch: string;
  branch_name: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profile: StaffProfile | null;
  staff_profile: StaffProfile | null;
  assigned_clients_count: number;
  assigned_clients?: AssignedClient[];
}

interface StaffFilters {
  status?: "active" | "suspended" | "deactivated" | "all";
  role?: "staff" | "manager" | "director" | "admin";
  search?: string;
  [key: string]: string | undefined;
}

// Query Keys
export const staffKeys = {
  all: ["staff"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  list: (filters: StaffFilters) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, "detail"] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
};

// ============================================
// FETCH STAFF LIST
// ============================================

export function useStaff(filters: StaffFilters = {}) {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }

      if (filters.role) {
        params.role = filters.role;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const result = await staffAPI.list(params);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch staff");
      }

      // Extract staff data from response
      let staffData: StaffMember[] = [];
      let stats: any = null;

      if (result.results?.staff && Array.isArray(result.results.staff)) {
        staffData = result.results.staff;
        stats = result.results.stats;
      } else if (result.staff && Array.isArray(result.staff)) {
        staffData = result.staff;
        stats = result.stats;
      } else if (result.data?.results?.staff) {
        staffData = result.data.results.staff;
        stats = result.data.results.stats;
      } else if (result.data?.staff) {
        staffData = result.data.staff;
        stats = result.data.stats;
      }

      return {
        staff: staffData,
        stats: stats || {
          total: staffData.length,
          active: staffData.filter((s) => s.is_active).length,
          suspended: 0,
          deactivated: staffData.filter((s) => !s.is_active).length,
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// FETCH SINGLE STAFF MEMBER WITH ASSIGNED CLIENTS
// ============================================

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: staffKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Staff ID is required");

      const result = await staffAPI.get(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch staff details");
      }

      // Extract staff data - handle both response formats
      const staffData = result.staff || result.data?.staff || result.data;

      // Normalize profile data - could be under 'profile' or 'staff_profile'
      const profile = staffData?.profile || staffData?.staff_profile || null;

      // Get assigned clients if present
      const assignedClients: AssignedClient[] =
        result.assigned_clients || result.data?.assigned_clients || [];

      return {
        ...staffData,
        profile,
        staff_profile: profile,
        assigned_clients: assignedClients,
        assigned_clients_count:
          result.assigned_clients_count ||
          staffData?.assigned_clients_count ||
          assignedClients.length,
      };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// CREATE STAFF
// ============================================

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const result = await staffAPI.create(data);

      if (!result.success) {
        const errorMessage =
          typeof result.error === "object"
            ? Object.entries(result.error)
                .map(
                  ([field, errors]) =>
                    `${field}: ${
                      Array.isArray(errors) ? errors.join(", ") : errors
                    }`
                )
                .join("\n")
            : result.error || "Failed to create staff";

        throw new Error(errorMessage);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      toast.success("Staff member created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create staff");
    },
  });
}

// ============================================
// UPDATE STAFF
// ============================================

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const result = await staffAPI.update(id, data);

      if (!result.success) {
        throw new Error(result.error || "Failed to update staff");
      }

      return result;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: staffKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: staffKeys.lists() });

      const previousStaff = queryClient.getQueryData(staffKeys.detail(id));
      const previousList = queryClient.getQueryData(staffKeys.lists());

      return { previousStaff, previousList, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffKeys.detail(variables.id),
      });
      toast.success("Staff updated successfully!");
    },
    onError: (error: any, variables, context) => {
      if (context?.previousStaff) {
        queryClient.setQueryData(
          staffKeys.detail(context.id),
          context.previousStaff
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(staffKeys.lists(), context.previousList);
      }
      toast.error(error.message || "Failed to update staff");
    },
  });
}

// ============================================
// DELETE STAFF
// ============================================

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await staffAPI.delete(id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete staff");
      }

      return result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
      toast.success("Staff member deleted successfully!");
      router.push("/staffs");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete staff");
    },
  });
}

// ============================================
// ACTIVATE/DEACTIVATE STAFF
// ============================================

export function useActivateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "activate" | "deactivate";
    }) => {
      const result = await userAPI.activate(id, action);

      if (!result.success) {
        throw new Error(result.error || `Failed to ${action} staff`);
      }

      return result;
    },

    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: staffKeys.lists() });
      await queryClient.cancelQueries({ queryKey: staffKeys.detail(id) });

      const previousList = queryClient.getQueryData(staffKeys.lists());
      const previousStaff = queryClient.getQueryData(staffKeys.detail(id));

      // Optimistically update the list
      queryClient.setQueryData(staffKeys.lists(), (old: any) => {
        if (!old?.staff) return old;

        return {
          ...old,
          staff: old.staff.map((staff: any) =>
            staff.id === id
              ? {
                  ...staff,
                  is_active: action === "activate",
                }
              : staff
          ),
        };
      });

      // Optimistically update single staff
      queryClient.setQueryData(staffKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_active: action === "activate",
        };
      });

      return { previousList, previousStaff, id };
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffKeys.detail(variables.id),
      });

      const message =
        variables.action === "activate"
          ? "Staff activated successfully!"
          : "Staff deactivated successfully!";
      toast.success(message);
    },

    onError: (error: any, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(staffKeys.lists(), context.previousList);
      }
      if (context?.previousStaff && context?.id) {
        queryClient.setQueryData(
          staffKeys.detail(context.id),
          context.previousStaff
        );
      }

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update staff status";
      toast.error(message);
    },
  });
}

// ============================================
// ASSIGN STAFF TO CLIENT
// ============================================

export function useAssignStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      staffId,
    }: {
      clientId: string;
      staffId: string | null;
    }) => {
      const result = await staffAPI.assignToClient(clientId, staffId);

      if (!result.success) {
        throw new Error(result.error || "Failed to assign staff");
      }

      return result;
    },

    onMutate: async ({ clientId, staffId }) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });

      const previousClients = queryClient.getQueryData(["clients"]);

      queryClient.setQueriesData({ queryKey: ["clients"] }, (old: any) => {
        if (!old) return old;

        if (Array.isArray(old)) {
          return old.map((client: any) =>
            client.id === clientId
              ? {
                  ...client,
                  profile: {
                    ...client.profile,
                    assigned_staff: staffId,
                  },
                }
              : client
          );
        }

        if (old.results && Array.isArray(old.results)) {
          return {
            ...old,
            results: old.results.map((client: any) =>
              client.id === clientId
                ? {
                    ...client,
                    profile: {
                      ...client.profile,
                      assigned_staff: staffId,
                    },
                  }
                : client
            ),
          };
        }

        return old;
      });

      return { previousClients };
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },

    onError: (error: any, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueriesData(
          { queryKey: ["clients"] },
          context.previousClients
        );
      }

      throw error;
    },
  });
}
