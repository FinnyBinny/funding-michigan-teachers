-- ─────────────────────────────────────────────────────────────────────────────
-- Funding Michigan Teachers — Content Refresh (July 2026)
-- Run this ENTIRE file once in the Supabase SQL Editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
--
-- Why this exists: the site trusts the database over the code's built-in
-- content whenever a table exists. Several tables were created through the
-- /access admin panel before recent content updates, so the live site was
-- showing STALE data (old events, missing Miss Abbott project, old school
-- list). This file is idempotent — safe to run more than once.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Make sure every content table exists (no-ops if already created) ─────

-- Project votes. This lives in SUPABASE_SETUP.sql too, but it is repeated
-- here because votes silently fail to save when the table is missing — if
-- only this refresh file was ever run, voting looked broken with no error.
create table if not exists project_votes (
  project_id  integer  not null,
  voter_id    text     not null,
  created_at  timestamptz default now(),
  primary key (project_id, voter_id)
);
alter table project_votes enable row level security;
drop policy if exists "allow_read"   on project_votes;
drop policy if exists "allow_insert" on project_votes;
create policy "allow_read"   on project_votes for select using (true);
create policy "allow_insert" on project_votes for insert with check (true);

create table if not exists events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  title       text not null,
  date        text not null,
  description text,
  location    text,
  type        text,
  phone       text,
  cta_label   text,
  cta_url     text,
  deadline    text
);
alter table events enable row level security;
drop policy if exists "events_read"   on events;
drop policy if exists "events_insert" on events;
drop policy if exists "events_update" on events;
drop policy if exists "events_delete" on events;
create policy "events_read"   on events for select using (true);
create policy "events_insert" on events for insert with check (true);
create policy "events_update" on events for update using (true) with check (true);
create policy "events_delete" on events for delete using (true);

create table if not exists projects (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  teacher_name text not null,
  school_name  text,
  title        text not null,
  description  text,
  goal         integer default 0,
  raised       integer default 0,
  votes        integer default 0
);
alter table projects enable row level security;
drop policy if exists "projects_read"   on projects;
drop policy if exists "projects_insert" on projects;
drop policy if exists "projects_update" on projects;
drop policy if exists "projects_delete" on projects;
create policy "projects_read"   on projects for select using (true);
create policy "projects_insert" on projects for insert with check (true);
create policy "projects_update" on projects for update using (true) with check (true);
create policy "projects_delete" on projects for delete using (true);

create table if not exists donors (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  name        text not null,
  amount      integer default 0,
  tier        text,
  message     text,
  pos_x       double precision default 0,
  pos_y       double precision default 0
);
alter table donors enable row level security;
drop policy if exists "donors_read"   on donors;
drop policy if exists "donors_insert" on donors;
drop policy if exists "donors_update" on donors;
drop policy if exists "donors_delete" on donors;
create policy "donors_read"   on donors for select using (true);
create policy "donors_insert" on donors for insert with check (true);
create policy "donors_update" on donors for update using (true) with check (true);
create policy "donors_delete" on donors for delete using (true);

create table if not exists locations (
  id           bigint generated always as identity primary key,
  created_at   timestamptz default now(),
  name         text not null,
  district     text,
  impact       text,
  amount       text,
  lat          double precision,
  lng          double precision,
  demographics jsonb default '{"students":"","lowIncome":"","diversity":""}',
  projects     jsonb default '[]'
);
alter table locations enable row level security;
drop policy if exists "locations_read"   on locations;
drop policy if exists "locations_insert" on locations;
drop policy if exists "locations_update" on locations;
drop policy if exists "locations_delete" on locations;
create policy "locations_read"   on locations for select using (true);
create policy "locations_insert" on locations for insert with check (true);
create policy "locations_update" on locations for update using (true) with check (true);
create policy "locations_delete" on locations for delete using (true);

create table if not exists stories (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  name        text not null,
  bio         text,
  impact      text,
  school      text,
  location    text,
  image       text
);
alter table stories enable row level security;
drop policy if exists "stories_read"   on stories;
drop policy if exists "stories_insert" on stories;
drop policy if exists "stories_update" on stories;
drop policy if exists "stories_delete" on stories;
create policy "stories_read"   on stories for select using (true);
create policy "stories_insert" on stories for insert with check (true);
create policy "stories_update" on stories for update using (true) with check (true);
create policy "stories_delete" on stories for delete using (true);

-- ── 2. Remove stale content ─────────────────────────────────────────────────

-- The placeholder event that was supposed to be deleted months ago.
delete from events where title ilike 'Teacher Appreciation Event%';

-- Walmart is a corporate sponsor, not an individual/community supporter.
delete from donors where name ilike 'Walmart%';

-- ── 3. Current upcoming event ────────────────────────────────────────────────

