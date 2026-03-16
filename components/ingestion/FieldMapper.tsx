"use client";

import { useState, useEffect } from "react";
import {
  CANONICAL_FIELDS,
  IDENTITY_FIELDS,
  REQUIRED_FIELD_NOTE,
} from "@/lib/canonical-fields";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { MappingTemplate } from "@/hooks/useIngestion";

interface FieldMapperProps {
  sourceColumns: string[];
  templates: MappingTemplate[];
  onSubmit: (
    mapping: Record<string, string>,
    partnerName: string,
    saveTemplate?: { name: string }
  ) => void;
  loading?: boolean;
}

// Auto-guess canonical field from column name
const CANONICAL_NAMES = new Set([
  "first_name", "last_name", "date_of_birth", "gender", "msisdn", "email",
  "national_id", "address_line_1", "address_line_2", "city", "province",
  "postal_code", "consent_sms", "consent_email",
]);

const FIELD_ALIASES: Record<string, string[]> = {
  first_name:    ["first_name", "firstname", "first name", "fname", "given_name"],
  last_name:     ["last_name", "lastname", "last name", "lname", "surname", "family_name"],
  msisdn:        ["msisdn", "phone", "mobile", "cell", "cellphone", "phone_number", "phone number", "contact_number", "telephone"],
  email:         ["email", "email_address", "email address", "e-mail", "emailaddress"],
  national_id:   ["national_id", "id_number", "id_no", "id number", "identity_number", "sa_id"],
  date_of_birth: ["date_of_birth", "date of birth", "dob", "birthdate", "birth_date", "birthday"],
  address_line_1:["address_line_1", "address line 1", "address_line1", "address1", "address", "street", "street_address"],
  address_line_2:["address_line_2", "address line 2", "address_line2", "address2", "suburb"],
  city:          ["city", "town"],
  province:      ["province", "state", "region"],
  postal_code:   ["postal_code", "postal code", "postcode", "zip", "zip_code"],
  consent_sms:   ["consent_sms", "sms_consent", "sms consent", "sms_opt_in"],
  consent_email: ["consent_email", "email_consent", "email consent", "email_opt_in"],
};

function guessMapping(col: string): string {
  const lower = col.toLowerCase().replace(/\s+/g, "_");
  // Exact canonical name match first
  if (CANONICAL_NAMES.has(lower)) return lower;
  // Alias matching
  for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((alias) => lower === alias || lower.includes(alias) || alias.includes(lower))) {
      return canonical;
    }
  }
  return "[ignore]";
}

export function FieldMapper({
  sourceColumns,
  templates,
  onSubmit,
  loading,
}: FieldMapperProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [partnerName, setPartnerName] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    const guessed: Record<string, string> = {};
    sourceColumns.forEach((col) => {
      guessed[col] = guessMapping(col);
    });
    const timer = setTimeout(() => setMappings(guessed), 0);
    return () => clearTimeout(timer);
  }, [sourceColumns]);

  const loadTemplate = (template: MappingTemplate) => {
    const newMappings: Record<string, string> = {};
    sourceColumns.forEach((col) => {
      newMappings[col] = template.field_mappings[col] ?? "[ignore]";
    });
    setMappings(newMappings);
    if (template.partner_name) setPartnerName(template.partner_name);
  };

  const hasIdentityMapped = IDENTITY_FIELDS.some((f) =>
    Object.values(mappings).includes(f)
  );

  const handleSubmit = () => {
    if (!hasIdentityMapped) return;
    onSubmit(
      mappings,
      partnerName,
      saveAsTemplate && templateName ? { name: templateName } : undefined
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Template loader */}
      {templates.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-neutral-600">Load template:</span>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t)}
              className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Partner name */}
      <Input
        label="Partner / Source Name (optional)"
        placeholder="e.g. LenderXYZ"
        value={partnerName}
        onChange={(e) => setPartnerName(e.target.value)}
      />

      {/* Identity field validation */}
      {!hasIdentityMapped ? (
        <div className="flex items-start gap-2 text-sm text-warning bg-warning/5 border border-warning/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{REQUIRED_FIELD_NOTE}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-success bg-success/5 border border-success/20 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Identity field mapped — ready to process</span>
        </div>
      )}

      {/* Mapping table */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 bg-neutral-50 px-4 py-2 border-b border-neutral-200">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Source Column
          </span>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Maps to
          </span>
        </div>
        <div className="divide-y divide-neutral-100">
          {sourceColumns.map((col) => (
            <div key={col} className="grid grid-cols-2 gap-4 px-4 py-3 items-center">
              <span className="text-sm font-mono text-neutral-700 truncate">{col}</span>
              <select
                value={mappings[col] ?? "[ignore]"}
                onChange={(e) =>
                  setMappings((prev) => ({ ...prev, [col]: e.target.value }))
                }
                className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CANONICAL_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Save as template */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-neutral-600">Save this mapping as a template</span>
        </label>
        {saveAsTemplate && (
          <Input
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        )}
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        loading={loading}
        disabled={!hasIdentityMapped}
        className="self-start"
      >
        Start Processing
      </Button>
    </div>
  );
}
