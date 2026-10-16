import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// RFC 8058 one-click unsubscribe target (List-Unsubscribe-Post).
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (token) {
    await sql("update subscribers set status = 'unsubscribed', unsubscribed_at = now() where token = $1 and status = 'active'", [token]);
    await sql(
      "update email_queue set status = 'cancelled' where status = 'pending' and subscriber_id in (select id from subscribers where token = $1)",
      [token],
    );
  }
  return NextResponse.json({ ok: true });
}
