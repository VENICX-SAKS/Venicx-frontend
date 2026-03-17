"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

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

const EMAIL_VARIABLES = [
  "{{first_name}}", "{{last_name}}",
  "{{email}}", "{{customer_id}}",
  "{{province}}", "{{application_url}}",
];

const SAMPLE = {
  first_name: "John", last_name: "Doe",
  email: "john@example.com", customer_id: "VCX-001",
  province: "Gauteng", application_url: "https://app.venicx.com/apply/VCX-001",
};

function renderWithSample(text: string) {
  return text
    .replace(/{{first_name}}/g, SAMPLE.first_name)
    .replace(/{{last_name}}/g, SAMPLE.last_name)
    .replace(/{{email}}/g, SAMPLE.email)
    .replace(/{{customer_id}}/g, SAMPLE.customer_id)
    .replace(/{{province}}/g, SAMPLE.province)
    .replace(/{{application_url}}/g, SAMPLE.application_url);
}

export default function EmailTemplatesPage() {
  const [selected, setSelected] = useState(DEFAULT_TEMPLATES[0]);
  const [subject, setSubject] = useState(DEFAULT_TEMPLATES[0].subject);
  const [content, setContent] = useState(DEFAULT_TEMPLATES[0].content);
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [updateRecord, setUpdateRecord] = useState(true);
  const [saved, setSaved] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const selectTemplate = (t: typeof DEFAULT_TEMPLATES[0]) => {
    setSelected(t);
    setSubject(t.subject);
    setContent(t.content);
    setSaved(false);
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
            <h2 className="text-xl font-bold text-neutral-900">Email Templates</h2>
            <p className="text-sm text-neutral-500">Manage templated email communications</p>
          </div>
        </div>
        <Button variant="black" onClick={() => setSaved(true)}>
          <Mail className="w-4 h-4" />
          {saved ? "Saved!" : "Save Template"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left — templates list */}
        <div className="lg:col-span-1 flex flex-col gap-3">
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
              <p className="text-xs text-neutral-400 mt-1 truncate">Subject: {t.subject}</p>
            </button>
          ))}

          <div className="border border-neutral-200 rounded-xl p-4 bg-white">
            <p className="text-sm font-semibold text-neutral-900 mb-1">Email Provider</p>
            <p className="text-xs text-neutral-500 mb-3">
              Configure your email provider (SendGrid, Mailgun, or Postmark)
            </p>
            <Link href="/settings">
              <Button variant="secondary" size="sm">Configure</Button>
            </Link>
          </div>
        </div>

        {/* Right — editor */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card>
            <CardContent className="py-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-900">Edit Template: {selected.name}</h3>

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
                <p className="text-xs text-blue-600 mb-3">Use these placeholders to personalize your email:</p>
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
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Email Preview</h3>
                <Button variant="secondary" size="sm">Send Test Email</Button>
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

          {/* Tracking */}
          <Card>
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Email Tracking</h3>
              <div className="flex flex-col gap-3">
                {[
                  { checked: trackOpens,   set: setTrackOpens,   label: "Track Opens",          desc: "Log when recipients open this email" },
                  { checked: trackClicks,  set: setTrackClicks,  label: "Track Clicks",         desc: "Log when recipients click links in this email" },
                  { checked: updateRecord, set: setUpdateRecord, label: "Update Super Record",  desc: "Store engagement data in customer timeline" },
                ].map(({ checked, set, label, desc }) => (
                  <label key={label} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => set(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{label}</p>
                      <p className="text-xs text-neutral-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
