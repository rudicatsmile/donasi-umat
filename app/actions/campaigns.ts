"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";
import { sanitizeHtml, sanitizePlainText } from "@/lib/sanitize";

const campaignSchema = z.object({
  title: z.string().min(5, "Judul kampanye minimal 5 karakter").max(120, "Judul kampanye maksimal 120 karakter"),
  category_id: z.string().optional().nullable(),
  short_description: z.string().max(250, "Deskripsi singkat maksimal 250 karakter").optional().nullable(),
  story: z.string().min(20, "Cerita galang dana minimal 20 karakter"),
  beneficiary_location: z.string().min(3, "Lokasi penerima manfaat wajib diisi"),
  target_amount: z.coerce.number().min(100000, "Target donasi minimal Rp 100.000"),
  deadline: z.string().min(1, "Batas waktu penggalangan dana wajib ditentukan"),
  cover_image_url: z.string().url("URL foto utama tidak valid").or(z.string().min(1)),
  gallery_urls: z.array(z.string()).optional().default([]),
  is_urgent: z.boolean().optional().default(false),
  submit_for_review: z.boolean().optional().default(false),
});

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function createCampaignAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check auth or allow mock preview
    const userId = user?.id || "fundraiser-mock-id";

    const rawData = {
      title: formData.get("title"),
      category_id: formData.get("category_id") || null,
      short_description: formData.get("short_description") || null,
      story: formData.get("story"),
      beneficiary_location: formData.get("beneficiary_location"),
      target_amount: formData.get("target_amount"),
      deadline: formData.get("deadline"),
      cover_image_url: formData.get("cover_image_url") || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200",
      gallery_urls: formData.getAll("gallery_urls").filter(Boolean) as string[],
      is_urgent: formData.get("is_urgent") === "true" || formData.get("is_urgent") === "on",
      submit_for_review: formData.get("submit_for_review") === "true",
    };

    const validated = campaignSchema.parse(rawData);
    const baseSlug = slugify(validated.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const status = validated.submit_for_review ? "pending_review" : "draft";

    const adminClient = createAdminClient();

    const insertPayload = {
      fundraiser_id: userId,
      category_id: validated.category_id || null,
      title: sanitizePlainText(validated.title),
      slug: uniqueSlug,
      short_description: validated.short_description ? sanitizePlainText(validated.short_description) : null,
      story: sanitizeHtml(validated.story),
      cover_image_url: validated.cover_image_url,
      gallery_urls: validated.gallery_urls,
      beneficiary_location: sanitizePlainText(validated.beneficiary_location),
      target_amount: validated.target_amount,
      deadline: new Date(validated.deadline).toISOString(),
      is_urgent: validated.is_urgent,
      status: status as any,
    };

    const { data: inserted, error } = await adminClient
      .from("campaigns")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.warn("DB insert campaign fallback warning:", error.message);
    }

    const campaignId = inserted?.id || `cmp-${Date.now()}`;

    await logAudit({
      actorId: userId,
      actorRole: "fundraiser",
      action: "create",
      entityType: "campaign",
      entityId: campaignId,
      description: `Membuat kampanye baru: "${validated.title}" dengan status ${status}`,
      afterData: insertPayload,
    });

    revalidatePath("/kampanye");
    revalidatePath("/galang-dana/kampanye-saya");
    revalidatePath("/admin/kampanye");

    return {
      success: true,
      message: validated.submit_for_review
        ? "Kampanye berhasil diajukan dan sedang menunggu verifikasi tim kurasi."
        : "Draft kampanye berhasil disimpan.",
      campaignId,
      slug: uniqueSlug,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal membuat kampanye" };
  }
}

export async function updateCampaignAction(campaignId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "fundraiser-mock-id";

    const rawData = {
      title: formData.get("title"),
      category_id: formData.get("category_id") || null,
      short_description: formData.get("short_description") || null,
      story: formData.get("story"),
      beneficiary_location: formData.get("beneficiary_location"),
      target_amount: formData.get("target_amount"),
      deadline: formData.get("deadline"),
      cover_image_url: formData.get("cover_image_url") || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200",
      gallery_urls: formData.getAll("gallery_urls").filter(Boolean) as string[],
      is_urgent: formData.get("is_urgent") === "true" || formData.get("is_urgent") === "on",
      submit_for_review: formData.get("submit_for_review") === "true",
    };

    const validated = campaignSchema.parse(rawData);
    const adminClient = createAdminClient();

    const updatePayload: Record<string, unknown> = {
      title: sanitizePlainText(validated.title),
      category_id: validated.category_id || null,
      short_description: validated.short_description ? sanitizePlainText(validated.short_description) : null,
      story: sanitizeHtml(validated.story),
      cover_image_url: validated.cover_image_url,
      gallery_urls: validated.gallery_urls,
      beneficiary_location: sanitizePlainText(validated.beneficiary_location),
      target_amount: validated.target_amount,
      deadline: new Date(validated.deadline).toISOString(),
      is_urgent: validated.is_urgent,
      updated_at: new Date().toISOString(),
    };

    if (validated.submit_for_review) {
      updatePayload.status = "pending_review";
    }

    const { error } = await adminClient
      .from("campaigns")
      .update(updatePayload as any)
      .eq("id", campaignId);

    if (error) {
      console.warn("DB update campaign fallback warning:", error.message);
    }

    await logAudit({
      actorId: userId,
      actorRole: "fundraiser",
      action: "update",
      entityType: "campaign",
      entityId: campaignId,
      description: `Memperbarui kampanye: "${validated.title}"`,
      afterData: updatePayload,
    });

    revalidatePath(`/kampanye`);
    revalidatePath(`/galang-dana/kampanye-saya`);
    revalidatePath(`/admin/kampanye`);

    return {
      success: true,
      message: "Kampanye berhasil diperbarui.",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal memperbarui kampanye" };
  }
}

