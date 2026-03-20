-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Create the contact_submissions table
create table if not exists public.contact_submissions (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name       text,
  email      text not null,
  message    text,
  type       text not null default 'contact', -- 'contact' | 'newsletter' | 'project'
  extra      jsonb                             -- for project submissions: { schoolName, projectTitle, description }
);

-- 2. Enable Row Level Security
alter table public.contact_submissions enable row level security;

-- 3. Allow anyone (unauthenticated) to INSERT new rows
create policy "Allow anonymous inserts"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- 4. Only authenticated users (you, in the Supabase dashboard) can SELECT
create policy "Allow authenticated reads"
  on public.contact_submissions
  for select
  to authenticated
  using (true);
