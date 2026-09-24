import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/notifications/whatsapp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`wa-api:${ip}`, 20, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan kirim notifikasi. Silakan coba beberapa saat lagi." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { recipientPhone, recipientName, templateKey, params } = body;

    if (!recipientPhone || !recipientName || !templateKey) {
      return NextResponse.json(
        { error: "recipientPhone, recipientName, dan templateKey wajib disertakan" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppNotification({
      recipientPhone,
      recipientName,
      templateKey,
      params: params || { recipientName },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
