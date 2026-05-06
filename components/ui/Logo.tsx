import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: "w-7 h-7", icon: "w-5 h-5", text: "text-base" },
  md: { container: "w-9 h-9", icon: "w-7 h-7", text: "text-xl" },
  lg: { container: "w-12 h-12", icon: "w-9 h-9", text: "text-3xl" },
};

export function Logo({ size = "md", variant = "dark", showText = true, className }: LogoProps) {
  const sizes = sizeMap[size];
  const textColor = variant === "light" ? "text-white" : "text-royal_blue";
  const bgColor = variant === "light" ? "bg-white border-white/20" : "bg-royal_blue border-white/20";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "rounded-xl shadow-lg flex items-center justify-center overflow-hidden border",
        sizes.container,
        bgColor
      )}>
        <img
          src="https://img.icons8.com/color/48/hummingbird.png"
          alt="VeniCX"
          className={cn("object-contain", sizes.icon)}
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <span className={cn(
          "font-outfit font-black tracking-tighter",
          sizes.text,
          textColor
        )}>
          VENICX
        </span>
      )}
    </div>
  );
}
