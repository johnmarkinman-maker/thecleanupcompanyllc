-- Run once in the Supabase SQL editor (the app also creates these on first connect).
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