insert into events (title, date, description, location, type)
select 'FMT Coffee Bar at OHS Kickstart', '2026-08-19',
       'We''re bringing the FMT Coffee Bar to Okemos High School''s Kickstart — fresh coffee, decaf, and hot chocolate for staff as they gear up for the new school year, with our friends at Biggby Coffee. 9am–2pm, or while supplies last.',
       'Okemos High School', 'appreciation'
where not exists (select 1 from events where title = 'FMT Coffee Bar at OHS Kickstart');

-- Correct the Kickstart description if an older version is in the DB
-- (Biggby provides the Coffee Bar; Tailgaters is not part of Kickstart)
update events set
  description = 'We''re bringing the FMT Coffee Bar to Okemos High School''s Kickstart — fresh coffee, decaf, and hot chocolate for staff as they gear up for the new school year, with our friends at Biggby Coffee. 9am–2pm, or while supplies last.'
where title = 'FMT Coffee Bar at OHS Kickstart';

-- ── 4. Classroom projects (adds Miss Abbott + keeps the submit card) ────────

insert into projects (teacher_name, school_name, title, description, goal, raised, votes)
select 'Danielle Tandoc', 'Okemos High School', 'New Dissection Lab Tools',
       'Our dissection tools are over 10 years old — scalpels dull, equipment worn. Help fund a complete set of modern dissection tools so every biology and anatomy student can learn safely and effectively. These students deserve equipment that matches their ambition.',
       1000, 0, 0
where not exists (select 1 from projects where teacher_name = 'Danielle Tandoc');

insert into projects (teacher_name, school_name, title, description, goal, raised, votes)
select 'Christina Abbott', 'Okemos High School', 'Greenhouse & Life Science Lab Restock',
       'Miss Abbott''s greenhouse and life science labs need real equipment: a 600 lb. poly utility dump cart to replace broken seed carts, two 6-tier commercial wire shelving units for greenhouse storage, and three bags of Pro-Mix HP Biofungicide with Mycorrhizae to keep student-grown plants healthy. Every item goes straight into her hands-on, research-driven classroom.',
       500, 0, 0
where not exists (select 1 from projects where teacher_name = 'Christina Abbott');

insert into projects (teacher_name, school_name, title, description, goal, raised, votes)
select 'Submit a Project', 'Your Classroom', 'Is Your Classroom Next?',
       'Michigan teachers: if you have a specific need — classroom decorations, supplies, equipment, or materials — we want to hear from you. Tell us what your classroom needs to better support your students and we''ll work to make it happen.',
       500, 0, 0
where not exists (select 1 from projects where teacher_name = 'Submit a Project');

