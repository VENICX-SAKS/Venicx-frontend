import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface BatchStatus {
  id: string;
  filename: string;
  status: string;
  total_rows: number | null;
  processed_rows: number;
  failed_rows: number;
  created_rows: number;
  merged_rows: number;
  progress_percent: number;
  partner_name: string | null;
  source_columns: string[];
  created_at: string;
  completed_at: string | null;
}

export interface MappingTemplate {
  id: string;
  name: string;
  partner_name: string | null;
  field_mappings: Record<string, string>;
  created_at: string;
}

export function useBatchStatus(batchId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["ingestion", "batch", batchId],
    queryFn: () => api.get<BatchStatus>(`/api/v1/ingestion/status/${batchId}`),
    enabled: !!batchId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data as BatchStatus | undefined;
      if (!data) return 3000;
      return data.status === "processing" || data.status === "pending" ? 3000 : false;
    },
  });
}

export function useBatchList() {
  return useQuery({
    queryKey: ["ingestion", "batches"],
    queryFn: () => api.get<BatchStatus[]>("/api/v1/ingestion/batches"),
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["ingestion", "templates"],
    queryFn: () => api.get<MappingTemplate[]>("/api/v1/ingestion/templates"),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.upload<{ batch_id: string; filename: string; file_type: string }>(
        "/api/v1/ingestion/upload",
        formData
      ),
  });
}

export function useMapFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      batch_id: string;
      field_mappings: Record<string, string>;
      partner_name?: string;
      save_template?: { name: string; partner_name?: string };
    }) => api.post("/api/v1/ingestion/map", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingestion"] }),
  });
}

export function useCancelBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => api.post(`/api/v1/ingestion/cancel/${batchId}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingestion"] }),
  });
}

export function useRetryBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) =>
      api.post<{ batch_id: string; status: string }>(`/api/v1/ingestion/retry/${batchId}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingestion"] }),
  });
}
