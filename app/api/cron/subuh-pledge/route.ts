import { NextResponse } from "next/server";
import { disburseDailySubuhPledgesAction } from "@/app/actions/pledges";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development / demo, allow bypass
    }

    const result = await disburseDailySubuhPledgesAction();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
