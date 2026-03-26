# VeniCX Frontend — Kiro Initialization Prompt
# Place this file in the venicx/frontend repo root before running.
# Read KIRO_PROJECT.md first for full system context.

---

## Your Job Right Now

The `venicx/frontend` repo is empty (only `.git` exists). Set up the complete Next.js 14 project
using **npm** (not pnpm or yarn). Build the full skeleton that:

1. Runs with `npm run dev`
2. Shows a login page at `/login` matching the VeniCX design
3. Shows the authenticated shell layout (sidebar + topbar) at all dashboard routes
4. Has all base UI components built and ready to use
5. Has the typed API client and auth layer configured

---

## Step 1 — Bootstrap the Project

Run this exact command inside the `venicx/frontend` folder:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted, accept all defaults. This will create the base Next.js 14 App Router project.

---

## Step 2 — Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install recharts
npm install lucide-react
npm install clsx tailwind-merge
npm install js-cookie
npm install --save-dev @types/js-cookie
```

---

## Folder Structure After Setup

Organise files exactly like this (create any missing files/folders):

```
frontend/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── app/
│   ├── layout.tsx                        ← Root layout
│   ├── globals.css
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  ← Login page
│   └── (dashboard)/
│       ├── layout.tsx                    ← Authenticated shell (sidebar + topbar)
│       ├── page.tsx                      ← Dashboard stub
│       ├── ingestion/
│       │   └── page.tsx
│       ├── records/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       └── page.tsx
│       └── communications/
│           └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── MetricCard.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── ProgressBar.tsx
│   │   └── StatusBadge.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── DashboardShell.tsx
│   ├── dashboard/
│   │   └── .gitkeep
│   ├── ingestion/
│   │   └── .gitkeep
│   ├── super-record/
│   │   └── .gitkeep
│   └── communication/
│       └── .gitkeep
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── query-client.ts
├── types/
│   └── index.ts
└── .github/
    └── workflows/
        └── deploy-staging.yml
```

---

## Design System

### tailwind.config.ts

Replace the generated file entirely with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B5BFF",
          50: "#EEF1FF",
          100: "#DDE3FF",
          700: "#2D4AE0",
        },
        sms: {
          DEFAULT: "#8B5CF6",
          light: "#EDE9FE",
        },
        email: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        error: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          900: "#111827",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
```

### app/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after { box-sizing: border-box; }

body {
  background-color: #F8FAFC;
  color: #111827;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

## .env.example

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## .gitignore

Add to the generated `.gitignore`:

```
.env
.env.local
.env.*.local
```

---

## lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-ZA").format(n);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
```

---

## lib/auth.ts

```ts
import Cookies from "js-cookie";

const TOKEN_KEY = "venicx_token";

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null;
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 1,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  full_name: string;
  exp: number;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}
```

---

## lib/api.ts

```ts
import { getToken, removeToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "UNAUTHORIZED", "Session expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? "An error occurred"
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string)                   => request<T>(path),
  post:   <T>(path: string, body: unknown)    => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)    => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)    => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                   => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData)   => request<T>(path, { method: "POST",   body: form }),
};
```

---

## lib/query-client.ts

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error: unknown) => {
        if (error instanceof Error && "status" in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 2;
      },
    },
  },
});
```

---

## types/index.ts

```ts
// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "operator" | "viewer";
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

export type BatchStatus = "pending" | "mapping" | "processing" | "completed" | "failed";

export interface IngestionBatch {
  id: string;
  filename: string;
  file_type: string;
  partner_name: string | null;
  status: BatchStatus;
  total_rows: number | null;
  processed_rows: number;
  failed_rows: number;
  created_rows: number;
  merged_rows: number;
  created_at: string;
  completed_at: string | null;
  created_by_email?: string;
}

export interface MappingTemplate {
  id: string;
  name: string;
  partner_name: string | null;
  field_mappings: Record<string, string>;
  created_at: string;
}

// ─── Super Records ────────────────────────────────────────────────────────────

export interface SuperRecord {
  customer_id: string;
  identity: {
    msisdn_last4: string | null;
    email_domain: string | null;
    has_national_id: boolean;
  };
  demographics: {
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null;
    city: string | null;
    province: string | null;
  };
  consent: {
    sms: ConsentStatus;
    email: ConsentStatus;
  };
  lead_history: LeadHistoryEntry[];
  communication_history: CommunicationHistoryEntry[];
  merge_history: MergeHistoryEntry[];
  timeline: TimelineEvent[];
}

export interface ConsentStatus {
  status: "granted" | "revoked" | "pending" | null;
  granted_at: string | null;
  revoked_at: string | null;
}

export interface LeadHistoryEntry {
  batch_id: string;
  filename: string;
  partner_name: string | null;
  ingested_at: string;
}

export interface CommunicationHistoryEntry {
  id: string;
  channel: "sms" | "email";
  status: string;
  sent_at: string | null;
  cost_amount: string | null;
}

export interface MergeHistoryEntry {
  merge_type: "deterministic" | "probabilistic" | "manual";
  match_field: string | null;
  confidence_score: number | null;
  merged_at: string;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  source: string | null;
  created_at: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  total_super_records: number;
  leads_ingested_today: number;
  leads_ingested_this_week: number;
  duplicate_merge_rate: number;
  sms_sent_last_7_days: number;
  email_engagement_rate: number;
}

export interface DailyActivityPoint {
  date: string;
  records: number;
  uploads: number;
}

export interface DailyCommunicationPoint {
  date: string;
  sms: number;
  email: number;
}

// ─── Communications ───────────────────────────────────────────────────────────

export interface CommunicationMetrics {
  sms_sent: number;
  emails_sent: number;
  delivery_rate: number;
  total_cost_zar: number;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

---

## Base UI Components

### components/ui/Button.tsx

```tsx
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "black";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary:     "bg-[#3B5BFF] text-white hover:bg-[#2D4AE0] focus:ring-[#3B5BFF]",
      secondary:   "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 focus:ring-[#3B5BFF]",
      destructive: "bg-error text-white hover:bg-red-700 focus:ring-error",
      ghost:       "text-neutral-600 hover:bg-neutral-100 focus:ring-[#3B5BFF]",
      black:       "bg-neutral-900 text-white hover:bg-neutral-700 focus:ring-neutral-900",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-5 py-2.5 text-base gap-2",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
