import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, FinalCta, PageHero } from "@/components/Sections";
import { ArrowIcon } from "@/components/Icons";
import { AREAS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service Areas: Nashville, Middle Tennessee & Central Pennsylvania",
  description:
    "Post-construction and commercial cleaning across Greater Nashville and Middle Tennessee, and Central Pennsylvania.",
  alternates: { canonical: "/service-areas" },
  openGraph: { url: "/service-areas" },
};

export default function AreasPage() {
  return (
    <>
      <PageHero
        label="Service areas"
        title="Two markets. The same schedule-first approach."
        intro="We work across Greater Nashville and Middle Tennessee, and Central Pennsylvania. Not sure if your project is in range? Ask us."
      />
      {AREAS.map((a, i) => (
        <section key={a.slug} id={a.slug} className="scroll-mt-20 py-16 sm:py-24" aria-labelledby={`${a.slug}-h`}>
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
              <div className={`relative aspect-[16/10] overflow-hidden rounded-[16px] bg-tint ${i % 2 ? "lg:order-2" : ""}`}>
                <Image src={a.image} alt={a.alt} fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
              </div>
              <div>
                <p className="label text-deep">{a.short}</p>
                <h2 id={`${a.slug}-h`} className="mt-2 text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">
                  {a.name}
                </h2>
                <p className="mt-4 text-lg text-muted">{a.body}</p>
                <Link href={`/contact?market=${encodeURIComponent(a.name)}`} className="btn btn-primary mt-8">
                  Request a quote in {a.short} <ArrowIcon />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ))}
      <FinalCta />
    </>
  );
}
