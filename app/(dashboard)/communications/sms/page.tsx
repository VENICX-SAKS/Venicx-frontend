"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Users, MessageSquare, DollarSign, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

const SMS_RATE = 0.5;

const AUDIENCE_OPTIONS = [
  { value: "customers_with_consent", label: "Customers with SMS consent" },
  { value: "all_customers",          label: "All customers (with stored number)" },
  { value: "customers_by_province",  label: "Customers by province" },
  { value: "all_businesses",         label: "All businesses" },
  { value: "businesses_by_industry", label: "Businesses by industry" },
  { value: "all_branches",           label: "All branches" },
  { value: "both",                   label: "Customers + businesses + branches" },
];

const BUSINESS_RECIPIENT_OPTIONS = [
  { value: "business", label: "Business contact only" },
  { value: "branches", label: "All branch contacts" },
  { value: "both",     label: "Business + all branches" },
];

const VARIABLES = [
  { key: "first_name",   label: "{{first_name}}" },
  { key: "last_name",    label: "{{last_name}}" },
  { key: "customer_id",  label: "{{customer_id}}" },
  { key: "province",     label: "{{province}}" },
  { key: "display_name", label: "{{display_name}}" },
];

const SAMPLE = {
  first_name: "John", last_name: "Doe",
  customer_id: "VCX-001", province: "Gauteng",
  display_name: "John Doe",
};

function getSmsSegments(text: string) {
  if (!text) return 0;
  if (text.length <= 160) return 1;
  return Math.ceil(text.length / 153);
}

function getCharsRemaining(text: string) {
  const segs = getSmsSegments(text);
  if (segs <= 1) return 160 - text.length;
  return segs * 153 - text.length;
}

function renderPreview(message: string) {
  return message
    .replace(/{{first_name}}/g, SAMPLE.first_name)
    .replace(/{{last_name}}/g, SAMPLE.last_name)
    .replace(/{{customer_id}}/g, SAMPLE.customer_id)
    .replace(/{{province}}/g, SAMPLE.province)
    .replace(/{{display_name}}/g, SAMPLE.display_name);
}

const needsBusinessRecipientType = (audience: string) =>
  ["all_businesses", "businesses_by_industry", "both"].includes(audience);

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

