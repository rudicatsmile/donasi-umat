"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLog, IdentityVerification, DonationTransaction } from "@/lib/dummy-data";

export interface AdminDashboardStats {
  pendingTransactionsCount: number;
  pendingIdentitiesCount: number;
  pendingWithdrawalsCount: number;
  totalDonationsSum: number;
  totalDisbursedSum: number;
  activeCampaignsCount: number;
  totalUsersCount: number;
  recentTransactions: DonationTransaction[];
  recentIdentities: IdentityVerification[];
  recentAuditLogs: AuditLog[];
}

export async function getAdminDashboardStatsAction(): Promise<{
  success: boolean;
  data: AdminDashboardStats;
  error?: string;
}> {
  try {
    const adminClient = createAdminClient();

    // 1. Pending counts
    const [
      { count: pendingTxCount },
      { count: pendingIdCount },
      { count: pendingWdCount },
      { count: activeCampaignsCount },
      { count: totalUsersCount },
    ] = await Promise.all([
      adminClient.from("donations").select("*", { count: "exact", head: true }).eq("status", "waiting_verification"),
      adminClient.from("identity_verifications").select("*", { count: "exact", head: true }).eq("status", "pending"),
      adminClient.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
      adminClient.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
      adminClient.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    // 2. Sum of verified donations
    const { data: verifiedDonations } = await adminClient
      .from("donations")
      .select("amount")
      .eq("status", "verified");
    const totalDonationsSum = (verifiedDonations || []).reduce((acc, curr: any) => acc + Number(curr.amount || 0), 0);

    // 3. Sum of transferred withdrawals
    const { data: transferredWithdrawals } = await adminClient
      .from("withdrawals")
      .select("requested_amount")
      .eq("status", "transferred");
    const totalDisbursedSum = (transferredWithdrawals || []).reduce((acc, curr: any) => acc + Number(curr.requested_amount || 0), 0);

    // 4. Recent transactions
    const { data: recentTxRows } = await adminClient
      .from("donations")
      .select(`
        id, donation_code, campaign_id, donor_id, amount, unique_code,
        total_transfer, bank_destination, is_anonymous, is_amount_hidden,
        prayer_message, proof_url, status, rejection_reason,
        verified_by, verified_at, expires_at, created_at,
        campaigns:campaign_id ( title, slug ),
        profiles:donor_id ( full_name, email, phone_wa )
      `)
      .order("created_at", { ascending: false })
      .limit(6);

    const recentTransactions: DonationTransaction[] = (recentTxRows || []).map((row: any) => ({
      id: row.id,
      donationCode: row.donation_code,
      campaignId: row.campaign_id,
      campaignTitle: row.campaigns?.title || "Kampanye Kebaikan",
      campaignSlug: row.campaigns?.slug || "",
      donorId: row.donor_id || "anonymous",
      donorName: row.is_anonymous ? "Hamba Allah" : (row.profiles?.full_name || "Donatur"),
      donorEmail: row.profiles?.email || "-",
      donorPhone: row.profiles?.phone_wa || "-",
      amount: Number(row.amount),
      uniqueCode: Number(row.unique_code),
      totalTransfer: Number(row.total_transfer),
      bankDestination: row.bank_destination || "BCA (1234567890 a.n Yayasan DonasiUmat)",
      isAnonymous: Boolean(row.is_anonymous),
      isAmountHidden: Boolean(row.is_amount_hidden),
      prayerMessage: row.prayer_message || undefined,
      proofUrl: row.proof_url || undefined,
      status: row.status,
      rejectionReason: row.rejection_reason || undefined,
      verifiedAt: row.verified_at || undefined,
      verifiedBy: row.verified_by || undefined,
      expiresAt: row.expires_at || row.created_at,
      createdAt: row.created_at,
    }));

    // 5. Recent KYC Identities
    const { data: recentIdRows } = await adminClient
      .from("identity_verifications")
      .select(`
        id, user_id, id_type, id_number_masked, full_name_on_id, address,
        bank_name, bank_account_number, bank_account_holder,
        id_photo_url, selfie_photo_url, status, rejection_reason,
        reviewed_by, reviewed_at, created_at,
        profiles:user_id ( full_name, email, phone_wa )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    const recentIdentities: IdentityVerification[] = (recentIdRows || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.profiles?.full_name || row.full_name_on_id || "Pengguna",
      userEmail: row.profiles?.email || "-",
      userPhone: row.profiles?.phone_wa || "-",
      idType: row.id_type,
      idNumberMasked: row.id_number_masked,
      fullNameOnId: row.full_name_on_id,
      address: row.address,
      bankName: row.bank_name,
      bankAccountNumber: row.bank_account_number,
      bankAccountHolder: row.bank_account_holder,
      idPhotoUrl: row.id_photo_url,
      selfiePhotoUrl: row.selfie_photo_url,
      status: row.status,
      rejectionReason: row.rejection_reason || undefined,
      reviewedBy: row.reviewed_by ? "Administrator" : undefined,
      reviewedAt: row.reviewed_at || undefined,
      createdAt: row.created_at,
    }));

    // 6. Recent Audit Logs
    const { data: recentLogsRows } = await adminClient
      .from("audit_logs")
      .select(`
        id, actor_id, actor_role, action, entity_type, entity_id,
        description, before_data, after_data, ip_address, user_agent, created_at,
        profiles:actor_id ( full_name )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    const recentAuditLogs: AuditLog[] = (recentLogsRows || []).map((row: any) => ({
      id: row.id,
      actorId: row.actor_id || "system",
      actorName: row.profiles?.full_name || (row.actor_role === "admin" ? "Administrator" : "Sistem"),
      actorRole: row.actor_role as any,
      action: row.action as any,
      entityType: row.entity_type as any,
      entityId: row.entity_id,
      description: row.description || "-",
      beforeData: row.before_data || undefined,
      afterData: row.after_data || undefined,
      ipAddress: row.ip_address || "127.0.0.1",
      userAgent: row.user_agent || "Browser Client",
      createdAt: row.created_at,
    }));

    return {
      success: true,
      data: {
        pendingTransactionsCount: pendingTxCount || 0,
        pendingIdentitiesCount: pendingIdCount || 0,
        pendingWithdrawalsCount: pendingWdCount || 0,
        totalDonationsSum,
        totalDisbursedSum,
        activeCampaignsCount: activeCampaignsCount || 0,
        totalUsersCount: totalUsersCount || 0,
        recentTransactions,
        recentIdentities,
        recentAuditLogs,
      },
    };
  } catch (err: any) {
    console.error("Error in getAdminDashboardStatsAction:", err);
    return {
      success: false,
      data: {
        pendingTransactionsCount: 0,
        pendingIdentitiesCount: 0,
        pendingWithdrawalsCount: 0,
        totalDonationsSum: 0,
        totalDisbursedSum: 0,
        activeCampaignsCount: 0,
        totalUsersCount: 0,
        recentTransactions: [],
        recentIdentities: [],
        recentAuditLogs: [],
      },
      error: err.message || "Gagal memuat statistik dasbor",
    };
  }
}

export async function getAdminAuditLogsAction(): Promise<{
  success: boolean;
  data: AuditLog[];
  error?: string;
}> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("audit_logs")
      .select(`
        id, actor_id, actor_role, action, entity_type, entity_id,
        description, before_data, after_data, ip_address, user_agent, created_at,
        profiles:actor_id ( full_name )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, data: [], error: error.message };
    }

    const formatted: AuditLog[] = (data || []).map((row: any) => ({
      id: row.id,
      actorId: row.actor_id || "system",
      actorName: row.profiles?.full_name || (row.actor_role === "admin" ? "Administrator" : "Sistem"),
      actorRole: row.actor_role as any,
      action: row.action as any,
      entityType: row.entity_type as any,
      entityId: row.entity_id,
      description: row.description || "-",
      beforeData: row.before_data || undefined,
      afterData: row.after_data || undefined,
      ipAddress: row.ip_address || "127.0.0.1",
      userAgent: row.user_agent || "Browser Client",
      createdAt: row.created_at,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, data: [], error: err.message || "Gagal memuat jejak audit" };
  }
}
