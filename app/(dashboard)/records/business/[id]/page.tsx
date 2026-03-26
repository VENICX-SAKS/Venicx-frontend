"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ArrowLeft, Building2, MapPin, Globe, Mail, Phone,
  Hash, Users, TrendingUp, Clock, Star,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { formatDate, formatNumber } from "@/lib/utils";

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

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: business, isLoading: loadingBusiness } = useQuery({
    queryKey: ["business", id],
    queryFn: () => api.get<any>(`/api/v1/super-record/businesses/${id}`),
  });

  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ["business-branches", id],
    queryFn: () => api.get<BranchRow[]>(`/api/v1/super-record/businesses/${id}/branches`),
  });

  if (loadingBusiness) {
    return <div className="animate-pulse h-64 bg-white rounded-xl border border-neutral-200" />;
  }

  if (!business) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {business.business_name ?? "—"}
            </h2>
            {business.industry && (
              <p className="text-sm text-neutral-500">{business.industry}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left — business details */}
        <div className="col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-neutral-900">Business Details</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-sm">
                {business.registration_number && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">Registration</p>
                      <p className="text-neutral-900">{business.registration_number}</p>
                    </div>
                  </div>
                )}
                {business.vat_number && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">VAT Number</p>
                      <p className="text-neutral-900">{business.vat_number}</p>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">Website</p>
                      <a
                        href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {business.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
                {business.business_email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">Email</p>
                      <p className="text-neutral-900">{business.business_email}</p>
                    </div>
                  </div>
                )}
                {business.business_phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">Phone</p>
                      <p className="text-neutral-900">{business.business_phone}</p>
                    </div>
                  </div>
                )}
                {(business.city || business.province) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400">Location</p>
                      <p className="text-neutral-900">
                        {[business.city, business.province].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(business.num_employees || business.annual_turnover) && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-neutral-900">Business Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {business.num_employees && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Users className="w-4 h-4" />
                        Employees
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatNumber(business.num_employees)}
                      </p>
                    </div>
                  )}
                  {business.annual_turnover && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <TrendingUp className="w-4 h-4" />
                        Annual Turnover
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">
                        R{formatNumber(business.annual_turnover)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — branches */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">Branches & Locations</h3>
            {branches && branches.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {branches.length}
              </span>
            )}
          </div>

          {loadingBranches && (
            <div className="bg-white rounded-xl border border-neutral-200 h-32 animate-pulse" />
          )}

          {!loadingBranches && (!branches || branches.length === 0) && (
            <div className="bg-white rounded-xl border border-neutral-200 px-6 py-12 text-center">
              <MapPin className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No branches recorded</p>
              <p className="text-xs text-neutral-300 mt-1">
                Upload a branch file linked to this business to add locations
              </p>
            </div>
          )}

          {!loadingBranches && branches && branches.length > 0 && (
            <div className="flex flex-col gap-3">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-sms/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-sms" />
                      </div>
                      <div>
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
                            {[branch.physical_address, branch.city, branch.province, branch.postal_code]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {branch.branch_phone && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <Phone className="w-3 h-3" />{branch.branch_phone}
                            </span>
                          )}
                          {branch.branch_email && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <Mail className="w-3 h-3" />{branch.branch_email}
                            </span>
                          )}
                          {branch.operating_hours && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <Clock className="w-3 h-3" />{branch.operating_hours}
                            </span>
                          )}
                        </div>
                        {branch.branch_manager_name && (
                          <p className="text-xs text-neutral-400 mt-1">
                            Manager: {branch.branch_manager_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 flex-shrink-0">
                      {formatDate(branch.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
