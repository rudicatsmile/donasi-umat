"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";
import { sanitizeHtml, sanitizePlainText } from "@/lib/sanitize";

async function resolveFundraiserId(supabase: any, adminClient: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  const cookieStore = await cookies();
  const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
  if (demoEmail) {
    const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
    if (p?.id) return p.id;
  }

  const { data: firstFundraiser } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "fundraiser")
    .limit(1)
    .maybeSingle();

  if (firstFundraiser?.id) return firstFundraiser.id;
  return "1bfce920-2748-42c7-9a62-bbe7151457b3";
}

async function resolveAdminId(supabase: any, adminClient: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  const cookieStore = await cookies();
  const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
  if (demoEmail) {
    const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
    if (p?.id) return p.id;
  }

  const { data: adminProf } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  return adminProf?.id || "0faa19b9-2a14-423e-8ede-dbe3a1437102";
}

// --- Campaign Updates Schema ---
const updateSchema = z.object({
  campaign_id: z.string().min(1, "ID Kampanye tidak valid"),
  title: z.string().min(5, "Judul kabar terbaru minimal 5 karakter"),
  content: z.string().min(20, "Isi kabar terbaru minimal 20 karakter"),
  image_url: z.string().optional().nullable(),
});

export async function createCampaignUpdateAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const authorId = await resolveFundraiserId(supabase, adminClient);

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      title: formData.get("title"),
      content: formData.get("content"),
      image_url: formData.get("image_url") || null,
    };

    const validated = updateSchema.parse(rawData);

    // Resolve campaign_id to UUID if slug passed
    let campaignId = validated.campaign_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    if (!isUuid) {
      const { data: c } = await adminClient.from("campaigns").select("id").eq("slug", campaignId).maybeSingle();
      if (c?.id) campaignId = c.id;
    }

    const payload = {
      campaign_id: campaignId,
      author_id: authorId,
      title: sanitizePlainText(validated.title),
      content: sanitizeHtml(validated.content),
      image_url: validated.image_url,
    };

    const { data: inserted, error } = await adminClient
      .from("campaign_updates")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Insert campaign update warning:", error.message);
      return { success: false, error: error.message };
    }

    const updateId = inserted?.id || `upd-${Date.now()}`;

    await logAudit({
      actorId: authorId,
      actorRole: "fundraiser",
      action: "publish",
      entityType: "campaign",
      entityId: campaignId,
      description: `Mempublikasikan kabar terbaru: "${validated.title}"`,
      afterData: payload,
    });

    // Broadcast notification to donors
    try {
      const { data: campaign } = await adminClient
        .from("campaigns")
        .select("title, slug")
        .eq("id", campaignId)
        .maybeSingle();

      const { data: donations } = await adminClient
        .from("donations")
        .select("donor_id, donor:donor_id(full_name, phone_wa)")
        .eq("campaign_id", campaignId)
        .eq("status", "verified")
        .limit(20);

      if (donations && donations.length > 0) {
        const notifiedUsers = new Set<string>();
        for (const d of donations) {
          const donorUser = d.donor as any;
          if (d.donor_id && !notifiedUsers.has(d.donor_id)) {
            notifiedUsers.add(d.donor_id);
            await sendInAppNotification({
              userId: d.donor_id,
              title: `Kabar Terbaru: ${campaign?.title || "Kampanye"}`,
              message: `Inisiator mempublikasikan perkembangan: "${validated.title}"`,
              type: "info",
              linkUrl: `/kampanye/${campaign?.slug || ""}`,
            });
          }
          if (donorUser?.phone_wa) {
            await sendWhatsAppNotification({
              recipientPhone: donorUser.phone_wa,
              recipientName: donorUser.full_name || "Sahabat Donatur",
              templateKey: "campaign_update_posted",
              params: {
                recipientName: donorUser.full_name || "Sahabat Donatur",
                campaignTitle: campaign?.title || "Program Kebaikan",
                campaignSlug: campaign?.slug || "",
                updateTitle: validated.title,
              },
            });
          }
        }
      }
    } catch (notifErr) {
      console.warn("Notice: Failed to broadcast update notification:", notifErr);
    }

    revalidatePath(`/kampanye`);
    revalidatePath(`/galang-dana/kampanye-saya`);
    revalidatePath(`/galang-dana/kampanye-saya/${validated.campaign_id}/update`);

    return {
      success: true,
      message: "Kabar terbaru berhasil dipublikasikan kepada para donatur.",
      updateId,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal mempublikasikan kabar terbaru" };
  }
}

