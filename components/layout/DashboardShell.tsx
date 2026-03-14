import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { CurrentUser } from "@/lib/auth";

interface DashboardShellProps {
  children: React.ReactNode;
  user: CurrentUser;
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
