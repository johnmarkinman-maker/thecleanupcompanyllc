import "server-only";
import { isBuildPhase, sql } from "./db";
import { SEED_POSTS } from "./seed-posts";

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover: string | null;
  cover_alt: string | null;
  status: string;
  published_at: string | null;
  updated_at: string | null;
};

export type Testimonial = {
  id: number;
  quote: string;
  name: string;
  role: string | null;
  company: string | null;
  published: boolean;
  sort: number;
};

const seedAsPosts = (): Post[] =>
  SEED_POSTS.map((p, i) => ({ ...p, id: i + 1, status: "published", updated_at: p.published_at }));

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : (v as string | null));
const normalize = (p: Post): Post => ({ ...p, published_at: iso(p.published_at), updated_at: iso(p.updated_at) });

export async function getPublishedPosts(limit = 100): Promise<Post[]> {
  if (isBuildPhase()) return seedAsPosts().reverse().slice(0, limit);
  try {
    const rows = await sql<Post>(
      "select * from posts where status = 'published' order by published_at desc nulls last limit $1",
      [limit],
    );
    return rows.map(normalize);
  } catch (e) {
    console.error("getPublishedPosts", e);
    return seedAsPosts().reverse().slice(0, limit);
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  if (isBuildPhase()) return seedAsPosts().find((p) => p.slug === slug) ?? null;
  try {
    const [row] = await sql<Post>("select * from posts where slug = $1 and status = 'published'", [slug]);
    return row ? normalize(row) : null;
  } catch (e) {
    console.error("getPost", e);
    return seedAsPosts().find((p) => p.slug === slug) ?? null;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (isBuildPhase()) return [];
  try {
    return await sql<Testimonial>("select * from testimonials where published = true order by sort, id");
  } catch (e) {
    console.error("getTestimonials", e);
    return [];
  }
}
