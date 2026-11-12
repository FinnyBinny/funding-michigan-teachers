-- ════════════════════════════════════════════════════════════════════════
-- Returnables collection boxes: NFC / QR "tap to request a pickup".
--
-- Run ONCE in Supabase → SQL Editor, AFTER SUPABASE_LOCKDOWN.sql (it uses
-- the is_admin() check that file creates, and stops here if it is missing).
-- Safe to run again: it only creates what is not there yet.
--
-- How it works
--   * Each box has a random, unguessable code. Its link is
--       https://www.fundingmichiganteachers.org/box/<code>
--     and that link is what goes on the box's NFC tag and QR code.
--   * The box page can do exactly three things, through the functions below,
--     and only for the code it was opened with: read the box, set it up the
--     first time (school, room, teacher), and request a pickup.
--   * Nobody can list boxes or read their history without signing in as an
--     admin at /access, where the Boxes tab shows them green or red.
--
-- Adding more boxes later: in the admin dashboard, Boxes tab, "Add a box".
-- ════════════════════════════════════════════════════════════════════════

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Run SUPABASE_LOCKDOWN.sql first: this file needs its is_admin() check.';
  end if;
end $$;

create table if not exists public.returnable_boxes (
  id           bigint generated always as identity primary key,
  box_number   int not null unique,
  -- 12 hex characters from a random UUID: not guessable, short enough to fit
  -- on any NFC sticker.
  code         text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  school       text,
  room         text,
  teacher      text,
  status       text not null default 'ok' check (status in ('ok', 'full')),
  requested_at timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.box_events (
  id         bigint generated always as identity primary key,
  box_id     bigint not null references public.returnable_boxes (id) on delete cascade,
  kind       text not null check (kind in ('set_up', 'requested', 'picked_up')),
  created_at timestamptz not null default now()
);
create index if not exists box_events_box_id_idx on public.box_events (box_id);

-- Only admins touch the tables directly. No policy for anyone else, so the
-- public can do nothing but call the three functions below.
alter table public.returnable_boxes enable row level security;
alter table public.box_events enable row level security;

drop policy if exists "Admins manage boxes" on public.returnable_boxes;
create policy "Admins manage boxes" on public.returnable_boxes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage box events" on public.box_events;
create policy "Admins manage box events" on public.box_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Table access for signed-in users, so the admin dashboard can reach the
-- tables at all. Supabase no longer grants this on new tables by itself;
-- without it every dashboard request fails with 403 "permission denied".
-- The policies above still limit it to admins. The public (anon) gets
-- nothing: the box page uses only the functions below.
grant select, insert, update, delete on public.returnable_boxes to authenticated;
grant select, insert, update, delete on public.box_events to authenticated;
grant usage on all sequences in schema public to authenticated;
revoke all on public.returnable_boxes from anon;
revoke all on public.box_events from anon;

-- ── What the box page may do, by code only ─────────────────────────────────

-- Read one box: where it is, whether a pickup is waiting, and how many
-- pickups it has had. Nothing about any other box.
create or replace function public.box_lookup(p_code text)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'box_number', b.box_number,
    'school', b.school,
    'room', b.room,
    'teacher', b.teacher,
    'status', b.status,
    'requested_at', b.requested_at,
    'pickups', (select count(*) from box_events e where e.box_id = b.id and e.kind = 'picked_up')
  )
  from returnable_boxes b
  where b.code = lower(trim(p_code));
$$;

-- First tap on a box nobody has set up: the teacher says where it lives.
-- Only works while the box is unassigned; after that, only an admin edits it.
create or replace function public.box_claim(p_code text, p_school text, p_room text, p_teacher text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare b returnable_boxes;
begin
  if coalesce(trim(p_school), '') = '' or coalesce(trim(p_room), '') = '' then
    raise exception 'school and room are required';
  end if;
  update returnable_boxes
     set school = left(trim(p_school), 80),
         room = left(trim(p_room), 40),
         teacher = nullif(left(trim(coalesce(p_teacher, '')), 60), '')
   where code = lower(trim(p_code)) and school is null
  returning * into b;
  if b.id is not null then
    insert into box_events (box_id, kind) values (b.id, 'set_up');
  end if;
  return box_lookup(p_code);
end $$;

-- The tap that matters: mark the box full. Tapping a box that is already
-- full changes nothing, so repeated taps cannot pile up requests.
create or replace function public.box_request_pickup(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare b returnable_boxes; already boolean := false;
begin
  select * into b from returnable_boxes where code = lower(trim(p_code)) for update;
  if b.id is null or b.school is null then
    return null;
  end if;
  if b.status = 'full' then
    already := true;
  else
    update returnable_boxes set status = 'full', requested_at = now() where id = b.id;
    insert into box_events (box_id, kind) values (b.id, 'requested');
  end if;
  return json_build_object('already', already, 'box', box_lookup(p_code));
end $$;

-- Admins only: the pickup is done, so the box goes back to green.
create or replace function public.box_mark_picked_up(p_box_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update returnable_boxes set status = 'ok', requested_at = null where id = p_box_id;
  insert into box_events (box_id, kind) values (p_box_id, 'picked_up');
end $$;

revoke all on function public.box_lookup(text) from public;
revoke all on function public.box_claim(text, text, text, text) from public;
revoke all on function public.box_request_pickup(text) from public;
revoke all on function public.box_mark_picked_up(bigint) from public;
grant execute on function public.box_lookup(text) to anon, authenticated;
grant execute on function public.box_claim(text, text, text, text) to anon, authenticated;
grant execute on function public.box_request_pickup(text) to anon, authenticated;
grant execute on function public.box_mark_picked_up(bigint) to authenticated;

-- ── The first 14 boxes, unassigned ─────────────────────────────────────────
-- Each gets its own code. Assign them in the admin dashboard, or let each
-- teacher set theirs up with the first tap.
insert into public.returnable_boxes (box_number)
select n from generate_series(1, 14) as n
on conflict (box_number) do nothing;

-- Check: 14 rows, each with its own code.
select box_number, code from public.returnable_boxes order by box_number;
