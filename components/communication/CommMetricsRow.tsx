import { MessageSquare, Mail, BarChart2, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber, formatPercent, formatCurrency } from "@/lib/utils";
import type { CommMetrics } from "@/hooks/useCommunications";

interface CommMetricsRowProps {
  data: CommMetrics | undefined;
  isLoading: boolean;
}

export function CommMetricsRow({ data, isLoading }: CommMetricsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "SMS Sent",
      value: formatNumber(data?.sms_sent ?? 0),
      icon: <MessageSquare className="w-5 h-5" />,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#8B5CF6]",
    },
    {
      label: "Emails Sent",
      value: formatNumber(data?.emails_sent ?? 0),
      icon: <Mail className="w-5 h-5" />,
      iconBg: "bg-[#D1FAE5]",
      iconColor: "text-[#10B981]",
    },
    {
      label: "Delivery Rate",
      value: formatPercent(data?.delivery_rate ?? 0),
      icon: <BarChart2 className="w-5 h-5" />,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
    },
    {
      label: "Total Cost (ZAR)",
      value: formatCurrency(data?.total_cost_zar ?? 0, "ZAR"),
      icon: <DollarSign className="w-5 h-5" />,
      iconBg: "bg-[#EEF1FF]",
      iconColor: "text-[#3B5BFF]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
