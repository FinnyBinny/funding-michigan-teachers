-- ─────────────────────────────────────────────────────────────────────────────
-- Funding Michigan Teachers — Content Seed
--
-- WHY THIS EXISTS: once the Supabase tables exist, the live site trusts the
-- database over the code's built-in defaults. If a table is EMPTY (like
-- food_partners after running SUPABASE_SETUP.sql), the matching section on
-- the site renders empty — that's why "Businesses Already Showing Up" lost
-- its photos. Running this file populates the tables with the real content,
-- photos included.
--
-- Safe to re-run: every insert is guarded so it won't duplicate rows.
-- Run in: supabase.com → your project → SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── In-kind food partners (photos live in /public/images on the site) ──────
insert into food_partners (month, business, detail, image, avif, display_order)
select * from (values
  ('September', 'Chick-Fil-A Okemos', 'Cookies + free meal coupons for every staff member', '/images/IMG_3714(CFA)-opt.jpg', '/images/IMG_3714(CFA).avif', 1),
  ('October', 'Tailgaters / Dunkin'', Okemos', 'Fresh donuts for the whole staff', '/images/IMG_4369(DNK)-opt.jpg', '/images/IMG_4369(DNK).avif', 2),
  ('January', 'Nothing Bundt Cakes, Okemos', 'Mini Bundt Cakes — the perfect January pick-me-up', '/images/IMG_5678(NBC)-opt.jpg', '/images/IMG_5678(NBC).avif', 3),
  ('March', 'Hungry Howie''s, Okemos', 'Pizza for the whole staff, donated by FMT founder Finn Regan', '/images/IMG_6308(FR)-opt.jpg', '/images/IMG_6308(FR).avif', 4),
  ('May', 'Chick-Fil-A Okemos (W Grand River)', 'Teacher Appreciation Week — "Be our guest" meal cards for 1,000+ educators across 8 schools', '/images/may-chick-fil-a-cards.jpg', null, 5),
  ('May', 'Dunkin'' Okemos', 'Teacher Appreciation Week — coffee + donuts at the OHS staff meeting where we announced Teacher of the Month winners', '/images/may-staff-meeting.jpg', null, 6),
  ('2026–27', 'Tailgaters Okemos', 'Powering the FMT Coffee Bar — starting at OHS Kickstart', null, null, 7),
  ('2026–27', 'Playmakers of Okemos', 'In-kind community partner supporting FMT programs', null, null, 8),
  ('2026–27', 'Cottage Inn Pizza, Okemos (Grand River)', 'In-kind community partner supporting FMT programs', null, null, 9),
  ('2026–27', 'Biggby Coffee, Okemos (Jolly & Okemos Rd)', 'In-kind community partner supporting FMT programs', null, null, 10),
  ('2026–27', 'Culver''s of Okemos South', 'In-kind community partner supporting FMT programs', null, null, 11)
) as seed(month, business, detail, image, avif, display_order)
where not exists (
  select 1 from food_partners f
  where f.business = seed.business and f.month = seed.month
);

-- Repair pass: if rows were added by hand without photos, attach them.
update food_partners set image = '/images/IMG_3714(CFA)-opt.jpg', avif = '/images/IMG_3714(CFA).avif' where business = 'Chick-Fil-A Okemos' and month = 'September' and (image is null or image = '');
update food_partners set image = '/images/IMG_4369(DNK)-opt.jpg', avif = '/images/IMG_4369(DNK).avif' where month = 'October' and (image is null or image = '');
update food_partners set image = '/images/IMG_5678(NBC)-opt.jpg', avif = '/images/IMG_5678(NBC).avif' where month = 'January' and (image is null or image = '');
update food_partners set image = '/images/IMG_6308(FR)-opt.jpg', avif = '/images/IMG_6308(FR).avif' where month = 'March' and (image is null or image = '');

-- ── Teachers of the Month (May 2026 winners) ────────────────────────────────
insert into teachers_of_month (month, teacher_name, school, subject, why, image, display_order)
select * from (values
  ('May 2026', 'Mrs. Turner', 'Okemos High School', 'Educator',
   'Students describe Mrs. Turner as a consistently positive and caring presence in the classroom. She goes out of her way to ensure every student understands the material — explaining things clearly and patiently — while also checking in on students personally to make sure they feel seen, included, and welcome. Her calm classroom environment and understanding nature make her someone students genuinely appreciate having in their corner.',
   null, 1),
  ('May 2026', 'Miss Abbott', 'Okemos High School', 'Science',
   'Students love Miss Abbott for making learning fun, engaging, and meaningful. She brings personal experiences into her lessons, runs exciting labs, and creates a welcoming classroom environment through thoughtful touches like rotating seating pods. What stands out most is her intentionality — she backs everything she does with evidence, showing students she truly cares about their growth inside and outside of academics.',
   null, 2),
  ('May 2026', 'Miss Richter', 'Okemos High School', 'Chemistry',
   'Students say Miss Richter has a gift for making chemistry approachable and enjoyable, using real-life examples and patient, clear explanations. She creates a safe, welcoming classroom where students feel free to express themselves, and her carefully crafted lessons leave a lasting impression — with more than one student saying she''s changed the way they think about the subject entirely.',
   null, 3)
) as seed(month, teacher_name, school, subject, why, image, display_order)
where not exists (
  select 1 from teachers_of_month t
  where t.teacher_name = seed.teacher_name and t.month = seed.month
);

-- ── Corporate sponsors ──────────────────────────────────────────────────────
insert into sponsors (name, tier, description, amount, active)
select * from (values
  ('Walmart Okemos', 'Principal''s Circle', 'Proud to support the Okemos community.', 250, true)
) as seed(name, tier, description, amount, active)
where not exists (
  select 1 from sponsors s where s.name = seed.name
);
