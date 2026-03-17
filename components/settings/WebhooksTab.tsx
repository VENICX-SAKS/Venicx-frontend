"use client";

import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useSystemInfo } from "@/hooks/useSettings";

export function WebhooksTab() {
  const { data: info } = useSystemInfo();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhooks = [
    {
      key: "smsportal",
      provider: "SMSPortal",
      description: "Set this as your Delivery Report webhook URL in SMSPortal → Settings → Delivery Reports",
      url: info?.webhook_urls.smsportal ?? "",
    },
    {
      key: "sendgrid",
      provider: "SendGrid",
      description: "Set this in SendGrid → Settings → Mail Settings → Event Webhook. Enable: Delivered, Opened, Clicked, Bounced.",
      url: info?.webhook_urls.sendgrid ?? "",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {webhooks.map(w => (
        <Card key={w.key}>
          <CardHeader>
            <h3 className="text-sm font-semibold text-neutral-900">{w.provider} Webhook</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{w.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5">
              <code className="text-xs text-neutral-700 flex-1 break-all">{w.url || "Loading..."}</code>
              <button
                onClick={() => copy(w.url, w.key)}
                className="text-neutral-400 hover:text-primary transition-colors flex-shrink-0"
                disabled={!w.url}
              >
                {copied === w.key
                  ? <CheckCircle className="w-4 h-4 text-success" />
                  : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
