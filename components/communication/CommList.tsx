"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/super-record/Pagination";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useCommList } from "@/hooks/useCommunications";

export function CommList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCommList(page);
  const items = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-neutral-900">Recent Communications</h3>
      </CardHeader>
      <div className="divide-y divide-neutral-100">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="h-4 bg-neutral-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/3" />
            </div>
          ))}

        {!isLoading && items.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-neutral-400">
            No communications yet
          </div>
        )}

        {!isLoading &&
          items.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.channel === "sms" ? "bg-[#EDE9FE]" : "bg-[#D1FAE5]"
              }`}>
                {item.channel === "sms"
                  ? <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                  : <Mail className="w-4 h-4 text-[#10B981]" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.customer_name ? (
                    <Link
                      href={`/records/${item.customer_id}`}
                      className="text-sm font-medium text-neutral-900 hover:text-primary truncate"
                    >
                      {item.customer_name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-neutral-900">Unknown</span>
                  )}
                  <StatusBadge status={item.status} />
                </div>
                {item.content_preview && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{item.content_preview}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-xs text-neutral-400">
                    {item.sent_at ? formatDate(item.sent_at) : formatDate(item.created_at)}
                    {" · "}{item.provider}
                  </p>
                  {item.provider_message_id && (
                    <p className="text-xs text-neutral-300 font-mono truncate max-w-[140px]">
                      ID: {item.provider_message_id}
                    </p>
                  )}
                  {item.delivered_at && (
                    <p className="text-xs text-success">
                      Delivered {formatDate(item.delivered_at)}
                    </p>
                  )}
                  {item.failed_reason && (
                    <p className="text-xs text-error truncate max-w-[200px]" title={item.failed_reason}>
                      {item.failed_reason}
                    </p>
                  )}
                </div>
              </div>

              {item.cost_amount && (
                <span className="text-xs text-neutral-500 flex-shrink-0">
                  {formatCurrency(parseFloat(item.cost_amount), "ZAR")}
                </span>
              )}
            </div>
          ))}
      </div>

      {data && (
        <div className="px-6 py-4 border-t border-neutral-100">
          <Pagination
            page={data.page}
            limit={data.limit}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      )}
    </Card>
  );
}
