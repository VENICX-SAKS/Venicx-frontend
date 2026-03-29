"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Eye, Users, AlertCircle, Search, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatNumber, cn } from "@/lib/utils";

const DEFAULT_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent when a new lead is created",
    subject: "Welcome to VeniCX",
    content: `Hello {{first_name}},\n\nThank you for your interest in our services. We're excited to help you with your financial needs.\n\nYour application is being reviewed and we'll be in touch soon.\n\nBest regards,\nThe VeniCX Team`,
  },
  {
    id: "consent",
    name: "Consent Confirmation",
    description: "Confirm opt-in consent",
    subject: "Confirm Your Marketing Preferences",
    content: `Hello {{first_name}},\n\nWe want to confirm your marketing communication preferences.\n\nBy clicking the link below you confirm you are happy to receive communications from VeniCX.\n\n{{application_url}}\n\nBest regards,\nThe VeniCX Team`,
  },
  {
    id: "reminder",
    name: "Application Reminder",
    description: "Reminder for incomplete applications",
    subject: "Complete Your Application",
    content: `Hello {{first_name}},\n\nWe noticed your application is incomplete. Please log in to complete it.\n\n{{application_url}}\n\nBest regards,\nThe VeniCX Team`,
  },
  {
    id: "docs",
    name: "Document Request",
    description: "Request supporting documents",
    subject: "Documents Required",
    content: `Hello {{first_name}},\n\nTo proceed with your application we require some supporting documents.\n\nPlease visit the link below to upload them:\n\n{{application_url}}\n\nBest regards,\nThe VeniCX Team`,
  },
];

const AUDIENCE_OPTIONS = [
  { value: "customers_with_consent", label: "Customers with email consent" },
  { value: "all_customers",          label: "All customers (with stored email)" },
  { value: "customers_by_province",  label: "Customers by province" },
  { value: "all_businesses",         label: "All businesses" },
  { value: "businesses_by_industry", label: "Businesses by industry" },
  { value: "all_branches",           label: "All branches" },
  { value: "both",                   label: "Customers + businesses + branches" },
  { value: "selected_recipients",    label: "Select specific recipients" },
];

const BUSINESS_RECIPIENT_OPTIONS = [
  { value: "business", label: "Business contact only" },
  { value: "branches", label: "All branch contacts" },
  { value: "both",     label: "Business + all branches" },
];

const EMAIL_VARIABLES = [
  "{{first_name}}", "{{last_name}}",
  "{{email}}", "{{customer_id}}",
  "{{province}}", "{{application_url}}",
  "{{display_name}}",
];

const SAMPLE = {
  first_name: "John", last_name: "Doe",
  email: "john@example.com", customer_id: "VCX-001",
  province: "Gauteng", application_url: "https://app.venicx.com/apply/VCX-001",
  display_name: "John Doe",
};

function renderWithSample(text: string) {
  return text
    .replace(/{{first_name}}/g, SAMPLE.first_name)
    .replace(/{{last_name}}/g, SAMPLE.last_name)
    .replace(/{{email}}/g, SAMPLE.email)
    .replace(/{{customer_id}}/g, SAMPLE.customer_id)
    .replace(/{{province}}/g, SAMPLE.province)
    .replace(/{{application_url}}/g, SAMPLE.application_url)
    .replace(/{{display_name}}/g, SAMPLE.display_name);
}

const needsBusinessRecipientType = (audience: string) =>
  ["all_businesses", "businesses_by_industry", "both"].includes(audience);

// ── Recipient picker ──────────────────────────────────────────────────────────

interface SelectedRecipient {
  id: string;
  type: "customer" | "business";
  name: string;
  contact: string;
}

