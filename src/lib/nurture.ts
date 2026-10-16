import "server-only";
import { sql } from "./db";
import { layout, markdownEmailBody, markdownToText, sendEmail, textFooter, unsubscribeUrl } from "./email";
import { BUSINESS } from "./site";

type Template = { key: string; day: number; subject: string; heading: string; preheader: string; md: string };

const callLine = () => (BUSINESS.phone ? ` or call ${BUSINESS.phone}` : "");

export const NURTURE: Template[] = [
  {
    key: "checklist",
    day: 0,
    subject: "Your Turnover-Ready Checklist",
    heading: "Here is your Turnover-Ready Checklist",
    preheader: "Hand this to any cleaning crew before the final clean.",
    md: `Thanks for asking for the checklist. Hand it to your cleaning crew before the final clean and walk it with the crew lead.

## Before the crew starts
- Confirm the phase: rough, final or touch-up
- Share the turnover date and inspection dates
- Note which trades are still working, and where
- Flag finishes that need special care

## Glass
- Remove labels, tape and film
- Scrape overspray with the right blade
- Clean frames, sills and tracks, inside and out
- Check every pane from an angle in direct light

## Dust, top to bottom
- Structure, ductwork and light fixtures
- Tops of door frames, window frames and casework
- Diffusers, grilles and returns
- Ledges, sills and base

## Fixtures, restrooms, floors, entries
- Hardware, switch plates and kick plates
- Restroom fixtures, partitions and mirrors
- Sweep, vacuum, then scrub hard floors
- Sweep entries and walks

## Final check
- Walk every room with all the lights on
- Photograph each area for closeout

The full version with notes is on our blog: [The Post-Construction Cleaning Checklist](/blog/post-construction-cleaning-checklist-for-gcs).`,
  },
  {
    key: "phases",
    day: 2,
    subject: "Rough, final, touch-up: when to schedule each",
    heading: "Three cleans, three jobs",
    preheader: "Why calling for the final clean a week out is too late.",
    md: `Calling for "the final clean" a week before turnover usually means the crew spends that week catching up.

Construction cleaning works best in three phases:

- **Rough clean** after drywall and rough-in, so finish trades start clean
- **Final clean** after finishes, before punch and the owner walk
- **Touch-up clean** right before turnover, after punch work

Put all three on your schedule as real activities. When the dates move, the cleaning moves with them.

Read the full breakdown: [Rough Clean, Final Clean, Touch-Up](/blog/rough-clean-final-clean-touch-up-phases).`,
  },
  {
    key: "walkthrough",
    day: 5,
    subject: "How to pass final walkthrough without the scramble",
    heading: "Keep the last week calm",
    preheader: "Seven habits that keep cleanup off the punch list.",
    md: `The scramble before a walkthrough is almost always a planning problem. A few habits fix most of it:

1. Put cleaning on the schedule when you build the schedule
2. Bring the cleaning crew in early to walk the site
3. Hand over a written scope
4. Keep finish protection in place until the final clean
5. Close cleaned areas to trades
6. Pre-walk with the cleaning lead a day or two before the owner
7. Keep one point of contact

More detail here: [How to Pass Final Walkthrough](/blog/pass-final-walkthrough-without-last-minute-cleanup).`,
  },
  {
    key: "quote",
    day: 9,
    subject: "Send us your schedule",
    heading: "Want us to plan your next closeout?",
    preheader: "Send the schedule. We walk the site. Turnover-ready on the date.",
    md: `If you have a project closing out in Greater Nashville, Middle Tennessee or Central Pennsylvania, here is how working with us goes:

1. **Send the schedule.** Turnover date, square footage and anything unusual about the site.
2. **We walk the site.** We size the crew to the job and map the cleaning phases to your schedule.
3. **Turnover-ready on the date.** One point of contact from first clean to handover.

[Request a quote](/contact) or reply to this email${callLine()}.`,
  },
];

export async function subscribe(email: string, name: string | null, source = "checklist") {
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const [existing] = await sql<{ id: number; status: string }>("select id, status from subscribers where email = $1", [email]);
  if (existing && existing.status === "active") return { id: existing.id, created: false };
  let id: number;
  if (existing) {
    await sql("update subscribers set status = 'active', unsubscribed_at = null, token = $2 where id = $1", [existing.id, token]);
    await sql("delete from email_queue where subscriber_id = $1 and status = 'pending'", [existing.id]);
    id = existing.id;
  } else {
    const [row] = await sql<{ id: number }>(
      "insert into subscribers (email, name, source, token) values ($1, $2, $3, $4) returning id",
      [email, name, source, token],
    );
    id = row.id;
  }
  for (const t of NURTURE) {
    await sql(
      "insert into email_queue (subscriber_id, template, send_at) values ($1, $2, now() + make_interval(days => $3::int))",
      [id, t.key, t.day],
    );
  }
  return { id, created: true };
}

type DueRow = { id: number; template: string; email: string; name: string | null; token: string };

export async function processQueue(limit = 200) {
  const due = await sql<DueRow>(
    `select q.id, q.template, s.email, s.name, s.token
       from email_queue q join subscribers s on s.id = q.subscriber_id
      where q.status = 'pending' and q.send_at <= now() and s.status = 'active'
      order by q.send_at limit $1`,
    [limit],
  );
  let sent = 0;
  let failed = 0;
  for (const row of due) {
    const t = NURTURE.find((n) => n.key === row.template);
    if (!t) {
      await sql("update email_queue set status = 'skipped', error = 'unknown template' where id = $1", [row.id]);
      continue;
    }
    const unsub = unsubscribeUrl(row.token);
    const res = await sendEmail({
      to: row.email,
      subject: t.subject,
      html: layout({ heading: t.heading, bodyHtml: markdownEmailBody(t.md), unsubscribeUrl: unsub, preheader: t.preheader }),
      text: markdownToText(t.md) + textFooter(unsub),
      unsubscribeUrl: unsub,
    });
    if (res.ok) {
      sent++;
      await sql("update email_queue set status = 'sent', sent_at = now() where id = $1", [row.id]);
    } else {
      failed++;
      await sql("update email_queue set status = 'failed', error = $2 where id = $1", [row.id, res.error ?? "unknown"]);
    }
  }
  // Anything queued for people who unsubscribed is cancelled.
  await sql(
    `update email_queue set status = 'cancelled'
      where status = 'pending' and subscriber_id in (select id from subscribers where status <> 'active')`,
  );
  return { due: due.length, sent, failed };
}
