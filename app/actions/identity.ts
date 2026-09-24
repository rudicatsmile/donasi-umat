"use server";

import { z } from "zod";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";
import { IdentityVerification } from "@/lib/dummy-data";

const identitySchema = z.object({
  id_type: z.enum(["ktp", "sim", "passport"]),
  id_number: z.string().min(8, "Nomor identitas minimal 8 karakter").max(20, "Nomor identitas maksimal 20 karakter"),
  full_name_on_id: z.string().min(3, "Nama lengkap sesuai KTP minimal 3 karakter"),
  address: z.string().min(10, "Alamat domisili lengkap wajib diisi minimal 10 karakter"),
  bank_name: z.string().min(2, "Nama bank tujuan wajib dipilih"),
  bank_account_number: z.string().min(5, "Nomor rekening bank wajib diisi"),
  bank_account_holder: z.string().min(3, "Nama pemilik rekening wajib diisi"),
  id_photo_url: z.string().min(1, "Foto dokumen identitas wajib diunggah"),
  selfie_photo_url: z.string().min(1, "Foto selfie memegang identitas wajib diunggah"),
});

function maskIdNumber(idNumber: string): string {
  if (idNumber.length <= 6) return idNumber.slice(0, 2) + "****" + idNumber.slice(-2);
  const start = idNumber.slice(0, 6);
  const end = idNumber.slice(-4);
  const maskedLength = Math.max(2, idNumber.length - 10);
  return `${start}${"*".repeat(maskedLength)}${end}`;
}

async function resolveUserId(supabase: any, adminClient: any): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  const cookieStore = await cookies();
  const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
  if (demoEmail) {
    const { data: p } = await adminClient.from("profiles").select("id").eq("email", demoEmail).maybeSingle();
    if (p?.id) return p.id;
  }

  // Fallback to fundraiser applicant or donor
  const { data: donor } = await adminClient.from("profiles").select("id").eq("role", "donor").limit(1).maybeSingle();
  if (donor?.id) return donor.id;

  const { data: anyUser } = await adminClient.from("profiles").select("id").limit(1).maybeSingle();
  return anyUser?.id || "da95d08f-872f-4280-8f69-c86a1d589c51";
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

  const { data: adminUser } = await adminClient.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
  return adminUser?.id || "0faa19b9-2a14-423e-8ede-dbe3a1437102";
}

