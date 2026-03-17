import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "operator" | "viewer";
  is_active: boolean;
  created_at: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  partner_name: string | null;
  field_mappings: Record<string, string>;
  created_at: string;
  created_by_email: string | null;
}

export interface SystemInfo {
  version: string;
  environment: string;
  database_status: string;
  total_customers: number;
  total_ingestion_batches: number;
  total_communications: number;
  webhook_urls: { smsportal: string; sendgrid: string };
}

export function useUsers() {
  return useQuery({
    queryKey: ["settings", "users"],
    queryFn: () => api.get<UserRow[]>("/api/v1/settings/users"),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; full_name: string; role: string; password: string }) =>
      api.post("/api/v1/settings/users/invite", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: string; is_active?: boolean; full_name?: string }) =>
      api.put(`/api/v1/settings/users/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "users"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { current_password: string; new_password: string }) =>
      api.post("/api/v1/settings/change-password", body),
  });
}

export function useSettingsTemplates() {
  return useQuery({
    queryKey: ["settings", "templates"],
    queryFn: () => api.get<TemplateRow[]>("/api/v1/settings/templates"),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/settings/templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "templates"] }),
  });
}

export function useSystemInfo() {
  return useQuery({
    queryKey: ["settings", "system"],
    queryFn: () => api.get<SystemInfo>("/api/v1/settings/system"),
  });
}
