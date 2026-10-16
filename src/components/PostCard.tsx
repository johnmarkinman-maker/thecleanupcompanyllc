import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/data";

export const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-tint">
        {post.cover && (
          <Image
            src={post.cover}
            alt={post.cover_alt || ""}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="label mt-4 text-muted">{fmtDate(post.published_at)}</p>
      <h3 className="mt-2 text-lg font-semibold leading-snug">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-deep">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="mt-2 line-clamp-3 text-muted">{post.excerpt}</p>}
    </article>
  );
}
