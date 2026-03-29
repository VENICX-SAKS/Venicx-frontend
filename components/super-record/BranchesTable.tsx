"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MapPin, Phone, Mail, Clock, Star } from "lucide-react";
import { Pagination } from "@/components/super-record/Pagination";

interface BranchRow {
  id: string;
  business_id: string;
  business_name: string | null;
  branch_name: string | null;
  physical_address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  branch_phone: string | null;
  branch_email: string | null;
  branch_manager_name: string | null;
  operating_hours: string | null;
  is_headquarters: boolean;
  created_at: string;
}

export function BranchesTable({ query }: { query: string }) {
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => { setPage(1); }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["branches", query, page],
    queryFn: () =>
      api.get<{ data: BranchRow[]; total: number }>(
        `/api/v1/super-record/branches?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      ),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-neutral-100 animate-pulse">
            <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-neutral-100 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  const branches = data?.data ?? [];

  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 px-6 py-16 text-center">
        <MapPin className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-500">No branches found</p>
        <p className="text-xs text-neutral-400 mt-1">
          {query
            ? `No branches match "${query}"`
            : "Upload a branch file or include branch rows in a business upload"}
        </p>
      </div>
    );
  }

  // Group by business
  const grouped = branches.reduce<Record<string, BranchRow[]>>((acc, b) => {
    const key = b.business_name ?? b.business_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([businessName, branchList]) => (
        <div key={businessName} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Business group header */}
          <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
            <span className="text-base">🏢</span>
            <p className="text-sm font-semibold text-neutral-900">{businessName}</p>
            <span className="text-xs text-neutral-400">
              {branchList.length} branch{branchList.length !== 1 ? "es" : ""}
            </span>
          </div>

          {/* Branch rows */}
          <div className="divide-y divide-neutral-100">
            {branchList.map((branch) => (
              <div key={branch.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 bg-sms/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-sms" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          {branch.branch_name ?? "Unnamed Branch"}
                        </p>
                        {branch.is_headquarters && (
                          <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                            <Star className="w-3 h-3" />
                            HQ
                          </span>
                        )}
                      </div>
                      {branch.physical_address && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {branch.physical_address}
                          {branch.city && `, ${branch.city}`}
                          {branch.province && `, ${branch.province}`}
                          {branch.postal_code && ` ${branch.postal_code}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact + hours */}
                  <div className="flex flex-col gap-1 text-xs text-neutral-500 flex-shrink-0 text-right">
                    {branch.branch_phone && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <Phone className="w-3 h-3" />
                        {branch.branch_phone}
                      </div>
                    )}
                    {branch.branch_email && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <Mail className="w-3 h-3" />
                        {branch.branch_email}
                      </div>
                    )}
                    {branch.branch_manager_name && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>👤</span>
                        {branch.branch_manager_name}
                      </div>
                    )}
                    {branch.operating_hours && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className="w-3 h-3" />
                        {branch.operating_hours}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>
      <Pagination
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
