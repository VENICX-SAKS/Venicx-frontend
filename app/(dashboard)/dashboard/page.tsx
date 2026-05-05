"use client";

import { useDashboardMetrics, useDashboardActivity, useRecentUploads } from "@/hooks/useDashboard";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { ActivityCharts } from "@/components/dashboard/ActivityCharts";
import { RecentUploads } from "@/components/dashboard/RecentUploads";

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();
  const { data: batches, isLoading: batchesLoading } = useRecentUploads();

  return (
    <div className="flex flex-col gap-5">
      <MetricsRow data={metrics} isLoading={metricsLoading} />
      <ActivityCharts
        dailyRecords={activity?.daily_records ?? []}
        dailyCommunications={activity?.daily_communications ?? []}
        isLoading={activityLoading}
      />
      <RecentUploads
        batches={batches ?? []}
        isLoading={batchesLoading}
      />
    </div>
  );
}