-- ── 5. Impact map — all 9 supported schools ─────────────────────────────────

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select * from (values
  ('Okemos High School', 'Okemos Public Schools',
   'Our home base: food at every staff meeting during the 2025–26 school year, classroom supply grants, door decorating competitions with $500+ in prizes, Teacher of the Month, the Post Office of Love letter campaign, and year-round appreciation events — all student-run, 100% community-funded.',
   '$15K+ org-wide', 42.7244, -84.4333,
   '{"students":"1,800","lowIncome":"18%","diversity":"34%"}'::jsonb,
   '["Staff Meeting Food (Every Meeting)","Classroom Supply Grants","Door Decorating Competition","Teacher of the Month","Post Office of Love","Coffee Bar"]'::jsonb),
  ('Kinawa Middle School', 'Okemos Public Schools',
   'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
   '~120 educators', 42.7180, -84.4180,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('Chippewa Middle School', 'Okemos Public Schools',
   'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
   '~120 educators', 42.7080, -84.4430,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('Cornell Elementary', 'Okemos Public Schools',
   'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
   '~120 educators', 42.7320, -84.4260,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('Bennett Woods Elementary', 'Okemos Public Schools',
   'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
   '~120 educators', 42.6990, -84.4640,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('Hiawatha Elementary', 'Okemos Public Schools',
   'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
   '~120 educators', 42.7150, -84.4520,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('Central Montessori', 'Okemos Public Schools',
   'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
   '~120 educators', 42.7230, -84.4450,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('Haslett High School', 'Haslett Public Schools',
   'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~130 staff members.',
   '~130 educators', 42.7530, -84.4010,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb),
  ('East Lansing High School', 'East Lansing Public Schools',
   'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~170 staff members.',
   '~170 educators', 42.7480, -84.4840,
   '{"students":"","lowIncome":"","diversity":""}'::jsonb, '["Teacher Appreciation Week Meal Cards"]'::jsonb)
) as v(name, district, impact, amount, lat, lng, demographics, projects)
where not exists (select 1 from locations where locations.name = v.name);

-- Okemos High: make sure Post Office of Love is credited on the map
update locations set
  impact = 'Our home base: food at every staff meeting during the 2025–26 school year, classroom supply grants, door decorating competitions with $500+ in prizes, Teacher of the Month, the Post Office of Love letter campaign, and year-round appreciation events — all student-run, 100% community-funded.',
  projects = '["Staff Meeting Food (Every Meeting)","Classroom Supply Grants","Door Decorating Competition","Teacher of the Month","Post Office of Love","Coffee Bar"]'::jsonb
where name = 'Okemos High School';

-- Correct staff counts if the old numbers are in the DB
update locations set
  impact = 'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~130 staff members.',
  amount = '~130 educators'
where name = 'Haslett High School';

update locations set
  impact = 'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~170 staff members.',
  amount = '~170 educators'
where name = 'East Lansing High School';

-- Real geographic coordinates so the impact map plots each school where it
-- actually sits (the earlier values were scattered/approximate).
update locations set lat = 42.6878, lng = -84.4267 where name = 'Okemos High School';
update locations set lat = 42.7016, lng = -84.4172 where name = 'Kinawa Middle School';
update locations set lat = 42.7014, lng = -84.4267 where name = 'Chippewa Middle School';
update locations set lat = 42.7010, lng = -84.3936 where name = 'Cornell Elementary';
update locations set lat = 42.6895, lng = -84.4388 where name = 'Bennett Woods Elementary';
update locations set lat = 42.6861, lng = -84.4099 where name = 'Hiawatha Elementary';
update locations set lat = 42.7098, lng = -84.4183 where name = 'Central Montessori';
update locations set lat = 42.7489, lng = -84.4010 where name = 'Haslett High School';
update locations set lat = 42.7522, lng = -84.4716 where name = 'East Lansing High School';

-- ── 6. Corporate sponsor: Walmart (with store address) ──────────────────────

update sponsors
set name = 'Walmart (5110 Times Square Pl. Okemos, MI)'
where name = 'Walmart Okemos';

insert into sponsors (name, tier, description, amount, active)
select 'Walmart (5110 Times Square Pl. Okemos, MI)', 'Principal''s Circle',
       'Proud to support the Okemos community.', 250, true
where not exists (select 1 from sponsors where name ilike 'Walmart%');

-- ── 7. Food partners: full store addresses + corrected TAW values ───────────
-- (matches update existing rows seeded earlier; inserts cover fresh databases)

update food_partners set business = 'Chick-Fil-A (2075 W Grand River Ave. Okemos, MI)'
where business in ('Chick-Fil-A Okemos', 'Chick-Fil-A Okemos (W Grand River)');

update food_partners set
  detail = 'Teacher Appreciation Week — 1,000 "Be our guest" meal cards ($3,000+ value) for educators across 9 schools'
where month = 'May' and business = 'Chick-Fil-A (2075 W Grand River Ave. Okemos, MI)';

update food_partners set business = 'Tailgaters / Dunkin'' (3450 Okemos Rd. Okemos, MI)'
where business like 'Tailgaters / Dunkin%';

update food_partners set business = 'Dunkin'' (3450 Okemos Rd. Okemos, MI)'
where business like 'Dunkin''%';

-- Tailgaters is NOT part of the Kickstart Coffee Bar — remove the bogus
-- credit if it was seeded (their October donut runs with Dunkin' remain).
delete from food_partners
where business like 'Tailgaters%' and detail like '%Kickstart%';

-- Biggby: attach the real Coffee Bar photo
update food_partners set image = '/images/coffee-bar-biggby-opt.jpg'
where business like 'Biggby Coffee%' and (image is null or image = '');

update food_partners set business = 'Nothing Bundt Cakes (2090 W Grand River Ave. Okemos, MI)'
where business like 'Nothing Bundt Cakes%';

update food_partners set business = 'Hungry Howie''s (2160 W Grand River Ave. Okemos, MI)'
where business like 'Hungry Howie''s%';

update food_partners set business = 'Biggby Coffee (3520 Okemos Rd. Okemos, MI)'
where business like 'Biggby Coffee%';

update food_partners set
  month = 'May',
  business = 'Playmakers (2299 W Grand River Ave. Okemos, MI)',
  detail = 'Teacher Appreciation Week — donated two $25 Playmakers gift cards for staff appreciation'
where business like 'Playmakers%';

update food_partners set
  month = 'May',
  business = 'Cottage Inn Pizza (1743 W Grand River Ave. Okemos, MI)',
  detail = 'Teacher Appreciation Week — donated five $20 gift cards for staff appreciation'
where business like 'Cottage Inn%';

update food_partners set
  month = 'May',
  business = 'Culver''s (3440 Okemos Rd. Okemos, MI)',
  detail = 'Teacher Appreciation Week — donated 75 free scoop tokens for staff'
where business like 'Culver%';
