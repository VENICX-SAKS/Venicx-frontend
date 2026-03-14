import { MetricCard } from "@/components/ui/MetricCard";
import { Users, TrendingUp, GitMerge, MessageSquare, BarChart2 } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";

interface MetricsRowProps {
  data: DashboardMetrics | undefined;
  isLoading: boolean;
}

export function MetricsRow({ data, isLoading }: MetricsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Super Records",
      value: formatNumber(data?.total_super_records ?? 0),
      icon: <Users className="w-5 h-5" />,
      iconBg: "bg-[#EEF1FF]",
      iconColor: "text-[#3B5BFF]",
    },
    {
      label: "Leads Ingested Today",
      value: formatNumber(data?.leads_ingested_today ?? 0),
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
    },
    {
      label: "Leads This Week",
      value: formatNumber(data?.leads_ingested_this_week ?? 0),
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-[#D1FAE5]",
      iconColor: "text-[#10B981]",
    },
    {
      label: "Duplicate Merge Rate",
      value: formatPercent(data?.duplicate_merge_rate ?? 0),
      icon: <GitMerge className="w-5 h-5" />,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      label: "SMS Sent (7 days)",
      value: formatNumber(data?.sms_sent_last_7_days ?? 0),
      icon: <MessageSquare className="w-5 h-5" />,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#8B5CF6]",
    },
    {
      label: "Email Engagement Rate",
      value: formatPercent(data?.email_engagement_rate ?? 0),
      icon: <BarChart2 className="w-5 h-5" />,
      iconBg: "bg-[#D1FAE5]",
      iconColor: "text-[#10B981]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
