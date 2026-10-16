import { isAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const csv = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await sql<Record<string, unknown>>(
    "select email, name, status, source, created_at, unsubscribed_at from subscribers order by created_at",
  );
  const cols = ["email", "name", "status", "source", "created_at", "unsubscribed_at"];
  const body = [cols.join(","), ...rows.map((r) => cols.map((c) => csv(r[c])).join(","))].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
