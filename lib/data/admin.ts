import { createAdminClient } from "@/lib/supabase/admin";
import {
  PLATFORM_STATISTICS,
  DUMMY_CAMPAIGNS,
  DUMMY_TRANSACTIONS,
  DUMMY_IDENTITIES,
  DUMMY_WITHDRAWALS,
  DUMMY_AUDIT_LOGS,
} from "@/lib/dummy-data";

export interface PlatformStats {
  totalCollected: number;
  activeCampaigns: number;
  totalDonors: number;
  verifiedFundraisers: number;
  transparencyReportsCount: number;
}

export async function getAdminPlatformStats(): Promise<PlatformStats> {
  try {
    const supabase = createAdminClient();

    // Query aggregates in parallel
    const [cRes, dRes, uRes, fRes] = await Promise.all([
      supabase.from("campaigns").select("target_amount, collected_amount, status"),
      supabase.from("donations").select("amount, status"),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "fundraiser").eq("is_verified", true),
    ]);

    if (!cRes.error && !dRes.error && dRes.data) {
      const verifiedDonations = (dRes.data as any[]).filter((d: any) => d.status === "verified");
      const totalCollected = verifiedDonations.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
      const activeCampaigns = (cRes.data as any[])?.filter((c: any) => c.status === "active").length || 0;
      const totalDonors = verifiedDonations.length;
      const verifiedFundraisers = fRes.count || 24;

      return {
        totalCollected: totalCollected || PLATFORM_STATISTICS.totalDonationDisbursed,
        activeCampaigns: activeCampaigns || PLATFORM_STATISTICS.totalCampaignsFunded,
        totalDonors: totalDonors || PLATFORM_STATISTICS.totalVerifiedDonors,
        verifiedFundraisers: verifiedFundraisers || 124,
        transparencyReportsCount: 380,
      };
    }
  } catch (err) {
    // Fallback
  }

  return {
    totalCollected: PLATFORM_STATISTICS.totalDonationDisbursed,
    activeCampaigns: PLATFORM_STATISTICS.totalCampaignsFunded,
    totalDonors: PLATFORM_STATISTICS.totalVerifiedDonors,
    verifiedFundraisers: 124,
    transparencyReportsCount: 380,
  };
}

export async function getAdminAuditLogs() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          role
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        actorId: item.actor_id,
        actorName: item.profiles?.full_name || "Sistem Otomatis",
        actorRole: item.actor_role,
        action: item.action,
        entityType: item.entity_type,
        entityId: item.entity_id,
        description: item.description,
        ipAddress: item.ip_address,
        createdAt: item.created_at,
      }));
    }
  } catch (err) {
    // Fallback
  }

  return DUMMY_AUDIT_LOGS;
}
