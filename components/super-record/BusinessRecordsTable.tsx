"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Building2, Globe, Mail, MapPin, Hash } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BusinessRow {
  id: string;
  business_name: string | null;
  registration_number: string | null;
  industry: string | null;
  city: string | null;
  province: string | null;
  business_email: string | null;
  website: string | null;
  created_at: string;
}

interface BusinessResponse {
  data: BusinessRow[];
  total: number;
  page: number;
  limit: number;
}

export function BusinessRecordsTable({ query }: { query: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["businesses", query],
    queryFn: () =>
      api.get<BusinessResponse>(
        `/api/v1/super-record/businesses?q=${encodeURIComponent(query)}&page=1&limit=20`
      ),
    placeholderData: (prev) => prev,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-neutral-100 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-100 rounded-lg" />
              <div>
                <div className="h-4 bg-neutral-100 rounded w-40 mb-1.5" />
                <div className="h-3 bg-neutral-100 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const businesses = data?.data ?? [];

  if (businesses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 px-6 py-16 text-center">
        <Building2 className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-500">No business records found</p>
        <p className="text-xs text-neutral-400 mt-1">
          {query
            ? `No businesses match "${query}"`
            : "Upload a business file from the Data Ingestion page"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200">
        <span className="col-span-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Business</span>
        <span className="col-span-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Industry</span>
        <span className="col-span-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">Location</span>
        <span className="col-span-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Contact</span>
        <span className="col-span-1 text-xs font-medium text-neutral-500 uppercase tracking-wide">Added</span>
      </div>

      <div className="divide-y divide-neutral-100">
        {businesses.map((b) => (
          <Link key={b.id} href={`/records/business/${b.id}`} className="block">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-neutral-50 transition-colors cursor-pointer">
            {/* Business name + reg number */}
            <div className="md:col-span-4 flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{b.business_name ?? "—"}</p>
                {b.registration_number && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Hash className="w-3 h-3 text-neutral-400" />
                    <p className="text-xs text-neutral-400 truncate">{b.registration_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Industry */}
            <div className="md:col-span-2">
              {b.industry ? (
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full font-medium">
                  {b.industry}
                </span>
              ) : (
                <span className="text-sm text-neutral-300">—</span>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              {b.city || b.province ? (
                <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{[b.city, b.province].filter(Boolean).join(", ")}</span>
                </div>
              ) : (
                <span className="text-sm text-neutral-300">—</span>
              )}
            </div>

            {/* Contact */}
            <div className="md:col-span-3 flex flex-col gap-1 min-w-0">
              {b.business_email && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 min-w-0">
                  <Mail className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{b.business_email}</span>
                </div>
              )}
              {b.website && (
                <div className="flex items-center gap-1.5 text-xs min-w-0">
                  <Globe className="w-3 h-3 text-primary flex-shrink-0" />
                  <a
                    href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {b.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {!b.business_email && !b.website && <span className="text-sm text-neutral-300">—</span>}
            </div>

            {/* Date */}
            <div className="md:col-span-1">
              <p className="text-xs text-neutral-400">{formatDate(b.created_at)}</p>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
