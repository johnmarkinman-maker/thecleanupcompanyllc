import "server-only";
import { BUSINESS, SITE_URL } from "./site";
import { renderMarkdown } from "./markdown";

const FROM = () => process.env.FROM_EMAIL || `The Cleanup Company <hello@thecleanupcompanyllc.com>`;
const MAILING_ADDRESS = () => process.env.MAILING_ADDRESS || "";

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  unsubscribeUrl?: string;
};

function payload(e: OutgoingEmail) {
  const headers: Record<string, string> = {};
  if (e.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${e.unsubscribeUrl.replace("/unsubscribe?", "/api/unsubscribe?")}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  return {
    from: FROM(),
    to: [e.to],
    subject: e.subject,
    html: e.html,
    text: e.text,
    reply_to: e.replyTo || BUSINESS.email,
    headers,
  };
}

export async function sendEmail(e: OutgoingEmail): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dry-run] to=${e.to} subject="${e.subject}"`);
    return { ok: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload(e)),
  });
  if (!res.ok) return { ok: false, error: `${res.status} ${await res.text()}` };
  return { ok: true };
}

// Resend batch endpoint accepts up to 100 messages per call.
export async function sendBatch(emails: OutgoingEmail[]): Promise<{ sent: number; errors: string[] }> {
  const key = process.env.RESEND_API_KEY;
  let sent = 0;
  const errors: string[] = [];
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100);
    if (!key) {
      chunk.forEach((e) => console.log(`[email:dry-run] to=${e.to} subject="${e.subject}"`));
      sent += chunk.length;
      continue;
    }
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk.map(payload)),
    });
    if (res.ok) sent += chunk.length;
    else errors.push(`${res.status} ${await res.text()}`);
  }
  return { sent, errors };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Shared layout. Marketing emails pass unsubscribeUrl so every one carries the
// unsubscribe link and mailing address (CAN-SPAM).
export function layout(opts: { heading: string; bodyHtml: string; unsubscribeUrl?: string; preheader?: string }) {
  const footer = opts.unsubscribeUrl
    ? `<p style="margin:0 0 6px">You are receiving this because you requested the Turnover-Ready Checklist or subscribed at ${esc(
        SITE_URL.replace(/^https?:\/\//, ""),
      )}.</p>
       <p style="margin:0 0 6px"><a href="${opts.unsubscribeUrl}" style="color:#2D6717">Unsubscribe</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#F5F6F3;font-family:Helvetica,Arial,sans-serif;color:#131A15">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader || "")}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6F3;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="padding:22px 28px;border-bottom:1px solid #E6EFE1">
  <a href="${SITE_URL}" style="text-decoration:none;color:#131A15;font-weight:700;font-size:17px">
  <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#3F8C22;vertical-align:-5px;margin-right:8px"></span>The Cleanup Company</a>
</td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.6">
  <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px">${esc(opts.heading)}</h1>
  ${opts.bodyHtml}
</td></tr>
<tr><td style="padding:18px 28px;background:#F5F6F3;font-size:12px;line-height:1.5;color:#545D56">
  ${footer}
  <p style="margin:0">${esc(BUSINESS.legalName)}${MAILING_ADDRESS() ? " · " + esc(MAILING_ADDRESS()) : ""}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function markdownEmailBody(md: string) {
  // Inline styles for email clients on top of the shared markdown-lite renderer.
  return renderMarkdown(md)
    .replace(/<h2>/g, '<h2 style="font-size:18px;margin:22px 0 8px">')
    .replace(/<h3>/g, '<h3 style="font-size:16px;margin:18px 0 6px">')
    .replace(/<p>/g, '<p style="margin:0 0 14px">')
    .replace(/<ul>/g, '<ul style="margin:0 0 14px;padding-left:20px">')
    .replace(/<ol>/g, '<ol style="margin:0 0 14px;padding-left:20px">')
    .replace(/<a href="\//g, `<a style="color:#2D6717" href="${SITE_URL}/`)
    .replace(/<a href="(?!http)/g, '<a style="color:#2D6717" href="');
}

export function markdownToText(md: string) {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, `$1 (${SITE_URL}$2)`)
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1 ($2)")
    .replace(/^#{2,3}\s+/gm, "");
}

export function textFooter(unsubscribeUrl?: string) {
  return `\n\n--\n${BUSINESS.legalName}${MAILING_ADDRESS() ? "\n" + MAILING_ADDRESS() : ""}${
    unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : ""
  }`;
}

export const unsubscribeUrl = (token: string) => `${SITE_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
