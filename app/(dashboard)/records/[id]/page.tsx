"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, CreditCard, MapPin,
  User, GitMerge, MessageSquare, Clock,
} from "lucide-react";
import { useSuperRecord } from "@/hooks/useSuperRecords";
import { ConsentPanel } from "@/components/super-record/ConsentPanel";
import { Timeline } from "@/components/super-record/Timeline";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: record, isLoading } = useSuperRecord(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Record not found</p>
        <Link href="/records" className="text-primary text-sm mt-2 inline-block hover:underline">
          Back to records
        </Link>
      </div>
    );
  }

  const fullName =
    [record.demographics.first_name, record.demographics.last_name].filter(Boolean).join(" ") ||
    "Unknown";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <Link
        href="/records"
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to records
      </Link>

      {/* Header */}
      <Card className="p-5 lg:p-6">
        <div className="flex items-start gap-4 lg:gap-5">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg lg:text-xl font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg lg:text-xl font-bold text-neutral-900">{fullName}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {record.identity.msisdn_last4 && (
                <span className="flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                  <Phone className="w-3 h-3" /> ···{record.identity.msisdn_last4}
                </span>
              )}
              {record.identity.email_domain && (
                <span className="flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                  <Mail className="w-3 h-3" /> @{record.identity.email_domain}
                </span>
              )}
              {record.identity.has_national_id && (
                <span className="flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                  <CreditCard className="w-3 h-3" /> National ID on file
                </span>
              )}
              {record.demographics.city && (
                <span className="flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {record.demographics.city}
                  {record.demographics.province && `, ${record.demographics.province}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main content — stacks on mobile, 2-col on desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
        {/* Left / main column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Demographics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-neutral-900">Demographics</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {([
                  ["First Name", record.demographics.first_name],
                  ["Last Name", record.demographics.last_name],
                  ["Date of Birth", record.demographics.date_of_birth],
                  ["Gender", record.demographics.gender],
                  ["Address", record.demographics.address_line_1],
                  ["City", record.demographics.city],
                  ["Province", record.demographics.province],
                  ["Postal Code", record.demographics.postal_code],
                  ["Country", record.demographics.country],
                ] as [string, string | null][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-neutral-400">{label}</p>
                    <p className="text-sm text-neutral-900 mt-0.5">{value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead history */}
          {record.lead_history.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-neutral-900">Lead History</h3>
              </CardHeader>
              <div className="divide-y divide-neutral-100">
                {record.lead_history.map((lead, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{lead.filename}</p>
                      <p className="text-xs text-neutral-500">
                        {lead.partner_name ?? "Unknown partner"} · {formatDate(lead.ingested_at)}
                      </p>
                    </div>
                    {lead.merge_action && (
                      <StatusBadge
                        status={
                          lead.merge_action === "created"
                            ? "success"
                            : lead.merge_action.startsWith("merged")
                            ? "processing"
                            : "pending"
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Communication history */}
          {record.communication_history.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-900">Communication History</h3>
                </div>
              </CardHeader>
              <div className="divide-y divide-neutral-100">
                {record.communication_history.map((comm) => (
                  <div key={comm.id} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        comm.channel === "sms" ? "bg-[#8B5CF6]" : "bg-[#10B981]"
                      }`}>
                        {comm.channel === "sms" ? "S" : "E"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 capitalize">{comm.channel}</p>
                        <p className="text-xs text-neutral-500">
                          {comm.sent_at ? formatDate(comm.sent_at) : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {comm.cost_amount && (
                        <span className="text-xs text-neutral-500">
                          {formatCurrency(parseFloat(comm.cost_amount), comm.cost_currency ?? "ZAR")}
                        </span>
                      )}
                      <StatusBadge status={comm.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Merge history */}
          {record.merge_history.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-900">Merge History</h3>
                </div>
              </CardHeader>
              <div className="divide-y divide-neutral-100">
                {record.merge_history.map((merge, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 capitalize">
                        {merge.merge_type} match
                        {merge.match_field && ` on ${merge.match_field}`}
                      </p>
                      <p className="text-xs text-neutral-500">{formatDate(merge.merged_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {merge.confidence_score != null && (
                        <span className="text-xs text-neutral-500">
                          {(merge.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                      )}
                      <StatusBadge status={merge.decision} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right / sidebar column */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-neutral-900">Consent</h3>
            </CardHeader>
            <CardContent>
              <ConsentPanel customerId={record.customer_id} consent={record.consent} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-neutral-900">Timeline</h3>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline events={record.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