// --- Transparency Reports Schema ---
const transparencyReportSchema = z.object({
  campaign_id: z.string().min(1, "ID Kampanye tidak valid"),
  title: z.string().min(5, "Judul laporan minimal 5 karakter"),
  amount_used: z.coerce.number().min(10000, "Nominal penggunaan dana minimal Rp 10.000"),
  disbursement_date: z.string().min(1, "Tanggal realisasi wajib diisi"),
  description: z.string().min(20, "Deskripsi rincian belanja dana minimal 20 karakter"),
  beneficiaries: z.string().optional().nullable(),
  photo_urls: z.array(z.string()).min(1, "Minimal sertakan 1 foto bukti kuitansi / dokumentasi belanja"),
});

export async function createTransparencyReportAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const authorId = await resolveFundraiserId(supabase, adminClient);

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      title: formData.get("title"),
      amount_used: formData.get("amount_used"),
      disbursement_date: formData.get("disbursement_date"),
      description: formData.get("description"),
      beneficiaries: formData.get("beneficiaries") || null,
      photo_urls: formData.getAll("photo_urls").filter(Boolean) as string[],
    };

    const validated = transparencyReportSchema.parse(rawData);

    let campaignId = validated.campaign_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    if (!isUuid) {
      const { data: c } = await adminClient.from("campaigns").select("id").eq("slug", campaignId).maybeSingle();
      if (c?.id) campaignId = c.id;
    }

    const payload = {
      campaign_id: campaignId,
      author_id: authorId,
      title: sanitizePlainText(validated.title),
      amount_used: validated.amount_used,
      disbursement_date: validated.disbursement_date,
      description: sanitizeHtml(validated.description),
      beneficiaries: validated.beneficiaries ? sanitizePlainText(validated.beneficiaries) : null,
      photo_urls: validated.photo_urls,
      status: "pending_review" as const,
    };

    const { data: inserted, error } = await adminClient
      .from("transparency_reports")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Insert transparency report warning:", error.message);
      return { success: false, error: error.message };
    }

    const reportId = inserted?.id || `rpt-${Date.now()}`;

    await logAudit({
      actorId: authorId,
      actorRole: "fundraiser",
      action: "create",
      entityType: "transparency_report",
      entityId: reportId,
      description: `Mengajukan laporan penyaluran dana: "${validated.title}" (Rp ${validated.amount_used.toLocaleString("id-ID")})`,
      afterData: payload,
    });

    revalidatePath("/admin/laporan-transparansi");
    revalidatePath(`/galang-dana/kampanye-saya/${validated.campaign_id}/laporan-transparansi`);

    return {
      success: true,
      message: "Laporan transparansi berhasil diajukan dan sedang menunggu verifikasi admin.",
      reportId,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal membuat laporan transparansi" };
  }
}

export const submitTransparencyReportAction = createTransparencyReportAction;

export async function approveTransparencyReportAction(reportId: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("transparency_reports")
      .update({
        status: "published",
        reviewed_by: adminId,
        reviewed_at: now,
        rejection_reason: null,
      })
      .eq("id", reportId);

    if (error) {
      console.warn("Approve transparency report warning:", error.message);
      return { success: false, error: error.message };
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "approve",
      entityType: "transparency_report",
      entityId: reportId,
      description: `Menyetujui dan menerbitkan laporan transparansi ${reportId}`,
    });

    revalidatePath("/admin/laporan-transparansi");
    revalidatePath("/kampanye");

    return {
      success: true,
      message: "Laporan transparansi berhasil disetujui dan dipublikasikan.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyetujui laporan" };
  }
}

