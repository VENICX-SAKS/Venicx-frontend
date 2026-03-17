"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useSystemInfo } from "@/hooks/useSettings";
import { formatNumber } from "@/lib/utils";

export function SystemTab() {
  const { data: info, isLoading } = useSystemInfo();

  if (isLoading) {
    return <div className="bg-white rounded-xl border border-neutral-200 h-48 animate-pulse" />;
  }

  const stats = [
    { label: "Total Super Records",      value: formatNumber(info?.total_customers ?? 0) },
    { label: "Total Ingestion Batches",  value: formatNumber(info?.total_ingestion_batches ?? 0) },
    { label: "Total Communications",     value: formatNumber(info?.total_communications ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-neutral-900">System Status</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Version</span>
              <span className="font-mono text-neutral-900">{info?.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Environment</span>
              <span className="capitalize font-medium text-neutral-900">{info?.environment}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-neutral-500">Database</span>
              <div className="flex items-center gap-1.5">
                {info?.database_status === "connected" ? (
                  <><CheckCircle className="w-4 h-4 text-success" /><span className="text-success text-xs font-medium">Connected</span></>
                ) : (
                  <><XCircle className="w-4 h-4 text-error" /><span className="text-error text-xs font-medium">Error</span></>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-neutral-900">Usage Stats</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {stats.map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-neutral-500">{s.label}</span>
                <span className="font-semibold text-neutral-900">{s.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
