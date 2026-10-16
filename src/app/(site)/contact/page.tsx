import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteForm, QuoteFormFromUrl } from "@/components/QuoteForm";
import { Container } from "@/components/Sections";
import { MailIcon, PhoneIcon } from "@/components/Icons";
import { AREAS, BUSINESS, phoneHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a quote for post-construction or commercial cleaning in Nashville, Middle Tennessee or Central Pennsylvania. Send your schedule and we will walk the site.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="label text-deep">Request a quote</p>
            <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">Send the schedule. We will take it from there.</h1>
            <p className="mt-5 text-lg text-muted">
              Tell us about the project and your turnover date. We will follow up to set up a site walk and build the cleaning plan around your dates.
            </p>
            <ol className="mt-8 grid gap-4">
              {["Send the schedule", "We walk the site", "Turnover-ready on the date"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="label flex h-8 w-8 items-center justify-center rounded-full bg-tint text-deep">{i + 1}</span>
                  <span className="font-medium">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 grid gap-3 border-t border-line pt-8">
              {BUSINESS.phone && (
                <a href={phoneHref} className="flex items-center gap-3 font-medium hover:text-deep">
                  <PhoneIcon className="h-5 w-5 text-deep" /> {BUSINESS.phone}
                </a>
              )}
              <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-3 break-all font-medium hover:text-deep">
                <MailIcon className="h-5 w-5 shrink-0 text-deep" /> {BUSINESS.email}
              </a>
              <p className="text-muted">Serving {AREAS.map((a) => a.name).join(" and ")}.</p>
            </div>
          </div>
          <Suspense fallback={<QuoteForm />}>
            <QuoteFormFromUrl />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
