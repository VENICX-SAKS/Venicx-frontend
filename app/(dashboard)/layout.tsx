import { DashboardShell } from "@/components/layout/DashboardShell";

// Temporary placeholder — will be replaced with real JWT-decoded user
const PLACEHOLDER_USER = {
  full_name: "Operations Admin",
  email: "operations@venicx.com",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell user={PLACEHOLDER_USER}>{children}</DashboardShell>;
}
