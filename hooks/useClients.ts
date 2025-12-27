import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientAPI, userAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Query Keys
export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// ============================================
// FETCH CLIENT LIST
// ============================================

export function useClients(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: async () => {
      const result = await clientAPI.list(filters);

      console.log("API Response:", result); // Debug logging

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch clients");
      }

      // The apiCall function spreads the backend response into the result
      // Handle multiple response structures:

      // 1. Direct clients array (non-paginated)
      if (result.clients && Array.isArray(result.clients)) {
        console.log("Found clients directly:", result.clients.length);
        return result.clients;
      }

      // 2. Paginated response: result.results.clients
      // DRF pagination wraps in { count, next, previous, results: { success, clients } }
      if (result.results?.clients && Array.isArray(result.results.clients)) {
        console.log(
          "Found clients in results.clients:",
          result.results.clients.length
        );
        return result.results.clients;
      }

      // 3. Check in data object (from apiCall spread)
      if (result.data) {
        // Paginated: data.results.clients
        if (
          result.data.results?.clients &&
          Array.isArray(result.data.results.clients)
        ) {
          console.log(
            "Found clients in data.results.clients:",
            result.data.results.clients.length
          );
          return result.data.results.clients;
        }

        // Non-paginated: data.clients
        if (result.data.clients && Array.isArray(result.data.clients)) {
          console.log(
            "Found clients in data.clients:",
            result.data.clients.length
          );
          return result.data.clients;
        }

        // Standard DRF pagination: data.results as array
        if (result.data.results && Array.isArray(result.data.results)) {
          console.log(
            "Found clients in data.results:",
            result.data.results.length
          );
          return result.data.results;
        }

        // Direct array
        if (Array.isArray(result.data)) {
          console.log("Found clients as array in data:", result.data.length);
          return result.data;
        }
      }

      console.log("No clients found in response");
      return [];
    },
  });
}

// ============================================
// FETCH SINGLE CLIENT
// ============================================

export function useClient(id: string | null) {
  return useQuery({
    queryKey: clientKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Client ID is required");

      const result = await clientAPI.get(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch client");
      }
      return result.client || result.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// CREATE CLIENT
// ============================================

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await clientAPI.create(data);

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
            : result.error || "Failed to create client";

        throw new Error(errorMessage);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success("Client created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create client");
    },
  });
}

// ============================================
// UPDATE CLIENT
// ============================================

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await clientAPI.update(id, data);

      if (!result.success) {
        throw new Error(result.error || "Failed to update client");
      }

      return result;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });

      const previousClient = queryClient.getQueryData(clientKeys.detail(id));
      const previousList = queryClient.getQueryData(clientKeys.lists());

      return { previousClient, previousList, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.id),
      });
      toast.success("Client updated successfully!");
    },
    onError: (error: any, variables, context) => {
      if (context?.previousClient) {
        queryClient.setQueryData(
          clientKeys.detail(context.id),
          context.previousClient
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(clientKeys.lists(), context.previousList);
      }
      toast.error(error.message || "Failed to update client");
    },
  });
}

// ============================================
// DELETE CLIENT
// ============================================

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await clientAPI.delete(id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete client");
      }

      return result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      toast.success("Client deleted successfully!");
      router.push("/clients");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete client");
    },
  });
}

// ============================================
// APPROVE CLIENT
// ============================================

export function useApproveClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "reject";
    }) => userAPI.approve(id, action),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });

      const previousClients = queryClient.getQueryData(clientKeys.lists());
      const previousClient = queryClient.getQueryData(clientKeys.detail(id));

      // Optimistically update lists
      queryClient.setQueryData(clientKeys.lists(), (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((client: any) =>
          client.id === id ? { ...client, is_approved: true } : client
        );
      });

      // Optimistically update detail
      queryClient.setQueryData(clientKeys.detail(id), (old: any) =>
        old ? { ...old, is_approved: true } : old
      );

      return { previousClients, previousClient, id };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
      toast.success("Client approved successfully!");
    },
    onError: (error: any, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.lists(), context.previousClients);
      }
      if (context?.previousClient && context?.id) {
        queryClient.setQueryData(
          clientKeys.detail(context.id),
          context.previousClient
        );
      }
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to approve client";
      toast.error(message);
    },
  });
}

