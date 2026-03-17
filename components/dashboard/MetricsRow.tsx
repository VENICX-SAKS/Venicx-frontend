import { MetricCard } from "@/components/ui/MetricCard";
import { Users, TrendingUp, ShieldCheck, MessageSquare } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";

interface MetricsRowProps {
  data: DashboardMetrics | undefined;
  isLoading: boolean;
}

function pctChange(current: number, previous: number): { label: string; positive: boolean } | null {
  if (previous === 0) return current > 0 ? { label: "New this period", positive: true } : null;
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return {
    label: `${sign}${change.toFixed(1)}% vs last period`,
    positive: change >= 0,
  };
}

export function MetricsRow({ data, isLoading }: MetricsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const recordsChange = data
    ? pctChange(data.total_super_records, data.total_super_records_prev)
    : null;
  const weekChange = data
    ? pctChange(data.leads_ingested_this_week, data.leads_ingested_prev_week)
    : null;
  const smsChange = data
    ? pctChange(data.sms_sent_last_7_days, data.sms_sent_prev_7_days)
    : null;

  const metrics = [
    {
      label: "Total Super Records",
      value: formatNumber(data?.total_super_records ?? 0),
      icon: <Users className="w-5 h-5" />,
      iconBg: "bg-[#EEF1FF]",
      iconColor: "text-[#3B5BFF]",
      change: recordsChange?.label,
      changePositive: recordsChange?.positive,
    },
    {
      label: "Ingested This Week",
      value: formatNumber(data?.leads_ingested_this_week ?? 0),
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
      change: weekChange?.label,
      changePositive: weekChange?.positive,
    },
    {
      label: "Duplicate Merge Rate",
      value: formatPercent(data?.duplicate_merge_rate ?? 0),
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      label: "SMS Sent (7 days)",
      value: formatNumber(data?.sms_sent_last_7_days ?? 0),
      icon: <MessageSquare className="w-5 h-5" />,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#8B5CF6]",
      change: smsChange?.label,
      changePositive: smsChange?.positive,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
