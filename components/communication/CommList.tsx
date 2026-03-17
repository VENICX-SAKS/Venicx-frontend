import Link from "next/link";
import { MessageSquare, Mail } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { CommListItem } from "@/hooks/useCommunications";

interface CommListProps {
  items: CommListItem[];
  isLoading: boolean;
}

export function CommList({ items, isLoading }: CommListProps) {
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
                <p className="text-xs text-neutral-400 mt-0.5">
                  {item.sent_at ? formatDate(item.sent_at) : formatDate(item.created_at)}
                  {" · "}{item.provider}
                </p>
              </div>

              {item.cost_amount && (
                <span className="text-xs text-neutral-500 flex-shrink-0">
                  {formatCurrency(parseFloat(item.cost_amount), "ZAR")}
                </span>
              )}
            </div>
          ))}
      </div>
    </Card>
  );
}
