import { createClient } from "@/lib/supabase/server";
import { DUMMY_TRANSACTIONS, type DonationTransaction } from "@/lib/dummy-data";

export async function getDonationsByCampaign(campaignId: string): Promise<DonationTransaction[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("donations")
      .select(`
        *,
        campaigns (
          id,
          title,
          slug
        ),
        profiles!donations_donor_id_fkey (
          id,
          full_name,
          email,
          phone_wa
        )
      `)
      .eq("campaign_id", campaignId)
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        donationCode: item.donation_code,
        campaignId: item.campaign_id,
        campaignTitle: item.campaigns?.title || "Program Kebaikan",
        campaignSlug: item.campaigns?.slug || "program-kebaikan",
        donorId: item.donor_id,
        donorName: item.is_anonymous ? "Hamba Allah" : (item.profiles?.full_name || "Donatur Baik"),
        donorEmail: item.is_anonymous ? "hambaallah@donasiumat.id" : (item.profiles?.email || "donatur@gmail.com"),
        donorPhone: item.profiles?.phone_wa || "+6281234567890",
        amount: Number(item.amount),
        uniqueCode: item.unique_code || 0,
        totalTransfer: Number(item.total_transfer),
        bankDestination: item.bank_destination,
        prayerMessage: item.prayer_message || undefined,
        isAnonymous: Boolean(item.is_anonymous),
        isAmountHidden: Boolean(item.is_amount_hidden),
        status: item.status,
        proofUrl: item.proof_url || undefined,
        createdAt: item.created_at,
        expiresAt: item.expires_at,
      }));
    }
  } catch (err) {
    // Fallback
  }

  return DUMMY_TRANSACTIONS.filter((d) => d.campaignId === campaignId);
}

export async function getUserDonations(userId?: string): Promise<DonationTransaction[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("donations")
      .select(`
        *,
        campaigns (
          id,
          title,
          slug,
          cover_image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (userId) {
      q = q.eq("donor_id", userId);
    }

    const { data, error } = await q;

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        donationCode: item.donation_code,
        campaignId: item.campaign_id,
        campaignTitle: item.campaigns?.title || "Program Kebaikan",
        campaignSlug: item.campaigns?.slug || "program-kebaikan",
        donorId: item.donor_id,
        donorName: item.is_anonymous ? "Hamba Allah" : "Saya",
        donorEmail: "donatur@gmail.com",
        donorPhone: "+6281234567890",
        amount: Number(item.amount),
        uniqueCode: item.unique_code || 0,
        totalTransfer: Number(item.total_transfer),
        bankDestination: item.bank_destination,
        prayerMessage: item.prayer_message || undefined,
        isAnonymous: Boolean(item.is_anonymous),
        isAmountHidden: Boolean(item.is_amount_hidden),
        status: item.status,
        proofUrl: item.proof_url || undefined,
        createdAt: item.created_at,
        expiresAt: item.expires_at,
      }));
    }
  } catch (err) {
    // Fallback
  }

  return DUMMY_TRANSACTIONS;
}
