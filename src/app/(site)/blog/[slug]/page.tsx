import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChecklistOptIn, Container, JsonLd } from "@/components/Sections";
import { fmtDate } from "@/components/PostCard";
import { ArrowIcon } from "@/components/Icons";
import { getPost, getPublishedPosts } from "@/lib/data";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { BUSINESS, SITE_URL } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      images: post.cover ? [{ url: post.cover, alt: post.cover_alt ?? "" }] : undefined,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt ?? undefined, images: post.cover ? [post.cover] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og.jpg`,
          datePublished: post.published_at,
          dateModified: post.updated_at ?? post.published_at,
          mainEntityOfPage: url,
          url,
          author: { "@type": "Organization", name: BUSINESS.legalName, url: SITE_URL },
          publisher: { "@type": "Organization", name: BUSINESS.legalName, logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-icon.png` } },
        }}
      />
      <article>
        <header className="pt-12 sm:pt-16">
          <Container className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="label text-muted">
              <Link href="/blog" className="hover:text-deep">
                Blog
              </Link>
            </nav>
            <h1 className="mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.08] tracking-tight">{post.title}</h1>
            <p className="label mt-5 text-muted">
              <time dateTime={post.published_at ?? undefined}>{fmtDate(post.published_at)}</time> · {readingMinutes(post.body)} min read
            </p>
          </Container>
          {post.cover && (
            <Container className="mt-10 max-w-5xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-tint">
                <Image src={post.cover} alt={post.cover_alt ?? ""} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
              </div>
            </Container>
          )}
        </header>
        <Container className="max-w-3xl py-12 sm:py-16">
          <div className="prose-tcc" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
          <div className="mt-14 rounded-[16px] border border-line bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Closing out a project soon?</h2>
            <p className="mt-2 text-muted">Send us the schedule. We will walk the site and plan the cleaning around your turnover date.</p>
            <Link href="/contact" className="btn btn-primary mt-5">
              Request a Quote <ArrowIcon />
            </Link>
          </div>
        </Container>
      </article>
      <ChecklistOptIn />
    </>
  );
}
