"use client";

import { useState } from "react";
import { FileText, Table2, Upload, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { FieldMapper } from "@/components/ingestion/FieldMapper";
import { ProcessingPipeline } from "@/components/ingestion/ProcessingPipeline";
import { useBatchList, useUploadFile, useMapFields, useTemplates, useCancelBatch, useRetryBatch } from "@/hooks/useIngestion";
import type { BatchStatus } from "@/hooks/useIngestion";
import { formatNumber } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// Parse CSV headers client-side (first 4KB)
function parseCsvHeaders(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split("\n")[0] ?? "";
      resolve(firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, "")).filter(Boolean));
    };
    reader.onerror = () => resolve([]);
    reader.readAsText(file.slice(0, 4096));
  });
}

// Parse XLSX headers client-side using SheetJS (reads only first row)
async function parseXlsxHeaders(file: File): Promise<string[]> {
  try {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array", sheetRows: 1 });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return [];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    return (rows[0] ?? []).map(String).filter(Boolean);
  } catch {
    return [];
  }
}

// Parse JSON keys client-side — reads first object's keys
function parseJsonKeys(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Try array
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
          resolve(Object.keys(parsed[0]));
          return;
        }
        // Try first line of NDJSON
        const firstLine = text.trim().split("\n")[0];
        const obj = JSON.parse(firstLine);
        if (typeof obj === "object" && obj !== null) {
          resolve(Object.keys(obj));
          return;
        }
      } catch {
        // ignore
      }
      resolve([]);
    };
    reader.onerror = () => resolve([]);
    // Read first 64KB — enough to get keys from first record
    reader.readAsText(file.slice(0, 65536));
  });
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed")
    return <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />;
  if (status === "failed")
    return <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />;
  if (status === "processing")
    return (
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
    );
  // pending / mapping
  return <Clock className="w-5 h-5 text-warning flex-shrink-0" />;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-neutral-900 text-white",
    processing: "border border-neutral-300 text-neutral-600 bg-white",
    pending: "border border-neutral-300 text-neutral-500 bg-white",
    mapping: "border border-warning text-warning bg-warning/5",
    failed: "border border-error text-error bg-error/5",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        styles[status] ?? styles.pending
      )}
    >
      {status}
    </span>
  );
}

