"use client";

import { useState } from "react";

export function ChecklistForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/subscribe", {
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
      <p role="status" className="rounded-xl bg-white px-5 py-4 font-medium text-deep">
        Check your inbox. The Turnover-Ready Checklist is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="c-name" className="text-sm font-medium">
            First name
          </label>
          <input id="c-name" name="name" className="field" autoComplete="given-name" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="c-email" className="text-sm font-medium">
            Work email <span className="text-muted">(required)</span>
          </label>
          <input id="c-email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send me the checklist"}
        </button>
        <p className="text-sm text-muted">Plus three short emails on phasing and walkthroughs. Unsubscribe anytime.</p>
      </div>
    </form>
  );
}
