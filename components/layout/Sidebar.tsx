"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Upload, Users, MessageSquare, Settings, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/ingestion",      label: "Data Ingestion", icon: Upload },
  { href: "/records",        label: "Super Records",  icon: Users },
  { href: "/communications", label: "Communications", icon: MessageSquare },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <aside className="w-60 h-full bg-white border-r border-neutral-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-100 flex items-center justify-between">
        <Logo size="md" variant="dark" />
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-neutral-400 hover:text-neutral-600" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-vibrant_orange/10 text-vibrant_orange"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-royal_blue"
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
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-vibrant_orange/10 text-vibrant_orange"
              : "text-neutral-500 hover:bg-neutral-50 hover:text-royal_blue"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex flex-shrink-0 min-h-screen">
        {content}
      </div>

      {/* Mobile: slide-in drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative flex h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
