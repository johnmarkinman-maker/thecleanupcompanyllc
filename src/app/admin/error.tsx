"use client";

import Link from "next/link";

// Shown when an admin page fails, most often because DATABASE_URL is missing or wrong.
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <h1 className="text-2xl font-semibold">The admin could not load its data</h1>
      <p className="mt-3 text-muted">
        This almost always means the database is not connected yet. In Vercel, set <code>DATABASE_URL</code> to your Supabase connection string
        (Transaction pooler), then redeploy.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          View site
        </Link>
      </div>
    </main>
  );
}
