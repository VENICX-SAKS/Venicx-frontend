"use client";

import { useState, useEffect } from "react";
import { useSuperRecordSearch } from "@/hooks/useSuperRecords";
import { RecordSearchBar } from "@/components/super-record/RecordSearchBar";
import { RecordsTable } from "@/components/super-record/RecordsTable";
import { Pagination } from "@/components/super-record/Pagination";
import { formatNumber } from "@/lib/utils";

export default function RecordsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSuperRecordSearch(debouncedQuery, page);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Super Records</h2>
          {data && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {formatNumber(data.total)} total record{data.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <RecordSearchBar value={query} onChange={setQuery} />

      <RecordsTable records={data?.data ?? []} isLoading={isLoading} />

      {data && (
        <Pagination
          page={data.page}
          limit={data.limit}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
