-- ─────────────────────────────────────────────────────────────────────────────
-- Funding Michigan Teachers — Supabase Setup
-- Run this entire file in the Supabase SQL Editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Table: one row per (project, anonymous voter)
create table if not exists project_votes (
  project_id  integer  not null,
  voter_id    text     not null,
  created_at  timestamptz default now(),
  primary key (project_id, voter_id)
);

-- Row-Level Security: allow anyone to read and insert (anon key is public)
alter table project_votes enable row level security;

drop policy if exists "allow_read"   on project_votes;
drop policy if exists "allow_insert" on project_votes;
create policy "allow_read"   on project_votes for select using (true);
create policy "allow_insert" on project_votes for insert with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Sponsors (corporate partners — editable from admin /access)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists sponsors (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  name        text not null,
  tier        text not null,                  -- 'Pencil Partner', 'Campus Champion', 'Principal''s Circle', 'Founding Patron'
  website     text,
  logo        text,                            -- url or path
  description text,
  amount      integer default 0,
  active      boolean default true
);
alter table sponsors enable row level security;
drop policy if exists "sponsors_read"   on sponsors;
drop policy if exists "sponsors_insert" on sponsors;
drop policy if exists "sponsors_update" on sponsors;
drop policy if exists "sponsors_delete" on sponsors;
create policy "sponsors_read"   on sponsors for select using (true);
create policy "sponsors_insert" on sponsors for insert with check (true);
create policy "sponsors_update" on sponsors for update using (true) with check (true);
create policy "sponsors_delete" on sponsors for delete using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- In-kind food partners (monthly staff-meeting food donors)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists food_partners (
  id            bigint generated always as identity primary key,
  created_at    timestamptz default now(),
  month         text not null,                -- 'September', 'October', etc.
  business      text not null,
  detail        text,
  image         text,
  avif          text,
  display_order integer default 0
);
alter table food_partners enable row level security;
drop policy if exists "food_partners_read"   on food_partners;
drop policy if exists "food_partners_insert" on food_partners;
drop policy if exists "food_partners_update" on food_partners;
drop policy if exists "food_partners_delete" on food_partners;
create policy "food_partners_read"   on food_partners for select using (true);
create policy "food_partners_insert" on food_partners for insert with check (true);
create policy "food_partners_update" on food_partners for update using (true) with check (true);
create policy "food_partners_delete" on food_partners for delete using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Teacher of the Month (rotating spotlight on /for-schools)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists teachers_of_month (
  id            bigint generated always as identity primary key,
  created_at    timestamptz default now(),
  month         text not null,                -- 'March 2026'
  teacher_name  text not null,
  school        text,
  subject       text,
  why           text,
  image         text,
  display_order integer default 0
);
alter table teachers_of_month enable row level security;
drop policy if exists "tom_read"   on teachers_of_month;
drop policy if exists "tom_insert" on teachers_of_month;
drop policy if exists "tom_update" on teachers_of_month;
drop policy if exists "tom_delete" on teachers_of_month;
create policy "tom_read"   on teachers_of_month for select using (true);
create policy "tom_insert" on teachers_of_month for insert with check (true);
create policy "tom_update" on teachers_of_month for update using (true) with check (true);
create policy "tom_delete" on teachers_of_month for delete using (true);
