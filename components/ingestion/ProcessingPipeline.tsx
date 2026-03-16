"use client";

import { Database, Filter, ShieldCheck, Layers, GitMerge, Users } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useBatchStatus } from "@/hooks/useIngestion";
import type { BatchStatus } from "@/hooks/useIngestion";

// ── Pipeline stage definitions ────────────────────────────────────────────────

interface Stage {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: Stage[] = [
  { id: 1, label: "Raw Storage",        description: "File uploaded to object storage",  icon: <Database className="w-4 h-4" /> },
  { id: 2, label: "Parser",             description: "File structure validated",          icon: <Filter className="w-4 h-4" /> },
  { id: 3, label: "Validation",         description: "Field validation & type checking",  icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 4, label: "Normalisation",      description: "Convert to canonical schema",       icon: <Layers className="w-4 h-4" /> },
  { id: 5, label: "Duplicate Detection",description: "Match against super records",       icon: <GitMerge className="w-4 h-4" /> },
  { id: 6, label: "Super Record Merge", description: "Create or update customer records", icon: <Users className="w-4 h-4" /> },
];

// Derive which stage is active from batch status + progress
function getActiveStage(batch: BatchStatus): number {
  if (batch.status === "mapping")    return 0; // not started
  if (batch.status === "pending")    return 1;
  if (batch.status === "failed")     return 0;
  if (batch.status === "completed")  return 7; // all done

  // processing — estimate stage from progress
  const pct = batch.progress_percent;
  if (pct < 15) return 1;
  if (pct < 30) return 2;
  if (pct < 50) return 3;
  if (pct < 65) return 4;
  if (pct < 80) return 5;
  return 6;
}

type StageState = "done" | "active" | "pending";

function stageState(stageId: number, activeStage: number): StageState {
  if (stageId < activeStage)  return "done";
  if (stageId === activeStage) return "active";
  return "pending";
}

// ── Log line builder ──────────────────────────────────────────────────────────

function buildLogs(batch: BatchStatus): { level: "INFO" | "WARN" | "ERROR"; text: string }[] {
  const logs: { level: "INFO" | "WARN" | "ERROR"; text: string }[] = [];
  const ts = new Date(batch.created_at).toISOString().replace("T", " ").slice(0, 19);

  logs.push({ level: "INFO",  text: `[${ts}] [INFO] Upload received: ${batch.filename}${batch.total_rows ? ` (${formatNumber(batch.total_rows)} records)` : ""}` });

  if (batch.status === "pending" || batch.status === "processing" || batch.status === "completed") {
    logs.push({ level: "INFO", text: `[${ts}] [INFO] File stored in GCS: uploads/${batch.id}/${batch.filename}` });
  }

  if (batch.status === "processing" || batch.status === "completed") {
    const ext = batch.filename.split(".").pop()?.toUpperCase() ?? "FILE";
    logs.push({ level: "INFO", text: `[${ts}] [INFO] ${ext} parser completed: ${formatNumber(batch.total_rows ?? 0)} valid objects` });

    if (batch.partner_name) {
      logs.push({ level: "INFO", text: `[${ts}] [INFO] Schema mapping applied for partner: ${batch.partner_name}` });
    }

    if (batch.processed_rows > 0) {
      logs.push({ level: "INFO", text: `[${ts}] [INFO] Validation in progress: ${formatNumber(batch.processed_rows)} / ${formatNumber(batch.total_rows ?? 0)} records validated` });
    }

    if (batch.failed_rows > 0) {
      logs.push({ level: "WARN", text: `[${ts}] [WARNING] ${formatNumber(batch.failed_rows)} records failed validation` });
    }

    if (batch.merged_rows > 0) {
      logs.push({ level: "INFO", text: `[${ts}] [INFO] ${formatNumber(batch.merged_rows)} duplicate records merged into existing super records` });
    }
  }

  if (batch.status === "completed") {
    logs.push({ level: "INFO", text: `[${ts}] [INFO] Processing complete. Created: ${formatNumber(batch.created_rows)}, Merged: ${formatNumber(batch.merged_rows)}, Failed: ${formatNumber(batch.failed_rows)}` });
  }

  if (batch.status === "processing") {
    logs.push({ level: "INFO", text: `[${ts}] [INFO] Processing continues...` });
  }

  if (batch.status === "failed") {
    logs.push({ level: "ERROR", text: `[${ts}] [ERROR] Batch processing failed. Check server logs for details.` });
  }

  return logs;
}

// ── Stage row ─────────────────────────────────────────────────────────────────

function StageRow({ stage, state, batch }: { stage: Stage; state: StageState; batch: BatchStatus }) {
  const isActive = state === "active";
  const isDone   = state === "done";

  // Records count to show on the right
  const recordCount = isDone || isActive
    ? stage.id <= 2 ? batch.total_rows
    : stage.id === 3 ? batch.processed_rows
    : stage.id >= 5 ? batch.merged_rows
    : batch.processed_rows
    : null;

  return (
    <div className={cn(
      "px-5 py-4 border-b border-neutral-100 last:border-0 transition-colors",
      isActive && "bg-primary/5 border-l-2 border-l-primary"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
            isDone   && "bg-success/10 text-success",
            isActive && "bg-primary/10 text-primary",
            state === "pending" && "bg-neutral-100 text-neutral-400"
          )}>
            {isDone
              ? <span className="text-success text-sm">✓</span>
              : stage.icon}
          </div>

          {/* Label + description */}
          <div>
            <p className={cn(
              "text-sm font-medium",
              isDone   && "text-neutral-700",
              isActive && "text-neutral-900",
              state === "pending" && "text-neutral-400"
            )}>
              Step {stage.id}: {stage.label}
              {isActive && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Active
                </span>
              )}
            </p>
            <p className={cn(
              "text-xs mt-0.5",
              state === "pending" ? "text-neutral-300" : "text-neutral-500"
            )}>
              {stage.description}
            </p>

            {/* Active stage progress */}
            {isActive && batch.total_rows && batch.total_rows > 0 && (
              <div className="mt-2 flex flex-col gap-1 w-64">
                <ProgressBar value={batch.progress_percent} />
                <p className="text-xs text-primary">
                  Processing... {formatNumber(batch.processed_rows)} of {formatNumber(batch.total_rows)} records validated
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right side: record count */}
        <div className="text-right flex-shrink-0">
          {recordCount != null && recordCount > 0 ? (
            <>
              <p className={cn("text-sm font-medium", isDone ? "text-neutral-700" : "text-primary")}>
                {formatNumber(recordCount)} records
              </p>
              <p className="text-xs text-neutral-400">—</p>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-300">—</p>
              <p className="text-xs text-neutral-300">—</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ProcessingPipelineProps {
  batchId: string;
}

export function ProcessingPipeline({ batchId }: ProcessingPipelineProps) {
  const { data: batch } = useBatchStatus(batchId, true);

  if (!batch) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeStage = getActiveStage(batch);
  const overallProgress = batch.status === "completed" ? 100 : batch.progress_percent;
  const logs = buildLogs(batch);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Processing Pipeline</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Real-time view of data processing stages</p>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-neutral-900">Upload: {batch.filename}</p>
          <span className="text-xs text-primary capitalize">{batch.status === "completed" ? "Complete" : "Processing..."}</span>
        </div>
        <ProgressBar value={overallProgress} className="h-2.5" />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-neutral-500">
            Stage {Math.min(activeStage, 6)} of 6
          </p>
          <p className="text-xs text-neutral-500">{Math.round(overallProgress)}% complete</p>
        </div>
      </div>

      {/* Stage list */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-card overflow-hidden">
        {STAGES.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            state={stageState(stage.id, activeStage)}
            batch={batch}
          />
        ))}
      </div>

      {/* Processing logs */}
      <div>
        <p className="text-sm font-semibold text-neutral-900 mb-3">Processing Logs</p>
        <div className="bg-[#0d1117] rounded-xl p-4 font-mono text-xs leading-6 min-h-40 max-h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={cn(
              log.level === "INFO"  && "text-[#58a6ff]",
              log.level === "WARN"  && "text-[#e3b341]",
              log.level === "ERROR" && "text-[#f85149]",
            )}>
              {log.text}
            </div>
          ))}
          <div className="text-neutral-600 animate-pulse">▋</div>
        </div>
      </div>
    </div>
  );
}