function BatchRow({
  batch,
  onClick,
  onCancel,
  onRetry,
  onResumeMapping,
}: {
  batch: BatchStatus;
  onClick: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onResumeMapping: () => void;
}) {
  const progress =
    batch.total_rows && batch.total_rows > 0
      ? Math.round(((batch.processed_rows + batch.failed_rows) / batch.total_rows) * 100)
      : 0;

  const canCancel = ["mapping", "pending", "processing"].includes(batch.status);
  const canRetry = ["failed", "cancelled"].includes(batch.status);
  const canResumeMapping = batch.status === "mapping";

  return (
    <div className="px-5 py-4 flex flex-col gap-2 hover:bg-neutral-50 transition-colors">
      {/* Row 1: icon + filename + badge + actions */}
      <div className="flex items-center gap-3">
        <div className="cursor-pointer flex items-center gap-3 flex-1 min-w-0" onClick={onClick}>
          <StatusIcon status={batch.status} />
          <span className="text-sm font-medium text-neutral-900 truncate">{batch.filename}</span>
          <StatusPill status={batch.status} />
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {canResumeMapping && (
            <button
              onClick={onResumeMapping}
              className="text-xs px-2.5 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors"
            >
              Map Fields
            </button>
          )}
          {canRetry && (
            <button
              onClick={onRetry}
              className="text-xs px-2.5 py-1 rounded-lg border border-success text-success hover:bg-success/5 transition-colors"
            >
              Retry
            </button>
          )}
          {canCancel && (
            <button
              onClick={onCancel}
              className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-500 hover:border-error hover:text-error transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Row 2: meta */}
      <div className="pl-8 text-xs text-neutral-500 flex items-center gap-2">
        <span>{batch.partner_name ?? "—"}</span>
        <span>·</span>
        <span>{formatNumber(batch.total_rows ?? 0)} records</span>
        <span>·</span>
        <span>{formatDate(batch.created_at)}</span>
      </div>

      {/* Row 3: progress bar (processing) */}
      {batch.status === "processing" && (
        <div className="pl-8 flex flex-col gap-1">
          <ProgressBar value={progress} />
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Processing</span>
            <span className="text-primary font-medium">
              {formatNumber(batch.processed_rows + batch.failed_rows)} /{" "}
              {formatNumber(batch.total_rows ?? 0)}
            </span>
          </div>
        </div>
      )}

      {/* Row 3: result counts (completed) */}
      {batch.status === "completed" && (
        <div className="pl-8 flex items-center gap-4 text-xs font-medium">
          <span className="text-success">
            ✓ {formatNumber(batch.created_rows)} valid
          </span>
          <span className="text-primary">
            {formatNumber(batch.merged_rows)} duplicates
          </span>
          {batch.failed_rows > 0 && (
            <span className="text-error">
              {formatNumber(batch.failed_rows)} errors
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function IngestionPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mappingModal, setMappingModal] = useState<{
    batchId: string;
    columns: string[];
  } | null>(null);
  const [pipelineBatchId, setPipelineBatchId] = useState<string | null>(null);

  const { data: batches, refetch: refetchBatches } = useBatchList();
  const { data: templates } = useTemplates();
  const { mutateAsync: uploadFile, isPending: uploading } = useUploadFile();
  const { mutateAsync: mapFields, isPending: mapping } = useMapFields();
  const { mutateAsync: cancelBatch } = useCancelBatch();
  const { mutateAsync: retryBatch } = useRetryBatch();

  const handleFile = async (file: File) => {
    setUploadError(null);
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".csv") && !ext.endsWith(".xlsx") && !ext.endsWith(".json")) {
      setUploadError("Only CSV, XLSX, and JSON files are accepted.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setUploadError("File exceeds the 100MB limit.");
      return;
    }

    try {
      let columns: string[] = [];
      if (ext.endsWith(".csv"))  columns = await parseCsvHeaders(file);
      if (ext.endsWith(".xlsx")) columns = await parseXlsxHeaders(file);
      if (ext.endsWith(".json")) columns = await parseJsonKeys(file);

      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFile(formData);

      refetchBatches();
      setMappingModal({
        batchId: res.batch_id,
        columns: columns.length > 0 ? columns : [],
      });
    } catch (e) {
      setUploadError(e instanceof ApiError ? e.message : "Upload failed. Please try again.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleMapping = async (
    mappings: Record<string, string>,
    partnerName: string,
    saveTemplate?: { name: string }
  ) => {
    if (!mappingModal) return;
    await mapFields({
      batch_id: mappingModal.batchId,
      field_mappings: mappings,
      partner_name: partnerName || undefined,
      save_template: saveTemplate,
    });
    setMappingModal(null);
    refetchBatches();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Upload section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-card">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Upload Data</h2>
        </div>

        {/* Drop zone */}
        <div className="p-5">
          <div
            className={cn(
              "border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-3 transition-colors cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : "border-neutral-200",
              uploading && "opacity-60 cursor-not-allowed"
            )}
            onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={!uploading ? handleDrop : undefined}
            onClick={() => !uploading && document.getElementById("ingest-file-input")?.click()}
          >
            <input
              id="ingest-file-input"
              type="file"
              accept=".csv,.xlsx,.json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            <Upload className="w-8 h-8 text-neutral-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-700">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Supports CSV, Excel (.xlsx), JSON files up to 100MB
              </p>
            </div>
            <Button variant="black" size="sm" loading={uploading}>
              Select File
            </Button>
          </div>

          {uploadError && (
            <p className="mt-3 text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
              {uploadError}
            </p>
          )}
        </div>

        {/* Format type hints */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 border-t border-neutral-100">
          {[
            { icon: <FileText className="w-4 h-4 text-primary" />, label: "CSV Upload", sub: "Bulk lead imports" },
            { icon: <Table2 className="w-4 h-4 text-success" />, label: "Excel Import", sub: "Call centre dumps" },
            { icon: <Upload className="w-4 h-4 text-sms" />, label: "JSON API", sub: "Webhook feeds" },
          ].map((item) => (
            <div key={item.label} className="px-5 py-3 flex items-center gap-3">
              {item.icon}
              <div>
                <p className="text-xs font-medium text-neutral-700">{item.label}</p>
                <p className="text-xs text-neutral-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload history */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-card">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Upload History</h2>
          <button
            className="text-xs text-primary hover:underline disabled:opacity-40"
            disabled={!batches || batches.filter(b => b.status !== "mapping").length === 0}
            onClick={() => {
              const active = batches?.find(b => b.status === "processing" || b.status === "pending")
                ?? batches?.find(b => b.status !== "mapping");
              if (active) setPipelineBatchId(active.id);
            }}
          >
            View Processing Pipeline
          </button>
        </div>

        <div className="divide-y divide-neutral-100">
          {!batches || batches.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-neutral-400">
              No uploads yet — drop a file above to get started
            </div>
          ) : (
            batches.map((batch) => (
              <BatchRow
                key={batch.id}
                batch={batch}
                onClick={() => setPipelineBatchId(batch.id)}
                onCancel={async () => {
                  await cancelBatch(batch.id);
                }}
                onRetry={async () => {
                  const result = await retryBatch(batch.id);
                  if (result.status === "mapping") {
                    setMappingModal({ batchId: batch.id, columns: batch.source_columns ?? [] });
                  }
                }}
                onResumeMapping={() => {
                  setMappingModal({ batchId: batch.id, columns: batch.source_columns ?? [] });
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Field mapping modal */}
      <Modal
        open={!!mappingModal}
        onClose={() => setMappingModal(null)}
        title={mappingModal?.columns.length === 0 ? "Resume Field Mapping" : "Map Fields"}
        className="max-w-2xl"
      >
        {mappingModal && (
          <FieldMapper
            sourceColumns={mappingModal.columns}
            templates={templates ?? []}
            onSubmit={handleMapping}
            loading={mapping}
          />
        )}
      </Modal>

      {/* Processing pipeline modal */}
      <Modal
        open={!!pipelineBatchId}
        onClose={() => setPipelineBatchId(null)}
        title="Processing Pipeline"
        className="max-w-3xl"
      >
        {pipelineBatchId && <ProcessingPipeline batchId={pipelineBatchId} />}
      </Modal>
    </div>
  );
}
