import Link from "next/link";
import { Upload } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber } from "@/lib/utils";
import type { IngestionBatch } from "@/types";

interface RecentUploadsProps {
  batches: IngestionBatch[];
  isLoading: boolean;
}

export function RecentUploads({ batches, isLoading }: RecentUploadsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Recent Uploads</h2>
          <Link href="/ingestion" className="text-sm text-[#3B5BFF] hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <div className="divide-y divide-neutral-100">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/3" />
            </div>
          ))}

        {!isLoading && batches.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-neutral-400">
            No uploads yet
          </div>
        )}

        {!isLoading &&
          batches.map((batch) => {
            const progress =
              batch.total_rows && batch.total_rows > 0
                ? Math.round((batch.processed_rows / batch.total_rows) * 100)
                : 0;

            return (
              <div key={batch.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-neutral-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 truncate">
                      {batch.filename}
                    </span>
                    <StatusBadge status={batch.status} />
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {batch.partner_name ?? "—"} · {formatNumber(batch.total_rows ?? 0)} records
                  </p>
                  {batch.created_by_email && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Uploaded by {batch.created_by_email} · {batch.created_at}
                    </p>
                  )}
                  {batch.status === "processing" && (
                    <ProgressBar value={progress} className="mt-2 w-48" />
                  )}
                </div>

                <div className="text-right text-xs flex-shrink-0">
                  {batch.status === "completed" && (
                    <div className="flex gap-3">
                      <span className="text-[#16A34A] font-medium">
                        {formatNumber(batch.created_rows)} valid
                      </span>
                      <span className="text-[#3B5BFF] font-medium">
                        {formatNumber(batch.merged_rows)} duplicates
                      </span>
                      {batch.failed_rows > 0 && (
                        <span className="text-[#DC2626] font-medium">
                          {formatNumber(batch.failed_rows)} errors
                        </span>
                      )}
                    </div>
                  )}
                  {batch.status === "processing" && (
                    <span className="text-neutral-400">{progress}% complete</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
}
