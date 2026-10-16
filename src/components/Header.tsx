"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { BUSINESS, NAV, phoneHref } from "@/lib/site";
import { PhoneIcon } from "./Icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="The Cleanup Company home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.95rem] text-muted">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`transition-colors hover:text-ink ${pathname.startsWith(n.href) ? "text-ink font-medium" : ""}`}
                  aria-current={pathname.startsWith(n.href) ? "page" : undefined}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {BUSINESS.phone && (
            <a href={phoneHref} className="hidden items-center gap-2 px-2 font-medium text-ink hover:text-deep md:inline-flex">
              <PhoneIcon className="h-4 w-4" />
              {BUSINESS.phone}
            </a>
          )}
          <Link href="/contact" className="btn btn-primary hidden !min-h-[42px] !px-4 text-[0.95rem] sm:inline-flex">
            Request a Quote
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-paper px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="divide-y divide-line border-y border-line">
            {[...NAV, { href: "/contact", label: "Contact" }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="flex min-h-14 items-center text-xl font-medium">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 grid gap-3">
          <Link href="/contact" className="btn btn-primary w-full">
            Request a Quote
          </Link>
          {BUSINESS.phone && (
            <a href={phoneHref} className="btn btn-ghost w-full">
              <PhoneIcon className="h-4 w-4" /> Call {BUSINESS.phone}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
