import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { layout, sendEmail } from "@/lib/email";
import { BUSINESS, SITE_URL } from "@/lib/site";
import { clean, EMAIL_RE } from "@/lib/validate";

const FIELDS = ["name", "company", "email", "phone", "service", "market", "location", "sq_ft", "turnover_date", "scope"] as const;
const LABELS: Record<(typeof FIELDS)[number], string> = {
  name: "Name",
  company: "Company",
  email: "Email",
  phone: "Phone",
  service: "Service",
  market: "Market",
  location: "Project location",
  sq_ft: "Square footage",
  turnover_date: "Turnover date",
  scope: "Scope",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  // Honeypot: real people never see or fill this field.
  if (clean(body.website)) return NextResponse.json({ ok: true });

  const d = Object.fromEntries(FIELDS.map((f) => [f, clean(body[f], f === "scope" ? 4000 : 300)])) as Record<
    (typeof FIELDS)[number],
    string
  >;
  if (!d.name || !EMAIL_RE.test(d.email)) {
    return NextResponse.json({ error: "Please add your name and a valid email." }, { status: 400 });
  }

  try {
    await sql(
      `insert into leads (name, company, email, phone, service, market, location, sq_ft, turnover_date, scope)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      FIELDS.map((f) => d[f] || null),
    );
  } catch (e) {
    console.error("lead insert failed", e);
    return NextResponse.json({ error: "We could not save your request. Please email us directly." }, { status: 500 });
  }

  const rows = FIELDS.filter((f) => d[f])
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#545D56;vertical-align:top;white-space:nowrap">${LABELS[f]}</td><td style="padding:6px 0">${esc(
          d[f],
        ).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");

  const notify = process.env.NOTIFY_EMAIL || BUSINESS.email;
  const results = await Promise.allSettled([
    sendEmail({
      to: notify,
      replyTo: d.email,
      subject: `New quote request: ${d.company || d.name}${d.market ? ` (${d.market})` : ""}`,
      html: layout({
        heading: "New quote request",
        bodyHtml: `<table role="presentation" style="font-size:15px">${rows}</table><p style="margin-top:18px"><a href="${SITE_URL}/admin/leads" style="color:#2D6717">Open in admin</a></p>`,
      }),
      text: FIELDS.filter((f) => d[f]).map((f) => `${LABELS[f]}: ${d[f]}`).join("\n"),
    }),
    sendEmail({
      to: d.email,
      subject: "We got your quote request",
      html: layout({
        heading: `Thanks, ${esc(d.name.split(" ")[0])}. We have your request.`,
        bodyHtml: `<p style="margin:0 0 14px">We will review your project and reach out to set up a site walk. If you have a schedule or drawings handy, reply to this email and attach them.</p>
<p style="margin:0 0 14px">Here is what happens next:</p>
<ol style="margin:0 0 14px;padding-left:20px"><li>We review your schedule and scope.</li><li>We walk the site and size the crew to the job.</li><li>Your building is turnover-ready on the date.</li></ol>
<p style="margin:0">${BUSINESS.phone ? `Need us sooner? Call ${BUSINESS.phone}.` : `Need us sooner? Reply to this email.`}</p>`,
      }),
      text: `Thanks, ${d.name}. We have your request and will reach out to set up a site walk.${
        BUSINESS.phone ? ` Need us sooner? Call ${BUSINESS.phone}.` : ""
      }\n\n${BUSINESS.legalName}`,
    }),
  ]);
  results.forEach((r) => {
    if (r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)) console.error("quote email failed", r);
  });

  return NextResponse.json({ ok: true });
}
