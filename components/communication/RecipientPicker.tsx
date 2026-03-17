"use client";

import { useState, useEffect } from "react";
import { Search, X, Users, CheckCircle } from "lucide-react";
import { useSuperRecordSearch } from "@/hooks/useSuperRecords";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/hooks/useSuperRecords";

export type AudienceMode = "all" | "consent" | "selected";

interface RecipientPickerProps {
  channel: "sms" | "email";
  mode: AudienceMode;
  onModeChange: (mode: AudienceMode) => void;
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
}

export function RecipientPicker({
  channel,
  mode,
  onModeChange,
  selectedIds,
  onSelectedChange,
}: RecipientPickerProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data } = useSuperRecordSearch(debouncedSearch, 1);
  const results = data?.data ?? [];

  const consentField = channel === "sms" ? "sms_consent" : "email_consent";

  const toggle = (id: string) => {
    onSelectedChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  const modes: { value: AudienceMode; label: string; desc: string }[] = [
    { value: "all",      label: "All Records",     desc: "Every active super record" },
    { value: "consent",  label: "Consented Only",  desc: `Only those with ${channel} consent granted` },
    { value: "selected", label: "Select Manually", desc: "Pick specific customers" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={cn(
              "text-left p-3 rounded-xl border text-sm transition-colors",
              mode === m.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}
          >
            <p className="font-medium">{m.label}</p>
            <p className="text-xs mt-0.5 text-neutral-500">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Manual selection */}
      {mode === "selected" && (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          {/* Search */}
          <div className="px-3 py-2 border-b border-neutral-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-neutral-400"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Selected count */}
          {selectedIds.length > 0 && (
            <div className="px-3 py-2 bg-primary/5 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => onSelectedChange([])}
                className="text-xs text-neutral-500 hover:text-error"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results */}
          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-50">
            {results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-neutral-400">
                {debouncedSearch ? "No customers found" : "Type to search customers"}
              </div>
            )}
            {results.map((r: SearchResult) => {
              const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "Unknown";
              const hasConsent = r[consentField as keyof SearchResult] === "granted";
              const isSelected = selectedIds.includes(r.id);

              return (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-neutral-300"
                  )}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {r.city ?? "—"} · {r.lead_count} lead{r.lead_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                    hasConsent ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-400"
                  )}>
                    {hasConsent ? "Consented" : "No consent"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {mode !== "selected" && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2">
          <Users className="w-3.5 h-3.5" />
          {mode === "all"
            ? "Will send to all active super records (consent still enforced server-side)"
            : `Will send only to customers with ${channel} consent granted`}
        </div>
      )}
    </div>
  );
}
