import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckList, Container, FinalCta, JsonLd, PageHero } from "@/components/Sections";
import { ArrowIcon } from "@/components/Icons";
import { SERVICES, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commercial & Post-Construction Cleaning Services",
  description:
    "Construction cleanup, commercial cleaning, schools, warehouse and industrial, window and floor care, and specialty cleaning in Nashville, Middle Tennessee and Central PA.",
  alternates: { canonical: "/services" },
  openGraph: { url: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": SERVICES.map((s) => ({
            "@type": "Service",
            name: s.name,
            description: s.intro,
            url: `${SITE_URL}/services#${s.slug}`,
            provider: { "@id": `${SITE_URL}/#business` },
            areaServed: ["Greater Nashville", "Middle Tennessee", "Central Pennsylvania"],
          })),
        }}
      />
      <PageHero
        label="Services"
        title="Six services, built around how commercial projects close out."
        intro="From the first rough clean to the touch-up before turnover, and the recurring work after move-in. Commercial and construction only."
      />
      <nav aria-label="Services on this page" className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <Container>
          <ul className="-mx-1 flex gap-1 overflow-x-auto py-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug} className="shrink-0">
                <a href={`#${s.slug}`} className="inline-flex min-h-10 items-center rounded-lg px-3 text-muted hover:bg-white hover:text-ink">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
      <div className="divide-y divide-line">
        {SERVICES.map((s, i) => (
          <section key={s.slug} id={s.slug} className="scroll-mt-32 py-16 sm:py-24" aria-labelledby={`${s.slug}-h`}>
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={`relative aspect-[4/3] overflow-hidden rounded-[16px] bg-tint ${i % 2 ? "lg:order-2" : ""}`}>
                  <Image src={s.image} alt={s.alt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
                </div>
                <div>
                  <p className="label text-deep">0{i + 1}</p>
                  <h2 id={`${s.slug}-h`} className="mt-2 text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">
                    {s.name}
                  </h2>
                  <p className="mt-4 text-lg text-muted">{s.intro}</p>
                  <CheckList items={s.items} className="mt-6" />
                  <Link href={`/contact?service=${encodeURIComponent(s.name)}`} className="btn btn-primary mt-8">
                    Get a quote <span className="sr-only">for {s.name}</span> <ArrowIcon />
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>
      <FinalCta />
    </>
  );
}
