import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CommMetrics {
  sms_sent: number;
  emails_sent: number;
  delivery_rate: number;
  total_cost_zar: number;
}

export interface PerformanceData {
  sms_sent: number;
  sms_delivered: number;
  email_sent: number;
  email_delivered: number;
}

export interface CommListItem {
  id: string;
  customer_id: string;
  customer_name: string | null;
  channel: string;
  status: string;
  provider: string;
  content_preview: string | null;
  cost_amount: string | null;
  sent_at: string | null;
  created_at: string;
}

export function useCommMetrics() {
  return useQuery({
    queryKey: ["communications", "metrics"],
    queryFn: () => api.get<CommMetrics>("/api/v1/communication/metrics"),
    refetchInterval: 30_000,
  });
}

export function useCommPerformance() {
  return useQuery({
    queryKey: ["communications", "performance"],
    queryFn: () => api.get<PerformanceData>("/api/v1/communication/performance"),
    refetchInterval: 60_000,
  });
}

export function useCommList() {
  return useQuery({
    queryKey: ["communications", "list"],
    queryFn: () => api.get<CommListItem[]>("/api/v1/communication/list"),
    refetchInterval: 15_000,
  });
}
