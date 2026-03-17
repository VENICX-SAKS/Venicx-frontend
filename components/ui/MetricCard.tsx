import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  change?: string;
  changePositive?: boolean;
}

export function MetricCard({ label, value, icon, iconBg, iconColor, change, changePositive }: MetricCardProps) {
  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs lg:text-sm text-neutral-500 truncate">{label}</span>
          <span className="text-2xl lg:text-3xl font-bold text-neutral-900">{value}</span>
          {change && (
            <span className={cn("text-xs font-medium", changePositive ? "text-[#16A34A]" : "text-error")}>
              {change}
            </span>
          )}
        </div>
        <div className={cn("w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}
