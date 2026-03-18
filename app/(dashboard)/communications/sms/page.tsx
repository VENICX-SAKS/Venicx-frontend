"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Users, MessageSquare, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/useDashboard";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { RecipientPicker, type AudienceMode } from "@/components/communication/RecipientPicker";

const SMS_RATE = 0.5;
const VARIABLES = [
  { key: "first_name",  label: "{{first_name}}" },
  { key: "last_name",   label: "{{last_name}}" },
  { key: "customer_id", label: "{{customer_id}}" },
  { key: "province",    label: "{{province}}" },
];
const SAMPLE = { first_name: "John", last_name: "Doe", customer_id: "VCX-001", province: "Gauteng" };

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
    .replace(/{{province}}/g, SAMPLE.province);
}

interface CampaignResult {
  campaign_name: string;
  total_attempted: number;
  sent: number;
  failed: number;
  skipped_no_consent: number;
}

export default function NewSmsCampaignPage() {
  const [name, setName] = useState("");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("consent");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [sendError, setSendError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: metrics } = useDashboardMetrics();
  const recipients = audienceMode === "selected" ? selectedIds.length : (metrics?.total_super_records ?? 0);
  const segments = getSmsSegments(message);
  const estimatedCost = recipients * segments * SMS_RATE;
  const charsRemaining = getCharsRemaining(message);
  const preview = renderPreview(message);

  const { mutateAsync: sendCampaign, isPending: sending } = useMutation({
    mutationFn: (body: { campaign_name: string; message: string; audience: string; customer_ids?: string[] }) =>
      api.post<CampaignResult>("/api/v1/communication/sms/campaign", body),
  });

  const insertVariable = useCallback((variable: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newMessage = message.slice(0, start) + variable + message.slice(end);
    setMessage(newMessage);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  }, [message]);

  const handleConfirmSend = async () => {
    setSendError("");
    try {
      const res = await sendCampaign({
        campaign_name: name,
        message,
        audience: audienceMode,
        customer_ids: audienceMode === "selected" ? selectedIds : undefined,
      });
      setResult(res);
      setShowConfirm(false);
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : "Failed to send campaign");
      setShowConfirm(false);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <Send className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">Campaign Sent!</h2>
        <div className="text-sm text-neutral-600 text-center space-y-1">
          <p>Sent: <strong>{formatNumber(result.sent)}</strong></p>
          <p>Failed: <strong>{result.failed}</strong></p>
          <p>Skipped (no consent): <strong>{result.skipped_no_consent}</strong></p>
        </div>
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

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">Phone Number Storage Notice</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    VeniCX stores only hashed phone numbers for POPIA compliance. Bulk SMS campaigns
                    require integration with your partner data source to resolve full MSISDN values
                    at send time. Individual SMS sends via the Super Record detail page work normally
                    when a destination number is provided directly.
                  </p>
                </div>
              </div>

              <Input
                label="Campaign Name"
                placeholder="e.g., February Lead Follow-up"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">Target Audience</label>
                <RecipientPicker
                  channel="sms"
                  mode={audienceMode}
                  onModeChange={setAudienceMode}
                  selectedIds={selectedIds}
                  onSelectedChange={setSelectedIds}
                />
              </div>

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
                  <span>{charsRemaining} characters remaining in current SMS</span>
                </div>
              </div>

              {/* Variables */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-700 mb-1">Message Variables</p>
                <p className="text-xs text-blue-600 mb-3">Use these placeholders to personalize your message:</p>
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

          {/* Preview */}
          <Card>
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Message Preview</h3>
              <div className="flex justify-center">
                <div className="w-64">
                  <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 min-h-16">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {preview || "Your message will appear here..."}
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

              {[
                { icon: <Users className="w-4 h-4 text-primary" />, bg: "bg-primary/10", label: "Recipients", value: formatNumber(recipients) },
                { icon: <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />, bg: "bg-[#EDE9FE]", label: "SMS per Recipient", value: String(segments) },
                { icon: <DollarSign className="w-4 h-4 text-success" />, bg: "bg-success/10", label: "Estimated Cost", value: formatCurrency(estimatedCost) },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-0">
                  <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">{item.label}</p>
                    <p className="text-xl font-bold text-neutral-900">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="text-xs text-neutral-500 space-y-1.5">
                <p className="font-medium text-neutral-600">Cost breakdown: R0.50 per SMS segment</p>
                <div className="flex justify-between"><span>Recipients:</span><span>{formatNumber(recipients)}</span></div>
                <div className="flex justify-between"><span>SMS segments:</span><span>{segments}</span></div>
                <div className="flex justify-between"><span>Rate per SMS:</span><span>R0.50</span></div>
                <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>Total:</span><span>{formatCurrency(estimatedCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-700 mb-1">SMSPortal API</p>
            <p className="text-xs text-amber-600">
              This campaign will be sent via the SMSPortal API. Delivery receipts will be logged to customer super records.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="black" size="lg" className="w-full" disabled={!name || !message} onClick={() => setShowConfirm(true)}>
              <Send className="w-4 h-4" /> Send Campaign
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
              You are about to send <strong>&ldquo;{name}&rdquo;</strong> to{" "}
              <strong>{formatNumber(recipients)} recipients</strong>.
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              Estimated cost: <strong>{formatCurrency(estimatedCost)}</strong>
            </p>
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

      {sendError && (
        <div className="fixed bottom-6 right-6 bg-error text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{sendError}</span>
        </div>
      )}
    </div>
  );
}
