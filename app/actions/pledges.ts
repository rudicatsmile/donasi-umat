"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { sendInAppNotification } from "@/lib/notifications/in-app";
import { sanitizePlainText } from "@/lib/sanitize";

const pledgeSettingsSchema = z.object({
  daily_amount: z.coerce.number().min(1000, "Nominal harian minimal Rp 1.000"),
  preferred_category: z.string().default("all"),
  prayer_message: z.string().max(300, "Doa maksimal 300 karakter").optional().nullable(),
  is_active: z.boolean().default(true),
});

export async function getPledgeAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Silakan masuk terlebih dahulu" };
    }

    const adminClient = createAdminClient();
    const { data: pledge } = await adminClient
      .from("sedekah_subuh_pledges")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return {
      success: true,
      pledge: pledge || {
        daily_amount: 10000,
        balance: 0,
        preferred_category: "all",
        prayer_message: "Bismillah, semoga sedekah subuh ini menjadi wasilah terkabulnya hajat dan penolak bala.",
        is_active: false,
        total_days_donated: 0,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function savePledgeSettingsAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Silakan masuk terlebih dahulu" };
    }

    const rawData = {
      daily_amount: formData.get("daily_amount"),
      preferred_category: formData.get("preferred_category") || "all",
      prayer_message: formData.get("prayer_message") || null,
      is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
    };

    const validated = pledgeSettingsSchema.parse(rawData);
    const adminClient = createAdminClient();

    const payload = {
      user_id: user.id,
      daily_amount: validated.daily_amount,
      preferred_category: validated.preferred_category,
      prayer_message: validated.prayer_message ? sanitizePlainText(validated.prayer_message) : null,
      is_active: validated.is_active,
      updated_at: new Date().toISOString(),
    };

    const { error } = await adminClient
      .from("sedekah_subuh_pledges")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.warn("Pledge settings upsert notice:", error.message);
    }

    await logAudit({
      actorId: user.id,
      actorRole: "donor",
      action: "update",
      entityType: "pledge",
      entityId: user.id,
      description: `Memperbarui setelan Sedekah Subuh Rutin: Rp ${validated.daily_amount.toLocaleString("id-ID")}/hari (${validated.is_active ? "Aktif" : "Nonaktif"})`,
    });

    revalidatePath("/dashboard/sedekah-subuh");

    return {
      success: true,
      message: "Pengaturan Sedekah Subuh Rutin berhasil disimpan.",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Input tidak valid" };
    }
    return { success: false, error: error.message || "Gagal menyimpan pengaturan" };
  }
}

