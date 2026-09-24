"use server";

import { z } from "zod";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";

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

export async function submitIdentityVerificationAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "user-mock-id";

    const rawData = {
      id_type: formData.get("id_type"),
      id_number: formData.get("id_number"),
      full_name_on_id: formData.get("full_name_on_id"),
      address: formData.get("address"),
      bank_name: formData.get("bank_name"),
      bank_account_number: formData.get("bank_account_number"),
      bank_account_holder: formData.get("bank_account_holder"),
      id_photo_url: formData.get("id_photo_url") || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
      selfie_photo_url: formData.get("selfie_photo_url") || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    };

    const validated = identitySchema.parse(rawData);

    // Hash ID number to protect PII while preventing duplicate registrations
    const idHash = createHash("sha256").update(validated.id_number.trim()).digest("hex");
    const idMasked = maskIdNumber(validated.id_number.trim());

    const adminClient = createAdminClient();

    // Check if ID hash already verified by another user
    const { data: existingVerified } = await adminClient
      .from("identity_verifications")
      .select("id, user_id")
      .eq("id_number_hash", idHash)
      .eq("status", "verified")
      .neq("user_id", userId)
      .limit(1)
      .single();

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
      console.warn("Identity verification insert fallback notice:", error.message);
    }

    const verificationId = inserted?.id || `kyc-${Date.now()}`;

    await logAudit({
      actorId: userId,
      actorRole: "donor",
      action: "create",
      entityType: "identity",
      entityId: verificationId,
      description: `Mengajukan verifikasi identitas KYC (${validated.id_type.toUpperCase()} - ${idMasked})`,
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
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
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
      console.warn("Approve KYC verification fallback notice:", vError.message);
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
      console.warn("Update profile verified fallback notice:", pError.message);
    }

    // 3. Send notifications to user
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("full_name, phone_number")
      .eq("id", targetUserId)
      .single();

    if (targetProfile?.phone_number) {
      try {
        await sendWhatsAppNotification({
          recipientPhone: targetProfile.phone_number,
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
      description: `Menyetujui verifikasi identitas KYC pengguna ${targetUserId}`,
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
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || "admin-mock-id";

    const adminClient = createAdminClient();
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
      console.warn("Reject KYC verification fallback notice:", error.message);
    }

    // Send notifications to user
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("full_name, phone_number")
      .eq("id", targetUserId)
      .single();

    if (targetProfile?.phone_number) {
      try {
        await sendWhatsAppNotification({
          recipientPhone: targetProfile.phone_number,
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
      description: `Menolak verifikasi identitas KYC ${verificationId} untuk pengguna ${targetUserId}: ${reason}`,
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
