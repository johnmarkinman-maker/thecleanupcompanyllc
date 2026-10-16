import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-4 py-24 sm:px-6">
        <p className="label text-deep">404</p>
        <h1 className="mt-3 text-[clamp(2.2rem,6vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">This page did not make the walkthrough.</h1>
        <p className="mt-4 text-lg text-muted">The link may be old or mistyped. Here are a few places to start.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Home
          </Link>
          <Link href="/services" className="btn btn-ghost">
            Services
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Request a Quote
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
