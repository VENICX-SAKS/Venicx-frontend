import { Badge } from "./Badge";

const statusMap: Record<string, { variant: Parameters<typeof Badge>[0]["variant"]; label: string }> = {
  completed:  { variant: "completed",  label: "Completed" },
  processing: { variant: "processing", label: "Processing" },
  mapping:    { variant: "mapping",    label: "Mapping" },
  failed:     { variant: "failed",     label: "Failed" },
  pending:    { variant: "pending",    label: "Pending" },
  granted:    { variant: "success",    label: "Granted" },
  revoked:    { variant: "failed",     label: "Revoked" },
  delivered:  { variant: "success",    label: "Delivered" },
  sent:       { variant: "processing", label: "Sent" },
  bounced:    { variant: "failed",     label: "Bounced" },
  opened:     { variant: "success",    label: "Opened" },
  clicked:    { variant: "success",    label: "Clicked" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? { variant: "pending" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
