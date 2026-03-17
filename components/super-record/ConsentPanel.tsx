"use client";

import { MessageSquare, Mail, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUpdateConsent } from "@/hooks/useSuperRecords";
import { formatDate } from "@/lib/utils";
import type { SuperRecord } from "@/types";

interface ConsentPanelProps {
  customerId: string;
  consent: SuperRecord["consent"];
}

export function ConsentPanel({ customerId, consent }: ConsentPanelProps) {
  const { mutate: updateConsent, isPending } = useUpdateConsent();

  const channels = [
    { key: "sms" as const, label: "SMS", icon: MessageSquare, data: consent.sms },
    { key: "email" as const, label: "Email", icon: Mail, data: consent.email },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {channels.map(({ key, label, icon: Icon, data }) => {
        const isGranted = data.status === "granted";
        const isRevoked = data.status === "revoked";

        return (
          <div
            key={key}
            className={`border rounded-xl p-4 ${
              isGranted ? "border-success/30 bg-success/5" :
              isRevoked ? "border-error/30 bg-error/5" :
              "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isGranted ? "bg-success/10" : isRevoked ? "bg-error/10" : "bg-neutral-100"
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isGranted ? "text-success" : isRevoked ? "text-error" : "text-neutral-400"
                  }`} />
                </div>
                <span className="text-sm font-medium text-neutral-900">{label}</span>
              </div>

              {isGranted ? (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Granted</span>
                </div>
              ) : isRevoked ? (
                <div className="flex items-center gap-1 text-error">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Revoked</span>
                </div>
              ) : (
                <span className="text-xs text-neutral-400">Not set</span>
              )}
            </div>

            <div className="text-xs text-neutral-500 mb-3 space-y-0.5">
              {data.granted_at && <p>Granted: {formatDate(data.granted_at)}</p>}
              {data.revoked_at && <p>Revoked: {formatDate(data.revoked_at)}</p>}
              {!data.status && <p>No consent record</p>}
            </div>

            {isGranted ? (
              <Button
                variant="destructive"
                size="sm"
                loading={isPending}
                onClick={() => updateConsent({ customerId, channel: key, status: "revoked" })}
              >
                Revoke
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={isPending}
                onClick={() => updateConsent({ customerId, channel: key, status: "granted" })}
              >
                Grant
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
