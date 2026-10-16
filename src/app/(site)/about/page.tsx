import type { Metadata } from "next";
import Image from "next/image";
import { CheckList, Container, FinalCta, PageHero } from "@/components/Sections";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Cleanup Company is a commercial and post-construction cleaning company serving general contractors in Nashville, Middle Tennessee and Central Pennsylvania.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        title="We clean so the building can be handed over."
        intro="The Cleanup Company does commercial and post-construction cleaning, and nothing else. Our job is to make the last week of your project the easy part."
      />
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-tint">
              <Image
                src="/images/detail-crew.webp"
                alt="Two technicians in green uniforms vacuuming window sills and wiping baseboards in a newly finished corridor"
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="text-lg text-muted">
              <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-ink">How we work</h2>
              <p className="mt-4">
                Most cleaning companies treat construction cleanup as a one-day job at the end. We treat it as part of the schedule. That means planning
                phases with you, walking the site before we staff it, and showing up when the dates say we should.
              </p>
              <p className="mt-4">
                We focus on commercial and construction work in two markets: Greater Nashville and Middle Tennessee, and Central Pennsylvania.
              </p>
              <CheckList
                className="mt-6 text-ink"
                items={[
                  "Commercial and construction only, no residential",
                  "Rough, final and touch-up cleans mapped to your schedule",
                  "Crews sized to the job after a site walk",
                  "One point of contact from first clean to handover",
                ]}
              />
            </div>
          </div>
        </Container>
      </section>
      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-tint sm:aspect-[21/9]">
            <Image
              src="/images/team.webp"
              alt="The Cleanup Company crew in dark green polos with cleaning equipment in a polished commercial lobby"
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
