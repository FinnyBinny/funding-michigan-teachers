-- ════════════════════════════════════════════════════════════════════════════
-- SUPABASE_LOCKDOWN.sql — only FMT's admins can read form submissions or edit
-- site content.
--
-- WHY: the policies in SUPABASE_REFRESH.sql let ANY signed-in Supabase user
-- read every form submission (names, emails, phone numbers, and returnables
-- pickup addresses with notes like "bags on the front porch") and edit every
-- content table. "Signed in" is not the same as "FMT admin": if public sign-up
-- is left on in Supabase Auth (the default), anyone can create an account
-- through the Auth API, without the site, and read all of it.
--
-- HOW TO RUN (Supabase dashboard → SQL Editor):
--   1. Put your admin email address(es) in step 1 below.
--   2. Run the whole file. If no admin was found it stops before changing any
--      policy, so it cannot lock you out.
--   3. Authentication → Sign In / Providers (or Settings): turn OFF
--      "Allow new users to sign up".
--   4. Authentication → Users: delete any account that is not an FMT admin.
--
-- Safe to run more than once.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 0. Who counts as an admin ───────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz default now()
);
-- No policies on purpose: nobody can read or change this list through the
-- public API, only here in the SQL editor.
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ── 1. EDIT THIS: the email(s) you sign in to /access with ─────────────────
insert into public.admin_users (user_id)
select id from auth.users
where lower(email) in (
  'hello@fundingmichiganteachers.org'   -- ← replace / add, comma-separated
)
on conflict do nothing;

-- Stop here if that matched nobody, rather than lock everyone out.
do $$
begin
  if not exists (select 1 from public.admin_users) then
    raise exception 'No admin found. Put the email you sign in with in step 1 and run again. Nothing was changed.';
  end if;
end $$;

-- ── 2. Form submissions: anyone may submit, only admins may read ───────────
drop policy if exists "Allow authenticated reads" on public.contact_submissions;
drop policy if exists "Admins read submissions"   on public.contact_submissions;
create policy "Admins read submissions"
  on public.contact_submissions for select to authenticated using (public.is_admin());

-- ── 3. Content tables: everyone may read, only admins may write ────────────
do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('events', 'events'), ('projects', 'projects'), ('donors', 'donors'),
      ('locations', 'locations'), ('stories', 'stories'), ('sponsors', 'sponsors'),
      ('food_partners', 'food_partners'), ('teachers_of_month', 'tom')
    ) as v(tbl, prefix)
  loop
    execute format('drop policy if exists %I on public.%I', t.prefix || '_insert', t.tbl);
    execute format('drop policy if exists %I on public.%I', t.prefix || '_update', t.tbl);
    execute format('drop policy if exists %I on public.%I', t.prefix || '_delete', t.tbl);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())', t.prefix || '_insert', t.tbl);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t.prefix || '_update', t.tbl);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', t.prefix || '_delete', t.tbl);
  end loop;
end $$;

-- Check: this should list your admin account(s) and nothing else.
select u.email from public.admin_users a join auth.users u on u.id = a.user_id;
