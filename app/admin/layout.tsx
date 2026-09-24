import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell activeRole="admin">{children}</DashboardShell>;
}
