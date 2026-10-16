import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { AdminShell, fmt, Table } from "../shell";
import { NewsletterForm } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter" };

export default async function NewsletterAdmin() {
  await requireAdmin();
  const [[{ n }], sent] = await Promise.all([
    sql<{ n: number }>("select count(*)::int as n from subscribers where status = 'active'"),
    sql<{ id: number; subject: string; status: string; sent_at: string; recipients: number }>(
      "select id, subject, status, sent_at, recipients from broadcasts order by id desc limit 50",
    ),
  ]);
  return (
    <AdminShell title="Newsletter">
      <p className="mb-6 text-sm text-muted">{n} active subscribers.</p>
      <NewsletterForm />
      <h2 className="mt-12 mb-3 text-lg font-semibold">Sent broadcasts</h2>
      {sent.length === 0 ? (
        <p className="text-muted">Nothing sent yet.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Recipients</th>
              <th>Status</th>
              <th>Sent</th>
            </tr>
          </thead>
          <tbody>
            {sent.map((b) => (
              <tr key={b.id}>
                <td className="font-medium">{b.subject}</td>
                <td>{b.recipients}</td>
                <td>{b.status}</td>
                <td className="text-muted">{fmt(b.sent_at)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminShell>
  );
}