export async function rejectTransparencyReportAction(reportId: string, reason: string) {
  try {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Alasan penolakan minimal 5 karakter wajib disertakan." };
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("transparency_reports")
      .update({
        status: "rejected",
        reviewed_by: adminId,
        reviewed_at: now,
        rejection_reason: reason,
      })
      .eq("id", reportId);

    if (error) {
      console.warn("Reject transparency report warning:", error.message);
      return { success: false, error: error.message };
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "reject",
      entityType: "transparency_report",
      entityId: reportId,
      description: `Menolak laporan transparansi ${reportId}. Alasan: ${reason}`,
    });

    revalidatePath("/admin/laporan-transparansi");

    return {
      success: true,
      message: "Laporan transparansi ditolak dan catatan telah dikirim ke inisiator.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menolak laporan" };
  }
}

// --- Withdrawals (Pencairan Dana) Schema ---
const withdrawalSchema = z.object({
  campaign_id: z.string().min(1, "ID Kampanye tidak valid"),
  requested_amount: z.coerce.number().min(100000, "Nominal pencairan dana minimal Rp 100.000"),
  purpose_description: z.string().min(15, "Tujuan penggunaan dana minimal 15 karakter"),
  bank_name: z.string().min(2, "Nama bank wajib dipilih"),
  bank_account_number: z.string().min(5, "Nomor rekening wajib diisi"),
  bank_account_holder: z.string().min(3, "Nama pemilik rekening wajib diisi"),
});

