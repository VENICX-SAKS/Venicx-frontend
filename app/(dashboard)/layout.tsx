"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
