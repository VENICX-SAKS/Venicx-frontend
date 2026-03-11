import { cn } from "@/lib/utils";

type BadgeVariant = "completed" | "processing" | "mapping" | "failed" | "pending" | "success" | "warning";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  completed:  "bg-neutral-900 text-white",
  processing: "border border-neutral-300 text-neutral-600 bg-white",
  mapping:    "border border-[#D97706] text-[#D97706] bg-[#FEF3C7]",
  failed:     "border border-error text-error bg-[#FEE2E2]",
  pending:    "border border-neutral-300 text-neutral-500 bg-white",
  success:    "bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20",
  warning:    "bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
