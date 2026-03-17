"use client";

import { Trash2, FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSettingsTemplates, useDeleteTemplate } from "@/hooks/useSettings";
import { formatDate } from "@/lib/utils";

export function TemplatesTab() {
  const { data: templates, isLoading } = useSettingsTemplates();
  const { mutate: deleteTemplate, isPending } = useDeleteTemplate();

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-neutral-900">Mapping Templates</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Saved field mappings from past ingestion uploads</p>
      </CardHeader>
      <div className="divide-y divide-neutral-100">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-neutral-100 rounded w-1/4" />
          </div>
        ))}
        {!isLoading && templates?.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-neutral-400">No saved templates yet</div>
        )}
        {!isLoading && templates?.map(t => (
          <div key={t.id} className="px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{t.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.partner_name && `${t.partner_name} · `}
                  {Object.keys(t.field_mappings).length} fields ·{" "}
                  {formatDate(t.created_at)}
                  {t.created_by_email && ` · ${t.created_by_email}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost" size="sm" loading={isPending}
              onClick={() => { if (confirm(`Delete template "${t.name}"?`)) deleteTemplate(t.id); }}
            >
              <Trash2 className="w-4 h-4 text-error" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
