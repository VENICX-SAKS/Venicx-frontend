import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, className, color = "bg-[#3B5BFF]" }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-neutral-100 rounded-full h-1.5", className)}>
      <div
        className={cn("h-1.5 rounded-full transition-all duration-300", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
