import { NextResponse } from "next/server";
import { expirePendingDonationsAction } from "@/app/actions/donations";
import { disburseDailySubuhPledgesAction } from "@/app/actions/pledges";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Optional check if CRON_SECRET configured
    }

    const [expireResult, subuhResult] = await Promise.all([
      expirePendingDonationsAction(),
      disburseDailySubuhPledgesAction(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredDonations: expireResult,
      subuhPledges: subuhResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
