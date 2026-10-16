import { NextResponse } from "next/server";
import { processQueue, subscribe } from "@/lib/nurture";
import { clean, EMAIL_RE } from "@/lib/validate";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (clean(body.website)) return NextResponse.json({ ok: true });
  const email = clean(body.email, 200).toLowerCase();
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  try {
    await subscribe(email, clean(body.name, 120) || null);
    // Send the day-0 checklist right away instead of waiting for the daily cron.
    await processQueue(20);
  } catch (e) {
    console.error("subscribe failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
