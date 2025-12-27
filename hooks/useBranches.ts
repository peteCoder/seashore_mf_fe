import { useQuery } from "@tanstack/react-query";
import { branchAPI } from "@/lib/api";

export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...branchKeys.lists(), filters] as const,
};

export function useBranches(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: branchKeys.list(filters),
    queryFn: async () => {
      const result = await branchAPI.list();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch branches");
      }

      let branchesData: any[] = [];

      if (!result.data) return branchesData;

      if (Array.isArray(result.data)) {
        branchesData = result.data;
      } else if (result.data?.results && Array.isArray(result.data.results)) {
        branchesData = result.data.results;
      } else if (result.data?.branches && Array.isArray(result.data.branches)) {
        branchesData = result.data.branches;
      }

      return branchesData;
    },
  });
}
