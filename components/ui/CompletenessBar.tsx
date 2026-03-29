interface CompletenessBarProps {
  score: number; // 0–100
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function CompletenessBar({ score, showLabel = true, size = "sm" }: CompletenessBarProps) {
  const color =
    score >= 80 ? "bg-success" :
    score >= 50 ? "bg-warning" :
    "bg-error";

  const textColor =
    score >= 80 ? "text-success" :
    score >= 50 ? "text-warning" :
    "text-error";

  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${barHeight} bg-neutral-100 rounded-full overflow-hidden`}>
        <div
          className={`${barHeight} ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium tabular-nums ${textColor}`}>
          {score}%
        </span>
      )}
    </div>
  );
}
