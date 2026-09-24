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

const campaignSchema = z.object({
  title: z.string().min(5, "Judul kampanye minimal 5 karakter").max(120, "Judul kampanye maksimal 120 karakter"),
  category_id: z.string().optional().nullable(),
  short_description: z.string().max(250, "Deskripsi singkat maksimal 250 karakter").optional().nullable(),
  story: z.string().min(20, "Cerita galang dana minimal 20 karakter"),
  beneficiary_location: z.string().min(3, "Lokasi penerima manfaat wajib diisi"),
  target_amount: z.coerce.number().min(1000000, "Target donasi minimal Rp 1.000.000"),
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

async function resolveFundraiserId(supabase: any, adminClient: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  const cookieStore = await cookies();
  const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
  if (demoEmail) {
    const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
    if (p?.id) return p.id;
  }

  // Fallback to first fundraiser profile in DB
  const { data: firstFundraiser } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "fundraiser")
    .limit(1)
    .maybeSingle();

  if (firstFundraiser?.id) return firstFundraiser.id;

  // Fallback to any profile
  const { data: anyProfile } = await adminClient.from("profiles").select("id").limit(1).maybeSingle();
  return anyProfile?.id || "1bfce920-2748-42c7-9a62-bbe7151457b3";
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

export async function createCampaignAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const fundraiserId = await resolveFundraiserId(supabase, adminClient);

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

    // Resolve category_id to valid UUID if needed
    let categoryId = validated.category_id;
    const isUuid = categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) {
      const { data: cat } = await adminClient.from("categories").select("id").limit(1).maybeSingle();
      categoryId = cat?.id || null;
    }

    const insertPayload = {
      fundraiser_id: fundraiserId,
      category_id: categoryId,
      title: sanitizePlainText(validated.title),
      slug: uniqueSlug,
      short_description: validated.short_description ? sanitizePlainText(validated.short_description) : null,
      story: sanitizeHtml(validated.story),
      cover_image_url: validated.cover_image_url,
      gallery_urls: validated.gallery_urls,
      beneficiary_location: sanitizePlainText(validated.beneficiary_location),
      target_amount: validated.target_amount,
      deadline: new Date(validated.deadline).toISOString().split("T")[0],
      is_urgent: validated.is_urgent,
      status: status as any,
    };

    const { data: inserted, error } = await adminClient
      .from("campaigns")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.warn("DB insert campaign warning:", error.message);
      return { success: false, error: error.message };
    }

    const campaignId = inserted?.id || `cmp-${Date.now()}`;

    await logAudit({
      actorId: fundraiserId,
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
    const adminClient = createAdminClient();
    const fundraiserId = await resolveFundraiserId(supabase, adminClient);

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

    let categoryId = validated.category_id;
    const isUuid = categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) {
      const { data: cat } = await adminClient.from("categories").select("id").limit(1).maybeSingle();
      categoryId = cat?.id || null;
    }

    const updatePayload: Record<string, unknown> = {
      title: sanitizePlainText(validated.title),
      category_id: categoryId,
      short_description: validated.short_description ? sanitizePlainText(validated.short_description) : null,
      story: sanitizeHtml(validated.story),
      cover_image_url: validated.cover_image_url,
      gallery_urls: validated.gallery_urls,
      beneficiary_location: sanitizePlainText(validated.beneficiary_location),
      target_amount: validated.target_amount,
      deadline: new Date(validated.deadline).toISOString().split("T")[0],
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
      console.warn("DB update campaign warning:", error.message);
      return { success: false, error: error.message };
    }

    await logAudit({
      actorId: fundraiserId,
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
    const adminClient = createAdminClient();
    const fundraiserId = await resolveFundraiserId(supabase, adminClient);

    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "pending_review",
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Submit campaign for review warning:", error.message);
      return { success: false, error: error.message };
    }

    await logAudit({
      actorId: fundraiserId,
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
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    // 1. Fetch campaign info
    const { data: campaign } = await adminClient
      .from("campaigns")
      .select("id, title, slug, fundraiser_id")
      .eq("id", campaignId)
      .maybeSingle();

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
      console.warn("Approve campaign warning:", error.message);
      return { success: false, error: error.message };
    }

    // Send notifications to fundraiser
    if (campaign?.fundraiser_id) {
      const { data: creator } = await adminClient
        .from("profiles")
        .select("full_name, phone_wa")
        .eq("id", campaign.fundraiser_id)
        .maybeSingle();

      if (creator?.phone_wa) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: creator.phone_wa,
            recipientName: creator.full_name || "Sahabat Inisiator",
            templateKey: "campaign_published",
            params: {
              recipientName: creator.full_name || "Sahabat Inisiator",
              campaignTitle: campaign.title,
              campaignSlug: campaign.slug,
            },
          });
        } catch (waErr) {
          console.warn("WhatsApp campaign approved notice:", waErr);
        }
      }

      await sendInAppNotification({
        userId: campaign.fundraiser_id,
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
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { data: campaign } = await adminClient
      .from("campaigns")
      .select("id, title, fundraiser_id")
      .eq("id", campaignId)
      .maybeSingle();

    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: now,
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Reject campaign warning:", error.message);
      return { success: false, error: error.message };
    }

    // Send notifications to fundraiser
    if (campaign?.fundraiser_id) {
      const { data: creator } = await adminClient
        .from("profiles")
        .select("full_name, phone_wa")
        .eq("id", campaign.fundraiser_id)
        .maybeSingle();

      if (creator?.phone_wa) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: creator.phone_wa,
            recipientName: creator.full_name || "Sahabat Inisiator",
            templateKey: "campaign_rejected",
            params: {
              recipientName: creator.full_name || "Sahabat Inisiator",
              campaignTitle: campaign.title,
              reason,
            },
          });
        } catch (waErr) {
          console.warn("WhatsApp campaign rejection notice:", waErr);
        }
      }

      await sendInAppNotification({
        userId: campaign.fundraiser_id,
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
    const adminClient = createAdminClient();
    const actorId = await resolveFundraiserId(supabase, adminClient);
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("campaigns")
      .update({
        status: "closed",
        updated_at: now,
      })
      .eq("id", campaignId);

    if (error) {
      console.warn("Close campaign warning:", error.message);
      return { success: false, error: error.message };
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

export async function getAdminCampaignsAction(filterStatus?: string) {
  try {
    const adminClient = createAdminClient();
    let query = adminClient
      .from("campaigns")
      .select(`
        id,
        slug,
        title,
        short_description,
        story,
        cover_image_url,
        gallery_urls,
        beneficiary_location,
        target_amount,
        collected_amount,
        donor_count,
        deadline,
        status,
        is_urgent,
        rejection_reason,
        created_at,
        published_at,
        categories (
          id,
          name,
          slug
        ),
        fundraiser:fundraiser_id (
          id,
          full_name,
          email,
          phone_wa,
          avatar_url,
          is_verified
        )
      `)
      .order("created_at", { ascending: false });

    if (filterStatus && filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("getAdminCampaignsAction error:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: (data || []).map((row: any) => {
        const cat = row.categories;
        const f = row.fundraiser;
        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          shortDescription: row.short_description || "",
          story: row.story || "",
          coverImageUrl: row.cover_image_url,
          galleryUrls: row.gallery_urls || [],
          categoryId: cat?.id || "",
          categoryName: cat?.name || "Kemanusiaan",
          beneficiaryLocation: row.beneficiary_location,
          targetAmount: Number(row.target_amount),
          collectedAmount: Number(row.collected_amount || 0),
          donorCount: Number(row.donor_count || 0),
          deadline: row.deadline,
          status: row.status,
          isUrgent: Boolean(row.is_urgent),
          rejectionReason: row.rejection_reason || null,
          createdAt: row.created_at,
          publishedAt: row.published_at || row.created_at,
          fundraiser: {
            id: f?.id || "",
            fullName: f?.full_name || "Sahabat Penggalang",
            username: (f?.full_name || "inisiator").toLowerCase().replace(/\s+/g, ""),
            avatarUrl: f?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            isVerified: Boolean(f?.is_verified),
            email: f?.email || "",
            phoneWa: f?.phone_wa || "",
          },
        };
      }),
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getFundraiserCampaignsAction() {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const fundraiserId = await resolveFundraiserId(supabase, adminClient);

    const { data, error } = await adminClient
      .from("campaigns")
      .select(`
        id,
        slug,
        title,
        short_description,
        story,
        cover_image_url,
        gallery_urls,
        beneficiary_location,
        target_amount,
        collected_amount,
        donor_count,
        deadline,
        status,
        is_urgent,
        rejection_reason,
        created_at,
        published_at,
        categories (
          id,
          name,
          slug
        ),
        fundraiser:fundraiser_id (
          id,
          full_name,
          email,
          phone_wa,
          avatar_url,
          is_verified
        )
      `)
      .eq("fundraiser_id", fundraiserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("getFundraiserCampaignsAction error:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: (data || []).map((row: any) => {
        const cat = row.categories;
        const f = row.fundraiser;
        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          shortDescription: row.short_description || "",
          story: row.story || "",
          coverImageUrl: row.cover_image_url,
          galleryUrls: row.gallery_urls || [],
          categoryId: cat?.id || "",
          categoryName: cat?.name || "Kemanusiaan",
          beneficiaryLocation: row.beneficiary_location,
          targetAmount: Number(row.target_amount),
          collectedAmount: Number(row.collected_amount || 0),
          donorCount: Number(row.donor_count || 0),
          deadline: row.deadline,
          status: row.status,
          isUrgent: Boolean(row.is_urgent),
          rejectionReason: row.rejection_reason || null,
          createdAt: row.created_at,
          publishedAt: row.published_at || row.created_at,
          fundraiser: {
            id: f?.id || "",
            fullName: f?.full_name || "Sahabat Penggalang",
            username: (f?.full_name || "inisiator").toLowerCase().replace(/\s+/g, ""),
            avatarUrl: f?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            isVerified: Boolean(f?.is_verified),
          },
        };
      }),
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getCampaignDetailForAdminAction(idOrSlug: string) {
  try {
    const adminClient = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = adminClient
      .from("campaigns")
      .select(`
        id,
        slug,
        title,
        short_description,
        story,
        cover_image_url,
        gallery_urls,
        beneficiary_location,
        target_amount,
        collected_amount,
        donor_count,
        deadline,
        status,
        is_urgent,
        rejection_reason,
        created_at,
        published_at,
        categories (
          id,
          name,
          slug
        ),
        fundraiser:fundraiser_id (
          id,
          full_name,
          email,
          phone_wa,
          avatar_url,
          is_verified
        )
      `);

    if (isUuid) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      return { success: false, error: error?.message || "Kampanye tidak ditemukan", data: null };
    }

    const r = row as any;
    const cat = r.categories;
    const f = r.fundraiser;

    return {
      success: true,
      data: {
        id: r.id,
        slug: r.slug,
        title: r.title,
        shortDescription: r.short_description || "",
        story: r.story || "",
        coverImageUrl: r.cover_image_url,
        galleryUrls: r.gallery_urls || [],
        categoryId: cat?.id || "",
        categoryName: cat?.name || "Kemanusiaan",
        beneficiaryLocation: r.beneficiary_location,
        targetAmount: Number(r.target_amount),
        collectedAmount: Number(r.collected_amount || 0),
        donorCount: Number(r.donor_count || 0),
        deadline: r.deadline,
        status: r.status,
        isUrgent: Boolean(r.is_urgent),
        rejectionReason: r.rejection_reason || null,
        createdAt: r.created_at,
        publishedAt: r.published_at || r.created_at,
        fundraiser: {
          id: f?.id || "",
          fullName: f?.full_name || "Sahabat Penggalang",
          username: (f?.full_name || "inisiator").toLowerCase().replace(/\s+/g, ""),
          avatarUrl: f?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          isVerified: Boolean(f?.is_verified),
          email: f?.email || "",
          phoneWa: f?.phone_wa || "",
        },
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}

export async function getCampaignCategoriesAction() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("categories")
      .select("id, name, slug, icon_name, description")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}
