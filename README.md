# The Cleanup Company website

Next.js (App Router) + TypeScript + Tailwind. Postgres (Supabase) for leads, subscribers, nurture queue, broadcasts, posts and testimonials. Resend for email, Vercel Cron for the daily nurture run.

## Local

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and CRON_SECRET at minimum
npm run build && npm start   # or npm run dev
```

With no `DATABASE_URL`, an embedded PGlite database is created in `.data/pglite` and seeded with the three blog posts. With no `RESEND_API_KEY`, emails are logged to the console instead of sent.

## Production (Vercel)

1. Create a Supabase project. Copy the **Transaction pooler** connection string into `DATABASE_URL`. Tables are created automatically on first request (or run `db/schema.sql` in the SQL editor).
2. Set every variable in `.env.example` in Vercel → Project → Settings → Environment Variables.
3. Verify the sending domain in Resend and use an address on it for `FROM_EMAIL`.
4. `vercel.json` schedules `/api/cron/nurture` daily at 14:00 UTC; Vercel sends `CRON_SECRET` automatically.

## Where things live

- Scroll film: `src/components/ScrollFilm.tsx`, styles at the bottom of `src/app/globals.css`, media in `public/film/`
- Business facts, services, areas, nav: `src/lib/site.ts`
- Nurture emails (day 0, 2, 5, 9): `src/lib/nurture.ts`
- Seed blog posts: `src/lib/seed-posts.ts`
- Admin: `/admin` (password = `ADMIN_PASSWORD`)

## Re-encoding the film

```bash
SRC=source.mp4
ffmpeg -i $SRC -an -c:v libx264 -preset slow -crf 20 -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart public/film/desktop.mp4
ffmpeg -i $SRC -an -vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=-2:720" -c:v libx264 -preset slow -crf 23 -g 4 -keyint_min 4 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart public/film/mobile.mp4
ffmpeg -i public/film/desktop.mp4 -frames:v 1 -c:v libwebp -quality 78 public/film/poster-desktop.webp
ffmpeg -i public/film/mobile.mp4  -frames:v 1 -c:v libwebp -quality 78 public/film/poster-mobile.webp
# VP9 fallbacks (browsers without H.264) use the same flags with -c:v libvpx-vp9 -b:v 0 -crf 34/36
```
