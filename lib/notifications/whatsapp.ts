import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatWhatsAppMessage,
  type WhatsAppTemplateKey,
  type WhatsAppTemplateParams,
} from "./whatsapp-templates";

export interface SendWhatsAppNotificationParams {
  recipientPhone: string;
  recipientName: string;
  templateKey: WhatsAppTemplateKey;
  params: WhatsAppTemplateParams;
}

export function sanitizeIndonesianPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export async function sendWhatsAppNotification({
  recipientPhone,
  recipientName,
  templateKey,
  params,
}: SendWhatsAppNotificationParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedPhone = sanitizeIndonesianPhone(recipientPhone);
  const messageText = formatWhatsAppMessage(templateKey, params);

  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
  const gatewayToken = process.env.WHATSAPP_GATEWAY_TOKEN;

  let isDelivered = false;
  let responseData: any = null;
  let errorMessage: string | null = null;

  // 3x exponential backoff retry
  const maxRetries = 3;
  let attempt = 0;

  if (gatewayUrl && gatewayToken && gatewayToken !== "your-wa-gateway-token") {
    while (attempt < maxRetries && !isDelivered) {
      attempt++;
      try {
        const response = await fetch(gatewayUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: gatewayToken,
          },
          body: JSON.stringify({
            target: formattedPhone,
            message: messageText,
            countryCode: "62",
          }),
        });

        const json = await response.json();
        responseData = json;

        if (response.ok && (json.status === true || json.success === true || json.status === "success")) {
          isDelivered = true;
          break;
        } else {
          errorMessage = json.reason || json.message || "Provider returned error status";
        }
      } catch (err: any) {
        errorMessage = err.message || "Network error sending WhatsApp";
      }

      if (!isDelivered && attempt < maxRetries) {
        // Exponential backoff: 500ms, 1000ms
        await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
      }
    }
  } else {
    // Development / demo mode: log simulated delivery
    isDelivered = true;
    responseData = { simulated: true, note: "Gateway token not configured, simulation logged successfully" };
  }

  // Insert log to database
  try {
    const supabase = createAdminClient();
    await supabase.from("whatsapp_logs").insert({
      recipient_phone: formattedPhone,
      recipient_name: recipientName,
      template_name: templateKey,
      message_content: messageText,
      status: isDelivered ? "sent" : "failed",
      error_message: errorMessage,
      response_data: responseData,
      retry_count: attempt,
      sent_at: isDelivered ? new Date().toISOString() : null,
    });
  } catch (logErr) {
    console.warn("Failed to write to whatsapp_logs:", logErr);
  }

  return {
    success: isDelivered,
    messageId: responseData?.id || `wa-msg-${Date.now()}`,
    error: errorMessage || undefined,
  };
}
