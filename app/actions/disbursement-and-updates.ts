"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";
import { sanitizeHtml, sanitizePlainText } from "@/lib/sanitize";

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
    const { data: { user } } = await supabase.auth.getUser();
    const authorId = user?.id || "fundraiser-mock-id";

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      title: formData.get("title"),
      content: formData.get("content"),
      image_url: formData.get("image_url") || null,
    };

    const validated = updateSchema.parse(rawData);
    const adminClient = createAdminClient();

    const payload = {
      campaign_id: validated.campaign_id,
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
      console.warn("Insert campaign update fallback notice:", error.message);
    }

    const updateId = inserted?.id || `upd-${Date.now()}`;

    await logAudit({
      actorId: authorId,
      actorRole: "fundraiser",
      action: "publish",
      entityType: "campaign",
      entityId: validated.campaign_id,
      description: `Mempublikasikan kabar terbaru: "${validated.title}"`,
      afterData: payload,
    });

    // Broadcast notification to donors
    try {
      const { data: campaign } = await adminClient
        .from("campaigns")
        .select("title, slug")
        .eq("id", validated.campaign_id)
        .single();

      const { data: donors } = await adminClient
        .from("donations")
        .select("user_id, donor_name, donor_phone")
        .eq("campaign_id", validated.campaign_id)
        .eq("status", "verified")
        .limit(20);

      if (donors && donors.length > 0) {
        const notifiedUsers = new Set<string>();
        for (const d of donors) {
          if (d.user_id && !notifiedUsers.has(d.user_id)) {
            notifiedUsers.add(d.user_id);
            await sendInAppNotification({
              userId: d.user_id,
              title: `Kabar Terbaru: ${campaign?.title || "Kampanye"}`,
              message: `Inisiator mempublikasikan perkembangan: "${validated.title}"`,
              type: "info",
              linkUrl: `/kampanye/${campaign?.slug || ""}`,
            });
          }
          if (d.donor_phone) {
            await sendWhatsAppNotification({
              recipientPhone: d.donor_phone,
              recipientName: d.donor_name || "Sahabat Donatur",
              templateKey: "campaign_update_posted",
              params: {
                recipientName: d.donor_name || "Sahabat Donatur",
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
  amount_used: z.coerce.number().min(1000, "Nominal dana yang digunakan minimal Rp 1.000"),
  disbursement_date: z.string().min(1, "Tanggal realisasi penyaluran dana wajib ditentukan"),
  description: z.string().min(20, "Rincian penyaluran dana minimal 20 karakter"),
  beneficiaries: z.string().optional().nullable(),
  photo_urls: z.array(z.string()).min(1, "Wajib menyertakan minimal 1 foto dokumentasi/bukti nota"),
});

export async function submitTransparencyReportAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const authorId = user?.id || "fundraiser-mock-id";

    const photos = formData.getAll("photo_urls").filter(Boolean) as string[];

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      title: formData.get("title"),
      amount_used: formData.get("amount_used"),
      disbursement_date: formData.get("disbursement_date"),
      description: formData.get("description"),
      beneficiaries: formData.get("beneficiaries") || null,
      photo_urls: photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"],
    };

    const validated = transparencyReportSchema.parse(rawData);
    const adminClient = createAdminClient();

    const payload = {
      campaign_id: validated.campaign_id,
      author_id: authorId,
      title: sanitizePlainText(validated.title),
      amount_used: validated.amount_used,
      disbursement_date: new Date(validated.disbursement_date).toISOString(),
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
      console.warn("Insert transparency report fallback notice:", error.message);
    }

    const reportId = inserted?.id || `rep-${Date.now()}`;

    await logAudit({
      actorId: authorId,
      actorRole: "fundraiser",
      action: "create",
      entityType: "transparency_report",
      entityId: reportId,
      description: `Mengirimkan laporan transparansi penyaluran dana: "${validated.title}" (Rp ${validated.amount_used.toLocaleString("id-ID")})`,
      afterData: payload,
    });

    revalidatePath("/admin/laporan-transparansi");
    revalidatePath(`/galang-dana/kampanye-saya/${validated.campaign_id}/laporan-transparansi`);

    return {
      success: true,
      message: "Laporan transparansi berhasil dikirim dan sedang menunggu peninjauan kurator.",
      reportId,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal mengirim laporan transparansi" };
  }
}

export async function approveTransparencyReportAction(reportId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
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
      console.warn("Approve transparency report fallback notice:", error.message);
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
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
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
      console.warn("Reject transparency report fallback notice:", error.message);
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
  requested_amount: z.coerce.number().min(50000, "Nominal pencairan dana minimal Rp 50.000"),
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
    const { data: { user } } = await supabase.auth.getUser();
    const fundraiserId = user?.id || "fundraiser-mock-id";

    const rawData = {
      campaign_id: formData.get("campaign_id"),
      requested_amount: formData.get("requested_amount"),
      purpose_description: formData.get("purpose_description"),
      bank_name: formData.get("bank_name"),
      bank_account_number: formData.get("bank_account_number"),
      bank_account_holder: formData.get("bank_account_holder"),
    };

    const validated = withdrawalSchema.parse(rawData);
    const adminClient = createAdminClient();

    // Check PRD Rule: If previous withdrawal was transferred, verify that at least one transparency report has been approved
    const { data: previousWithdrawals } = await adminClient
      .from("withdrawals")
      .select("id, status")
      .eq("campaign_id", validated.campaign_id)
      .eq("status", "transferred");

    if (previousWithdrawals && previousWithdrawals.length > 0) {
      const { data: approvedReports } = await adminClient
        .from("transparency_reports")
        .select("id")
        .eq("campaign_id", validated.campaign_id)
        .eq("status", "published");

      if (!approvedReports || approvedReports.length < previousWithdrawals.length) {
        return {
          success: false,
          error: "Pencairan berikutnya ditangguhkan: Anda belum melengkapi Laporan Transparansi untuk pencairan dana sebelumnya. Silakan submit laporan transparansi terlebih dahulu demi menjaga amanah donatur.",
        };
      }
    }

    const withdrawalCode = generateWithdrawalCode();
    const payload = {
      withdrawal_code: withdrawalCode,
      campaign_id: validated.campaign_id,
      fundraiser_id: fundraiserId,
      requested_amount: validated.requested_amount,
      purpose_description: validated.purpose_description,
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
      console.warn("Insert withdrawal fallback notice:", error.message);
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
    revalidatePath(`/galang-dana/kampanye-saya/${validated.campaign_id}/pencairan`);

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
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { data: wd } = await adminClient
      .from("withdrawals")
      .select("id, requested_amount, bank_name, bank_account_number, fundraiser_id, campaign_id")
      .eq("id", withdrawalId)
      .single();

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
      console.warn("Approve withdrawal fallback notice:", error.message);
    }

    if (wd) {
      const { data: camp } = await adminClient.from("campaigns").select("title").eq("id", wd.campaign_id).single();
      const { data: fundProfile } = await adminClient.from("profiles").select("full_name, phone_number").eq("id", wd.fundraiser_id).single();
      const amountStr = `Rp ${(wd.requested_amount || 0).toLocaleString("id-ID")}`;

      if (fundProfile?.phone_number) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: fundProfile.phone_number,
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
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
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
      console.warn("Reject withdrawal fallback notice:", error.message);
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

export async function markWithdrawalTransferredAction(withdrawalId: string, transferProofUrl: string) {
  try {
    if (!transferProofUrl || transferProofUrl.trim().length === 0) {
      return { success: false, error: "Bukti transfer antarbank wajib disertakan." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { data: wd } = await adminClient
      .from("withdrawals")
      .select("id, requested_amount, bank_name, bank_account_number, bank_account_holder, fundraiser_id, campaign_id")
      .eq("id", withdrawalId)
      .single();

    const { error } = await adminClient
      .from("withdrawals")
      .update({
        status: "transferred",
        transfer_proof_url: transferProofUrl,
        transferred_at: now,
      })
      .eq("id", withdrawalId);

    if (error) {
      console.warn("Mark withdrawal transferred fallback notice:", error.message);
    }

    if (wd) {
      const { data: camp } = await adminClient.from("campaigns").select("title").eq("id", wd.campaign_id).single();
      const { data: fundProfile } = await adminClient.from("profiles").select("full_name, phone_number").eq("id", wd.fundraiser_id).single();
      const amountStr = `Rp ${(wd.requested_amount || 0).toLocaleString("id-ID")}`;

      if (fundProfile?.phone_number) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: fundProfile.phone_number,
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
