"use client";

import Link from "next/link";
import { Phone, Mail, CreditCard, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/hooks/useSuperRecords";

function ConsentBadge({ status, label }: { status: string | null; label: string }) {
  return (
    <span className={cn(
      "text-xs px-2 py-0.5 rounded-full font-medium",
      status === "granted" ? "bg-success/10 text-success" :
      status === "revoked" ? "bg-error/10 text-error" :
      "bg-neutral-100 text-neutral-400"
    )}>
      {label}
    </span>
  );
}

interface RecordsTableProps {
  records: SearchResult[];
  isLoading: boolean;
}

export function RecordsTable({ records, isLoading }: RecordsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-neutral-100 animate-pulse">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-neutral-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 px-6 py-16 text-center">
        <p className="text-sm text-neutral-400">No records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Desktop header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200">
        <span className="col-span-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Name</span>
        <span className="col-span-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Identity</span>
        <span className="col-span-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Location</span>
        <span className="col-span-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Consent</span>
        <span className="col-span-1 text-xs font-medium text-neutral-500 uppercase tracking-wide">Leads</span>
        <span className="col-span-1" />
      </div>

      <div className="divide-y divide-neutral-100">
        {records.map((r) => {
          const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "Unknown";
          const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

          return (
            <Link
              key={r.id}
              href={`/records/${r.id}`}
              className="flex md:grid md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 items-center hover:bg-neutral-50 transition-colors group"
            >
              {/* Avatar + name */}
              <div className="md:col-span-3 flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
                  <p className="text-xs text-neutral-400">{r.lead_count} lead{r.lead_count !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Identity — hidden on mobile */}
              <div className="hidden md:flex md:col-span-3 items-center gap-1.5 flex-wrap">
                {r.msisdn_last4 && (
                  <span className="flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                    <Phone className="w-3 h-3" />···{r.msisdn_last4}
                  </span>
                )}
                {r.email_domain && (
                  <span className="flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                    <Mail className="w-3 h-3" />@{r.email_domain.split(".")[0]}
                  </span>
                )}
                {r.has_national_id && (
                  <span className="flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                    <CreditCard className="w-3 h-3" />ID
                  </span>
                )}
              </div>

              {/* Location — hidden on mobile */}
              <div className="hidden md:block md:col-span-2">
                <p className="text-sm text-neutral-700 truncate">{r.city ?? "—"}</p>
                <p className="text-xs text-neutral-400 truncate">{r.province ?? ""}</p>
              </div>

              {/* Consent — hidden on mobile */}
              <div className="hidden md:flex md:col-span-2 gap-1.5">
                <ConsentBadge status={r.sms_consent} label="SMS" />
                <ConsentBadge status={r.email_consent} label="Email" />
              </div>

              {/* Lead count — hidden on mobile */}
              <div className="hidden md:block md:col-span-1">
                <span className="text-sm text-neutral-700">{formatNumber(r.lead_count)}</span>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 md:col-span-1 flex justify-end">
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
