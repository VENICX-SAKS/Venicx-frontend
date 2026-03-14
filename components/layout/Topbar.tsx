"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { CurrentUser } from "@/lib/auth";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/ingestion": "Data Ingestion",
  "/records": "Super Records",
  "/communications": "Communications",
  "/settings": "Settings",
};

interface TopbarProps {
  user: CurrentUser;
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const title = Object.entries(pageTitles).find(([path]) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)
  )?.[1] ?? "VeniCX";

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-6 flex items-center justify-between flex-shrink-0">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-neutral-900 leading-none">{user.full_name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center cursor-pointer">
          <span className="text-white text-sm font-semibold">{initials}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