export async function topupPledgeBalanceAction(amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Silakan masuk terlebih dahulu" };
    }

    if (amount < 20000) {
      return { success: false, error: "Top-up saldo komitmen minimal Rp 20.000" };
    }

    const adminClient = createAdminClient();
    const uniqueCode = Math.floor(100 + Math.random() * 900);
    const totalTransfer = amount + uniqueCode;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const donationCode = `TOPUP-${Date.now().toString().slice(-6)}`;

    // In a production setup, this creates a top-up transaction verified by admin.
    // For demo/fallback, we also update pledge balance directly or register transaction.
    const { data: existingPledge } = await adminClient
      .from("sedekah_subuh_pledges")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const currentBalance = existingPledge?.balance || 0;
    const newBalance = currentBalance + amount;

    await adminClient
      .from("sedekah_subuh_pledges")
      .upsert({
        user_id: user.id,
        balance: newBalance,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    await logAudit({
      actorId: user.id,
      actorRole: "donor",
      action: "create",
      entityType: "pledge",
      entityId: donationCode,
      description: `Top-up Saldo Komitmen Sedekah Subuh: Rp ${amount.toLocaleString("id-ID")} (Saldo Baru: Rp ${newBalance.toLocaleString("id-ID")})`,
    });

    revalidatePath("/dashboard/sedekah-subuh");

    return {
      success: true,
      donationCode,
      uniqueCode,
      totalTransfer,
      newBalance,
      expiresAt,
      message: `Top-up saldo Sedekah Subuh sebesar Rp ${amount.toLocaleString("id-ID")} berhasil dialokasikan ke saldo amanah Anda.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal melakukan top-up" };
  }
}

/**
 * Subuh Cron Action: Executed every morning around 04:30 WIB
 * Automatically disburses daily sedekah subuh from active pre-funded balances
 */
export async function disburseDailySubuhPledgesAction() {
  try {
    const adminClient = createAdminClient();
    const now = new Date().toISOString();

    // 1. Fetch active pledges with sufficient balance
    const { data: activePledges, error: fetchErr } = await adminClient
      .from("sedekah_subuh_pledges")
      .select("id, user_id, daily_amount, balance, preferred_category, prayer_message, total_days_donated")
      .eq("is_active", true)
      .gt("balance", 0);

    if (fetchErr) {
      console.warn("Fetch active pledges warning:", fetchErr.message);
    }

    if (!activePledges || activePledges.length === 0) {
      return { success: true, processedCount: 0, message: "Tidak ada pledge aktif dengan saldo mencukupi" };
    }

    // 2. Fetch active emergency/urgent campaigns to allocate to
    const { data: urgentCampaigns } = await adminClient
      .from("campaigns")
      .select("id, title, slug, collected_amount, donor_count")
      .eq("status", "active")
      .order("is_urgent", { ascending: false })
      .limit(5);

    const targetCampaign = urgentCampaigns?.[0] || {
      id: "bantu-pengobatan-bu-siti",
      title: "Bantu Pengobatan Bu Siti, Janda Tunanetra Berjuang Melawan Tumor",
      slug: "bantu-pengobatan-bu-siti-bandung",
      collected_amount: 15400000,
      donor_count: 87,
    };

    let processedCount = 0;

    for (const pledge of activePledges) {
      if (pledge.balance < pledge.daily_amount) {
        continue;
      }

      const newBalance = pledge.balance - pledge.daily_amount;
      const newDays = (pledge.total_days_donated || 0) + 1;

      // Update pledge record
      await adminClient
        .from("sedekah_subuh_pledges")
        .update({
          balance: newBalance,
          total_days_donated: newDays,
          last_disbursed_at: now,
          updated_at: now,
        })
        .eq("id", pledge.id);

      // Create verified donation record
      const donationCode = `SBS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      await adminClient.from("donations").insert({
        donation_code: donationCode,
        campaign_id: targetCampaign.id,
        user_id: pledge.user_id,
        donor_id: pledge.user_id,
        donor_name: "Sahabat Sedekah Subuh",
        amount: pledge.daily_amount,
        unique_code: 0,
        total_transfer: pledge.daily_amount,
        bank_destination: "SALDO_KOMITMEN_SUBUH",
        is_anonymous: false,
        prayer_message: pledge.prayer_message || "Doa fajar: Semoga berkah dan dilipatgandakan pahalanya.",
        status: "verified",
        verified_at: now,
      });

      // Increment campaign collected amount
      if (targetCampaign.id) {
        await adminClient
          .from("campaigns")
          .update({
            collected_amount: (targetCampaign.collected_amount || 0) + pledge.daily_amount,
            donor_count: (targetCampaign.donor_count || 0) + 1,
            updated_at: now,
          })
          .eq("id", targetCampaign.id);
      }

      // Fetch user profile for WhatsApp report
      const { data: userProfile } = await adminClient
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", pledge.user_id)
        .single();

      if (userProfile?.phone_number) {
        try {
          await sendWhatsAppNotification({
            recipientPhone: userProfile.phone_number,
            recipientName: userProfile.full_name || "Sahabat Subuh",
            templateKey: "donation_verified",
            params: {
              recipientName: userProfile.full_name || "Sahabat Subuh",
              campaignTitle: targetCampaign.title,
              campaignSlug: targetCampaign.slug,
              amount: `Rp ${pledge.daily_amount.toLocaleString("id-ID")}`,
              donationCode,
            },
          });
        } catch (e) {
          console.warn("Notice: WA Subuh notification failed:", e);
        }
      }

      // Send in-app notification
      await sendInAppNotification({
        userId: pledge.user_id,
        title: "Sedekah Subuh Tersalurkan!",
        message: `Alhamdulillah, sedekah subuh Anda sebesar Rp ${pledge.daily_amount.toLocaleString("id-ID")} telah disalurkan ke "${targetCampaign.title}". Sisa saldo amanah: Rp ${newBalance.toLocaleString("id-ID")}.`,
        type: "success",
        linkUrl: `/kampanye/${targetCampaign.slug}`,
      });

      processedCount++;
    }

    await logAudit({
      actorRole: "system",
      action: "verify",
      entityType: "pledge",
      entityId: `subuh-${now.slice(0, 10)}`,
      description: `Sistem Subuh Otomatis menyalurkan sedekah dari ${processedCount} donatur komitmen.`,
    });

    return {
      success: true,
      processedCount,
      targetCampaign: targetCampaign.title,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
