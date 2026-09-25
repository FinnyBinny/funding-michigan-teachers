-- ─────────────────────────────────────────────────────────────────────────────
-- Funding Michigan Teachers — Content Refresh (September 2026)
-- Run this ENTIRE file once in the Supabase SQL Editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
--
-- THIS IS THE ONLY FILE YOU NEED TO RUN. It creates every table the site
-- uses (including project_votes for classroom-project voting and
-- contact_submissions for form backups), then fixes the content. The older
-- SUPABASE_SETUP.sql / SUPABASE_SEED.sql / FORMS_SETUP.sql files are kept
-- for reference but are no longer required.
--
-- SECURITY (September 2026): all content writes now require a signed-in
-- Supabase user. The site's anon key is public inside the JS bundle by
-- design, and the old policies let ANYONE with it insert/update/delete
-- events, projects, stories, and the rest. Now: everyone can read, only an
-- authenticated admin can write. Votes and form submissions stay open for
-- inserting (that's their job). After running this, create the admin login:
--   Supabase → Authentication → Users → Add user → your email + a strong
--   password → then sign in at fundingmichiganteachers.org/access.
--
-- Why this file exists: the site trusts the database over the code's built-in
-- content whenever a table exists, so stale rows beat fresh code. This file
-- is idempotent — safe to run more than once.
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
create policy "events_insert" on events for insert to authenticated with check (true);
create policy "events_update" on events for update to authenticated using (true) with check (true);
create policy "events_delete" on events for delete to authenticated using (true);

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
create policy "projects_insert" on projects for insert to authenticated with check (true);
create policy "projects_update" on projects for update to authenticated using (true) with check (true);
create policy "projects_delete" on projects for delete to authenticated using (true);

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
create policy "donors_insert" on donors for insert to authenticated with check (true);
create policy "donors_update" on donors for update to authenticated using (true) with check (true);
create policy "donors_delete" on donors for delete to authenticated using (true);

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
create policy "locations_insert" on locations for insert to authenticated with check (true);
create policy "locations_update" on locations for update to authenticated using (true) with check (true);
create policy "locations_delete" on locations for delete to authenticated using (true);

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
create policy "stories_insert" on stories for insert to authenticated with check (true);
create policy "stories_update" on stories for update to authenticated using (true) with check (true);
create policy "stories_delete" on stories for delete to authenticated using (true);

-- Sponsors, food partners, and Teacher of the Month. Sections below UPDATE
-- sponsors and food_partners, which errors out mid-script if the tables were
-- never created — so they are created here to keep this file self-sufficient.
create table if not exists sponsors (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  name        text not null,
  tier        text not null,
  website     text,
  logo        text,
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
create policy "sponsors_insert" on sponsors for insert to authenticated with check (true);
create policy "sponsors_update" on sponsors for update to authenticated using (true) with check (true);
create policy "sponsors_delete" on sponsors for delete to authenticated using (true);

create table if not exists food_partners (
  id            bigint generated always as identity primary key,
  created_at    timestamptz default now(),
  month         text not null,
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
create policy "food_partners_insert" on food_partners for insert to authenticated with check (true);
create policy "food_partners_update" on food_partners for update to authenticated using (true) with check (true);
create policy "food_partners_delete" on food_partners for delete to authenticated using (true);

create table if not exists teachers_of_month (
  id            bigint generated always as identity primary key,
  created_at    timestamptz default now(),
  month         text not null,
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
create policy "tom_insert" on teachers_of_month for insert to authenticated with check (true);
create policy "tom_update" on teachers_of_month for update to authenticated using (true) with check (true);
create policy "tom_delete" on teachers_of_month for delete to authenticated using (true);

-- Backup copy of form submissions. Deliberately NOT publicly readable:
-- anyone can submit a form, but only a signed-in Supabase user can read
-- them, because these rows hold people's names, emails, and messages.
-- (FormBold is the day-to-day inbox; this is the archive.)
create table if not exists public.contact_submissions (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name       text,
  email      text not null,
  message    text,
  type       text not null default 'contact',
  extra      jsonb
);
alter table public.contact_submissions enable row level security;
drop policy if exists "Allow anonymous inserts"  on public.contact_submissions;
drop policy if exists "Allow authenticated reads" on public.contact_submissions;
create policy "Allow anonymous inserts"
  on public.contact_submissions for insert to anon with check (true);
create policy "Allow authenticated reads"
  on public.contact_submissions for select to authenticated using (true);

-- ── 2. Remove stale content ─────────────────────────────────────────────────

-- The placeholder event that was supposed to be deleted months ago.
delete from events where title ilike 'Teacher Appreciation Event%';

-- Walmart is a corporate sponsor, not an individual/community supporter.
delete from donors where name ilike 'Walmart%';

-- ── 3. Events: the 2026–27 season ───────────────────────────────────────────
-- The site now hides events whose date has passed, so old rows can stay in
-- the table harmlessly (the Aug 19 Coffee Bar simply stops showing as
-- upcoming). Month-long programs are dated at the END of their window so
-- they stay visible throughout it; their descriptions carry the real timing.

-- One INSERT per event on purpose. A single multi-row VALUES list forces
-- Postgres to settle on one type per column before assigning it, which makes
-- the date literals text — and this table's `date` column is a real date type
-- in some databases and text in others (it predates these scripts). Written
-- this way the literals stay untyped and Postgres coerces each one to whatever
-- the column actually is, so this runs on either schema.

insert into events (title, date, description, location, type)
select 'First Staff Meeting Smoothies — East Lansing', '2026-09-08',
       '80 Jamba Juice smoothies (16 oz) and coupons for East Lansing High School''s first staff meeting of the year.',
       'East Lansing High School', 'appreciation'
where not exists (select 1 from events where title = 'First Staff Meeting Smoothies — East Lansing');

insert into events (title, date, description, location, type)
select 'Staff Meeting Catering — Haslett', '2026-09-15',
       'Catering Haslett High School''s September staff meeting.',
       'Haslett High School', 'appreciation'
where not exists (select 1 from events where title = 'Staff Meeting Catering — Haslett');

insert into events (title, date, description, location, type)
select 'Staff Meeting Catering — Okemos', '2026-09-16',
       'Catering the September staff meeting at Okemos High School.',
       'Okemos High School', 'appreciation'
where not exists (select 1 from events where title = 'Staff Meeting Catering — Okemos');

insert into events (title, date, description, location, type)
select 'Boo Baskets — October Teacher of the Month', '2026-10-30',
       'Halloween edition of Teacher of the Month: custom-themed boo baskets delivered to two or three Okemos teachers every week, all October long.',
       'Okemos High School', 'appreciation'
where not exists (select 1 from events where title = 'Boo Baskets — October Teacher of the Month');

insert into events (title, date, description, location, type)
select 'FMT Turns Three', '2026-11-20',
       'Our founding anniversary — three years since Funding Michigan Teachers started in November 2023.',
       'Okemos, MI', 'milestone'
where not exists (select 1 from events where title = 'FMT Turns Three');

insert into events (title, date, description, location, type)
select 'Door Decorating Competition', '2026-12-18',
       'The door decorating competition returns — classrooms go all out and winners take home prizes.',
       'Okemos High School', 'competition'
where not exists (select 1 from events where title = 'Door Decorating Competition');

insert into events (title, date, description, location, type)
select 'December School Supply Drive', '2026-12-31',
       'Collecting classroom supplies all through December, delivered to teachers when school resumes in January.',
       'Greater Lansing area', 'fundraiser'
where not exists (select 1 from events where title = 'December School Supply Drive');

insert into events (title, date, description, location, type)
select 'Post Office of Love', '2027-02-12',
       'Students write letters to the staff members who matter to them, and we deliver every one at the end of the day. Runs for about a week in February.',
       'Okemos High School', 'appreciation'
where not exists (select 1 from events where title = 'Post Office of Love');

insert into events (title, date, description, location, type)
select 'Teacher Appreciation Week', '2027-05-07',
       'Our biggest week of the year — meals, meal cards, and appreciation events for educators across our partner schools.',
       'All partner schools', 'appreciation'
where not exists (select 1 from events where title = 'Teacher Appreciation Week');

insert into events (title, date, description, location, type)
select 'End-of-Year Staff Appreciation Breakfast', '2027-06-04',
       'Closing out the school year the right way: breakfast for the staff who made it happen.',
       'Okemos High School', 'appreciation'
where not exists (select 1 from events where title = 'End-of-Year Staff Appreciation Breakfast');

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

-- One INSERT per school, for the same reason as the events above: untyped
-- literals let Postgres coerce each value to the column's real type. The
-- coordinates here are the real geocoded ones, so no correction pass is
-- needed afterwards.

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Okemos High School', 'Okemos Public Schools',
       'Our home base: food at every staff meeting during the 2025–26 school year, classroom supply grants, door decorating competitions with $500+ in prizes, Teacher of the Month, the Post Office of Love letter campaign, and year-round appreciation events — all student-run, funded entirely by the community.',
       '$15K+ org-wide', 42.6878, -84.4267,
       '{"students":"1,800","lowIncome":"18%","diversity":"34%"}'::jsonb,
       '["Staff Meeting Food (Every Meeting)","Classroom Supply Grants","Door Decorating Competition","Teacher of the Month","Post Office of Love","Coffee Bar"]'::jsonb
where not exists (select 1 from locations where name = 'Okemos High School');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Kinawa Middle School', 'Okemos Public Schools',
       'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
       '~120 educators', 42.7016, -84.4172,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Kinawa Middle School');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Chippewa Middle School', 'Okemos Public Schools',
       'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
       '~120 educators', 42.7014, -84.4267,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Chippewa Middle School');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Cornell Elementary', 'Okemos Public Schools',
       'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
       '~120 educators', 42.701, -84.3936,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Cornell Elementary');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Bennett Woods Elementary', 'Okemos Public Schools',
       'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
       '~120 educators', 42.6895, -84.4388,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Bennett Woods Elementary');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Hiawatha Elementary', 'Okemos Public Schools',
       'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
       '~120 educators', 42.6861, -84.4099,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Hiawatha Elementary');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Central Montessori', 'Okemos Public Schools',
       'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to all ~120 staff members.',
       '~120 educators', 42.7098, -84.4183,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Central Montessori');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'Haslett High School', 'Haslett Public Schools',
       'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~130 staff members.',
       '~130 educators', 42.7489, -84.401,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'Haslett High School');

insert into locations (name, district, impact, amount, lat, lng, demographics, projects)
select 'East Lansing High School', 'East Lansing Public Schools',
       'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~170 staff members.',
       '~170 educators', 42.7522, -84.4716,
       '{"students":"","lowIncome":"","diversity":""}'::jsonb,
       '["Teacher Appreciation Week Meal Cards"]'::jsonb
where not exists (select 1 from locations where name = 'East Lansing High School');

-- Okemos High: make sure Post Office of Love is credited on the map
update locations set
  impact = 'Our home base: food at every staff meeting during the 2025–26 school year, classroom supply grants, door decorating competitions with $500+ in prizes, Teacher of the Month, the Post Office of Love letter campaign, and year-round appreciation events — all student-run, funded entirely by the community.',
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

-- ═════════════════════════════════════════════════════════════════════════════
-- SEPTEMBER 2026 ACCURACY PASS
--
-- The site reads the database in preference to the code's built-in content, so
-- correcting the code alone changes nothing on the live site. These statements
-- fix the same things in the database. Safe to run repeatedly.
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Never credit a business that didn't give ────────────────────────────────
-- The March 2026 staff-meeting pizza was bought with the founder's own
-- certificates. Hungry Howie's donated nothing and must not appear as a
-- partner. Same for Asian Buffet and Dave's Hot Chicken if they ever appear.
delete from food_partners where business ilike 'Hungry Howie%';
delete from food_partners where business ilike 'Asian Buffet%';
delete from food_partners where business ilike 'Dave%Hot Chicken%';

-- ── The 2026–27 Kickstart Coffee Bar never happened ─────────────────────────
delete from events where title ilike '%Coffee Bar%Kickstart%';
update food_partners
   set detail = 'Donated coffee, decaf, and hot chocolate for the April and end-of-year FMT Coffee Bar events',
       month  = '2025–26'
 where business ilike 'Biggby%';

-- ── Walmart: a 2025 grant, not a current sponsor ────────────────────────────
update sponsors set active = false where name ilike 'Walmart%';

-- ── Current-year (2026–27) sponsors ─────────────────────────────────────────
-- In-kind counts toward tier at fair market value, the same as cash.
insert into sponsors (name, tier, description, amount, active)
select 'Ozzy''s Kabob', 'Principal''s Circle',
       '130 individually wrapped meals across two staff meetings — 60 for Haslett High School and 70 for Okemos High School the next day. Roughly $2,100 in donated food.',
       2100, true
where not exists (select 1 from sponsors where name ilike 'Ozzy%');

-- The insert above is guarded by `where not exists`, so it does nothing once
-- Ozzy's is already in the table — which is why the count stayed wrong after a
-- re-run. This corrects the row that is actually there: it was 130 meals, 60 at
-- Haslett and 70 at Okemos, not 60 in total.
update sponsors
   set description = '130 individually wrapped meals across two staff meetings — 60 for Haslett High School and 70 for Okemos High School the next day. Roughly $2,100 in donated food.'
 where name ilike 'Ozzy%';

insert into sponsors (name, tier, description, amount, active)
select 'Jamba Juice (Matt & Stephanie Wagemann)', 'Principal''s Circle',
       '60 smoothies for Haslett on a hot back-to-school day, and 80 for East Lansing''s first staff meeting of the year, plus coupons for Haslett staff.',
       1200, true
where not exists (select 1 from sponsors where name ilike 'Jamba%');

insert into sponsors (name, tier, description, amount, active)
select 'Dusty''s Wine Cellar', 'Pencil Partner',
       'A $25 gift certificate for a teacher appreciation basket.', 25, true
where not exists (select 1 from sponsors where name ilike 'Dusty%');

-- ── Stats: replace unverified figures with sourced ones ─────────────────────
-- "$15,000 raised" was never documented. Documented in-kind for 2025–26 is
-- about $6,500; with the founder's own contributions the defensible total is
-- $8,500+. "Raised" also reads as cash, so the site says "in support".
update locations
   set amount = '$8,500+ in support'
 where amount ilike '%15K%' or amount ilike '%15,000%';

-- Chick-fil-A's real fair market value, and an honest description of reach.
update food_partners
   set detail = 'Teacher Appreciation Week — 1,000+ meal cards (500 breakfast, 500 lunch entrées), roughly $5,000 in value'
 where business ilike 'Chick%' and month = 'May';

-- ── Partner schools vs. schools reached ─────────────────────────────────────
-- Three schools are ongoing partnerships. The other six received one-time
-- meal-card deliveries to the main office. Presenting all nine identically
-- overstates the relationship; the district field now carries the distinction
-- and the counts are real rather than a repeated ~120 placeholder.
update locations set district = 'Okemos Public Schools · Partner School',
       impact = 'Our home base: food at every staff meeting through the 2025–26 school year, classroom supply grants, door decorating competitions with $500+ in prizes, Teacher of the Month, the Post Office of Love letter campaign, and year-round appreciation events.',
       amount = '~75–80 teachers · ~120 staff'
 where name = 'Okemos High School';

update locations set district = 'Haslett Public Schools · Partner School',
       impact = 'Ongoing partner. Back-to-school smoothies from Jamba Juice on a hot September day, catered staff meetings from Ozzy''s Kabob, and Teacher Appreciation Week meal cards.',
       amount = '~50–60 teachers · ~100 staff'
 where name = 'Haslett High School';

update locations set district = 'East Lansing Public Schools · Partner School',
       impact = 'Ongoing partner. Jamba Juice smoothies and coupons for the first staff meeting of the year, plus Teacher Appreciation Week meal cards.',
       amount = '~90 teachers · 120–140 staff'
 where name = 'East Lansing High School';

-- The six one-touch schools: honest about what actually happened.
update locations
   set district = district || ' · Reached',
       impact = 'Teacher Appreciation Week — Chick-fil-A meal cards delivered to the main office for staff. A school we''d like to come back to.',
       amount = 'One-time delivery'
 where name in ('Kinawa Middle School','Chippewa Middle School','Cornell Elementary',
                'Bennett Woods Elementary','Hiawatha Elementary','Central Montessori')
   and district not like '%Reached%';

-- ── Consistency pass (September 2026) ───────────────────────────────────────
-- Teachers and staff are different counts of different people, and the site
-- had been using the words interchangeably. The database carried the same
-- confusion: a pin whose impact text said "~120 staff members" displayed
-- "~120 educators" as its headline figure.
--
-- Partner schools show the real split. The six one-touch schools show no
-- headcount at all: the repeated "~120" was a placeholder, and inventing a
-- number is worse than omitting one.

update locations set amount = '~75–80 teachers · ~120 staff'
 where name = 'Okemos High School';
update locations set amount = '~50–60 teachers · ~100 staff'
 where name = 'Haslett High School';
update locations set amount = '~90 teachers · 120–140 staff'
 where name = 'East Lansing High School';

update locations
   set amount = 'One-time delivery',
       impact = 'Teacher Appreciation Week — Chick-fil-A meal cards delivered to the main office for staff. A school we''d like to come back to.'
 where name in ('Kinawa Middle School','Chippewa Middle School','Cornell Elementary',
                'Bennett Woods Elementary','Hiawatha Elementary','Central Montessori');

-- Any lingering "educators" headline figure, wherever it came from.
update locations set amount = 'One-time delivery'
 where amount ilike '%educator%';

-- The $8,500 figure covers the 2025-26 school year alone, not everything
-- since founding — the earlier wording undersold a single year's work.
update locations set amount = '$8,500+ in support, 2025–26'
 where amount ilike '%8,500%' and amount not ilike '%2025%';

-- ── Teachers' lounge makeover at Okemos, Monday 28 September 2026 ──────────
-- Upcoming events are read from this table, so a code-only addition would
-- never appear on the live site.
insert into events (title, date, description, location, type)
select 'Teachers'' Lounge Makeover — Okemos',
       '2026-09-28',
       'We are cleaning and decorating the Okemos High School teachers'' lounge, together with ACTION, a student club at OHS. FMT bought the decorations; ACTION brought the hands.',
       'Okemos High School',
       'appreciation'
where not exists (select 1 from events where title ilike '%Lounge Makeover%');

-- ── Ozzy's Kabob, singular ────────────────────────────────────────────────
-- The business is "Ozzy's Kabob". Rows seeded with the plural are corrected
-- here; a re-run of the guarded insert above would not touch them.
update sponsors      set name        = replace(name,        'Ozzy''s Kabobs', 'Ozzy''s Kabob') where name        like '%Ozzy''s Kabobs%';
update sponsors      set description = replace(description, 'Ozzy''s Kabobs', 'Ozzy''s Kabob') where description like '%Ozzy''s Kabobs%';
update locations     set impact      = replace(impact,      'Ozzy''s Kabobs', 'Ozzy''s Kabob') where impact      like '%Ozzy''s Kabobs%';
update food_partners set business    = replace(business,    'Ozzy''s Kabobs', 'Ozzy''s Kabob') where business    like '%Ozzy''s Kabobs%';
update food_partners set detail      = replace(detail,      'Ozzy''s Kabobs', 'Ozzy''s Kabob') where detail      like '%Ozzy''s Kabobs%';

-- ── Jamba Juice: 80 East Lansing, 60 Haslett ──────────────────────────────
-- The sponsors insert above is guarded by `where not exists`, so it does
-- nothing once Jamba is in the table — the corrected wording would never
-- have reached the live row without this.
update sponsors
   set description = '60 smoothies for Haslett on a hot back-to-school day, and 80 for East Lansing''s first staff meeting of the year, plus coupons for Haslett staff.'
 where name ilike 'Jamba%';

-- ── Jamba Juice joins the businesses who showed up ────────────────────────
-- food_partners is read from this table too, so the code seeds alone are
-- invisible on the live site.
insert into food_partners (month, business, detail, display_order)
select 'September', 'Jamba Juice (Matt & Stephanie Wagemann)',
       '80 smoothies for East Lansing High School''s first staff meeting of the year', 4
where not exists (select 1 from food_partners where detail ilike '%East Lansing High School''s first staff meeting%');

insert into food_partners (month, business, detail, display_order)
select 'September', 'Jamba Juice (Matt & Stephanie Wagemann)',
       '60 back-to-school smoothies for the Haslett staff, plus coupons', 4
where not exists (select 1 from food_partners where detail ilike '%back-to-school smoothies for the Haslett staff%');
