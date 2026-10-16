import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Container } from "@/components/Sections";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function unsubscribe(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  if (!token) return;
  await sql("update subscribers set status = 'unsubscribed', unsubscribed_at = now() where token = $1 and status = 'active'", [token]);
  await sql(
    "update email_queue set status = 'cancelled' where status = 'pending' and subscriber_id in (select id from subscribers where token = $1)",
    [token],
  );
  revalidatePath("/unsubscribe");
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const [sub] = token
    ? await sql<{ email: string; status: string }>("select email, status from subscribers where token = $1", [token]).catch(() => [])
    : [];

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-xl">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight">Email preferences</h1>
        {!sub ? (
          <p className="mt-4 text-lg text-muted">This link is not valid or has expired. Use the unsubscribe link in any of our emails.</p>
        ) : sub.status !== "active" ? (
          <p role="status" className="mt-4 text-lg text-muted">
            <strong className="text-ink">{sub.email}</strong> is unsubscribed. You will not get any more marketing emails from us.
          </p>
        ) : (
          <>
            <p className="mt-4 text-lg text-muted">
              Unsubscribe <strong className="text-ink">{sub.email}</strong> from the checklist emails and newsletter?
            </p>
            <form action={unsubscribe} className="mt-6">
              <input type="hidden" name="token" value={token} />
              <button className="btn btn-primary">Unsubscribe</button>
            </form>
          </>
        )}
      </Container>
    </section>
  );
}
