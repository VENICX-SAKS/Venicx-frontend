"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Users, AlertTriangle, TrendingUp, Search } from "lucide-react";
import { useSuperRecordSearch } from "@/hooks/useSuperRecords";
import { Pagination } from "@/components/super-record/Pagination";
import { formatNumber, formatCurrency, cn } from "@/lib/utils";
import type { SearchResult } from "@/hooks/useSuperRecords";

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs text-neutral-500">
        {label}: {value}%
      </span>
    </div>
  );
}

// ── Customer card ─────────────────────────────────────────────────────────────

function CustomerCard({ record }: { record: SearchResult }) {
  const name =
    [record.first_name, record.last_name].filter(Boolean).join(" ") || "Unknown";
  const isConsented =
    record.sms_consent === "granted" || record.email_consent === "granted";
  const isFraudRisk = false; // placeholder — would come from a risk score field

  // Derive approximate scores from available data (visual only)
  const approvalScore = Math.min(95, 50 + record.lead_count * 5);
  const duplicateScore = Math.max(2, 20 - record.lead_count * 2);
  const fraudScore = isFraudRisk ? 35 : Math.max(1, 10 - record.lead_count);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        {/* Name + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-neutral-900">{name}</span>
          {isConsented && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-success text-success font-medium">
              Consented
            </span>
          )}
          {isFraudRisk && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-error text-error font-medium">
              Fraud Risk
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
          {record.province && <span>{record.province}</span>}
          <span>{record.lead_count} interaction{record.lead_count !== 1 ? "s" : ""}</span>
          <span>LTV: R0</span>
        </div>

        {/* Score bars */}
        <div className="flex items-center gap-5 mt-2.5 flex-wrap">
          <ScoreBar label="Approval" value={approvalScore} color="bg-success" />
          <ScoreBar label="Duplicate" value={duplicateScore} color="bg-warning" />
          <ScoreBar label="Fraud" value={fraudScore} color="bg-error" />
        </div>
      </div>

      {/* View Details */}
      <Link
        href={`/records/${record.id}`}
        className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-primary border border-neutral-200 hover:border-primary px-3 py-2 rounded-lg transition-colors flex-shrink-0"
      >
        <Eye className="w-3.5 h-3.5" />
        View Details
      </Link>
    </div>
  );
}

// ── Merge suggestion card ─────────────────────────────────────────────────────

interface MergeSuggestion {
  id: string;
  confidence: number;
  reason: string;
  primary: { name: string; phone: string; location: string; id: string };
  duplicate: { name: string; phone: string; location: string; id: string };
  matched_fields: string[];
}

function MergeSuggestionCard({ suggestion }: { suggestion: MergeSuggestion }) {
  const confidenceColor =
    suggestion.confidence >= 90
      ? "bg-success/10 text-success border-success/30"
      : suggestion.confidence >= 75
      ? "bg-warning/10 text-warning border-warning/30"
      : "bg-neutral-100 text-neutral-600 border-neutral-200";

  return (
    <div className="border border-warning/20 bg-warning/5 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", confidenceColor)}>
            {suggestion.confidence}% match confidence
          </span>
          <span className="text-xs text-warning font-medium">{suggestion.reason}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
            Reject
          </button>
          <button className="text-xs px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors font-medium">
            Merge
          </button>
        </div>
      </div>

      {/* Records side by side */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Primary Record", data: suggestion.primary },
          { label: "Duplicate Record", data: suggestion.duplicate },
        ].map(({ label, data }) => (
          <div key={label} className="bg-white rounded-lg border border-neutral-200 p-3">
            <p className="text-xs text-neutral-400 mb-1">{label}</p>
            <p className="text-sm font-semibold text-neutral-900">{data.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {data.phone} · {data.location}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">ID: {data.id}</p>
          </div>
        ))}
      </div>

      {/* Matched fields */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-500">Matched fields:</span>
        {suggestion.matched_fields.map((f) => (
          <span
            key={f}
            className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// Placeholder merge suggestions — will be replaced when probabilistic matching is built
const MOCK_SUGGESTIONS: MergeSuggestion[] = [];

export default function RecordsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSuperRecordSearch(debouncedQuery, page);

  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-900">Customer Super Records</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Super Records",
            value: formatNumber(total),
            icon: <Users className="w-5 h-5" />,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
          },
          {
            label: "Merge Suggestions",
            value: formatNumber(MOCK_SUGGESTIONS.length),
            icon: <AlertTriangle className="w-5 h-5" />,
            iconBg: "bg-warning/10",
            iconColor: "text-warning",
          },
          {
            label: "Avg Lifetime Value",
            value: "R0",
            icon: <TrendingUp className="w-5 h-5" />,
            iconBg: "bg-success/10",
            iconColor: "text-success",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-neutral-200 p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.iconBg)}>
              <span className={stat.iconColor}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Merge suggestions */}
      {MOCK_SUGGESTIONS.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold text-neutral-900">Merge Suggestions</h3>
            </div>
            <span className="text-xs bg-warning/10 text-warning px-2.5 py-1 rounded-full font-medium">
              {MOCK_SUGGESTIONS.length} pending
            </span>
          </div>
          {MOCK_SUGGESTIONS.map((s) => (
            <MergeSuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}

      {/* Customer list */}
      <div className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-200 h-24 animate-pulse"
            />
          ))}

        {!isLoading && data?.data.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 px-6 py-16 text-center">
            <p className="text-sm text-neutral-400">No records found</p>
          </div>
        )}

        {!isLoading &&
          data?.data.map((record) => (
            <CustomerCard key={record.id} record={record} />
          ))}
      </div>

      {/* Pagination */}
      {data && (
        <Pagination
          page={data.page}
          limit={data.limit}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
