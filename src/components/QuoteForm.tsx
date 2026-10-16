"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AREAS, BUSINESS, SERVICES, phoneHref } from "@/lib/site";

// Prefills service/market from links like /contact?service=… without making the page dynamic.
export function QuoteFormFromUrl() {
  const q = useSearchParams();
  return <QuoteForm defaultService={q.get("service") ?? ""} defaultMarket={q.get("market") ?? ""} />;
}

type State = "idle" | "sending" | "done" | "error";

export function QuoteForm({ defaultService = "", defaultMarket = "" }: { defaultService?: string; defaultMarket?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-[16px] border border-line bg-white p-8">
        <p className="label text-deep">Request received</p>
        <h2 className="mt-2 text-2xl font-semibold">Thanks. We have your project.</h2>
        <p className="mt-3 text-muted">
          A confirmation is on its way to your inbox. We will reach out to set up a site walk.
          {BUSINESS.phone && (
            <>
              {" "}
              Need us sooner? Call{" "}
              <a href={phoneHref} className="font-medium text-deep underline underline-offset-4">
                {BUSINESS.phone}
              </a>
              .
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-[16px] border border-line bg-white p-5 sm:p-8" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Company" name="company" autoComplete="organization" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
        <div className="grid gap-1.5">
          <label htmlFor="q-service" className="text-sm font-medium">
            Service
          </label>
          <select id="q-service" name="service" className="field" defaultValue={defaultService}>
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s.slug}>{s.name}</option>
            ))}
            <option>Not sure yet</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="q-market" className="text-sm font-medium">
            Market
          </label>
          <select id="q-market" name="market" className="field" defaultValue={defaultMarket}>
            <option value="">Select a market</option>
            {AREAS.map((a) => (
              <option key={a.slug}>{a.name}</option>
            ))}
          </select>
        </div>
        <Field label="Project location" name="location" placeholder="City or address" autoComplete="off" />
        <Field label="Approx. square footage" name="sq_ft" inputMode="numeric" placeholder="e.g. 25,000" />
        <Field label="Turnover date" name="turnover_date" type="date" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="q-scope" className="text-sm font-medium">
          Scope and notes
        </label>
        <textarea
          id="q-scope"
          name="scope"
          rows={5}
          className="field"
          placeholder="Phase needed (rough, final, touch-up), floor types, glass, access, anything we should know."
        />
      </div>
      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="q-website">Website</label>
        <input id="q-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error} You can also email{" "}
          <a className="underline" href={`mailto:${BUSINESS.email}`}>
            {BUSINESS.email}
          </a>
          .
        </p>
      )}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Request a Quote"}
        </button>
        <p className="text-sm text-muted">We reply with next steps and a time to walk the site.</p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `q-${name}`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {rest.required && <span className="text-muted"> (required)</span>}
      </label>
      <input id={id} name={name} className="field" {...rest} />
    </div>
  );
}
