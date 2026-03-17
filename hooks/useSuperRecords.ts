import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SuperRecord } from "@/types";

export interface SearchResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  province: string | null;
  msisdn_last4: string | null;
  email_domain: string | null;
  has_national_id: boolean;
  sms_consent: string | null;
  email_consent: string | null;
  created_at: string;
  lead_count: number;
  ltv_zar: number;
}

export interface SearchResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

export function useSuperRecordSearch(q: string, page: number) {
  return useQuery({
    queryKey: ["super-records", "search", q, page],
    queryFn: () =>
      api.get<SearchResponse>(
        `/api/v1/super-record/search?q=${encodeURIComponent(q)}&page=${page}&limit=20`
      ),
    placeholderData: (prev) => prev,
  });
}

export interface MergeSuggestion {
  id: string;
  confidence: number;
  match_field: string | null;
  primary: { id: string; name: string; msisdn_last4: string | null; city: string | null };
  duplicate: { id: string; name: string; msisdn_last4: string | null; city: string | null };
}

export function useMergeSuggestions() {
  return useQuery({
    queryKey: ["super-records", "merge-suggestions"],
    queryFn: () => api.get<MergeSuggestion[]>("/api/v1/super-record/merge-suggestions"),
    refetchInterval: 30_000,
  });
}

export function useAcceptMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/super-record/merge-suggestions/${id}/accept`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-records"] }),
  });
}

export function useRejectMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/super-record/merge-suggestions/${id}/reject`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-records"] }),
  });
}

export function useSuperRecord(id: string | null) {
  return useQuery({
    queryKey: ["super-records", id],
    queryFn: () => api.get<SuperRecord>(`/api/v1/super-record/${id}`),
    enabled: !!id,
  });
}

export function useUpdateConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      channel,
      status,
    }: {
      customerId: string;
      channel: "sms" | "email";
      status: "granted" | "revoked";
    }) =>
      api.post(`/api/v1/super-record/${customerId}/consent`, { channel, status }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["super-records", vars.customerId] });
    },
  });
}
