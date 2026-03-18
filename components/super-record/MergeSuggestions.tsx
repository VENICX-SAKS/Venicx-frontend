"use client";

import { useState } from "react";
import { GitMerge, CheckCircle, XCircle, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  useMergeSuggestions,
  useConfirmMerge,
  useRejectMerge,
} from "@/hooks/useMergeSuggestions";
import type { MergeSuggestion } from "@/hooks/useMergeSuggestions";
import { formatDate } from "@/lib/utils";

function CandidateCard({
  candidate,
  label,
}: {
  candidate: MergeSuggestion["source"];
  label: string;
}) {
  const name =
    [candidate.first_name, candidate.last_name].filter(Boolean).join(" ") || "Unknown";

  return (
    <div className="flex-1 bg-neutral-50 rounded-xl p-4 border border-neutral-200">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-sm font-semibold text-neutral-900 mb-3">{name}</p>
      <div className="space-y-1.5">
        {candidate.date_of_birth && (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Calendar className="w-3 h-3 text-neutral-400" />
            {candidate.date_of_birth}
          </div>
        )}
        {(candidate.city || candidate.province) && (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <MapPin className="w-3 h-3 text-neutral-400" />
            {[candidate.city, candidate.province].filter(Boolean).join(", ")}
          </div>
        )}
        {candidate.msisdn_last4 && (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Phone className="w-3 h-3 text-neutral-400" />
            ···{candidate.msisdn_last4}
          </div>
        )}
        {candidate.email_domain && (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Mail className="w-3 h-3 text-neutral-400" />
            @{candidate.email_domain}
          </div>
        )}
        <div className="text-xs text-neutral-400 pt-0.5">
          {candidate.lead_count} lead{candidate.lead_count !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: MergeSuggestion }) {
  const { mutate: confirm, isPending: confirming } = useConfirmMerge();
  const { mutate: reject, isPending: rejecting } = useRejectMerge();
  const [decided, setDecided] = useState<"confirmed" | "rejected" | null>(null);

  const confidencePct = Math.round(suggestion.confidence_score * 100);
  const confidenceColor =
    confidencePct >= 80
      ? "text-error"
      : confidencePct >= 70
      ? "text-warning"
      : "text-neutral-600";
  const barColor =
    confidencePct >= 80 ? "bg-error" : confidencePct >= 70 ? "bg-warning" : "bg-neutral-400";

  if (decided === "confirmed") {
    return (
      <div className="border border-success/30 bg-success/5 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
        <p className="text-sm text-success font-medium">
          Merge confirmed — records combined
        </p>
      </div>
    );
  }

  if (decided === "rejected") {
    return (
      <div className="border border-neutral-200 bg-neutral-50 rounded-xl p-4 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-neutral-400 flex-shrink-0" />
        <p className="text-sm text-neutral-500">
          Merge rejected — kept as separate records
        </p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 bg-white rounded-xl p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-sm font-medium text-neutral-900">Possible Duplicate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Similarity</span>
          <span className={`text-sm font-bold ${confidenceColor}`}>{confidencePct}%</span>
          <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Side-by-side candidates */}
      <div className="flex gap-3 mb-4">
        <CandidateCard candidate={suggestion.source} label="Record A (New)" />
        <div className="flex items-center justify-center px-1 text-neutral-300 text-xl select-none">
          ⟷
        </div>
        <CandidateCard candidate={suggestion.target} label="Record B (Existing)" />
      </div>

      <p className="text-xs text-neutral-400 mb-3">
        Flagged {formatDate(suggestion.created_at)} · No matching phone, email, or national ID
        found
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          loading={confirming}
          onClick={() =>
            confirm(suggestion.merge_log_id, {
              onSuccess: () => setDecided("confirmed"),
            })
          }
        >
          <CheckCircle className="w-4 h-4" />
          Confirm Merge
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={rejecting}
          onClick={() =>
            reject(suggestion.merge_log_id, {
              onSuccess: () => setDecided("rejected"),
            })
          }
        >
          <XCircle className="w-4 h-4" />
          Keep Separate
        </Button>
      </div>
    </div>
  );
}

export function MergeSuggestions() {
  const { data: suggestions, isLoading } = useMergeSuggestions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Spinner className="w-6 h-6" />
        </CardContent>
      </Card>
    );
  }

  const pending = suggestions ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-sm font-semibold text-neutral-900">Merge Suggestions</h3>
          </div>
          {pending.length > 0 && (
            <span className="text-xs bg-warning/10 text-warning font-medium px-2 py-0.5 rounded-full">
              {pending.length} pending
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <div className="text-center py-8">
            <GitMerge className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No merge suggestions</p>
            <p className="text-xs text-neutral-300 mt-1">
              Records that may be duplicates will appear here for review
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((s) => (
              <SuggestionCard key={s.merge_log_id} suggestion={s} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
