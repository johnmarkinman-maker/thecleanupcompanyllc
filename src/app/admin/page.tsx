import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NURTURE } from "@/lib/nurture";
import { AdminShell } from "./shell";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const [[counts], queue, recentFailures] = await Promise.all([
    sql<{ leads_new: number; leads: number; subs: number; unsubs: number; posts: number; testimonials: number }>(
      `select
        (select count(*)::int from leads where status = 'new') as leads_new,
        (select count(*)::int from leads) as leads,
        (select count(*)::int from subscribers where status = 'active') as subs,
        (select count(*)::int from subscribers where status <> 'active') as unsubs,
        (select count(*)::int from posts where status = 'published') as posts,
        (select count(*)::int from testimonials where published) as testimonials`,
    ),
    sql<{ template: string; status: string; n: number }>("select template, status, count(*)::int as n from email_queue group by 1, 2"),
    sql<{ id: number; template: string; error: string; email: string }>(
      `select q.id, q.template, q.error, s.email from email_queue q join subscribers s on s.id = q.subscriber_id
        where q.status = 'failed' order by q.id desc limit 5`,
    ),
  ]);
  const cell = (t: string, s: string) => queue.find((q) => q.template === t && q.status === s)?.n ?? 0;

  const stats = [
    { label: "New leads", value: counts.leads_new, href: "/admin/leads" },
    { label: "Total leads", value: counts.leads, href: "/admin/leads" },
    { label: "Active subscribers", value: counts.subs, href: "/admin/subscribers" },
    { label: "Unsubscribed", value: counts.unsubs, href: "/admin/subscribers" },
    { label: "Published posts", value: counts.posts, href: "/admin/posts" },
    { label: "Live testimonials", value: counts.testimonials, href: "/admin/testimonials" },
  ];

  return (
    <AdminShell title="Overview">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded-[12px] border border-line bg-white p-4 hover:border-deep">
              <span className="block text-3xl font-semibold">{s.value}</span>
              <span className="text-sm text-muted">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Nurture queue</h2>
      <p className="text-sm text-muted">Processed daily by Vercel Cron. Day 0 sends immediately on signup.</p>
      <div className="mt-3 overflow-x-auto rounded-[12px] border border-line bg-white">
        <table className="w-full min-w-[560px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-muted">
          <thead className="border-b border-line">
            <tr>
              <th>Email</th>
              <th>Day</th>
              <th>Pending</th>
              <th>Sent</th>
              <th>Failed</th>
              <th>Cancelled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {NURTURE.map((t) => (
              <tr key={t.key}>
                <td>{t.subject}</td>
                <td>{t.day}</td>
                <td>{cell(t.key, "pending")}</td>
                <td>{cell(t.key, "sent")}</td>
                <td>{cell(t.key, "failed")}</td>
                <td>{cell(t.key, "cancelled")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {recentFailures.length > 0 && (
        <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-medium">Recent failures</p>
          <ul className="mt-2 grid gap-1">
            {recentFailures.map((f) => (
              <li key={f.id}>
                {f.email} · {f.template}: {f.error?.slice(0, 160)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
