// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "operator" | "viewer";
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

export type BatchStatus = "pending" | "mapping" | "processing" | "completed" | "failed";

export interface IngestionBatch {
  id: string;
  filename: string;
  file_type: string;
  partner_name: string | null;
  status: BatchStatus;
  record_type?: "customer" | "business";
  total_rows: number | null;
  processed_rows: number;
  failed_rows: number;
  created_rows: number;
  merged_rows: number;
  created_at: string;
  completed_at: string | null;
  created_by_email?: string;
}

export interface MappingTemplate {
  id: string;
  name: string;
  partner_name: string | null;
  field_mappings: Record<string, string>;
  created_at: string;
}

// ─── Super Records ────────────────────────────────────────────────────────────

export interface SuperRecord {
  customer_id: string;
  identity: {
    msisdn_last4: string | null;
    email_domain: string | null;
    has_national_id: boolean;
  };
  demographics: {
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address_line_1: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string | null;
  };
  consent: {
    sms: ConsentStatus;
    email: ConsentStatus;
  };
  lead_history: LeadHistoryEntry[];
  communication_history: CommunicationHistoryEntry[];
  merge_history: MergeHistoryEntry[];
  timeline: TimelineEvent[];
}

export interface ConsentStatus {
  status: string | null;
  granted_at: string | null;
  revoked_at: string | null;
}

export interface LeadHistoryEntry {
  batch_id: string;
  filename: string;
  partner_name: string | null;
  ingested_at: string;
  merge_action: string | null;
}

export interface CommunicationHistoryEntry {
  id: string;
  channel: string;
  status: string;
  provider: string;
  sent_at: string | null;
  delivered_at: string | null;
  cost_amount: string | null;
  cost_currency: string | null;
}

export interface MergeHistoryEntry {
  merge_type: string;
  match_field: string | null;
  confidence_score: number | null;
  decision: string;
  merged_at: string;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  source: string | null;
  created_at: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  total_super_records: number;
  leads_ingested_today: number;
  leads_ingested_this_week: number;
  duplicate_merge_rate: number;
  sms_sent_last_7_days: number;
  email_engagement_rate: number;
  avg_data_completeness: number;
  // Previous period for change calculation
  total_super_records_prev: number;
  leads_ingested_prev_week: number;
  sms_sent_prev_7_days: number;
}

export interface DailyActivityPoint {
  date: string;
  records: number;
  uploads: number;
}

export interface DailyCommunicationPoint {
  date: string;
  sms: number;
  email: number;
}

// ─── Communications ───────────────────────────────────────────────────────────

export interface CommunicationMetrics {
  sms_sent: number;
  emails_sent: number;
  delivery_rate: number;
  total_cost_zar: number;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
