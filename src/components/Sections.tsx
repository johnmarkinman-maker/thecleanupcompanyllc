import Image from "next/image";
import Link from "next/link";
import { BUSINESS, phoneHref } from "@/lib/site";
import { ChecklistForm } from "./ChecklistForm";
import { ArrowIcon, CheckIcon, PhoneIcon } from "./Icons";

export const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

export function PageHero({ label, title, intro }: { label: string; title: string; intro: string }) {
  return (
    <section className="border-b border-line bg-paper">
      <Container className="py-16 sm:py-20 lg:py-24">
        <p className="label text-deep">{label}</p>
        <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{intro}</p>
      </Container>
    </section>
  );
}

export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`grid gap-2.5 ${className}`}>
      {items.map((i) => (
        <li key={i} className="flex gap-3">
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-green" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export function ChecklistOptIn() {
  return (
    <section id="checklist" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 overflow-hidden rounded-[16px] bg-tint p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-14">
          <div>
            <p className="label text-deep">Free download</p>
            <h2 className="mt-3 text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">Get the Turnover-Ready Checklist</h2>
            <p className="mt-4 max-w-md text-lg text-[#3c463e]">
              The room-by-room list we hand every crew before a final clean. Give it to yours and keep dust off the punch list.
            </p>
          </div>
          <ChecklistForm />
        </div>
      </Container>
    </section>
  );
}

export function FinalCta({ title = "Hand over the keys to a building that looks finished." }: { title?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal text-white">
      <Image
        src="/images/handshake.webp"
        alt="General contractor in a safety vest shaking hands with the building owner in a finished, spotless lobby"
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-60"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/95 via-charcoal/70 to-charcoal/35" aria-hidden="true" />
      <Container className="py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight">{title}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
          Send the schedule. We walk the site. Your building is turnover-ready on the date.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn btn-primary">
            Request a Quote <ArrowIcon />
          </Link>
          {BUSINESS.phone && (
            <a href={phoneHref} className="btn btn-ghost-dark">
              <PhoneIcon className="h-4 w-4" /> Call {BUSINESS.phone}
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
