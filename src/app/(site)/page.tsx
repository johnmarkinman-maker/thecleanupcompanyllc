import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ScrollFilm } from "@/components/ScrollFilm";
import { ChecklistOptIn, Container, FinalCta, JsonLd } from "@/components/Sections";
import { PostCard } from "@/components/PostCard";
import { ArrowIcon, CheckIcon, XIcon } from "@/components/Icons";
import { getPublishedPosts, getTestimonials } from "@/lib/data";
import { localBusinessSchema } from "@/lib/schema";
import { SERVICES } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Post-Construction Cleaning for GCs | Nashville & Central PA | The Cleanup Company" },
  description:
    "Turnover-ready post-construction and commercial cleaning for general contractors in Greater Nashville, Middle Tennessee and Central Pennsylvania. Phased cleans, crews sized to the job, one point of contact.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Turnover-ready. On your schedule. | The Cleanup Company" },
};

const AUTHORITY = [
  { t: "Commercial and construction only", d: "No residential. Job sites and commercial buildings are all we do." },
  { t: "Phased cleaning", d: "Rough, final and touch-up, scheduled against your dates instead of tacked on at the end." },
  { t: "Crews sized to the job", d: "We walk the site first, then staff it so the work fits the window you have." },
  { t: "One point of contact", d: "One person who knows your project, from the first clean to the handover." },
  { t: "Two markets", d: "Greater Nashville and Middle Tennessee, plus Central Pennsylvania." },
];

const WITHOUT = [
  "Dust shows up on ledges and vents the day of the walk",
  "Streaked glass and stickers end up on the punch list",
  "Final clean squeezed into the last 48 hours",
  "You chase a crew instead of closing out",
  "Turnover slips while the building gets cleaned again",
];
const WITH = [
  "Cleaning phases built into your schedule from the start",
  "Clear glass and dust-free surfaces before the owner arrives",
  "A crew sized to the job, on site when you need it",
  "One point of contact from first clean to handover",
  "A building that looks finished on the date you promised",
];

// Bento layout: first card is the hero tile.
const BENTO = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
];

export default async function Home() {
  const [posts, testimonials] = await Promise.all([getPublishedPosts(3), getTestimonials()]);

  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <ScrollFilm />

      {/* Guide: empathy + authority */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
            <div>
              <p className="label text-deep">Why GCs call us</p>
              <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.06] tracking-tight">
                We get it. Your schedule is tight.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-muted">
                The building is almost done, the owner walk is on the calendar, and the last thing you need is to manage the cleaning. We plan the clean
                around your closeout so it is one less thing on your list.
              </p>
              <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {AUTHORITY.map((a) => (
                  <li key={a.t} className="border-t border-line pt-4">
                    <h3 className="font-semibold">{a.t}</h3>
                    <p className="mt-1.5 text-muted">{a.d}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-tint lg:aspect-[4/3.4]">
              <Image
                src="/images/team.webp"
                alt="Five Cleanup Company technicians in dark green polos standing with a janitorial cart, floor buffer and mop in a polished lobby"
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Services bento */}
      <section className="pb-20 sm:pb-28" aria-labelledby="services-h">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-deep">Services</p>
              <h2 id="services-h" className="mt-3 max-w-xl text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.06] tracking-tight">
                Six services. One crew that knows your site.
              </h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 font-medium text-deep hover:underline">
              All service details <ArrowIcon />
            </Link>
          </div>
          <ul className="mt-10 grid auto-rows-[15rem] gap-4 md:grid-cols-3 md:auto-rows-[14rem] lg:auto-rows-[16rem]">
            {SERVICES.map((s, i) => (
              <li key={s.slug} className={`group relative isolate overflow-hidden rounded-[14px] bg-charcoal ${BENTO[i]}`}>
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                  className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden="true" />
                <div className="flex h-full flex-col justify-end p-5 text-white sm:p-6">
                  <h3 className={`font-semibold leading-tight ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                    <Link href={`/services#${s.slug}`} className="after:absolute after:inset-0">
                      {s.name}
                    </Link>
                  </h3>
                  <p className={`mt-1.5 text-white/85 ${i === 0 ? "max-w-md text-lg" : "text-[0.95rem]"}`}>{s.short}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Stakes vs success */}
      <section className="bg-white py-20 sm:py-28" aria-labelledby="stakes-h">
        <Container>
          <p className="label text-deep">What is at stake</p>
          <h2 id="stakes-h" className="mt-3 max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.06] tracking-tight">
            A finished building should look finished.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[16px] border border-line bg-paper p-6 sm:p-8">
              <h3 className="text-xl font-semibold">Without a cleaning plan</h3>
              <ul className="mt-5 grid gap-3.5">
                {WITHOUT.map((w) => (
                  <li key={w} className="flex gap-3 text-muted">
                    <XIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#8a4b3c]" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[16px] border border-green/30 bg-tint p-6 sm:p-8">
              <h3 className="text-xl font-semibold">With The Cleanup Company</h3>
              <ul className="mt-5 grid gap-3.5">
                {WITH.map((w) => (
                  <li key={w} className="flex gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-deep" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-charcoal py-20 text-white sm:py-28" aria-labelledby="t-h">
          <Container>
            <p className="label text-white/75">What customers say</p>
            <h2 id="t-h" className="sr-only">
              Testimonials
            </h2>
            <div className={`mt-8 grid gap-10 ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}>
              {testimonials.slice(0, 4).map((t) => (
                <figure key={t.id}>
                  <blockquote className="text-[clamp(1.35rem,2.6vw,2rem)] leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-5 text-white/75">
                    <span className="font-semibold text-white">{t.name}</span>
                    {[t.role, t.company].filter(Boolean).length > 0 && <>, {[t.role, t.company].filter(Boolean).join(", ")}</>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      <ChecklistOptIn />

      {posts.length > 0 && (
        <section className="pb-20 sm:pb-28" aria-labelledby="blog-h">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-deep">From the blog</p>
                <h2 id="blog-h" className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.06] tracking-tight">
                  Closeout notes for GCs
                </h2>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 font-medium text-deep hover:underline">
                All posts <ArrowIcon />
              </Link>
            </div>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <FinalCta />
    </>
  );
}
