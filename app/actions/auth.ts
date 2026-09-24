"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["donor", "fundraiser"]).default("donor"),
});

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Input tidak valid",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_verified")
    .eq("id", data.user.id)
    .single();

  await logAudit({
    actorId: data.user.id,
    actorRole: (profile?.role as any) || "donor",
    action: "create",
    entityType: "user",
    entityId: data.user.id,
    description: `Pengguna ${email} berhasil masuk ke sistem`,
  });

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Berhasil masuk ke sistem!",
    role: profile?.role || "donor",
  };
}

export async function registerAction(formData: FormData) {
  const fullName = (formData.get("fullName") || formData.get("full_name")) as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") || formData.get("phone_wa")) as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as "donor" | "fundraiser") || "donor";

  const validation = registerSchema.safeParse({
    fullName,
    email,
    phone,
    password,
    role,
  });

  if (!validation.success) {
    return {
      success: false,
      error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Input tidak valid",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_wa: phone,
        role: role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    await logAudit({
      actorId: data.user.id,
      actorRole: role,
      action: "create",
      entityType: "user",
      entityId: data.user.id,
      description: `Pendaftaran akun baru ${fullName} (${email}) sebagai ${role}`,
    });
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi." };
}

export async function setDemoSessionAction(
  role: "donor" | "fundraiser" | "admin",
  email?: string
) {
  const cookieStore = await cookies();
  cookieStore.set("donasiumat_demo_role", role, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    sameSite: "lax",
  });
  if (email) {
    cookieStore.set("donasiumat_demo_email", email, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("donasiumat_demo_role");
  cookieStore.delete("donasiumat_demo_email");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logAudit({
      actorId: user.id,
      actorRole: "donor",
      action: "delete",
      entityType: "user",
      entityId: user.id,
      description: `Pengguna keluar (logout) dari sistem`,
    });
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetPasswordAction(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Alamat email tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    actorRole: "donor",
    action: "update",
    entityType: "user",
    entityId: email,
    description: `Permintaan reset password dikirim ke ${email}`,
  });

  return {
    success: true,
    message: "Tautan reset password telah dikirim ke email Anda.",
  };
}
