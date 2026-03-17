"use client";

import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import type { PerformanceData } from "@/hooks/useCommunications";

interface PerformanceChartProps {
  data: PerformanceData | undefined;
  isLoading: boolean;
}

export function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
  const chartData = [
    { name: "SMS",   Sent: data?.sms_sent ?? 0,   Delivered: data?.sms_delivered ?? 0 },
    { name: "Email", Sent: data?.email_sent ?? 0, Delivered: data?.email_delivered ?? 0 },
  ];

  if (isLoading) {
    return <div className="bg-white rounded-xl border border-neutral-200 h-72 animate-pulse" />;
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Communication Performance</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            barCategoryGap="35%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Bar dataKey="Sent"      fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            <Bar dataKey="Delivered" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
