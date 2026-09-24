import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell activeRole="donor">{children}</DashboardShell>;
}
