"use client";

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import type { DailyActivityPoint, DailyCommunicationPoint } from "@/types";

interface ActivityChartsProps {
  dailyRecords: DailyActivityPoint[];
  dailyCommunications: DailyCommunicationPoint[];
  isLoading: boolean;
}

export function ActivityCharts({ dailyRecords, dailyCommunications, isLoading }: ActivityChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 h-72 animate-pulse" />
        <div className="bg-white rounded-xl border border-neutral-200 h-72 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Records & Uploads line chart */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-semibold text-neutral-700 mb-3">Records & Uploads (7 days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyRecords} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="records"
                name="Records"
                stroke="#3B5BFF"
                strokeWidth={2}
                dot={{ fill: "#3B5BFF", r: 4 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="uploads"
                name="Uploads"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 4 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SMS & Email bar chart */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-semibold text-neutral-700 mb-3">Communications (7 days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyCommunications} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
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
              <Legend
                iconType="square"
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar dataKey="sms" name="SMS" fill="#8B5CF6" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="email" name="Email" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
