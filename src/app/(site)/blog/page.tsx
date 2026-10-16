import type { Metadata } from "next";
import { Container, PageHero } from "@/components/Sections";
import { PostCard } from "@/components/PostCard";
import { getPublishedPosts } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog: Closeout and Construction Cleaning Notes for GCs",
  description:
    "Practical guides for general contractors on post-construction cleaning, cleaning phases and passing final walkthrough.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getPublishedPosts();
  return (
    <>
      <PageHero
        label="Blog"
        title="Closeout notes for general contractors."
        intro="Checklists, scheduling advice and walkthrough tips from a crew that only does commercial and construction cleaning."
      />
      <section className="py-16 sm:py-20">
        <Container>
          {posts.length === 0 ? (
            <p className="text-muted">No posts yet. Check back soon.</p>
          ) : (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
