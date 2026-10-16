import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { AdminShell, fmt, Table } from "../shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog posts" };

export default async function PostsAdmin() {
  await requireAdmin();
  const posts = await sql<{ id: number; title: string; slug: string; status: string; published_at: string | null; updated_at: string }>(
    "select id, title, slug, status, published_at, updated_at from posts order by coalesce(published_at, updated_at) desc",
  );
  return (
    <AdminShell
      title="Blog posts"
      actions={
        <Link href="/admin/posts/new" className="btn btn-primary !min-h-10">
          New post
        </Link>
      }
    >
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Published</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/posts/${p.id}`} className="font-medium text-deep underline-offset-2 hover:underline">
                  {p.title}
                </Link>
                <div className="text-xs text-muted">/blog/{p.slug}</div>
              </td>
              <td>
                <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-tint text-deep" : "bg-paper text-muted"}`}>{p.status}</span>
              </td>
              <td className="whitespace-nowrap text-muted">{fmt(p.published_at)}</td>
              <td className="whitespace-nowrap text-muted">{fmt(p.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminShell>
  );
}