function generateWithdrawalCode(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WD-${dateStr}-${rand}`;
}

export async function requestWithdrawalAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const fundraiserId = await resolveFundraiserId(supabase, adminClient);

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      requested_amount: formData.get("requested_amount"),
      purpose_description: formData.get("purpose_description"),
      bank_name: formData.get("bank_name"),
      bank_account_number: formData.get("bank_account_number"),
      bank_account_holder: formData.get("bank_account_holder"),
    };

    const validated = withdrawalSchema.parse(rawData);

    // Resolve campaign UUID
    let campaignId = validated.campaign_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    if (!isUuid) {
      const { data: c } = await adminClient.from("campaigns").select("id").eq("slug", campaignId).maybeSingle();
      if (c?.id) campaignId = c.id;
    }

    const withdrawalCode = generateWithdrawalCode();
    const payload = {
      withdrawal_code: withdrawalCode,
      campaign_id: campaignId,
      fundraiser_id: fundraiserId,
      requested_amount: validated.requested_amount,
      purpose_description: sanitizePlainText(validated.purpose_description),
      bank_name: validated.bank_name,
      bank_account_number: validated.bank_account_number,
      bank_account_holder: validated.bank_account_holder,
      status: "pending" as const,
    };

    const { data: inserted, error } = await adminClient
      .from("withdrawals")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Insert withdrawal warning:", error.message);
      return { success: false, error: error.message };
    }

    const withdrawalId = inserted?.id || `wd-${Date.now()}`;

    await logAudit({
      actorId: fundraiserId,
      actorRole: "fundraiser",
      action: "create",
      entityType: "withdrawal",
      entityId: withdrawalId,
      description: `Mengajukan permohonan pencairan dana: Rp ${validated.requested_amount.toLocaleString("id-ID")} ke ${validated.bank_name} (${validated.bank_account_number})`,
      afterData: payload,
    });

    revalidatePath("/admin/pencairan");
    revalidatePath("/galang-dana/riwayat-pencairan");
    revalidatePath(`/galang-dana/kampanye-saya/${campaignId}/pencairan`);

    return {
      success: true,
      message: "Pengajuan pencairan dana berhasil dibuat dan menunggu persetujuan Admin.",
      withdrawalId,
      withdrawalCode,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal mengajukan pencairan dana" };
  }
}

export async function approveWithdrawalAction(withdrawalId: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { data: wd } = await adminClient
      .from("withdrawals")
      .select("id, requested_amount, bank_name, bank_account_number, fundraiser_id, campaign_id")
      .eq("id", withdrawalId)
      .maybeSingle();

    const { error } = await adminClient
      .from("withdrawals")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: now,
        rejection_reason: null,
      })
      .eq("id", withdrawalId);

    if (error) {
      console.warn("Approve withdrawal warning:", error.message);
      return { success: false, error: error.message };
    }

    if (wd) {
      const { data: camp } = await adminClient.from("campaigns").select("title").eq("id", wd.campaign_id).maybeSingle();
      const { data: fundProfile } = await adminClient.from("profiles").select("full_name, phone_wa").eq("id", wd.fundraiser_id).maybeSingle();
      const amountStr = `Rp ${(Number(wd.requested_amount) || 0).toLocaleString("id-ID")}`;

      if (fundProfile?.phone_wa) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: fundProfile.phone_wa,
            recipientName: fundProfile.full_name || "Sahabat Inisiator",
            templateKey: "withdrawal_approved",
            params: {
              recipientName: fundProfile.full_name || "Sahabat Inisiator",
              campaignTitle: camp?.title || "Program Kebaikan",
              amount: amountStr,
              bankName: wd.bank_name,
              accountNumber: wd.bank_account_number,
            },
          });
        } catch (e) {
          console.warn("WA withdrawal approved notice failed:", e);
        }
      }

      await sendInAppNotification({
        userId: wd.fundraiser_id,
        title: "Pencairan Dana Disetujui!",
        message: `Permohonan pencairan dana ${amountStr} untuk kampanye "${camp?.title || 'Program'}" telah disetujui. Tim finance sedang memproses transfer ke rekening Anda.`,
        type: "info",
        linkUrl: "/galang-dana/riwayat-pencairan",
      });
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "approve",
      entityType: "withdrawal",
      entityId: withdrawalId,
      description: `Menyetujui permohonan pencairan dana ${withdrawalId} (menunggu transfer)`,
    });

    revalidatePath("/admin/pencairan");
    revalidatePath("/galang-dana/riwayat-pencairan");

    return {
      success: true,
      message: "Pengajuan pencairan dana disetujui. Silakan lakukan transfer manual dan unggah bukti transfer.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyetujui pencairan" };
  }
}

export async function rejectWithdrawalAction(withdrawalId: string, reason: string) {
  try {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Alasan penolakan minimal 5 karakter wajib disertakan." };
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("withdrawals")
      .update({
        status: "rejected",
        reviewed_by: adminId,
        reviewed_at: now,
        rejection_reason: reason,
      })
      .eq("id", withdrawalId);

    if (error) {
      console.warn("Reject withdrawal warning:", error.message);
      return { success: false, error: error.message };
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "reject",
      entityType: "withdrawal",
      entityId: withdrawalId,
      description: `Menolak permohonan pencairan dana ${withdrawalId}. Alasan: ${reason}`,
    });

    revalidatePath("/admin/pencairan");
    revalidatePath("/galang-dana/riwayat-pencairan");

    return {
      success: true,
      message: "Pengajuan pencairan dana ditolak.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menolak pencairan" };
  }
}

export async function markWithdrawalTransferredAction(withdrawalId: string, transferProofUrlOrFormData: string | FormData) {
  try {
    let transferProofUrl = "";

    if (typeof transferProofUrlOrFormData === "string") {
      transferProofUrl = transferProofUrlOrFormData;
    } else {
      const file = transferProofUrlOrFormData.get("proof_file") as File | null;
      const rawUrl = transferProofUrlOrFormData.get("proof_url") as string | null;
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        const adminClient = createAdminClient();
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `wd-${withdrawalId}-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadErr } = await adminClient.storage
          .from("payment-proofs")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadErr) {
          const { data: signed } = await adminClient.storage
            .from("payment-proofs")
            .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 5);
          transferProofUrl = signed?.signedUrl || "";
        }
      }
      if (!transferProofUrl) {
        transferProofUrl = rawUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80";
      }
    }

    if (!transferProofUrl || transferProofUrl.trim().length === 0) {
      return { success: false, error: "Bukti transfer antarbank wajib disertakan." };
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { data: wd } = await adminClient
      .from("withdrawals")
      .select("id, requested_amount, bank_name, bank_account_number, bank_account_holder, fundraiser_id, campaign_id")
      .eq("id", withdrawalId)
      .maybeSingle();

    const { error } = await adminClient
      .from("withdrawals")
      .update({
        status: "transferred",
        transfer_proof_url: transferProofUrl,
        reviewed_by: adminId,
        reviewed_at: now,
        transferred_at: now,
      })
      .eq("id", withdrawalId);

    if (error) {
      console.warn("Mark withdrawal transferred warning:", error.message);
      return { success: false, error: error.message };
    }

    if (wd) {
      const { data: camp } = await adminClient.from("campaigns").select("title").eq("id", wd.campaign_id).maybeSingle();
      const { data: fundProfile } = await adminClient.from("profiles").select("full_name, phone_wa").eq("id", wd.fundraiser_id).maybeSingle();
      const amountStr = `Rp ${(Number(wd.requested_amount) || 0).toLocaleString("id-ID")}`;

      if (fundProfile?.phone_wa) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: fundProfile.phone_wa,
            recipientName: fundProfile.full_name || "Sahabat Inisiator",
            templateKey: "withdrawal_completed",
            params: {
              recipientName: fundProfile.full_name || "Sahabat Inisiator",
              campaignTitle: camp?.title || "Program Kebaikan",
              amount: amountStr,
              bankName: wd.bank_name,
              accountNumber: wd.bank_account_number,
              accountHolder: wd.bank_account_holder,
            },
          });
        } catch (e) {
          console.warn("WA withdrawal completed notice failed:", e);
        }
      }

      await sendInAppNotification({
        userId: wd.fundraiser_id,
        title: "Dana Telah Berhasil Ditransfer!",
        message: `Pencairan dana ${amountStr} telah berhasil ditransfer. Harap segera susun dan unggah Laporan Transparansi agar pencairan berikutnya tidak ditangguhkan.`,
        type: "success",
        linkUrl: `/galang-dana/kampanye-saya/${wd.campaign_id}/laporan-transparansi`,
      });
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "verify",
      entityType: "withdrawal",
      entityId: withdrawalId,
      description: `Admin mengonfirmasi transfer dana berhasil dikirimkan untuk pencairan ${withdrawalId}`,
      afterData: { status: "transferred", transfer_proof_url: transferProofUrl, transferred_at: now },
    });

    revalidatePath("/admin/pencairan");
    revalidatePath("/galang-dana/riwayat-pencairan");

    return {
      success: true,
      message: "Pencairan dana berhasil ditandai sebagai telah ditransfer beserta bukti transfer.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menandai pencairan ditransfer" };
  }
}

