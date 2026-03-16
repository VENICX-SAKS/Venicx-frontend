"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber } from "@/lib/utils";
import type { BatchStatus } from "@/hooks/useIngestion";

interface BatchProgressProps {
  batch: BatchStatus;
}

export function BatchProgress({ batch }: BatchProgressProps) {
  const isComplete = batch.status === "completed";
  const isFailed = batch.status === "failed";
  const isActive = !isComplete && !isFailed;

  return (
    <div className="flex flex-col gap-5">
      {/* Status header */}
      <div className="flex items-center gap-3">
        {isComplete && <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />}
        {isFailed && <XCircle className="w-6 h-6 text-error flex-shrink-0" />}
        {isActive && <Loader2 className="w-6 h-6 text-primary animate-spin flex-shrink-0" />}
        <div>
          <p className="text-sm font-medium text-neutral-900">{batch.filename}</p>
          <p className="text-xs text-neutral-500 capitalize mt-0.5">{batch.status}</p>
        </div>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="flex flex-col gap-2">
          <ProgressBar value={batch.progress_percent} />
          <p className="text-xs text-neutral-500">
            Processing row{" "}
            {formatNumber(batch.processed_rows + batch.failed_rows)} of{" "}
            {formatNumber(batch.total_rows ?? 0)}
          </p>
        </div>
      )}

      {/* Result counts */}
      {(isComplete || batch.processed_rows > 0) && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success">
              {formatNumber(batch.created_rows)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">New Records</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {formatNumber(batch.merged_rows)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Merged</p>
          </div>
          <div className="bg-error/5 border border-error/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-error">
              {formatNumber(batch.failed_rows)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Errors</p>
          </div>
        </div>
      )}
    </div>
  );
}
