"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Upload, Users, MessageSquare, Settings, Database } from "lucide-react";

const navItems = [
  { href: "/",               label: "Dashboard",      icon: LayoutDashboard },
  { href: "/ingestion",      label: "Data Ingestion", icon: Upload },
  { href: "/records",        label: "Super Records",  icon: Users },
  { href: "/communications", label: "Communications", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-neutral-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#3B5BFF] rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900">VeniCX</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#EEF1FF] text-[#3B5BFF]"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings pinned to bottom */}
      <div className="px-3 py-4 border-t border-neutral-100">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-[#EEF1FF] text-[#3B5BFF]"
              : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