export async function getAdminIdentityVerificationsAction(): Promise<{
  success: boolean;
  data: IdentityVerification[];
  error?: string;
}> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("identity_verifications")
      .select(`
        id,
        user_id,
        id_type,
        id_number_masked,
        full_name_on_id,
        address,
        bank_name,
        bank_account_number,
        bank_account_holder,
        id_photo_url,
        selfie_photo_url,
        status,
        rejection_reason,
        reviewed_by,
        reviewed_at,
        created_at,
        profiles:user_id ( full_name, email, phone_wa )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching identity verifications:", error);
      return { success: false, data: [], error: error.message };
    }

    const formatted: IdentityVerification[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.profiles?.full_name || row.full_name_on_id || "Pengguna",
      userEmail: row.profiles?.email || "-",
      userPhone: row.profiles?.phone_wa || "-",
      idType: row.id_type,
      idNumberMasked: row.id_number_masked,
      fullNameOnId: row.full_name_on_id,
      address: row.address,
      bankName: row.bank_name,
      bankAccountNumber: row.bank_account_number,
      bankAccountHolder: row.bank_account_holder,
      idPhotoUrl: row.id_photo_url,
      selfiePhotoUrl: row.selfie_photo_url,
      status: row.status,
      rejectionReason: row.rejection_reason || undefined,
      reviewedBy: row.reviewed_by ? "Administrator" : undefined,
      reviewedAt: row.reviewed_at || undefined,
      createdAt: row.created_at,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, data: [], error: err.message || "Gagal memuat data verifikasi" };
  }
}

export async function getUserIdentityVerificationAction(): Promise<{
  success: boolean;
  verification: any | null;
  profile: any | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveUserId(supabase, adminClient);

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, full_name, email, phone_wa, role, is_verified")
      .eq("id", userId)
      .maybeSingle();

    const { data: verification } = await adminClient
      .from("identity_verifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      success: true,
      verification,
      profile,
    };
  } catch (err: any) {
    return { success: false, verification: null, profile: null, error: err.message };
  }
}

export async function submitIdentityVerificationAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const userId = await resolveUserId(supabase, adminClient);

    let idPhotoUrl = formData.get("id_photo_url") as string;
    let selfiePhotoUrl = formData.get("selfie_photo_url") as string;

    // Handle potential file uploads
    const idFile = formData.get("id_photo_file") as File | null;
    const selfieFile = formData.get("selfie_photo_file") as File | null;

    if (idFile && typeof idFile === "object" && idFile.size > 0) {
      try {
        const ext = idFile.name.split(".").pop() || "jpg";
        const path = `${userId}/id-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await idFile.arrayBuffer());
        const { error: upErr } = await adminClient.storage
          .from("verification-docs")
          .upload(path, buffer, { contentType: idFile.type || "image/jpeg", upsert: true });

        if (!upErr) {
          const { data: urlData } = adminClient.storage.from("verification-docs").getPublicUrl(path);
          idPhotoUrl = urlData.publicUrl;
        }
      } catch (uploadErr) {
        console.warn("Storage upload error for ID document:", uploadErr);
      }
    }

    if (selfieFile && typeof selfieFile === "object" && selfieFile.size > 0) {
      try {
        const ext = selfieFile.name.split(".").pop() || "jpg";
        const path = `${userId}/selfie-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await selfieFile.arrayBuffer());
        const { error: upErr } = await adminClient.storage
          .from("verification-docs")
          .upload(path, buffer, { contentType: selfieFile.type || "image/jpeg", upsert: true });

        if (!upErr) {
          const { data: urlData } = adminClient.storage.from("verification-docs").getPublicUrl(path);
          selfiePhotoUrl = urlData.publicUrl;
        }
      } catch (uploadErr) {
        console.warn("Storage upload error for Selfie document:", uploadErr);
      }
    }

    const rawData = {
      id_type: formData.get("id_type"),
      id_number: formData.get("id_number"),
      full_name_on_id: formData.get("full_name_on_id"),
      address: formData.get("address"),
      bank_name: formData.get("bank_name"),
      bank_account_number: formData.get("bank_account_number"),
      bank_account_holder: formData.get("bank_account_holder"),
      id_photo_url: idPhotoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
      selfie_photo_url: selfiePhotoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    };

    const validated = identitySchema.parse(rawData);

    // Hash ID number to protect PII while preventing duplicate registrations
    const idHash = createHash("sha256").update(validated.id_number.trim()).digest("hex");
    const idMasked = maskIdNumber(validated.id_number.trim());

    // Check if ID hash already verified by another user
    const { data: existingVerified } = await adminClient
      .from("identity_verifications")
      .select("id, user_id")
      .eq("id_number_hash", idHash)
      .eq("status", "verified")
      .neq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (existingVerified) {
      return {
        success: false,
        error: "Nomor identitas ini sudah terdaftar dan terverifikasi pada akun lain.",
      };
    }

    const payload = {
      user_id: userId,
      id_type: validated.id_type,
      id_number_hash: idHash,
      id_number_masked: idMasked,
      full_name_on_id: validated.full_name_on_id,
      address: validated.address,
      bank_name: validated.bank_name,
      bank_account_number: validated.bank_account_number,
      bank_account_holder: validated.bank_account_holder,
      id_photo_url: validated.id_photo_url,
      selfie_photo_url: validated.selfie_photo_url,
      status: "pending" as const,
      rejection_reason: null,
    };

    const { data: inserted, error } = await adminClient
      .from("identity_verifications")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Identity verification insert notice:", error.message);
      return { success: false, error: error.message };
    }

    const verificationId = inserted?.id;

    if (verificationId) {
      await logAudit({
        actorId: userId,
        actorRole: "donor",
        action: "create",
        entityType: "identity",
        entityId: verificationId,
        description: `Mengajukan verifikasi identitas KYC (${validated.id_type.toUpperCase()} - ${idMasked})`,
      });
    }

    await sendInAppNotification({
      userId,
      title: "Pengajuan Verifikasi Identitas Diterima",
      message: "Data identitas (KYC) Anda sedang dalam antrean verifikasi oleh tim kurator DonasiUmat (1x24 jam kerja).",
      type: "info",
      linkUrl: "/galang-dana/verifikasi-identitas",
    });

    revalidatePath("/galang-dana/verifikasi-identitas");
    revalidatePath("/admin/verifikasi-identitas");
    revalidatePath("/dashboard/profil");

    return {
      success: true,
      message: "Data identitas Anda berhasil diajukan dan sedang ditinjau kurator (1x24 jam kerja).",
      verificationId,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal mengajukan verifikasi identitas" };
  }
}

export async function approveIdentityAction(verificationId: string, targetUserId: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    // 1. Update verification record
    const { error: vError } = await adminClient
      .from("identity_verifications")
      .update({
        status: "verified",
        reviewed_by: adminId,
        reviewed_at: now,
        rejection_reason: null,
      })
      .eq("id", verificationId);

    if (vError) {
      console.warn("Approve KYC verification notice:", vError.message);
      return { success: false, error: vError.message };
    }

    // 2. Update user profile to verified & fundraiser role
    const { error: pError } = await adminClient
      .from("profiles")
      .update({
        is_verified: true,
        role: "fundraiser",
        updated_at: now,
      })
      .eq("id", targetUserId);

    if (pError) {
      console.warn("Update profile verified notice:", pError.message);
    }

    // 3. Send notifications to user
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("full_name, phone_wa")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetProfile?.phone_wa) {
      try {
        await sendWhatsAppNotification({
          recipientPhone: targetProfile.phone_wa,
          recipientName: targetProfile.full_name || "Sahabat",
          templateKey: "identity_approved",
          params: {
            recipientName: targetProfile.full_name || "Sahabat",
          },
        });
      } catch (waErr) {
        console.warn("WhatsApp identity approved failed:", waErr);
      }
    }

    await sendInAppNotification({
      userId: targetUserId,
      title: "Verifikasi Identitas Disetujui!",
      message: "Selamat! Verifikasi identitas (KYC) Anda telah disetujui. Anda sekarang dapat membuat kampanye galang dana sosial.",
      type: "success",
      linkUrl: "/galang-dana/kampanye-baru",
    });

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "approve",
      entityType: "identity",
      entityId: verificationId,
      description: `Menyetujui verifikasi identitas KYC pengguna ${targetProfile?.full_name || targetUserId}`,
    });

    revalidatePath("/admin/verifikasi-identitas");
    revalidatePath("/admin/pengguna");
    revalidatePath("/galang-dana/verifikasi-identitas");

    return {
      success: true,
      message: "Identitas pengguna berhasil disetujui. Akun kini terverifikasi sebagai Penggalang Dana.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyetujui verifikasi" };
  }
}

export async function rejectIdentityAction(verificationId: string, targetUserId: string, reason: string) {
  try {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Alasan penolakan minimal 5 karakter wajib disertakan." };
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();
    const adminId = await resolveAdminId(supabase, adminClient);
    const now = new Date().toISOString();

    const { error } = await adminClient
      .from("identity_verifications")
      .update({
        status: "rejected",
        reviewed_by: adminId,
        reviewed_at: now,
        rejection_reason: reason,
      })
      .eq("id", verificationId);

    if (error) {
      console.warn("Reject KYC verification notice:", error.message);
      return { success: false, error: error.message };
    }

    // Send notifications to user
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("full_name, phone_wa")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetProfile?.phone_wa) {
      try {
        await sendWhatsAppNotification({
          recipientPhone: targetProfile.phone_wa,
          recipientName: targetProfile.full_name || "Sahabat",
          templateKey: "identity_rejected",
          params: {
            recipientName: targetProfile.full_name || "Sahabat",
            reason,
          },
        });
      } catch (waErr) {
        console.warn("WhatsApp identity rejected failed:", waErr);
      }
    }

    await sendInAppNotification({
      userId: targetUserId,
      title: "Verifikasi Identitas Belum Disetujui",
      message: `Pengajuan verifikasi identitas (KYC) Anda ditolak: "${reason}". Silakan perbaiki dan ajukan ulang.`,
      type: "error",
      linkUrl: "/galang-dana/verifikasi-identitas",
    });

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "reject",
      entityType: "identity",
      entityId: verificationId,
      description: `Menolak verifikasi identitas KYC pengguna ${targetProfile?.full_name || targetUserId}: ${reason}`,
    });

    revalidatePath("/admin/verifikasi-identitas");
    revalidatePath("/galang-dana/verifikasi-identitas");

    return {
      success: true,
      message: "Verifikasi identitas ditolak dan alasan telah dikirimkan ke pengguna.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menolak verifikasi" };
  }
}
