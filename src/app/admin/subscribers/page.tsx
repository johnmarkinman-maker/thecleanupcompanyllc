import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { AdminShell, fmt, Table } from "../shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  await requireAdmin();
  const subs = await sql<{ id: number; email: string; name: string | null; status: string; source: string; created_at: string; sent: number }>(
    `select s.*, (select count(*)::int from email_queue q where q.subscriber_id = s.id and q.status = 'sent') as sent
       from subscribers s order by s.created_at desc limit 1000`,
  );
  return (
    <AdminShell
      title={`Subscribers (${subs.filter((s) => s.status === "active").length} active)`}
      actions={
        <a href="/admin/subscribers/export" className="btn btn-ghost !min-h-10">
          Export CSV
        </a>
      }
    >
      {subs.length === 0 ? (
        <p className="text-muted">No subscribers yet.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Source</th>
              <th>Nurture sent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.email}</td>
                <td>{s.name}</td>
                <td>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "active" ? "bg-tint text-deep" : "bg-paper text-muted"}`}>{s.status}</span>
                </td>
                <td className="text-muted">{s.source}</td>
                <td>{s.sent} / 4</td>
                <td className="whitespace-nowrap text-muted">{fmt(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminShell>
  );
}
