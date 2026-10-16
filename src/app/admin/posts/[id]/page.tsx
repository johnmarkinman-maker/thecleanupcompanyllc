import { readdir } from "fs/promises";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { deletePost } from "../../actions";
import { AdminShell } from "../../shell";
import { PostEditor } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit post" };

type Row = { id: number; title: string; slug: string; excerpt: string | null; body: string; cover: string | null; cover_alt: string | null; status: string };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let post: Row | undefined;
  if (id !== "new") {
    [post] = await sql<Row>("select * from posts where id = $1", [Number(id)]);
    if (!post) notFound();
  }
  const covers = await readdir(process.cwd() + "/public/images")
    .then((f) => f.filter((x) => /\.(webp|jpe?g|png|avif)$/.test(x)).map((x) => `/images/${x}`))
    .catch(() => []);
  return (
    <AdminShell
      title={post ? "Edit post" : "New post"}
      actions={
        <Link href="/admin/posts" className="text-sm text-muted hover:text-ink">
          Back to posts
        </Link>
      }
    >
      <PostEditor
        covers={covers}
        post={{
          id: post ? String(post.id) : "new",
          title: post?.title ?? "",
          slug: post?.slug ?? "",
          excerpt: post?.excerpt ?? "",
          body: post?.body ?? "",
          cover: post?.cover ?? "",
          cover_alt: post?.cover_alt ?? "",
          status: post?.status ?? "draft",
        }}
      />
      {post && (
        <form action={deletePost} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={post.id} />
          <button className="text-sm text-red-800 underline">Delete this post</button>
        </form>
      )}
    </AdminShell>
  );
}
