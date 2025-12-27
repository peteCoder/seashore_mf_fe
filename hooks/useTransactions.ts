// hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Types
export interface PendingTransaction {
  id: string;
  transaction_ref: string;
  transaction_type: "deposit" | "withdrawal";
  type_display: string;
  amount: number;
  client_id: string;
  client_name: string;
  client_email: string;
  savings_account_id: string | null;
  account_number: string | null;
  account_balance: number | null;
  branch_id: string;
  branch_name: string;
  requested_by: string | null;
  requested_by_id: string | null;
  description: string;
  notes: string;
  status: string;
  created_at: string;
}

export interface TransactionCounts {
  total_pending: number;
  pending_deposits: number;
  pending_withdrawals: number;
}

export interface TransactionDetail {
  id: string;
  transaction_ref: string;
  transaction_type: string;
  type_display: string;
  amount: number;
  status: string;
  status_display: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  savings_account: {
    id: string;
    account_number: string;
    balance: number;
  } | null;
  branch: {
    id: string;
    name: string;
  };
  balance_before: number | null;
  balance_after: number | null;
  description: string;
  notes: string;
  processed_by: {
    id: string;
    name: string;
  } | null;
  approved_by: {
    id: string;
    name: string;
  } | null;
  approved_at: string | null;
  rejection_reason: string;
  created_at: string;
  transaction_date: string;
}

// Hook to get pending transactions
export function usePendingTransactions(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["pending-transactions", params],
    queryFn: async () => {
      const response = await transactionsAPI.getPending(params);
      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch pending transactions"
        );
      }
      return {
        transactions: response.transactions as PendingTransaction[],
        counts: response.counts as TransactionCounts,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Hook to get transaction details
export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await transactionsAPI.get(id);
      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch transaction details"
        );
      }
      return response.transaction as TransactionDetail;
    },
    enabled: !!id,
  });
}

// Hook to approve a transaction
export function useApproveTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await transactionsAPI.approve(transactionId);
      if (!response.success) {
        throw new Error(response.error || "Failed to approve transaction");
      }
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Transaction approved successfully");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["pending-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve transaction");
    },
  });
}

// Hook to reject a transaction
export function useRejectTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      const response = await transactionsAPI.reject(transactionId, reason);
      if (!response.success) {
        throw new Error(response.error || "Failed to reject transaction");
      }
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Transaction rejected");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["pending-transactions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject transaction");
    },
  });
}
