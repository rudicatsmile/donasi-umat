"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
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

    const adminClient = createAdminClient();

    // Resolve campaign ID if passed as slug
    let campaignId = validated.campaign_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    if (!isUuid) {
      const { data: cData } = await adminClient.from("campaigns").select("id").eq("slug", campaignId).maybeSingle();
      if (cData?.id) campaignId = cData.id;
    }

    // Resolve donor ID
    let donorId = user?.id;
    if (!donorId) {
      const cookieStore = await cookies();
      const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
      if (demoEmail) {
        const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
        if (p?.id) donorId = p.id;
      }
    }
    if (!donorId && validated.donor_email) {
      const { data: p } = await adminClient.from("profiles").select("id").eq("email", validated.donor_email).maybeSingle();
      if (p?.id) donorId = p.id;
    }
    if (!donorId) {
      const { data: firstDonor } = await adminClient.from("profiles").select("id").eq("role", "donor").limit(1).maybeSingle();
      if (firstDonor?.id) donorId = firstDonor.id;
    }

    // Update donor profile name/phone if provided
    if (donorId && (validated.donor_name || validated.donor_phone)) {
      const updates: any = {};
      if (validated.donor_name) updates.full_name = sanitizePlainText(validated.donor_name);
      if (validated.donor_phone) updates.phone_wa = validated.donor_phone;
      await adminClient.from("profiles").update(updates).eq("id", donorId);
    }

    // Payloads strictly matches public.donations table columns
    const payload = {
      donation_code: donationCode,
      campaign_id: campaignId,
      donor_id: donorId,
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
          .eq("id", campaignId)
          .maybeSingle();

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
            accountNumber: validated.bank_destination.includes("BSI") ? "7189 0123 45" : "1234567890",
            accountHolder: "Yayasan DonasiUmat",
            expiresAt: new Date(expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          },
        });
      } catch (waErr) {
        console.warn("Notice: Failed to dispatch WhatsApp donation instruction:", waErr);
      }
    }

    if (donorId) {
      await sendInAppNotification({
        userId: donorId,
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

export async function uploadPaymentProofAction(donationIdOrFormData: string | FormData, directProofUrl?: string) {
  try {
    let donationId: string;
    let proofUrl: string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();

    let donorId = user?.id;
    if (!donorId) {
      const cookieStore = await cookies();
      const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
      if (demoEmail) {
        const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
        if (p?.id) donorId = p.id;
      }
    }
    if (!donorId) {
      const { data: firstDonor } = await adminClient.from("profiles").select("id").eq("role", "donor").limit(1).maybeSingle();
      if (firstDonor?.id) donorId = firstDonor.id;
    }

    if (typeof donationIdOrFormData === "string") {
      donationId = donationIdOrFormData;
      proofUrl = directProofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80";
    } else {
      donationId = (donationIdOrFormData.get("donation_id") as string) || "";
      const file = donationIdOrFormData.get("proof_file") as File | null;
      const rawUrl = donationIdOrFormData.get("proof_url") as string | null;

      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${donationId || "proof"}-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadErr } = await adminClient.storage
          .from("payment-proofs")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (uploadErr) {
          console.warn("Storage upload notice:", uploadErr.message);
          proofUrl = rawUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80";
        } else {
          const { data: signed } = await adminClient.storage
            .from("payment-proofs")
            .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 5); // 5 years valid
          proofUrl = signed?.signedUrl || rawUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80";
        }
      } else {
        proofUrl = rawUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80";
      }
    }

    if (!proofUrl || proofUrl.trim().length === 0) {
      return { success: false, error: "Bukti transfer wajib disertakan." };
    }

    const { error } = await adminClient
      .from("donations")
      .update({
        proof_url: proofUrl,
        status: "waiting_verification",
      })
      .eq("id", donationId);

    if (error) {
      console.warn("Upload payment proof notice:", error.message);
    }

    await logAudit({
      actorId: donorId,
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
      proofUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengunggah bukti transfer" };
  }
}

export async function verifyDonationAction(donationId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();

    // Resolve admin UUID
    let adminId = user?.id;
    if (!adminId) {
      const cookieStore = await cookies();
      const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
      if (demoEmail) {
        const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
        if (p?.id) adminId = p.id;
      }
    }
    if (!adminId) {
      const { data: adminProf } = await adminClient.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
      if (adminProf?.id) adminId = adminProf.id;
    }

    const now = new Date().toISOString();

    // 1. Fetch current donation details
    const { data: donation, error: fetchErr } = await adminClient
      .from("donations")
      .select(`
        id,
        campaign_id,
        amount,
        donation_code,
        donor_id,
        status,
        donor:donor_id (
          id,
          full_name,
          phone_wa,
          email
        )
      `)
      .eq("id", donationId)
      .maybeSingle();

    if (fetchErr) {
      console.warn("Fetch donation fallback notice:", fetchErr.message);
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
    let campaignInfo: { title: string; slug: string; fundraiser_id?: string } | null = null;
    if (donation?.campaign_id) {
      const { data: campaign } = await adminClient
        .from("campaigns")
        .select("id, title, slug, fundraiser_id, collected_amount, donor_count")
        .eq("id", donation.campaign_id)
        .maybeSingle();

      if (campaign) {
        campaignInfo = campaign;
        await adminClient
          .from("campaigns")
          .update({
            collected_amount: (Number(campaign.collected_amount) || 0) + (Number(donation.amount) || 0),
            donor_count: (Number(campaign.donor_count) || 0) + 1,
            updated_at: now,
          })
          .eq("id", donation.campaign_id);
      }
    }

    // 4. Send Notifications (WhatsApp & In-App)
    const formattedAmount = `Rp ${(Number(donation?.amount) || 0).toLocaleString("id-ID")}`;
    const donorName = (donation?.donor as any)?.full_name || "Sahabat Donatur";
    const donorPhone = (donation?.donor as any)?.phone_wa;

    if (donorPhone) {
      try {
        await sendWhatsAppNotification({
          recipientPhone: donorPhone,
          recipientName: donorName,
          templateKey: "donation_verified",
          params: {
            recipientName: donorName,
            campaignTitle: campaignInfo?.title || "Program Kebaikan",
            campaignSlug: campaignInfo?.slug || "",
            amount: formattedAmount,
            donationCode: donation?.donation_code || "",
          },
        });
      } catch (waErr) {
        console.warn("WhatsApp notification notice:", waErr);
      }
    }

    if (donation?.donor_id) {
      await sendInAppNotification({
        userId: donation.donor_id,
        title: "Donasi Terverifikasi!",
        message: `Alhamdulillah! Donasi Anda sebesar ${formattedAmount} untuk kampanye "${campaignInfo?.title || 'Program Kebaikan'}" telah terverifikasi.`,
        type: "success",
        linkUrl: `/dashboard/riwayat-donasi/${donationId}`,
      });
    }

    if (campaignInfo?.fundraiser_id) {
      await sendInAppNotification({
        userId: campaignInfo.fundraiser_id,
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
    revalidatePath("/dashboard");

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

    const adminClient = createAdminClient();

    // Resolve admin UUID
    let adminId = user?.id;
    if (!adminId) {
      const cookieStore = await cookies();
      const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
      if (demoEmail) {
        const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
        if (p?.id) adminId = p.id;
      }
    }
    if (!adminId) {
      const { data: adminProf } = await adminClient.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
      if (adminProf?.id) adminId = adminProf.id;
    }

    const now = new Date().toISOString();

    const { data: donation } = await adminClient
      .from("donations")
      .select(`
        id,
        amount,
        donation_code,
        donor_id,
        donor:donor_id (
          full_name,
          phone_wa,
          email
        )
      `)
      .eq("id", donationId)
      .maybeSingle();

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
      console.warn("Reject donation notice:", error.message);
    }

    // Send notifications to donor
    if (donation) {
      const formattedAmount = `Rp ${(Number(donation.amount) || 0).toLocaleString("id-ID")}`;
      const donorName = (donation.donor as any)?.full_name || "Sahabat Donatur";
      const donorPhone = (donation.donor as any)?.phone_wa;

      if (donorPhone) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: donorPhone,
            recipientName: donorName,
            templateKey: "donation_rejected",
            params: {
              recipientName: donorName,
              amount: formattedAmount,
              donationCode: donation.donation_code,
              reason,
            },
          });
        } catch (waErr) {
          console.warn("WhatsApp rejection notification notice:", waErr);
        }
      }

      if (donation.donor_id) {
        await sendInAppNotification({
          userId: donation.donor_id,
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
    revalidatePath("/dashboard");

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
      console.warn("Expire donations notice:", error.message);
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

export async function getAdminDonationsAction() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("donations")
      .select(`
        id,
        donation_code,
        campaign_id,
        donor_id,
        amount,
        unique_code,
        total_transfer,
        bank_destination,
        is_anonymous,
        is_amount_hidden,
        prayer_message,
        proof_url,
        status,
        rejection_reason,
        verified_by,
        verified_at,
        expires_at,
        created_at,
        campaigns (
          id,
          title,
          slug,
          cover_image_url
        ),
        donor:donor_id (
          id,
          full_name,
          email,
          phone_wa
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("getAdminDonationsAction error:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        donationCode: row.donation_code,
        campaignId: row.campaign_id,
        campaignTitle: row.campaigns?.title || "Program Kebaikan",
        campaignSlug: row.campaigns?.slug || "",
        donorId: row.donor_id,
        donorName: row.is_anonymous ? "Hamba Allah" : (row.donor?.full_name || "Sahabat Donatur"),
        donorEmail: row.donor?.email || "",
        donorPhone: row.donor?.phone_wa || "-",
        amount: Number(row.amount),
        uniqueCode: Number(row.unique_code),
        totalTransfer: Number(row.total_transfer),
        bankDestination: row.bank_destination,
        isAnonymous: Boolean(row.is_anonymous),
        isAmountHidden: Boolean(row.is_amount_hidden),
        prayerMessage: row.prayer_message || "",
        proofUrl: row.proof_url || null,
        status: row.status,
        rejectionReason: row.rejection_reason || null,
        verifiedBy: row.verified_by || null,
        verifiedAt: row.verified_at || null,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getUserDonationsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();
    let donorId = user?.id;

    if (!donorId) {
      const cookieStore = await cookies();
      const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
      if (demoEmail) {
        const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
        if (p?.id) donorId = p.id;
      }
    }

    if (!donorId) {
      // Default fallback to first donor profile in DB (e.g. Dimas Nugraha)
      const { data: firstDonor } = await adminClient.from("profiles").select("id").eq("role", "donor").limit(1).maybeSingle();
      if (firstDonor?.id) donorId = firstDonor.id;
    }

    if (!donorId) {
      return { success: true, data: [] };
    }

    const { data, error } = await adminClient
      .from("donations")
      .select(`
        id,
        donation_code,
        campaign_id,
        donor_id,
        amount,
        unique_code,
        total_transfer,
        bank_destination,
        is_anonymous,
        is_amount_hidden,
        prayer_message,
        proof_url,
        status,
        rejection_reason,
        verified_by,
        verified_at,
        expires_at,
        created_at,
        campaigns (
          id,
          title,
          slug,
          cover_image_url
        ),
        donor:donor_id (
          id,
          full_name,
          email,
          phone_wa
        )
      `)
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("getUserDonationsAction error:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        donationCode: row.donation_code,
        campaignId: row.campaign_id,
        campaignTitle: row.campaigns?.title || "Program Kebaikan",
        campaignSlug: row.campaigns?.slug || "",
        donorId: row.donor_id,
        donorName: row.is_anonymous ? "Hamba Allah" : (row.donor?.full_name || "Sahabat Donatur"),
        donorEmail: row.donor?.email || "",
        donorPhone: row.donor?.phone_wa || "-",
        amount: Number(row.amount),
        uniqueCode: Number(row.unique_code),
        totalTransfer: Number(row.total_transfer),
        bankDestination: row.bank_destination,
        isAnonymous: Boolean(row.is_anonymous),
        isAmountHidden: Boolean(row.is_amount_hidden),
        prayerMessage: row.prayer_message || "",
        proofUrl: row.proof_url || null,
        status: row.status,
        rejectionReason: row.rejection_reason || null,
        verifiedBy: row.verified_by || null,
        verifiedAt: row.verified_at || null,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getDonationDetailAction(id: string) {
  try {
    const adminClient = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = adminClient
      .from("donations")
      .select(`
        id,
        donation_code,
        campaign_id,
        donor_id,
        amount,
        unique_code,
        total_transfer,
        bank_destination,
        is_anonymous,
        is_amount_hidden,
        prayer_message,
        proof_url,
        status,
        rejection_reason,
        verified_by,
        verified_at,
        expires_at,
        created_at,
        campaigns (
          id,
          title,
          slug,
          cover_image_url,
          beneficiary_location
        ),
        donor:donor_id (
          id,
          full_name,
          email,
          phone_wa
        )
      `);

    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.or(`donation_code.eq.${id},id.eq.${id}`);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      return { success: false, error: error?.message || "Donasi tidak ditemukan", data: null };
    }

    const r = row as any;

    return {
      success: true,
      data: {
        id: r.id,
        donationCode: r.donation_code,
        campaignId: r.campaign_id,
        campaignTitle: r.campaigns?.title || "Program Kebaikan",
        campaignSlug: r.campaigns?.slug || "",
        beneficiaryLocation: r.campaigns?.beneficiary_location || "",
        donorId: r.donor_id,
        donorName: r.is_anonymous ? "Hamba Allah" : (r.donor?.full_name || "Sahabat Donatur"),
        donorEmail: r.donor?.email || "",
        donorPhone: r.donor?.phone_wa || "-",
        amount: Number(r.amount),
        uniqueCode: Number(r.unique_code),
        totalTransfer: Number(r.total_transfer),
        bankDestination: r.bank_destination,
        isAnonymous: Boolean(r.is_anonymous),
        isAmountHidden: Boolean(r.is_amount_hidden),
        prayerMessage: r.prayer_message || "",
        proofUrl: r.proof_url || null,
        status: r.status,
        rejectionReason: r.rejection_reason || null,
        verifiedBy: r.verified_by || null,
        verifiedAt: r.verified_at || null,
        expiresAt: r.expires_at,
        createdAt: r.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}

export async function getCurrentDonorProfileAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();
    let profile: any = null;

    if (user?.id) {
      const { data } = await adminClient.from("profiles").select("id, full_name, email, phone_wa, avatar_url").eq("id", user.id).maybeSingle();
      if (data) profile = data;
    }

    if (!profile) {
      const cookieStore = await cookies();
      const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
      if (demoEmail) {
        const { data } = await adminClient.from("profiles").select("id, full_name, email, phone_wa, avatar_url").eq("email", demoEmail).maybeSingle();
        if (data) profile = data;
      }
    }

    if (!profile) {
      const { data } = await adminClient.from("profiles").select("id, full_name, email, phone_wa, avatar_url").eq("role", "donor").limit(1).maybeSingle();
      if (data) profile = data;
    }

    return { success: true, profile };
  } catch (err: any) {
    return { success: false, profile: null };
  }
}

export async function getOfficialBankAccountsAction() {
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("platform_settings")
      .select("value")
      .eq("key", "bank_transfer_official")
      .maybeSingle();

    const banks = [];
    if (data?.value) {
      const val = data.value as any;
      banks.push({
        bankName: val.bank_name || "BCA",
        accountNumber: val.account_number || "1234567890",
        accountHolder: val.account_holder || "Yayasan DonasiUmat Indonesia",
        badge: "Bank Resmi Utama",
      });
    }

    if (!banks.some((b) => b.bankName.includes("BSI"))) {
      banks.push({
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7189 0123 45",
        accountHolder: "Yayasan DonasiUmat Indonesia",
        badge: "Syariah",
      });
    }
    if (!banks.some((b) => b.bankName.includes("Mandiri"))) {
      banks.push({
        bankName: "Bank Mandiri",
        accountNumber: "137 000 9876 543",
        accountHolder: "Yayasan DonasiUmat Indonesia",
        badge: "Nasional",
      });
    }

    return { success: true, banks };
  } catch (err: any) {
    return {
      success: true,
      banks: [
        {
          bankName: "BCA",
          accountNumber: "1234567890",
          accountHolder: "Yayasan DonasiUmat Indonesia",
          badge: "Bank Resmi Utama",
        },
        {
          bankName: "Bank Syariah Indonesia (BSI)",
          accountNumber: "7189 0123 45",
          accountHolder: "Yayasan DonasiUmat Indonesia",
          badge: "Syariah",
        },
      ],
    };
  }
}

export async function getCampaignForDonationAction(slug: string) {
  try {
    const { getCampaignBySlug } = await import("@/lib/data/campaigns");
    const campaign = await getCampaignBySlug(slug);
    return { success: true, campaign };
  } catch (err: any) {
    return { success: false, campaign: null, error: err.message };
  }
}

