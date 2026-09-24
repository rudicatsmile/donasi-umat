"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
});

async function resolveDonorId(supabase: any, adminClient: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  const cookieStore = await cookies();
  const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
  if (demoEmail) {
    const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
    if (p?.id) return p.id;
  }

  // Fallback to Dimas Nugraha donor
  const { data: donor } = await adminClient.from("profiles").select("id").eq("role", "donor").limit(1).maybeSingle();
  return donor?.id || "da95d08f-872f-4280-8f69-c86a1d589c51";
}

// ----------------------------------------------------
// DONOR PROFILE ACTIONS
// ----------------------------------------------------
export async function getUserProfileAction(): Promise<{
  success: boolean;
  profile?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    isVerified: boolean;
    avatarUrl?: string;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveDonorId(supabase, adminClient);

    const { data: p, error } = await adminClient
      .from("profiles")
      .select("id, full_name, email, phone_wa, role, is_verified, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error || !p) {
      return { success: false, error: error?.message || "Profil tidak ditemukan" };
    }

    return {
      success: true,
      profile: {
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        phone: p.phone_wa || "",
        role: p.role,
        isVerified: !!p.is_verified,
        avatarUrl: p.avatar_url || undefined,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProfileAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const validation = profileSchema.safeParse({ fullName, phone });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Input tidak valid" };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();
  const userId = await resolveDonorId(supabase, adminClient);

  const { data: beforeData } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { error } = await adminClient
    .from("profiles")
    .update({
      full_name: fullName,
      phone_wa: phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: userId,
    actorRole: beforeData?.role || "donor",
    action: "update",
    entityType: "user",
    entityId: userId,
    description: `Pengguna ${fullName} memperbarui profil dan nomor WhatsApp`,
    beforeData: beforeData as any,
    afterData: { full_name: fullName, phone_wa: phone },
  });

  revalidatePath("/dashboard/profil");
  revalidatePath("/admin/pengguna");
  return { success: true, message: "Profil berhasil diperbarui!" };
}

// ----------------------------------------------------
// USER NOTIFICATION ACTIONS
// ----------------------------------------------------
export async function getUserNotificationsAction(): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    type: "donation_verified" | "campaign_update" | "whatsapp_sent" | "campaign_target";
    title: string;
    message: string;
    createdAt: string;
    linkUrl?: string;
    isRead: boolean;
    channel: "In-App" | "WhatsApp";
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveDonorId(supabase, adminClient);

    const { data, error } = await adminClient
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    const formatted = (data || []).map((n: any) => ({
      id: n.id,
      type: (n.type || "donation_verified") as any,
      channel: (n.type?.includes("whatsapp") ? "WhatsApp" : "In-App") as "In-App" | "WhatsApp",
      title: n.title,
      message: n.message,
      createdAt: n.created_at,
      linkUrl: n.link_url || "/dashboard",
      isRead: !!n.is_read,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveDonorId(supabase, adminClient);

    const { error } = await adminClient
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/notifikasi");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// DONOR PRAYER (DOA SAYA) ACTIONS
// ----------------------------------------------------
export async function getUserPrayersAction(): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    campaignTitle: string;
    campaignSlug: string;
    message: string;
    createdAt: string;
    isEditable: boolean;
    likes: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveDonorId(supabase, adminClient);

    const { data, error } = await adminClient
      .from("donations")
      .select(`
        id,
        prayer_message,
        created_at,
        campaigns:campaign_id (
          title,
          slug
        )
      `)
      .eq("donor_id", userId)
      .not("prayer_message", "is", null)
      .neq("prayer_message", "")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    const formatted = (data || []).map((d: any) => ({
      id: d.id,
      campaignTitle: d.campaigns?.title || "Kampanye Kebaikan",
      campaignSlug: d.campaigns?.slug || "",
      message: d.prayer_message,
      createdAt: d.created_at,
      isEditable: true,
      likes: 12,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function updateUserPrayerAction(donationId: string, message: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveDonorId(supabase, adminClient);

    const { error } = await adminClient
      .from("donations")
      .update({ prayer_message: message })
      .eq("id", donationId)
      .eq("donor_id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/doa-saya");
    return { success: true, message: "Doa berhasil diperbarui!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUserPrayerAction(donationId: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveDonorId(supabase, adminClient);

    const { error } = await adminClient
      .from("donations")
      .update({ prayer_message: null })
      .eq("id", donationId)
      .eq("donor_id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/doa-saya");
    return { success: true, message: "Doa berhasil dihapus." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// ADMIN USER MANAGEMENT ACTIONS
// ----------------------------------------------------
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "donor" | "fundraiser" | "admin";
  isVerified: boolean;
  status: "active" | "suspended";
  joinedDate: string;
}

export async function getAdminUsersAction(): Promise<{
  success: boolean;
  data: AdminUserItem[];
  error?: string;
}> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select("id, full_name, email, phone_wa, role, is_verified, suspended_at, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    const formatted: AdminUserItem[] = (data || []).map((u: any) => ({
      id: u.id,
      name: u.full_name || "Pengguna",
      email: u.email,
      phone: u.phone_wa || "-",
      role: u.role,
      isVerified: !!u.is_verified,
      status: u.suspended_at ? "suspended" : "active",
      joinedDate: u.created_at ? u.created_at.split("T")[0] : "-",
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function updateUserRoleAction(userId: string, newRole: "donor" | "fundraiser" | "admin") {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      actorRole: "admin",
      action: "update",
      entityType: "user",
      entityId: userId,
      description: `Admin mengubah peran pengguna ${userId} menjadi ${newRole}`,
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: `Peran pengguna berhasil diubah menjadi ${newRole}!` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleUserSuspensionAction(userId: string, currentStatus: "active" | "suspended") {
  try {
    const adminClient = createAdminClient();
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    const { error } = await adminClient
      .from("profiles")
      .update({
        suspended_at: newStatus === "suspended" ? new Date().toISOString() : null,
        suspended_reason: newStatus === "suspended" ? "Ditangguhkan oleh administrator" : null,
      })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      actorRole: "admin",
      action: "update",
      entityType: "user",
      entityId: userId,
      description: `Admin mengubah status pengguna ${userId} menjadi ${newStatus}`,
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: `Status pengguna berhasil diubah menjadi ${newStatus}!` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// ADMIN PLATFORM SETTINGS ACTIONS
// ----------------------------------------------------
export async function getPlatformSettingsAction(): Promise<{
  success: boolean;
  settings: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    waVerificationTemplate: string;
    waUpdateTemplate: string;
  };
  error?: string;
}> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from("platform_settings").select("*");

    if (error) {
      return {
        success: false,
        settings: {
          bankName: "BCA",
          bankAccountNumber: "1234567890",
          bankAccountHolder: "Yayasan DonasiUmat Indonesia",
          waVerificationTemplate: "",
          waUpdateTemplate: "",
        },
        error: error.message,
      };
    }

    const bankSetting = data?.find((s: any) => s.key === "bank_transfer_official")?.value || {};
    const waSetting = data?.find((s: any) => s.key === "whatsapp_templates")?.value || {};

    return {
      success: true,
      settings: {
        bankName: bankSetting.bank_name || "BCA",
        bankAccountNumber: bankSetting.account_number || "1234567890",
        bankAccountHolder: bankSetting.account_holder || "Yayasan DonasiUmat Indonesia",
        waVerificationTemplate: waSetting.donation_verified || "Halo Sahabat Umat, donasi Anda sebesar {{amount}} untuk kampanye {{campaign_title}} telah diverifikasi. Terima kasih atas kebaikannya. — DonasiUmat",
        waUpdateTemplate: waSetting.campaign_update_posted || "Sahabat Umat, penggalang kampanye {{campaign_title}} yang Anda dukung baru saja mengunggah kabar perkembangan terbaru: {{update_title}}. Cek selengkapnya di aplikasi DonasiUmat.",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      settings: {
        bankName: "BCA",
        bankAccountNumber: "1234567890",
        bankAccountHolder: "Yayasan DonasiUmat Indonesia",
        waVerificationTemplate: "",
        waUpdateTemplate: "",
      },
      error: err.message,
    };
  }
}

export async function updatePlatformSettingsAction(data: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  waVerificationTemplate: string;
  waUpdateTemplate: string;
}) {
  try {
    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    const { error: bErr } = await adminClient.from("platform_settings").upsert({
      key: "bank_transfer_official",
      value: {
        bank_name: data.bankName,
        account_number: data.bankAccountNumber,
        account_holder: data.bankAccountHolder,
      },
      updated_at: now,
    });

    if (bErr) return { success: false, error: bErr.message };

    const { error: wErr } = await adminClient.from("platform_settings").upsert({
      key: "whatsapp_templates",
      value: {
        donation_verified: data.waVerificationTemplate,
        campaign_update_posted: data.waUpdateTemplate,
      },
      updated_at: now,
    });

    if (wErr) return { success: false, error: wErr.message };

    revalidatePath("/admin/pengaturan");
    return { success: true, message: "Pengaturan platform berhasil disimpan ke database!" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// CATEGORY ACTIONS (ADMIN)
// ----------------------------------------------------
export async function getCategoriesAction() {
  try {
    const adminClient = createAdminClient();
    const { data: categories, error } = await adminClient
      .from("categories")
      .select("id, name, slug, icon_name, description, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error: error.message, data: [] };
    }

    const { data: campaigns } = await adminClient
      .from("campaigns")
      .select("category_id");

    const countMap: Record<string, number> = {};
    if (campaigns) {
      campaigns.forEach((c: any) => {
        if (c.category_id) {
          countMap[c.category_id] = (countMap[c.category_id] || 0) + 1;
        }
      });
    }

    const formatted = (categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconName: cat.icon_name || "HeartPulse",
      description: cat.description || "",
      count: countMap[cat.id] || 0,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function createCategoryAction(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  if (!name || !slug) {
    return { error: "Nama dan slug kategori wajib diisi" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("categories")
    .insert({
      name,
      slug,
      description,
      icon_name: "Heart",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (data?.id) {
    await logAudit({
      actorId: user?.id || null,
      actorRole: "admin",
      action: "create",
      entityType: "campaign" as any,
      entityId: data.id,
      description: `Admin menambahkan kategori baru: ${name}`,
      afterData: data as any,
    });
  }

  revalidatePath("/admin/kategori");
  revalidatePath("/kampanye");
  revalidatePath("/");
  return { success: true, message: "Kategori berhasil ditambahkan!" };
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  if (!id || !name || !slug) {
    return { error: "ID, nama, dan slug kategori wajib diisi" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("categories")
    .update({
      name,
      slug,
      description,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: user?.id || null,
    actorRole: "admin",
    action: "update",
    entityType: "campaign" as any,
    entityId: id,
    description: `Admin memperbarui kategori: ${name}`,
    afterData: data as any,
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/kampanye");
  revalidatePath("/");
  return { success: true, message: "Kategori berhasil diperbarui!" };
}

export async function deleteCategoryAction(id: string) {
  const adminClient = createAdminClient();
  const { data: beforeData } = await adminClient
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await adminClient.from("categories").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorRole: "admin",
    action: "delete",
    entityType: "campaign" as any,
    entityId: id,
    description: `Admin menghapus kategori ${(beforeData as any)?.name || id}`,
    beforeData: beforeData as any,
  });

  revalidatePath("/admin/kategori");
  return { success: true };
}
