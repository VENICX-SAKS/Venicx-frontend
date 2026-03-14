import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DashboardMetrics,
  DailyActivityPoint,
  DailyCommunicationPoint,
  IngestionBatch,
} from "@/types";

interface ActivityResponse {
  daily_records: DailyActivityPoint[];
  daily_communications: DailyCommunicationPoint[];
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => api.get<DashboardMetrics>("/api/v1/dashboard/metrics"),
    refetchInterval: 30_000,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => api.get<ActivityResponse>("/api/v1/dashboard/activity"),
    refetchInterval: 60_000,
  });
}

export function useRecentUploads() {
  return useQuery({
    queryKey: ["dashboard", "recent-uploads"],
    queryFn: () => api.get<IngestionBatch[]>("/api/v1/dashboard/recent-uploads"),
    refetchInterval: 15_000,
  });
}
