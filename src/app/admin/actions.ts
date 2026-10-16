"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, passwordMatches, requireAdmin, sessionValue } from "@/lib/auth";
import { sql } from "@/lib/db";
import { layout, markdownEmailBody, markdownToText, sendBatch, sendEmail, textFooter, unsubscribeUrl } from "@/lib/email";
import { EMAIL_RE } from "@/lib/validate";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function login(_: unknown, form: FormData) {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD is not set on the server." };
  if (!passwordMatches(str(form, "password"))) return { error: "Wrong password." };
  (await cookies()).set(ADMIN_COOKIE, sessionValue()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost"];
export async function setLeadStatus(form: FormData) {
  await requireAdmin();
  const status = str(form, "status");
  if (!LEAD_STATUSES.includes(status)) return;
  await sql("update leads set status = $2 where id = $1", [Number(str(form, "id")), status]);
  revalidatePath("/admin/leads");
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export async function savePost(_: unknown, form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title");
  const body = String(form.get("body") ?? "");
  if (!title || !body.trim()) return { error: "Title and body are required." };
  const slug = slugify(str(form, "slug") || title);
  const status = str(form, "status") === "published" ? "published" : "draft";
  const values = [slug, title, str(form, "excerpt") || null, body, str(form, "cover") || null, str(form, "cover_alt") || null, status];
  try {
    if (id && id !== "new") {
      await sql(
        `update posts set slug=$1, title=$2, excerpt=$3, body=$4, cover=$5, cover_alt=$6, status=$7, updated_at=now(),
           published_at = case when $7 = 'published' and published_at is null then now() else published_at end
         where id = $8`,
        [...values, Number(id)],
      );
    } else {
      await sql(
        `insert into posts (slug, title, excerpt, body, cover, cover_alt, status, published_at)
         values ($1,$2,$3,$4,$5,$6,$7, case when $7 = 'published' then now() else null end)`,
        values,
      );
    }
  } catch (e) {
    const msg = String(e);
    return { error: msg.includes("unique") || msg.includes("duplicate") ? "That slug is already used by another post." : "Could not save the post." };
  }
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  redirect("/admin/posts");
}

export async function deletePost(form: FormData) {
  await requireAdmin();
  const [row] = await sql<{ slug: string }>("delete from posts where id = $1 returning slug", [Number(str(form, "id"))]);
  revalidatePath("/blog");
  if (row) revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function saveTestimonial(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const quote = str(form, "quote");
  const name = str(form, "name");
  if (!quote || !name) return;
  const vals = [quote, name, str(form, "role") || null, str(form, "company") || null, form.get("published") === "on", Number(str(form, "sort") || 0)];
  if (id) await sql("update testimonials set quote=$1, name=$2, role=$3, company=$4, published=$5, sort=$6 where id=$7", [...vals, Number(id)]);
  else await sql("insert into testimonials (quote, name, role, company, published, sort) values ($1,$2,$3,$4,$5,$6)", vals);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(form: FormData) {
  await requireAdmin();
  await sql("delete from testimonials where id = $1", [Number(str(form, "id"))]);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

function broadcastEmail(subject: string, body: string, token: string, to: string) {
  const unsub = unsubscribeUrl(token);
  return {
    to,
    subject,
    html: layout({ heading: subject, bodyHtml: markdownEmailBody(body), unsubscribeUrl: unsub }),
    text: markdownToText(body) + textFooter(unsub),
    unsubscribeUrl: unsub,
  };
}

export async function sendNewsletter(_: unknown, form: FormData) {
  await requireAdmin();
  const subject = str(form, "subject");
  const body = String(form.get("body") ?? "");
  const mode = str(form, "mode");
  if (!subject || !body.trim()) return { error: "Subject and body are required." };

  if (mode === "test") {
    const to = str(form, "test_email");
    if (!EMAIL_RE.test(to)) return { error: "Enter a valid test email." };
    const res = await sendEmail(broadcastEmail(`[TEST] ${subject}`, body, "test-preview", to));
    return res.ok ? { ok: `Test sent to ${to}.` } : { error: `Send failed: ${res.error}` };
  }

  if (str(form, "confirm") !== "SEND") return { error: 'Type SEND in the confirmation box to email every active subscriber.' };
  const subs = await sql<{ email: string; token: string }>("select email, token from subscribers where status = 'active' order by id");
  if (subs.length === 0) return { error: "There are no active subscribers yet." };
  const { sent, errors } = await sendBatch(subs.map((s) => broadcastEmail(subject, body, s.token, s.email)));
  await sql("insert into broadcasts (subject, body, status, sent_at, recipients) values ($1, $2, $3, now(), $4)", [
    subject,
    body,
    errors.length ? "partial" : "sent",
    sent,
  ]);
  revalidatePath("/admin/newsletter");
  return errors.length ? { error: `Sent ${sent}. Some batches failed: ${errors[0]}` } : { ok: `Sent to ${sent} subscribers.` };
}
