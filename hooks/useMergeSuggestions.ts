import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface MergeCandidateView {
  customer_id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  city: string | null;
  province: string | null;
  msisdn_last4: string | null;
  email_domain: string | null;
  lead_count: number;
}

export interface MergeSuggestion {
  merge_log_id: string;
  confidence_score: number;
  source: MergeCandidateView;
  target: MergeCandidateView;
  created_at: string;
}

export function useMergeSuggestions() {
  return useQuery({
    queryKey: ["merge-suggestions"],
    queryFn: () => api.get<MergeSuggestion[]>("/api/v1/super-record/merge-suggestions"),
    refetchInterval: 30_000,
  });
}

export function useConfirmMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mergeLogId: string) =>
      api.post(`/api/v1/super-record/merge-suggestions/${mergeLogId}/confirm`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merge-suggestions"] });
      qc.invalidateQueries({ queryKey: ["super-records"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mergeLogId: string) =>
      api.post(`/api/v1/super-record/merge-suggestions/${mergeLogId}/reject`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merge-suggestions"] });
    },
  });
}
