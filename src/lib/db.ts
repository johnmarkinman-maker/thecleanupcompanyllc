import "server-only";
import { SEED_POSTS } from "./seed-posts";

// One tiny query interface over two drivers:
//  - DATABASE_URL set (Supabase / Vercel Postgres / Neon): postgres.js
//  - not set (local dev): embedded PGlite stored in .data/pglite
type Row = Record<string, unknown>;
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = `
create table if not exists leads (
  id serial primary key,
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text not null,
  phone text,
  service text,
  market text,
  location text,
  sq_ft text,
  turnover_date text,
  scope text,
  status text not null default 'new'
);
create table if not exists subscribers (
  id serial primary key,
  created_at timestamptz not null default now(),
  email text not null unique,
  name text,
  source text default 'checklist',
  token text not null unique,
  status text not null default 'active',
  unsubscribed_at timestamptz
);
create table if not exists email_queue (
  id serial primary key,
  created_at timestamptz not null default now(),
  subscriber_id integer not null references subscribers(id) on delete cascade,
  template text not null,
  send_at timestamptz not null,
  status text not null default 'pending',
  sent_at timestamptz,
  error text
);
create index if not exists email_queue_due on email_queue (status, send_at);
create table if not exists broadcasts (
  id serial primary key,
  created_at timestamptz not null default now(),
  subject text not null,
  body text not null,
  status text not null default 'draft',
  sent_at timestamptz,
  recipients integer default 0
);
create table if not exists posts (
  id serial primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null,
  cover text,
  cover_alt text,
  status text not null default 'draft',
  published_at timestamptz
);
create table if not exists testimonials (
  id serial primary key,
  created_at timestamptz not null default now(),
  quote text not null,
  name text not null,
  role text,
  company text,
  published boolean not null default true,
  sort integer not null default 0
);
`;

declare global {
  var __tccDb: Promise<Runner> | undefined;
}

async function connect(): Promise<Runner> {
  let run: Runner;
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    const postgres = (await import("postgres")).default;
    const client = postgres((process.env.DATABASE_URL || process.env.POSTGRES_URL)!, {
      ssl: process.env.DATABASE_SSL === "false" ? false : "require",
      max: 3,
      prepare: false, // required for Supabase's transaction pooler
    });
    run = async (text, params = []) => (await client.unsafe(text, params as never[])) as unknown as Row[];
  } else {
    if (process.env.VERCEL) throw new Error("DATABASE_URL is not set");
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdirSync } = await import("fs");
    const dir = process.cwd() + "/.data/pglite";
    mkdirSync(dir, { recursive: true });
    const db = new PGlite(dir);
    run = async (text, params = []) => {
      if (params.length === 0 && text.includes(";")) {
        await db.exec(text);
        return [];
      }
      return (await db.query(text, params)).rows as Row[];
    };
  }
  await run(SCHEMA);
  const [{ n }] = (await run("select count(*)::int as n from posts")) as { n: number }[];
  if (n === 0) {
    for (const p of SEED_POSTS) {
      await run(
        `insert into posts (slug, title, excerpt, body, cover, cover_alt, status, published_at)
         values ($1,$2,$3,$4,$5,$6,'published',$7) on conflict (slug) do nothing`,
        [p.slug, p.title, p.excerpt, p.body, p.cover, p.cover_alt, p.published_at],
      );
    }
  }
  return run;
}

export const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

export async function sql<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  globalThis.__tccDb ??= connect().catch((e) => {
    globalThis.__tccDb = undefined;
    throw e;
  });
  const run = await globalThis.__tccDb;
  return (await run(text, params)) as T[];
}
