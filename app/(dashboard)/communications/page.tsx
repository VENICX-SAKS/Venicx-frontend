"use client";

import { useCommMetrics, useCommPerformance, useCommList } from "@/hooks/useCommunications";
import { CommMetricsRow } from "@/components/communication/CommMetricsRow";
import { ActionCards } from "@/components/communication/ActionCards";
import { PerformanceChart } from "@/components/communication/PerformanceChart";
import { CommList } from "@/components/communication/CommList";

export default function CommunicationsPage() {
  const { data: metrics, isLoading: metricsLoading } = useCommMetrics();
  const { data: performance, isLoading: performanceLoading } = useCommPerformance();
  const { data: list, isLoading: listLoading } = useCommList();

  return (
    <div className="flex flex-col gap-5">
      <CommMetricsRow data={metrics} isLoading={metricsLoading} />
      <ActionCards />
      <PerformanceChart data={performance} isLoading={performanceLoading} />
      <CommList items={list ?? []} isLoading={listLoading} />
    </div>
  );
}
