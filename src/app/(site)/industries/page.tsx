import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, FinalCta, PageHero } from "@/components/Sections";
import { ArrowIcon } from "@/components/Icons";
import { INDUSTRIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "Cleaning for general contractors, property managers, schools, warehouse and distribution, churches and nonprofits, and government buildings in Nashville and Central PA.",
  alternates: { canonical: "/industries" },
  openGraph: { url: "/industries" },
};

export default function IndustriesPage() {
  const [gc, ...rest] = INDUSTRIES;
  return (
    <>
      <PageHero
        label="Industries"
        title="Built for the people who have to hand over the keys."
        intro="General contractors are our primary focus. We also keep buildings clean for the property managers, schools and organizations that move in after."
      />
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid overflow-hidden rounded-[16px] bg-white lg:grid-cols-2">
            <div className="relative aspect-[16/10] lg:aspect-auto">
              <Image
                src="/images/blog-walkthrough.webp"
                alt="Superintendent in a hard hat reviewing a tablet while walking a finished glass corridor"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 sm:p-10 lg:p-14">
              <p className="label text-deep">Primary focus</p>
              <h2 className="mt-2 text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">{gc.name}</h2>
              <p className="mt-4 text-lg text-muted">{gc.body}</p>
              <p className="mt-4 text-muted">
                Send us the schedule early and we will map rough, final and touch-up cleans to your dates, size the crew to the building and give you one
                point of contact through closeout.
              </p>
              <Link href="/contact" className="btn btn-primary mt-8">
                Request a Quote <ArrowIcon />
              </Link>
            </div>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((ind) => (
              <li key={ind.name} className="rounded-[14px] border border-line bg-white p-6">
                <h2 className="text-xl font-semibold">{ind.name}</h2>
                <p className="mt-2 text-muted">{ind.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
