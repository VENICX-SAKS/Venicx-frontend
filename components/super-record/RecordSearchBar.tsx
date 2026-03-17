"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordSearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function RecordSearchBar({ value, onChange }: RecordSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, city, phone last 4, or email domain..."
        className={cn(
          "w-full pl-9 pr-9 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "placeholder:text-neutral-400"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
