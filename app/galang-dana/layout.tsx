import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default function FundraiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell activeRole="fundraiser">{children}</DashboardShell>;
}
