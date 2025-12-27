import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savingsAPI } from "@/lib/api";
import toast from "react-hot-toast";

export const savingsKeys = {
  all: ["savings"] as const,
  lists: () => [...savingsKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...savingsKeys.lists(), filters] as const,
  details: () => [...savingsKeys.all, "detail"] as const,
  detail: (id: string) => [...savingsKeys.details(), id] as const,
  transactions: (id: string) => [...savingsKeys.detail(id), "transactions"],
  statistics: () => [...savingsKeys.all, "statistics"] as const,
};

export function useSavings(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: savingsKeys.list(filters),
    queryFn: async () => {
      const result = await savingsAPI.list(filters);
      if (!result.success) throw new Error(result.error);

      let savingsData = [];
      if (Array.isArray(result.data)) {
        savingsData = result.data;
      } else if (result.data?.results) {
        savingsData = result.data.results;
      } else if (result.data?.accounts) {
        savingsData = result.data.accounts;
      }

      return savingsData;
    },
  });
}

export function useSavingsAccount(id: string) {
  return useQuery({
    queryKey: savingsKeys.detail(id),
    queryFn: async () => {
      const result = await savingsAPI.get(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useSavingsTransactions(id: string) {
  return useQuery({
    queryKey: savingsKeys.transactions(id),
    queryFn: async () => {
      const result = await savingsAPI.getTransactions(id);
      if (!result.success) throw new Error(result.error);

      let transactions = [];
      if (Array.isArray(result.data)) {
        transactions = result.data;
      } else if (result.data?.transactions) {
        transactions = result.data.transactions;
      } else if (result.data?.results) {
        transactions = result.data.results;
      }

      return transactions;
    },
    enabled: !!id,
  });
}

export function useCreateSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => savingsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savingsKeys.statistics() });
      toast.success("Savings account created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create savings account");
    },
  });
}

export function useDepositSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      savingsAPI.deposit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savingsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions(id) });
      queryClient.invalidateQueries({ queryKey: savingsKeys.statistics() });
      toast.success("Deposit recorded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record deposit");
    },
  });
}

export function useWithdrawSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      savingsAPI.withdraw(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savingsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: savingsKeys.transactions(id) });
      queryClient.invalidateQueries({ queryKey: savingsKeys.statistics() });
      toast.success("Withdrawal processed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process withdrawal");
    },
  });
}
