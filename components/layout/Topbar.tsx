"use client";

import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/":               "Dashboard",
  "/ingestion":      "Data Ingestion",
  "/records":        "Super Records",
  "/communications": "Communications",
  "/settings":       "Settings",
};

interface TopbarProps {
  user: { full_name: string; email: string };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([key]) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key)
  )?.[1] ?? "VeniCX";

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-6 flex items-center justify-between flex-shrink-0">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-neutral-900 leading-none">{user.full_name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#3B5BFF] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{getInitials(user.full_name)}</span>
        </div>
      </div>
    </header>
  );
}
