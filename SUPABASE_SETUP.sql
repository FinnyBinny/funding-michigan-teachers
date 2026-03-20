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

create policy "allow_read"   on project_votes for select using (true);
create policy "allow_insert" on project_votes for insert with check (true);