export default function NewSmsCampaignPage() {
  const [name, setName] = useState("");
  const [audience, setAudience] = useState("customers_with_consent");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [businessRecipientType, setBusinessRecipientType] = useState("business");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [queued, setQueued] = useState<CampaignQueued | null>(null);
  const [sendError, setSendError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const segments = getSmsSegments(message);
  const charsRemaining = getCharsRemaining(message);
  const msgPreview = renderPreview(message);

  const buildPayload = () => ({
    name,
    channel: "sms",
    audience_type: audience,
    audience_filter:
      audience === "customers_by_province" ? { province: provinceFilter } :
      audience === "businesses_by_industry" ? { industry: industryFilter } :
      null,
    business_recipient_type: needsBusinessRecipientType(audience) ? businessRecipientType : null,
    message_content: message,
  });

  const { mutateAsync: sendCampaign, isPending: sending } = useMutation({
    mutationFn: (body: ReturnType<typeof buildPayload>) =>
      api.post<CampaignQueued>("/api/v1/communication/campaigns", body),
  });

  const insertVariable = useCallback((variable: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newMsg = message.slice(0, start) + variable + message.slice(end);
    setMessage(newMsg);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  }, [message]);

  const handlePreview = async () => {
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

  const handleConfirmSend = async () => {
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
      <div className="flex items-center gap-3">
        <Link href="/communications">
          <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50">
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">New SMS Campaign</h2>
          <p className="text-sm text-neutral-500">SMSPortal Integration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — form */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardContent className="py-5 flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-neutral-900">Campaign Details</h3>

              <Input
                label="Campaign Name"
                placeholder="e.g., February Lead Follow-up"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              {/* Audience selector */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">Target Audience</label>
                <select
                  value={audience}
                  onChange={e => { setAudience(e.target.value); setPreview(null); }}
                  className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {AUDIENCE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Province filter */}
              {audience === "customers_by_province" && (
                <Input
                  label="Province"
                  placeholder="e.g., KwaZulu-Natal"
                  value={provinceFilter}
                  onChange={e => { setProvinceFilter(e.target.value); setPreview(null); }}
                />
              )}

              {/* Industry filter */}
              {audience === "businesses_by_industry" && (
                <Input
                  label="Industry"
                  placeholder="e.g., Healthcare"
                  value={industryFilter}
                  onChange={e => { setIndustryFilter(e.target.value); setPreview(null); }}
                />
              )}

              {/* Business recipient type */}
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

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">Message Content</label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter your SMS message..."
                  rows={4}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{message.length} characters · {segments} SMS{segments !== 1 ? "s" : ""}</span>
                  <span>{charsRemaining} remaining in current SMS</span>
                </div>
              </div>

              {/* Variables */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-700 mb-1">Message Variables</p>
                <p className="text-xs text-blue-600 mb-3">Click to insert at cursor:</p>
                <div className="grid grid-cols-2 gap-2">
                  {VARIABLES.map(v => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.label)}
                      className="text-left text-xs font-mono bg-white border border-blue-200 rounded-lg px-3 py-2 hover:border-blue-400 hover:bg-blue-50 transition-colors text-neutral-700"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message preview */}
          <Card>
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Message Preview</h3>
              <div className="flex justify-center">
                <div className="w-64">
                  <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 min-h-16">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {msgPreview || "Your message will appear here..."}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 ml-1">VeniCX SMS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — summary */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="py-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-900">Campaign Summary</h3>

              {preview ? (
                <>
                  <div className="flex items-center gap-3 py-3 border-b border-neutral-100">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Recipients</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatNumber(preview.estimated_recipients)}
                      </p>
                      <div className="text-xs text-neutral-400 mt-0.5 space-y-0.5">
                        {preview.customer_count > 0 && <p>👤 {formatNumber(preview.customer_count)} customers</p>}
                        {preview.business_count > 0 && <p>🏢 {formatNumber(preview.business_count)} businesses</p>}
                        {preview.branch_count > 0 && <p>📍 {formatNumber(preview.branch_count)} branches</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-b border-neutral-100">
                    <div className="w-9 h-9 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">SMS per Recipient</p>
                      <p className="text-xl font-bold text-neutral-900">{segments}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-b border-neutral-100">
                    <div className="w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Estimated Cost</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatCurrency(preview.estimated_cost)}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-500 space-y-1.5">
                    <div className="flex justify-between"><span>Recipients:</span><span>{formatNumber(preview.estimated_recipients)}</span></div>
                    <div className="flex justify-between"><span>SMS segments:</span><span>{segments}</span></div>
                    <div className="flex justify-between"><span>Rate per SMS:</span><span>R0.50</span></div>
                    <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                      <span>Total:</span><span>{formatCurrency(preview.estimated_cost)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-neutral-400">
                    Click Preview to see recipient count and cost estimate
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-neutral-700 mb-1">SMSPortal API</p>
            <p className="text-xs text-neutral-500">
              Campaign dispatches in the background via SMSPortal. Delivery receipts are logged to each record&apos;s timeline via webhook.
            </p>
          </div>

          {sendError && (
            <div className="bg-error/5 border border-error/20 rounded-xl p-3">
              <p className="text-xs text-error">{sendError}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              loading={previewing}
              disabled={!message}
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4" />
              Preview Recipients
            </Button>
            <Button
              variant="black"
              size="lg"
              className="w-full"
              disabled={!name || !message}
              onClick={() => setShowConfirm(true)}
            >
              <Send className="w-4 h-4" />
              Send Campaign
            </Button>
            <Link href="/communications" className="text-center text-sm text-neutral-500 hover:text-neutral-700 py-1">
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Confirm Send Campaign</h3>
            <p className="text-sm text-neutral-600 mb-1">
              Campaign: <strong>&ldquo;{name}&rdquo;</strong>
            </p>
            {preview && (
              <p className="text-sm text-neutral-600 mb-4">
                Will send to <strong>{formatNumber(preview.estimated_recipients)} recipients</strong>.
                Estimated cost: <strong>{formatCurrency(preview.estimated_cost)}</strong>
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="black" className="flex-1" loading={sending} onClick={handleConfirmSend}>
                Confirm &amp; Send
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
