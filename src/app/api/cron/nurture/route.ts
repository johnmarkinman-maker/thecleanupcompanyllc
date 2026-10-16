import { NextResponse } from "next/server";
import { processQueue } from "@/lib/nurture";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron calls this daily with "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processQueue();
  return NextResponse.json(result);
}