```

### components/ui/Input.tsx

```tsx
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg bg-white placeholder:text-neutral-400",
          "focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent",
          "disabled:bg-neutral-50 disabled:cursor-not-allowed",
          error ? "border-error" : "border-neutral-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
```

### components/ui/Badge.tsx

```tsx
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
```

### components/ui/Card.tsx

```tsx
import { cn } from "@/lib/utils";

interface CardProps { children: React.ReactNode; className?: string; }

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-neutral-200 shadow-card", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4 border-b border-neutral-100", className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
```

### components/ui/MetricCard.tsx

```tsx
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  change?: string;
  changePositive?: boolean;
}

export function MetricCard({ label, value, icon, iconBg, iconColor, change, changePositive }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-neutral-500">{label}</span>
          <span className="text-3xl font-bold text-neutral-900">{value}</span>
          {change && (
            <span className={cn("text-xs font-medium", changePositive ? "text-[#16A34A]" : "text-error")}>
              {change}
            </span>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}
```

### components/ui/Spinner.tsx

```tsx
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-[#3B5BFF]", className)} />;
}
```

### components/ui/ProgressBar.tsx

```tsx
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
```

### components/ui/StatusBadge.tsx

```tsx
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
```

### components/ui/Select.tsx

```tsx
import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-lg bg-white appearance-none pr-8",
            "focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent",
            "disabled:bg-neutral-50 disabled:cursor-not-allowed",
            error ? "border-error" : "border-neutral-200",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
```

### components/ui/Modal.tsx

```tsx
"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn(
        "relative bg-white rounded-2xl shadow-xl w-full max-w-lg border border-neutral-200",
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
```

### components/ui/Table.tsx

```tsx
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-neutral-100">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-neutral-50">{children}</tbody>;
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-neutral-50 transition-colors", className)}>{children}</tr>;
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-neutral-700", className)}>{children}</td>;
}
```

---

## Layout Components

### components/layout/Sidebar.tsx

```tsx
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
```

### components/layout/Topbar.tsx

```tsx
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
```

### components/layout/DashboardShell.tsx

```tsx
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  user: { full_name: string; email: string };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## App Layouts & Pages

### app/layout.tsx

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeniCX",
  description: "Advanced Data Ingestion & Super Record Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### app/(auth)/login/page.tsx

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";
import type { LoginResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", { email, password });
      setToken(res.token);
      router.push("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#3B5BFF] rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">VeniCX</span>
          </div>

          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Sign in</h2>
          <p className="text-sm text-neutral-500 mb-6">Enter your credentials to continue</p>

          <div className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            {error && (
              <p className="text-sm text-error bg-[#FEE2E2] border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              onClick={handleLogin}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### app/(dashboard)/layout.tsx

```tsx
import { DashboardShell } from "@/components/layout/DashboardShell";

// Temporary placeholder — will be replaced with real JWT-decoded user
const PLACEHOLDER_USER = {
  full_name: "Operations Admin",
  email: "operations@venicx.com",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell user={PLACEHOLDER_USER}>{children}</DashboardShell>;
}
```

### Stub Pages

Create each of these with minimal content so routes resolve:

**app/(dashboard)/page.tsx**
```tsx
export default function DashboardPage() {
  return <div className="text-neutral-500 text-sm">Dashboard — build in progress</div>;
}
```

**app/(dashboard)/ingestion/page.tsx**
```tsx
export default function IngestionPage() {
  return <div className="text-neutral-500 text-sm">Data Ingestion — build in progress</div>;
}
```

**app/(dashboard)/records/page.tsx**
```tsx
export default function RecordsPage() {
  return <div className="text-neutral-500 text-sm">Super Records — build in progress</div>;
}
```

**app/(dashboard)/records/[id]/page.tsx**
```tsx
export default function RecordDetailPage({ params }: { params: { id: string } }) {
  return <div className="text-neutral-500 text-sm">Record {params.id} — build in progress</div>;
}
```

**app/(dashboard)/communications/page.tsx**
```tsx
export default function CommunicationsPage() {
  return <div className="text-neutral-500 text-sm">Communications — build in progress</div>;
}
```

---

## GitHub Actions — Staging Deploy

`.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy Frontend → Staging
on:
  push:
    branches: [staging]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}
      # Add Vercel or Cloud Run deploy step once infrastructure is configured
```

---

## Verify & Commit

```bash
# 1. Create env file
cp .env.example .env.local

# 2. Install (if not already done)
npm install

# 3. Run dev server
npm run dev

# 4. Open browser:
#    http://localhost:3000/login       → login page
#    http://localhost:3000             → dashboard shell with sidebar

# 5. Verify no TypeScript or console errors

# 6. Commit
git add .
git commit -m "feat: initialize frontend — design system, layout, login page, base components"
git push origin staging
```

Do NOT push to `main`. All work goes to `staging` first.