function RecipientPicker({
  selected,
  onChange,
}: {
  selected: SelectedRecipient[];
  onChange: (r: SelectedRecipient[]) => void;
}) {
  const [tab, setTab] = useState<"customers" | "businesses">("customers");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: customerData } = useQuery({
    queryKey: ["email-picker-customers", debounced],
    queryFn: () =>
      api.get<{ data: Array<{ id: string; first_name: string | null; last_name: string | null; email_domain: string | null; city: string | null }> }>(
        `/api/v1/super-record/search?q=${encodeURIComponent(debounced)}&limit=30`
      ),
    enabled: tab === "customers",
  });

  const { data: businessData } = useQuery({
    queryKey: ["email-picker-businesses", debounced],
    queryFn: () =>
      api.get<{ data: Array<{ id: string; business_name: string | null; business_email: string | null; city: string | null }> }>(
        `/api/v1/super-record/businesses?q=${encodeURIComponent(debounced)}&limit=30`
      ),
    enabled: tab === "businesses",
  });

  const toggle = (r: SelectedRecipient) => {
    const exists = selected.find(s => s.id === r.id);
    onChange(exists ? selected.filter(s => s.id !== r.id) : [...selected, r]);
  };

  const isSelected = (id: string) => selected.some(s => s.id === id);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex border-b border-neutral-200">
        {(["customers", "businesses"] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); }}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors capitalize",
              tab === t ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-b border-neutral-100 flex items-center gap-2">
        <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-neutral-400"
        />
        {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-neutral-400" /></button>}
      </div>

      {selected.length > 0 && (
        <div className="px-3 py-2 bg-primary/5 border-b border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-primary font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />{selected.length} selected
          </span>
          <button onClick={() => onChange([])} className="text-xs text-neutral-500 hover:text-error">Clear all</button>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto divide-y divide-neutral-50">
        {tab === "customers" && (customerData?.data ?? []).map(c => {
          const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown";
          const sel = isSelected(c.id);
          return (
            <button key={c.id} onClick={() => toggle({ id: c.id, type: "customer", name, contact: c.email_domain ? `@${c.email_domain}` : "No email" })}
              className={cn("w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors", sel && "bg-primary/5")}>
              <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0", sel ? "bg-primary border-primary" : "border-neutral-300")}>
                {sel && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
                <p className="text-xs text-neutral-500">{c.city ?? "—"} · {c.email_domain ? `@${c.email_domain}` : "No email"}</p>
              </div>
            </button>
          );
        })}

        {tab === "businesses" && (businessData?.data ?? []).map(b => {
          const name = b.business_name ?? "Unknown";
          const sel = isSelected(b.id);
          return (
            <button key={b.id} onClick={() => toggle({ id: b.id, type: "business", name, contact: b.business_email ?? "No email" })}
              className={cn("w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors", sel && "bg-primary/5")}>
              <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0", sel ? "bg-primary border-primary" : "border-neutral-300")}>
                {sel && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
                <p className="text-xs text-neutral-500">{b.city ?? "—"} · {b.business_email ?? "No email"}</p>
              </div>
            </button>
          );
        })}

        {((tab === "customers" && (customerData?.data ?? []).length === 0) ||
          (tab === "businesses" && (businessData?.data ?? []).length === 0)) && (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            {debounced ? `No ${tab} found` : `Type to search ${tab}`}
          </div>
        )}
      </div>
    </div>
  );
}

interface PreviewResult {
  estimated_recipients: number;
  customer_count: number;
  business_count: number;
  branch_count: number;
  estimated_cost: number;
}

interface CampaignQueued {
  campaign_id: string;
  status: string;
  total_recipients: number;
  message: string;
}

export default function EmailCampaignPage() {
  const [selected, setSelected] = useState(DEFAULT_TEMPLATES[0]);
  const [subject, setSubject] = useState(DEFAULT_TEMPLATES[0].subject);
  const [content, setContent] = useState(DEFAULT_TEMPLATES[0].content);
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [audience, setAudience] = useState("customers_with_consent");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [businessRecipientType, setBusinessRecipientType] = useState("business");
  const [selectedRecipients, setSelectedRecipients] = useState<SelectedRecipient[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [queued, setQueued] = useState<CampaignQueued | null>(null);
  const [sendError, setSendError] = useState("");
  const [testEmailSent, setTestEmailSent] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const buildPayload = () => ({
    name: selected.name,
    channel: "email",
    audience_type: audience === "selected_recipients"
      ? (selectedRecipients.some(r => r.type === "customer") && selectedRecipients.some(r => r.type === "business") ? "both"
        : selectedRecipients.some(r => r.type === "business") ? "all_businesses" : "all_customers")
      : audience,
    audience_filter:
      audience === "customers_by_province" ? { province: provinceFilter } :
      audience === "businesses_by_industry" ? { industry: industryFilter } :
      null,
    business_recipient_type: needsBusinessRecipientType(audience) ? businessRecipientType : null,
    message_content: content.replace(/\n/g, "<br>"),
    email_subject: subject,
    selected_customer_ids: audience === "selected_recipients"
      ? selectedRecipients.filter(r => r.type === "customer").map(r => r.id)
      : undefined,
    selected_business_ids: audience === "selected_recipients"
      ? selectedRecipients.filter(r => r.type === "business").map(r => r.id)
      : undefined,
  });

  const { mutateAsync: sendCampaign, isPending: sending } = useMutation({
    mutationFn: (body: ReturnType<typeof buildPayload>) =>
      api.post<CampaignQueued>("/api/v1/communication/campaigns", body),
  });

  const { mutateAsync: sendTestEmail, isPending: testSending } = useMutation({
    mutationFn: (body: { to_email: string; subject: string; html_body: string }) =>
      api.post("/api/v1/communication/email/test", body),
  });

  const handlePreview = async () => {
    if (audience === "selected_recipients") {
      setPreview({
        estimated_recipients: selectedRecipients.length,
        customer_count: selectedRecipients.filter(r => r.type === "customer").length,
        business_count: selectedRecipients.filter(r => r.type === "business").length,
        branch_count: 0,
        estimated_cost: 0,
      });
      return;
    }
    setPreviewing(true);
    setSendError("");
    try {
      const result = await api.post<PreviewResult>(
        "/api/v1/communication/campaigns/preview",
        buildPayload()
      );
      setPreview(result);
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSendCampaign = async () => {
    setSendError("");
    try {
      const res = await sendCampaign(buildPayload());
      setQueued(res);
      setShowConfirm(false);
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : "Failed to send campaign");
      setShowConfirm(false);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) return;
    try {
      await sendTestEmail({
        to_email: user.email,
        subject,
        html_body: content.replace(/\n/g, "<br>"),
      });
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : "Failed to send test email");
    }
  };

  const selectTemplate = (t: typeof DEFAULT_TEMPLATES[0]) => {
    setSelected(t);
    setSubject(t.subject);
    setContent(t.content);
    setPreview(null);
  };

  const insertVariable = (variable: string) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newContent = content.slice(0, start) + variable + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const renderedSubject = renderWithSample(subject);
  const renderedContent = renderWithSample(content);

  if (queued) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <Send className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">Campaign Dispatched!</h2>
        <p className="text-sm text-neutral-500 text-center">
          Sending to <strong>{formatNumber(queued.total_recipients)}</strong> recipients in the background.
        </p>
        <Link href="/communications">
          <Button variant="primary">Back to Communications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/communications">
            <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50">
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Email Campaign</h2>
            <p className="text-sm text-neutral-500">SendGrid Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" loading={previewing} disabled={!subject || !content} onClick={handlePreview}>
            <Eye className="w-4 h-4" />
            Preview Recipients
          </Button>
          <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={!subject || !content}>
            <Send className="w-4 h-4" />
            Send Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left — templates list */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-1">Templates</p>
          {DEFAULT_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t)}
              className={`text-left p-4 rounded-xl border transition-colors ${
                selected.id === t.id
                  ? "border-primary bg-primary/5"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <p className={`text-sm font-semibold ${selected.id === t.id ? "text-primary" : "text-neutral-900"}`}>
                {t.name}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>
            </button>
          ))}

          {/* Audience + preview summary */}
          {preview && (
            <div className="border border-neutral-200 rounded-xl p-4 bg-white flex flex-col gap-2">
              <p className="text-xs font-semibold text-neutral-700">Recipients</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xl font-bold text-neutral-900">{formatNumber(preview.estimated_recipients)}</p>
              </div>
              <div className="text-xs text-neutral-400 space-y-0.5">
                {preview.customer_count > 0 && <p>👤 {formatNumber(preview.customer_count)} customers</p>}
                {preview.business_count > 0 && <p>🏢 {formatNumber(preview.business_count)} businesses</p>}
                {preview.branch_count > 0 && <p>📍 {formatNumber(preview.branch_count)} branches</p>}
              </div>
            </div>
          )}

          <div className="border border-neutral-200 rounded-xl p-4 bg-white">
            <p className="text-sm font-semibold text-neutral-900 mb-1">Email Provider</p>
            <p className="text-xs text-neutral-500 mb-3">SendGrid — open & click tracking enabled</p>
            <Link href="/settings">
              <Button variant="secondary" size="sm">Configure</Button>
            </Link>
          </div>
        </div>

        {/* Right — editor */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card>
            <CardContent className="py-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-900">Edit: {selected.name}</h3>

              <Input
                label="Email Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">Email Content</label>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-700 mb-1">Template Variables</p>
                <p className="text-xs text-blue-600 mb-3">Click to insert at cursor:</p>
                <div className="grid grid-cols-2 gap-2">
                  {EMAIL_VARIABLES.map(v => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="text-left text-xs font-mono bg-white border border-blue-200 rounded-lg px-3 py-2 hover:border-blue-400 hover:bg-blue-50 transition-colors text-neutral-700"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience selector */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral-700">Target Audience</label>
                  <select
                    value={audience}
                    onChange={e => { setAudience(e.target.value); setPreview(null); setSelectedRecipients([]); }}
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {AUDIENCE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {audience === "customers_by_province" && (
                  <Input
                    label="Province"
                    placeholder="e.g., KwaZulu-Natal"
                    value={provinceFilter}
                    onChange={e => { setProvinceFilter(e.target.value); setPreview(null); }}
                  />
                )}

                {audience === "businesses_by_industry" && (
                  <Input
                    label="Industry"
                    placeholder="e.g., Healthcare"
                    value={industryFilter}
                    onChange={e => { setIndustryFilter(e.target.value); setPreview(null); }}
                  />
                )}

                {needsBusinessRecipientType(audience) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">Send to</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUSINESS_RECIPIENT_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          onClick={() => { setBusinessRecipientType(o.value); setPreview(null); }}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            businessRecipientType === o.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {audience === "selected_recipients" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">
                      Select Recipients
                      {selectedRecipients.length > 0 && (
                        <span className="ml-2 text-xs text-primary font-normal">{selectedRecipients.length} selected</span>
                      )}
                    </label>
                    <RecipientPicker selected={selectedRecipients} onChange={setSelectedRecipients} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Email Preview</h3>
                <Button variant="secondary" size="sm" loading={testSending} onClick={handleTestEmail}>
                  {testEmailSent ? "Sent!" : `Send Test to ${user?.email ?? "me"}`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit mb-4">
                {(["desktop", "mobile"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                      previewTab === tab
                        ? "bg-white text-neutral-900 shadow-sm font-medium"
                        : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={`border border-neutral-200 rounded-xl overflow-hidden ${
                previewTab === "mobile" ? "max-w-sm mx-auto" : "w-full"
              }`}>
                <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 text-xs text-neutral-500 space-y-0.5">
                  <p><span className="font-medium">From:</span> VeniCX &lt;noreply@venicx.com&gt;</p>
                  <p><span className="font-medium">To:</span> John Doe &lt;john@example.com&gt;</p>
                  <p><span className="font-medium">Subject:</span> {renderedSubject}</p>
                </div>
                <div className="bg-white px-8 py-6">
                  <div className="mb-6">
                    <span className="text-lg font-bold text-primary">VeniCX</span>
                  </div>
                  <div className="text-sm text-neutral-700 whitespace-pre-wrap mb-8 leading-relaxed">
                    {renderedContent}
                  </div>
                  <div className="border-t border-neutral-200 pt-4 text-xs text-neutral-400 space-y-1">
                    <p>© 2026 VeniCX. All rights reserved.</p>
                    <p>
                      If you no longer wish to receive these emails, you can{" "}
                      <span className="text-primary underline cursor-pointer">unsubscribe</span>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking info */}
          <Card>
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Email Tracking</h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <p className="text-xs text-neutral-500">
                  Open tracking and click tracking are enabled by default via SendGrid.
                  Engagement events are automatically recorded to each record&apos;s timeline via webhook.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {sendError && (
        <div className="fixed bottom-6 right-6 bg-error text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{sendError}</span>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Send Email Campaign</h3>
            <p className="text-sm text-neutral-600 mb-1">
              Template: <strong>&ldquo;{subject}&rdquo;</strong>
            </p>
            {preview ? (
              <p className="text-sm text-neutral-600 mb-4">
                Will send to <strong>{formatNumber(preview.estimated_recipients)} recipients</strong>.
              </p>
            ) : (
              <p className="text-sm text-neutral-600 mb-4">
                Audience: <strong>{AUDIENCE_OPTIONS.find(o => o.value === audience)?.label}</strong>
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" loading={sending} onClick={handleSendCampaign}>
                <Send className="w-4 h-4" /> Confirm &amp; Send
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
