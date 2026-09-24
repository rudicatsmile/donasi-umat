"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
});

export async function updateProfileAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const validation = profileSchema.safeParse({ fullName, phone });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Input tidak valid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi telah berakhir, silakan login kembali." };
  }

  const { data: beforeData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone_wa: phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  await logAudit({
    actorId: user.id,
    actorRole: beforeData?.role || "donor",
    action: "update",
    entityType: "user",
    entityId: user.id,
    description: `Pengguna memperbarui profil dan nomor WhatsApp`,
    beforeData: beforeData as any,
    afterData: { full_name: fullName, phone_wa: phone },
  });

  revalidatePath("/dashboard/profil");
  return { success: true, message: "Profil berhasil diperbarui!" };
}

// Category Server Actions (Admin)
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

  await logAudit({
    actorId: user?.id || null,
    actorRole: "admin",
    action: "create",
    entityType: "category" as any,
    entityId: (data as any)?.id || `cat-${Date.now()}`,
    description: `Admin menambahkan kategori baru: ${name}`,
    afterData: data as any,
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/kampanye");
  revalidatePath("/");
  return { success: true, message: "Kategori berhasil ditambahkan!" };
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
    entityType: "category" as any,
    entityId: id,
    description: `Admin menghapus kategori ${(beforeData as any)?.name || id}`,
    beforeData: beforeData as any,
  });

  revalidatePath("/admin/kategori");
  return { success: true };
}

export async function toggleUserSuspensionAction(userId: string, currentStatus: "active" | "suspended") {
  const adminClient = createAdminClient();
  const newStatus = currentStatus === "active" ? "suspended" : "active";

  const { error } = await adminClient
    .from("profiles")
    .update({
      suspended_at: newStatus === "suspended" ? new Date().toISOString() : null,
      suspended_reason: newStatus === "suspended" ? "Ditangguhkan oleh administrator" : null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAudit({
    actorRole: "admin",
    action: "update",
    entityType: "user",
    entityId: userId,
    description: `Admin mengubah status pengguna menjadi ${newStatus}`,
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}