export async function getAdminWithdrawalsAction() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("withdrawals")
      .select(`
        id,
        withdrawal_code,
        campaign_id,
        fundraiser_id,
        requested_amount,
        purpose_description,
        bank_name,
        bank_account_number,
        bank_account_holder,
        status,
        rejection_reason,
        transfer_proof_url,
        reviewed_by,
        reviewed_at,
        transferred_at,
        created_at,
        campaigns (
          id,
          title,
          slug,
          collected_amount
        ),
        fundraiser:fundraiser_id (
          id,
          full_name,
          email,
          phone_wa
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("getAdminWithdrawalsAction error:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        withdrawalCode: row.withdrawal_code,
        campaignId: row.campaign_id,
        campaignTitle: row.campaigns?.title || "Program Kebaikan",
        campaignSlug: row.campaigns?.slug || "",
        campaignCollectedAmount: Number(row.campaigns?.collected_amount || 0),
        fundraiserId: row.fundraiser_id,
        fundraiserName: row.fundraiser?.full_name || "Sahabat Penggalang",
        fundraiserEmail: row.fundraiser?.email || "",
        fundraiserPhone: row.fundraiser?.phone_wa || "-",
        requestedAmount: Number(row.requested_amount),
        purposeDescription: row.purpose_description,
        bankName: row.bank_name,
        bankAccountNumber: row.bank_account_number,
        bankAccountHolder: row.bank_account_holder,
        status: row.status,
        rejectionReason: row.rejection_reason || null,
        transferProofUrl: row.transfer_proof_url || null,
        reviewedBy: row.reviewed_by || null,
        reviewedAt: row.reviewed_at || null,
        transferredAt: row.transferred_at || null,
        createdAt: row.created_at,
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getFundraiserWithdrawalsAction() {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const fundraiserId = await resolveFundraiserId(supabase, adminClient);

    const { data, error } = await adminClient
      .from("withdrawals")
      .select(`
        id,
        withdrawal_code,
        campaign_id,
        fundraiser_id,
        requested_amount,
        purpose_description,
        bank_name,
        bank_account_number,
        bank_account_holder,
        status,
        rejection_reason,
        transfer_proof_url,
        reviewed_by,
        reviewed_at,
        transferred_at,
        created_at,
        campaigns (
          id,
          title,
          slug,
          collected_amount
        )
      `)
      .eq("fundraiser_id", fundraiserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("getFundraiserWithdrawalsAction error:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        withdrawalCode: row.withdrawal_code,
        campaignId: row.campaign_id,
        campaignTitle: row.campaigns?.title || "Program Kebaikan",
        campaignSlug: row.campaigns?.slug || "",
        campaignCollectedAmount: Number(row.campaigns?.collected_amount || 0),
        fundraiserId: row.fundraiser_id,
        requestedAmount: Number(row.requested_amount),
        purposeDescription: row.purpose_description,
        bankName: row.bank_name,
        bankAccountNumber: row.bank_account_number,
        bankAccountHolder: row.bank_account_holder,
        status: row.status,
        rejectionReason: row.rejection_reason || null,
        transferProofUrl: row.transfer_proof_url || null,
        reviewedBy: row.reviewed_by || null,
        reviewedAt: row.reviewed_at || null,
        transferredAt: row.transferred_at || null,
        createdAt: row.created_at,
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getCampaignForWithdrawalAction(campaignIdOrSlug: string) {
  try {
    const adminClient = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignIdOrSlug);

    let query = adminClient.from("campaigns").select("id, title, slug, collected_amount, fundraiser_id");
    if (isUuid) {
      query = query.eq("id", campaignIdOrSlug);
    } else {
      query = query.or(`slug.eq.${campaignIdOrSlug},id.eq.${campaignIdOrSlug}`);
    }

    const { data: campaign, error } = await query.maybeSingle();
    if (error || !campaign) {
      return { success: false, error: "Kampanye tidak ditemukan", data: null };
    }

    // Get all previous approved or transferred withdrawals
    const { data: previousWds } = await adminClient
      .from("withdrawals")
      .select("requested_amount, status")
      .eq("campaign_id", campaign.id)
      .in("status", ["approved", "transferred"]);

    const withdrawnAmount = (previousWds || []).reduce((acc, curr) => acc + Number(curr.requested_amount || 0), 0);
    const collectedAmount = Number(campaign.collected_amount || 0);
    const availableBalance = Math.max(0, collectedAmount - withdrawnAmount);

    return {
      success: true,
      data: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        collectedAmount,
        withdrawnAmount,
        availableBalance,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}
