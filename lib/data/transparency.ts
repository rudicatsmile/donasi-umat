import { createClient } from "@/lib/supabase/server";
import {
  DUMMY_CAMPAIGNS,
  DUMMY_WITHDRAWALS,
  type TransparencyReport,
  type WithdrawalRequest,
} from "@/lib/dummy-data";

export async function getTransparencyReports(campaignId?: string): Promise<TransparencyReport[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("transparency_reports")
      .select(`
        *,
        campaigns (
          id,
          title
        )
      `)
      .order("disbursement_date", { ascending: false });

    if (campaignId) {
      q = q.eq("campaign_id", campaignId);
    }

    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        campaignId: item.campaign_id,
        title: item.title,
        amountUsed: Number(item.amount_used),
        disbursementDate: item.disbursement_date,
        description: item.description,
        beneficiaries: item.beneficiaries || "",
        photoUrls: item.photo_urls || [],
        status: item.status,
        reviewedAt: item.reviewed_at || undefined,
      }));
    }
  } catch (err) {
    // Fallback
  }

  const allReports: TransparencyReport[] = [];
  DUMMY_CAMPAIGNS.forEach((c) => {
    (c.transparencyReports || []).forEach((r) => {
      allReports.push(r);
    });
  });

  if (campaignId) {
    return allReports.filter((r) => r.campaignId === campaignId);
  }
  return allReports;
}

export async function getWithdrawals(campaignId?: string): Promise<WithdrawalRequest[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("withdrawals")
      .select(`
        *,
        campaigns (
          id,
          title
        ),
        profiles!withdrawals_fundraiser_id_fkey (
          id,
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (campaignId) {
      q = q.eq("campaign_id", campaignId);
    }

    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        withdrawalCode: item.withdrawal_code,
        campaignId: item.campaign_id,
        campaignTitle: item.campaigns?.title || "Program Kebaikan",
        fundraiserId: item.fundraiser_id,
        fundraiserName: item.profiles?.full_name || "Penggalang Dana",
        requestedAmount: Number(item.requested_amount),
        purposeDescription: item.purpose_description,
        bankName: item.bank_name,
        bankAccountNumber: item.bank_account_number,
        bankAccountHolder: item.bank_account_holder,
        status: item.status,
        rejectionReason: item.rejection_reason || undefined,
        transferProofUrl: item.transfer_proof_url || undefined,
        transferredAt: item.transferred_at || undefined,
        createdAt: item.created_at,
      }));
    }
  } catch (err) {
    // Fallback
  }

  if (campaignId) {
    return DUMMY_WITHDRAWALS.filter((w) => w.campaignId === campaignId);
  }
  return DUMMY_WITHDRAWALS;
}
