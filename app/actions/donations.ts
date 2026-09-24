"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";
import { sanitizePlainText } from "@/lib/sanitize";

const donationSchema = z.object({
  campaign_id: z.string().min(1, "Kampanye tidak valid"),
  amount: z.coerce.number().min(10000, "Donasi minimal Rp 10.000"),
  bank_destination: z.string().min(2, "Pilih bank tujuan transfer"),
  is_anonymous: z.boolean().default(false),
  is_amount_hidden: z.boolean().default(false),
  prayer_message: z.string().max(500, "Doa maksimal 500 karakter").optional().nullable(),
  donor_name: z.string().optional().nullable(),
  donor_email: z.string().email("Format email tidak valid").optional().nullable(),
  donor_phone: z.string().optional().nullable(),
});

function generateDonationCode(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DON-${dateStr}-${rand}`;
}

export async function createDonationAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      amount: formData.get("amount"),
      bank_destination: formData.get("bank_destination"),
      is_anonymous: formData.get("is_anonymous") === "true" || formData.get("is_anonymous") === "on",
      is_amount_hidden: formData.get("is_amount_hidden") === "true" || formData.get("is_amount_hidden") === "on",
      prayer_message: formData.get("prayer_message") || null,
      donor_name: formData.get("donor_name") || null,
      donor_email: formData.get("donor_email") || null,
      donor_phone: formData.get("donor_phone") || null,
    };

    const validated = donationSchema.parse(rawData);

    // 3-digit unique code between 101 and 999
    const uniqueCode = Math.floor(100 + Math.random() * 899);
    const totalTransfer = validated.amount + uniqueCode;
    const donationCode = generateDonationCode();

    // 24 hours expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const donorId = user?.id || "donor-guest-id";
    const adminClient = createAdminClient();

    const payload = {
      donation_code: donationCode,
      campaign_id: validated.campaign_id,
      donor_id: donorId,
      donor_name: validated.donor_name ? sanitizePlainText(validated.donor_name) : null,
      donor_email: validated.donor_email || null,
      donor_phone: validated.donor_phone || null,
      amount: validated.amount,
      unique_code: uniqueCode,
      total_transfer: totalTransfer,
      bank_destination: validated.bank_destination,
      is_anonymous: validated.is_anonymous,
      is_amount_hidden: validated.is_amount_hidden,
      prayer_message: validated.prayer_message ? sanitizePlainText(validated.prayer_message) : null,
      status: "pending" as const,
      expires_at: expiresAt,
    };

    const { data: inserted, error } = await adminClient
      .from("donations")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Create donation insert fallback notice:", error.message);
    }

    const donationId = inserted?.id || `don-${Date.now()}`;

    await logAudit({
      actorId: donorId,
      actorRole: "donor",
      action: "create",
      entityType: "donation",
      entityId: donationId,
      description: `Inisiasi donasi sebesar Rp ${validated.amount.toLocaleString("id-ID")} dengan kode unik ${uniqueCode} (Total: Rp ${totalTransfer.toLocaleString("id-ID")})`,
      afterData: payload,
    });

    // Send WhatsApp payment instruction notification if phone provided
    if (validated.donor_phone) {
      try {
        const { data: camp } = await adminClient
          .from("campaigns")
          .select("title")
          .eq("id", validated.campaign_id)
          .single();

        await sendWhatsAppNotification({
          recipientPhone: validated.donor_phone,
          recipientName: validated.donor_name || "Sahabat Kebaikan",
          templateKey: "donation_instruction",
          params: {
            recipientName: validated.donor_name || "Sahabat Kebaikan",
            campaignTitle: camp?.title || "Program Kebaikan",
            amount: `Rp ${validated.amount.toLocaleString("id-ID")}`,
            totalTransfer: `Rp ${totalTransfer.toLocaleString("id-ID")}`,
            uniqueCode,
            donationCode,
            bankName: validated.bank_destination,
            accountNumber: validated.bank_destination.includes("BSI") ? "7189 0123 45" : "137 000 9876 543",
            accountHolder: "Yayasan DonasiUmat",
            expiresAt: new Date(expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          },
        });
      } catch (waErr) {
        console.warn("Notice: Failed to dispatch WhatsApp donation instruction:", waErr);
      }
    }

    if (user?.id) {
      await sendInAppNotification({
        userId: user.id,
        title: "Instruksi Transfer Donasi",
        message: `Silakan transfer tepat Rp ${totalTransfer.toLocaleString("id-ID")} (termasuk kode unik) untuk kode donasi ${donationCode}.`,
        type: "info",
        linkUrl: `/dashboard/riwayat-donasi/${donationId}`,
      });
    }

    revalidatePath(`/kampanye`);
    revalidatePath("/dashboard/riwayat-donasi");
    revalidatePath("/admin/transaksi");

    return {
      success: true,
      donationId,
      donationCode,
      amount: validated.amount,
      uniqueCode,
      totalTransfer,
      bankDestination: validated.bank_destination,
      expiresAt,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal membuat instruksi donasi" };
  }
}

export async function uploadPaymentProofAction(donationId: string, proofUrl: string) {
  try {
    if (!proofUrl || proofUrl.trim().length === 0) {
      return { success: false, error: "Bukti transfer wajib disertakan." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "donor-mock-id";

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("donations")
      .update({
        proof_url: proofUrl,
        status: "waiting_verification",
      })
      .eq("id", donationId);

    if (error) {
      console.warn("Upload payment proof fallback notice:", error.message);
    }

    await logAudit({
      actorId: userId,
      actorRole: "donor",
      action: "update",
      entityType: "donation",
      entityId: donationId,
      description: `Mengunggah bukti transfer manual untuk donasi ${donationId}`,
      afterData: { status: "waiting_verification", proof_url: proofUrl },
    });

    revalidatePath("/dashboard/riwayat-donasi");
    revalidatePath(`/dashboard/riwayat-donasi/${donationId}`);
    revalidatePath("/admin/transaksi");

    return {
      success: true,
      message: "Bukti transfer berhasil dikirim. Admin akan segera memverifikasi mutasi rekening Anda.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengunggah bukti transfer" };
  }
}

export async function verifyDonationAction(donationId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    // 1. Fetch current donation details
    const { data: donation, error: fetchErr } = await adminClient
      .from("donations")
      .select("id, campaign_id, amount, donation_code, donor_name, donor_phone, user_id, status")
      .eq("id", donationId)
      .single();

    if (fetchErr && !donation) {
      console.warn("Fetch donation fallback notice:", fetchErr?.message);
    }

    // 2. Mark donation as verified
    const { error: updateDonationErr } = await adminClient
      .from("donations")
      .update({
        status: "verified",
        verified_by: adminId,
        verified_at: now,
        rejection_reason: null,
      })
      .eq("id", donationId);

    if (updateDonationErr) {
      console.warn("Verify donation fallback notice:", updateDonationErr.message);
    }

    // 3. Increment campaign collected_amount & donor_count and fetch campaign info for notification
    let campaignInfo: { title: string; slug: string; user_id?: string } | null = null;
    if (donation?.campaign_id) {
      const { data: campaign } = await adminClient
        .from("campaigns")
        .select("id, title, slug, user_id, collected_amount, donor_count")
        .eq("id", donation.campaign_id)
        .single();

      if (campaign) {
        campaignInfo = campaign;
        await adminClient
          .from("campaigns")
          .update({
            collected_amount: (campaign.collected_amount || 0) + (donation.amount || 0),
            donor_count: (campaign.donor_count || 0) + 1,
            updated_at: now,
          })
          .eq("id", donation.campaign_id);
      }
    }

    // 4. Send Notifications (WhatsApp & In-App)
    const formattedAmount = `Rp ${(donation?.amount || 0).toLocaleString("id-ID")}`;
    if (donation?.donor_phone) {
      try {
        await sendWhatsAppNotification({
          recipientPhone: donation.donor_phone,
          recipientName: donation.donor_name || "Sahabat Donatur",
          templateKey: "donation_verified",
          params: {
            recipientName: donation.donor_name || "Sahabat Donatur",
            campaignTitle: campaignInfo?.title || "Program Kebaikan",
            campaignSlug: campaignInfo?.slug || "",
            amount: formattedAmount,
            donationCode: donation.donation_code,
          },
        });
      } catch (waErr) {
        console.warn("WhatsApp notification failed:", waErr);
      }
    }

    if (donation?.user_id) {
      await sendInAppNotification({
        userId: donation.user_id,
        title: "Donasi Terverifikasi!",
        message: `Alhamdulillah! Donasi Anda sebesar ${formattedAmount} untuk kampanye "${campaignInfo?.title || 'Program Kebaikan'}" telah terverifikasi.`,
        type: "success",
        linkUrl: `/dashboard/riwayat-donasi/${donationId}`,
      });
    }

    if (campaignInfo?.user_id) {
      await sendInAppNotification({
        userId: campaignInfo.user_id,
        title: "Donasi Masuk!",
        message: `Kabar baik! Donasi baru sebesar ${formattedAmount} telah terverifikasi untuk kampanye Anda "${campaignInfo.title}".`,
        type: "info",
        linkUrl: "/galang-dana/kampanye-saya",
      });
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "verify",
      entityType: "donation",
      entityId: donationId,
      description: `Memverifikasi bukti transfer donasi ${donationId} (Status: verified)`,
      afterData: { status: "verified", verified_at: now },
    });

    revalidatePath("/admin/transaksi");
    revalidatePath("/kampanye");
    revalidatePath("/dashboard/riwayat-donasi");

    return {
      success: true,
      message: "Donasi berhasil diverifikasi dan dana telah diakumulasikan ke kampanye.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memverifikasi donasi" };
  }
}

export async function rejectDonationAction(donationId: string, reason: string) {
  try {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Alasan penolakan minimal 5 karakter wajib disertakan." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { data: donation } = await adminClient
      .from("donations")
      .select("id, amount, donation_code, donor_name, donor_phone, user_id")
      .eq("id", donationId)
      .single();

    const { error } = await adminClient
      .from("donations")
      .update({
        status: "rejected",
        verified_by: adminId,
        verified_at: now,
        rejection_reason: reason,
      })
      .eq("id", donationId);

    if (error) {
      console.warn("Reject donation fallback notice:", error.message);
    }

    // Send notifications to donor
    if (donation) {
      const formattedAmount = `Rp ${(donation.amount || 0).toLocaleString("id-ID")}`;
      if (donation.donor_phone) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: donation.donor_phone,
            recipientName: donation.donor_name || "Sahabat Donatur",
            templateKey: "donation_rejected",
            params: {
              recipientName: donation.donor_name || "Sahabat Donatur",
              amount: formattedAmount,
              donationCode: donation.donation_code,
              reason,
            },
          });
        } catch (waErr) {
          console.warn("WhatsApp rejection notification failed:", waErr);
        }
      }

      if (donation.user_id) {
        await sendInAppNotification({
          userId: donation.user_id,
          title: "Verifikasi Donasi Belum Berhasil",
          message: `Verifikasi donasi ${donation.donation_code} (${formattedAmount}) ditolak: "${reason}".`,
          type: "warning",
          linkUrl: "/dashboard/riwayat-donasi",
        });
      }
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "reject",
      entityType: "donation",
      entityId: donationId,
      description: `Menolak donasi ${donationId}. Alasan: ${reason}`,
      afterData: { status: "rejected", rejection_reason: reason },
    });

    revalidatePath("/admin/transaksi");
    revalidatePath("/dashboard/riwayat-donasi");

    return {
      success: true,
      message: "Donasi ditolak dan notifikasi dikirimkan ke donatur.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menolak donasi" };
  }
}

export async function expirePendingDonationsAction() {
  try {
    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { data: expiredList, error } = await adminClient
      .from("donations")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("expires_at", now)
      .select("id");

    if (error) {
      console.warn("Expire donations fallback notice:", error.message);
    }

    const count = expiredList?.length || 0;

    if (count > 0) {
      await logAudit({
        actorRole: "system",
        action: "update",
        entityType: "donation",
        entityId: "batch-expiry",
        description: `Sistem otomatis meng-expire ${count} donasi yang melewati batas 24 jam`,
      });
    }

    return { success: true, expiredCount: count };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memproses kedaluwarsa donasi" };
  }
}
