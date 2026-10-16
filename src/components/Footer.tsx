import Link from "next/link";
import { Logo } from "./Logo";
import { AREAS, BUSINESS, SERVICES, phoneHref } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" aria-label="The Cleanup Company home">
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs text-muted">
            Commercial and post-construction cleaning for general contractors and property managers. Commercial and construction only.
          </p>
          <ul className="mt-5 space-y-2">
            {BUSINESS.phone && (
              <li>
                <a href={phoneHref} className="font-medium hover:text-deep">
                  {BUSINESS.phone}
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${BUSINESS.email}`} className="break-all text-deep underline-offset-4 hover:underline">
                {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>
        <FooterCol title="Services" links={SERVICES.map((s) => ({ href: `/services#${s.slug}`, label: s.name }))} />
        <FooterCol
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/industries", label: "Industries" },
            { href: "/blog", label: "Blog" },
            { href: "/contact", label: "Request a Quote" },
          ]}
        />
        <FooterCol title="Service Areas" links={AREAS.map((a) => ({ href: `/service-areas#${a.slug}`, label: a.name }))} />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {BUSINESS.legalName}. All rights reserved.
          </p>
          <p>Commercial and construction cleaning only. No residential.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="label text-muted">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-deep">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