// ============================================
// ACTIVATE/DEACTIVATE CLIENT
// ============================================

export function useActivateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "activate" | "deactivate";
    }) => userAPI.activate(id, action),

    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });

      const previousClients = queryClient.getQueryData(clientKeys.lists());
      const previousClient = queryClient.getQueryData(clientKeys.detail(id));

      // Optimistically update the clients list
      queryClient.setQueryData(clientKeys.lists(), (old: any) => {
        if (!Array.isArray(old)) return old;

        return old.map((client: any) =>
          client.id === id
            ? {
                ...client,
                is_active: action === "activate",
                is_approved: true,
              }
            : client
        );
      });

      // Optimistically update the single client detail
      queryClient.setQueryData(clientKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_active: action === "activate",
          is_approved: true,
        };
      });

      return { previousClients, previousClient, id };
    },

    onSuccess: (_, variables) => {
      const { id, action } = variables;

      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });

      const message =
        action === "activate"
          ? "Client activated successfully!"
          : "Client deactivated successfully!";
      toast.success(message);
    },

    onError: (error: any, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.lists(), context.previousClients);
      }
      if (context?.previousClient && context?.id) {
        queryClient.setQueryData(
          clientKeys.detail(context.id),
          context.previousClient
        );
      }

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update client status";
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
      return clientAPI.assignStaff(clientId, staffId);
    },
    onMutate: async ({ clientId, staffId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: clientKeys.detail(clientId),
      });

      // Snapshot previous value
      const previousClient = queryClient.getQueryData(
        clientKeys.detail(clientId)
      );

      // Optimistically update
      queryClient.setQueryData(clientKeys.detail(clientId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          profile: {
            ...old.profile,
            assigned_staff: staffId,
          },
        };
      });

      return { previousClient };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousClient) {
        queryClient.setQueryData(
          clientKeys.detail(variables.clientId),
          context.previousClient
        );
      }
      toast.error("Failed to assign staff");
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });

      toast.success(
        variables.staffId
          ? "Staff assigned successfully!"
          : "Staff unassigned successfully!"
      );
    },
  });
}

// ============================================
// GUARANTOR MUTATIONS
// ============================================

export function useAddGuarantor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: {
        name: string;
        phone: string;
        email?: string;
        relationship: string;
        address: string;
        occupation?: string;
        employer?: string;
        monthly_income?: number;
      };
    }) => {
      const result = await clientAPI.addGuarantor(clientId, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to add guarantor");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Guarantor added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add guarantor");
    },
  });
}

export function useUpdateGuarantor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      guarantorId,
      data,
    }: {
      clientId: string;
      guarantorId: string;
      data: any;
    }) => {
      const result = await clientAPI.updateGuarantor(
        clientId,
        guarantorId,
        data
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to update guarantor");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Guarantor updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update guarantor");
    },
  });
}

export function useDeleteGuarantor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      guarantorId,
    }: {
      clientId: string;
      guarantorId: string;
    }) => {
      const result = await clientAPI.deleteGuarantor(clientId, guarantorId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete guarantor");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Guarantor removed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove guarantor");
    },
  });
}

// ============================================
// NEXT OF KIN MUTATIONS
// Note: NextOfKin is a OneToOne relationship, so no nokId needed
// ============================================

export function useAddNextOfKin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: {
        name: string;
        phone: string;
        email?: string;
        relationship: string;
        address: string;
        occupation?: string;
        employer?: string;
      };
    }) => {
      const result = await clientAPI.addNextOfKin(clientId, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to add next of kin");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Next of kin added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add next of kin");
    },
  });
}

export function useUpdateNextOfKin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: any }) => {
      const result = await clientAPI.updateNextOfKin(clientId, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update next of kin");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Next of kin updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update next of kin");
    },
  });
}

export function useDeleteNextOfKin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const result = await clientAPI.deleteNextOfKin(clientId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete next of kin");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Next of kin removed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove next of kin");
    },
  });
}

// ============================================
// UPLOAD CLIENT IMAGES
// ============================================

export function useUploadClientImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      formData,
    }: {
      clientId: string;
      formData: FormData;
    }) => {
      const result = await clientAPI.uploadImages(clientId, formData);
      if (!result.success) {
        throw new Error(result.error || "Failed to upload images");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
      toast.success("Images uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
}
