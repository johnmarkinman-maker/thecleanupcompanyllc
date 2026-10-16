import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { setLeadStatus } from "../actions";
import { AdminShell, fmt, Table } from "../shell";
import { StatusSelect } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

type Lead = Record<string, string | number | null> & { id: number; status: string };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const leads = status
    ? await sql<Lead>("select * from leads where status = $1 order by created_at desc", [status])
    : await sql<Lead>("select * from leads order by created_at desc limit 500");
  const filters = ["", "new", "contacted", "quoted", "won", "lost"];
  return (
    <AdminShell title="Leads">
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => (
          <a
            key={f}
            href={f ? `/admin/leads?status=${f}` : "/admin/leads"}
            className={`rounded-lg px-3 py-1.5 capitalize ${(status ?? "") === f ? "bg-ink text-white" : "bg-white text-muted"}`}
          >
            {f || "all"}
          </a>
        ))}
      </div>
      {leads.length === 0 ? (
        <p className="text-muted">No leads yet.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Received</th>
              <th>Contact</th>
              <th>Project</th>
              <th>Scope</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap text-muted">{fmt(l.created_at)}</td>
                <td>
                  <div className="font-medium">{l.name}</div>
                  {l.company && <div className="text-muted">{l.company}</div>}
                  <a className="block text-deep underline" href={`mailto:${l.email}`}>
                    {l.email}
                  </a>
                  {l.phone && (
                    <a className="block text-deep" href={`tel:${l.phone}`}>
                      {l.phone}
                    </a>
                  )}
                </td>
                <td className="text-muted">
                  {[l.service, l.market, l.location].filter(Boolean).map((v) => (
                    <div key={String(v)}>{v}</div>
                  ))}
                  {l.sq_ft && <div>{l.sq_ft} sq ft</div>}
                  {l.turnover_date && <div>Turnover: {l.turnover_date}</div>}
                </td>
                <td className="max-w-sm whitespace-pre-wrap">{l.scope}</td>
                <td>
                  <StatusSelect id={l.id} value={l.status} action={setLeadStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminShell>
  );
}