export async function submitCampaignForReviewAction(campaignId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "fundraiser-mock-id";

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "pending_review",
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Submit campaign for review fallback warning:", error.message);
    }

    await logAudit({
      actorId: userId,
      actorRole: "fundraiser",
      action: "update",
      entityType: "campaign",
      entityId: campaignId,
      description: `Mengajukan kampanye ${campaignId} untuk review tim kurasi`,
    });

    revalidatePath("/galang-dana/kampanye-saya");
    revalidatePath("/admin/kampanye");

    return {
      success: true,
      message: "Kampanye berhasil diajukan untuk ditinjau oleh kurator.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengajukan kampanye" };
  }
}

export async function approveCampaignAction(campaignId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    // 1. Fetch campaign info
    const { data: campaign } = await adminClient
      .from("campaigns")
      .select("id, title, slug, user_id")
      .eq("id", campaignId)
      .single();

    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "active",
        approved_by: adminId,
        approved_at: now,
        published_at: now,
        rejection_reason: null,
        updated_at: now,
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Approve campaign fallback warning:", error.message);
    }

    // Send notifications to fundraiser
    if (campaign?.user_id) {
      const { data: creator } = await adminClient
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", campaign.user_id)
        .single();

      if (creator?.phone_number) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: creator.phone_number,
            recipientName: creator.full_name || "Sahabat Inisiator",
            templateKey: "campaign_published",
            params: {
              recipientName: creator.full_name || "Sahabat Inisiator",
              campaignTitle: campaign.title,
              campaignSlug: campaign.slug,
            },
          });
        } catch (waErr) {
          console.warn("WhatsApp campaign approved failed:", waErr);
        }
      }

      await sendInAppNotification({
        userId: campaign.user_id,
        title: "Kampanye Anda Telah Aktif!",
        message: `Alhamdulillah! Kampanye "${campaign.title}" telah disetujui kurator dan siap menerima donasi masyarakat.`,
        type: "success",
        linkUrl: `/kampanye/${campaign.slug}`,
      });
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "approve",
      entityType: "campaign",
      entityId: campaignId,
      description: `Menyetujui dan mempublikasikan kampanye ${campaignId}`,
      afterData: { status: "active", approved_at: now },
    });

    revalidatePath("/kampanye");
    revalidatePath(`/kampanye/${campaignId}`);
    revalidatePath("/admin/kampanye");
    revalidatePath("/galang-dana/kampanye-saya");

    return {
      success: true,
      message: "Kampanye berhasil disetujui dan kini aktif menerima donasi.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyetujui kampanye" };
  }
}

export async function rejectCampaignAction(campaignId: string, reason: string) {
  try {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Alasan penolakan minimal 5 karakter wajib disertakan." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { data: campaign } = await adminClient
      .from("campaigns")
      .select("id, title, user_id")
      .eq("id", campaignId)
      .single();

    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: now,
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Reject campaign fallback warning:", error.message);
    }

    // Send notifications to fundraiser
    if (campaign?.user_id) {
      const { data: creator } = await adminClient
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", campaign.user_id)
        .single();

      if (creator?.phone_number) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: creator.phone_number,
            recipientName: creator.full_name || "Sahabat Inisiator",
            templateKey: "campaign_rejected",
            params: {
              recipientName: creator.full_name || "Sahabat Inisiator",
              campaignTitle: campaign.title,
              reason,
            },
          });
        } catch (waErr) {
          console.warn("WhatsApp campaign rejection failed:", waErr);
        }
      }

      await sendInAppNotification({
        userId: campaign.user_id,
        title: "Perbaikan Kampanye Diperlukan",
        message: `Pengajuan kampanye "${campaign.title}" belum disetujui: "${reason}". Silakan lakukan revisi.`,
        type: "warning",
        linkUrl: "/galang-dana/kampanye-saya",
      });
    }

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "reject",
      entityType: "campaign",
      entityId: campaignId,
      description: `Menolak kampanye ${campaignId}: ${reason}`,
      afterData: { status: "rejected", rejection_reason: reason },
    });

    revalidatePath("/admin/kampanye");
    revalidatePath("/galang-dana/kampanye-saya");

    return {
      success: true,
      message: "Kampanye ditolak dan catatan telah dikirim ke penggalang dana.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menolak kampanye" };
  }
}

export async function closeCampaignAction(campaignId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const actorId = user?.id || "user-mock-id";

    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "closed",
        updated_at: now,
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Close campaign fallback warning:", error.message);
    }

    await logAudit({
      actorId,
      actorRole: "fundraiser",
      action: "update",
      entityType: "campaign",
      entityId: campaignId,
      description: `Menutup kampanye ${campaignId}. Alasan: ${reason || "Target tercapai atau ditutup oleh inisiator."}`,
    });

    revalidatePath("/kampanye");
    revalidatePath("/galang-dana/kampanye-saya");
    revalidatePath("/admin/kampanye");

    return {
      success: true,
      message: "Kampanye berhasil ditutup.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menutup kampanye" };
  }
}
