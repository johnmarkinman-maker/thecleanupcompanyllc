"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useActionState, useMemo, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { login, savePost, sendNewsletter } from "./actions";


// Submitting through onSubmit (instead of <form action>) stops React 19 from
// resetting every field after the action runs, so drafts survive errors.
function keepValues(action: (f: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const data = new FormData(e.currentTarget, submitter);
    startTransition(() => action(data));
  };
}

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/posts", label: "Blog" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export function AdminTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto">
      {TABS.map((t) => {
        const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm ${active ? "bg-ink text-white" : "text-muted hover:bg-white hover:text-ink"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="grid gap-3">
      <label htmlFor="pw" className="text-sm font-medium">
        Password
      </label>
      <input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
      {state?.error && (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function StatusSelect({ id, value, action }: { id: number; value: string; action: (f: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`st-${id}`}>
        Status
      </label>
      <select
        id={`st-${id}`}
        name="status"
        defaultValue={value}
        className="field !min-h-9 !py-1 text-sm"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {["new", "contacted", "quoted", "won", "lost"].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </form>
  );
}

type PostInit = { id: string; title: string; slug: string; excerpt: string; body: string; cover: string; cover_alt: string; status: string };

export function PostEditor({ post, covers }: { post: PostInit; covers: string[] }) {
  const [state, action, pending] = useActionState(savePost, null);
  const [body, setBody] = useState(post.body);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const html = useMemo(() => renderMarkdown(body), [body]);
  return (
    <form onSubmit={keepValues(action)} className="grid gap-5">
      <input type="hidden" name="id" value={post.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <L label="Title">
          <input name="title" defaultValue={post.title} required className="field" />
        </L>
        <L label="Slug (leave blank to use the title)">
          <input name="slug" defaultValue={post.slug} className="field" />
        </L>
      </div>
      <L label="Excerpt (used for the meta description)">
        <textarea name="excerpt" defaultValue={post.excerpt} rows={2} className="field" />
      </L>
      <div className="grid gap-4 md:grid-cols-2">
        <L label="Cover image">
          <input name="cover" defaultValue={post.cover} list="covers" className="field" placeholder="/images/…" />
          <datalist id="covers">
            {covers.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </L>
        <L label="Cover alt text">
          <input name="cover_alt" defaultValue={post.cover_alt} className="field" />
        </L>
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Body</span>
          <div role="tablist" className="flex gap-1 rounded-lg bg-white p-1 text-sm">
            {(["write", "preview"] as const).map((t) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === t}
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 capitalize ${tab === t ? "bg-ink text-white" : "text-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={22}
          aria-label="Body"
          className={`field mt-2 font-mono text-sm ${tab === "write" ? "" : "hidden"}`}
        />
        {tab === "preview" && <div className="prose-tcc mt-2 rounded-[10px] border border-line bg-white p-6" dangerouslySetInnerHTML={{ __html: html }} />}
        <p className="mt-2 text-xs text-muted">
          Formatting: <code>## Heading</code>, <code>### Subheading</code>, <code>- list</code>, <code>1. list</code>, <code>**bold**</code>,{" "}
          <code>*italic*</code>, <code>[link](/contact)</code>. Blank line between paragraphs.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <L label="Status" inline>
          <select name="status" defaultValue={post.status} className="field !w-auto">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </L>
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save post"}
        </button>
        {state?.error && (
          <p role="alert" className="text-sm text-red-800">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

export function NewsletterForm() {
  const [state, action, pending] = useActionState(sendNewsletter, null);
  const [body, setBody] = useState("");
  return (
    <form onSubmit={keepValues(action)} className="grid gap-5">
      <L label="Subject">
        <input name="subject" required className="field" />
      </L>
      <L label="Body (same formatting as blog posts)">
        <textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="field font-mono text-sm" required />
      </L>
      {body && (
        <details className="rounded-[10px] border border-line bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium">Preview</summary>
          <div className="prose-tcc mt-3" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
        </details>
      )}
      <p className="text-sm text-muted">Every send includes the unsubscribe link and MAILING_ADDRESS automatically.</p>
      <div className="grid gap-4 rounded-[12px] border border-line bg-white p-4 md:grid-cols-2">
        <div className="grid gap-2">
          <L label="Send a test to">
            <input name="test_email" type="email" className="field" placeholder="you@company.com" />
          </L>
          <button name="mode" value="test" className="btn btn-ghost" disabled={pending}>
            Send test
          </button>
        </div>
        <div className="grid gap-2">
          <L label='Type SEND to confirm sending to all'>
            <input name="confirm" className="field" autoComplete="off" />
          </L>
          <button name="mode" value="all" className="btn btn-primary" disabled={pending}>
            Send to all active subscribers
          </button>
        </div>
      </div>
      {pending && <p className="text-sm text-muted">Sending…</p>}
      {state?.error && (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm font-medium text-deep">
          {state.ok}
        </p>
      )}
    </form>
  );
}

function L({ label, children, inline = false }: { label: string; children: React.ReactNode; inline?: boolean }) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium ${inline ? "grid-flow-col items-center" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
