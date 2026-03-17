import { formatDate } from "@/lib/utils";
import type { SuperRecord } from "@/types";

const eventConfig: Record<string, { label: string; color: string; dot: string }> = {
  ingested:        { label: "Ingested",        color: "text-primary",  dot: "bg-primary" },
  merged:          { label: "Merged",          color: "text-[#8B5CF6]", dot: "bg-[#8B5CF6]" },
  consent_granted: { label: "Consent Granted", color: "text-success",  dot: "bg-success" },
  consent_revoked: { label: "Consent Revoked", color: "text-error",    dot: "bg-error" },
  sms_sent:        { label: "SMS Sent",        color: "text-[#8B5CF6]", dot: "bg-[#8B5CF6]" },
  email_sent:      { label: "Email Sent",      color: "text-[#10B981]", dot: "bg-[#10B981]" },
  sms_delivered:   { label: "SMS Delivered",   color: "text-success",  dot: "bg-success" },
  email_opened:    { label: "Email Opened",    color: "text-success",  dot: "bg-success" },
  email_clicked:   { label: "Email Clicked",   color: "text-success",  dot: "bg-success" },
};

function getConfig(eventType: string) {
  return (
    eventConfig[eventType] ?? {
      label: eventType.replace(/_/g, " "),
      color: "text-neutral-600",
      dot: "bg-neutral-300",
    }
  );
}

interface TimelineProps {
  events: SuperRecord["timeline"];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-neutral-400 py-4">No events recorded</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-neutral-200" />
      <div className="space-y-4">
        {events.map((event) => {
          const config = getConfig(event.event_type);
          return (
            <div key={event.id} className="flex gap-4 relative">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-white border-2 border-neutral-200 relative z-10">
                <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium capitalize ${config.color}`}>
                    {config.label}
                  </p>
                  <span className="text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">
                    {formatDate(event.created_at)}
                  </span>
                </div>
                {event.source && (
                  <p className="text-xs text-neutral-400 mt-0.5">via {event.source}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
