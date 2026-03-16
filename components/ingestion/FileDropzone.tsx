"use client";

import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  loading?: boolean;
}

export function FileDropzone({ onFile, loading }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const ext = file.name.toLowerCase();
      if (!ext.endsWith(".csv") && !ext.endsWith(".xlsx") && !ext.endsWith(".json")) {
        setError("Only CSV, XLSX, and JSON files are accepted.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("File exceeds the 100MB limit.");
        return;
      }
      setSelectedFile(file);
      onFile(file);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-neutral-200 bg-white",
          !loading && "hover:border-primary hover:bg-primary/5",
          loading && "opacity-60 cursor-not-allowed"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={!loading ? handleDrop : undefined}
        onClick={() => !loading && document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!loading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setError(null);
                }}
                className="text-xs text-neutral-400 hover:text-error flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Drop your file here, or{" "}
                <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-neutral-400 mt-1">CSV, XLSX, or JSON · Max 100MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
