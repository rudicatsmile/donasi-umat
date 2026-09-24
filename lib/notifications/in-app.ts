import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface InAppNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  linkUrl?: string;
}

export async function sendInAppNotification(params: InAppNotificationParams) {
  try {
    const supabase = createAdminClient();
    const payload = {
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      link_url: params.linkUrl || null,
      is_read: false,
    };

    const { error } = await supabase.from("notifications").insert(payload);
    if (error) {
      console.warn("In-app notification insert notice (safe fallback):", error.message);
    }
  } catch (err) {
    console.error("Failed to send in-app notification:", err);
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    revalidatePath("/dashboard/notifikasi");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAllNotificationsAsReadAction(userId: string) {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    revalidatePath("/dashboard/notifikasi");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
