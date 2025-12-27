import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loanAPI } from "@/lib/api";
import toast from "react-hot-toast";

export const loanKeys = {
  all: ["loans"] as const,
  lists: () => [...loanKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...loanKeys.lists(), filters] as const,
  details: () => [...loanKeys.all, "detail"] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
  statistics: () => [...loanKeys.all, "statistics"] as const,
};

export function useLoans(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: async () => {
      const result = await loanAPI.list(filters);
      if (!result.success) throw new Error(result.error);

      let loansData = [];
      if (Array.isArray(result.data)) {
        loansData = result.data;
      } else if (result.data?.results) {
        loansData = result.data.results;
      } else if (result.data?.loans) {
        loansData = result.data.loans;
      }

      return loansData;
    },
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: async () => {
      const result = await loanAPI.get(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useLoanStatistics() {
  return useQuery({
    queryKey: loanKeys.statistics(),
    queryFn: async () => {
      const result = await loanAPI.getStatistics();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useApplyLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => loanAPI.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() });
      toast.success("Loan application submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit loan application");
    },
  });
}

export function useApproveLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: string;
      reason?: string;
    }) => loanAPI.approve(id, action, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() });
      toast.success("Loan application processed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process loan");
    },
  });
}

export function useDisburseLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      loanAPI.disburse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() });
      toast.success("Loan disbursed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to disburse loan");
    },
  });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      loanAPI.repay(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() });
      toast.success("Payment recorded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record payment");
    },
  });
}
