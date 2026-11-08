-- ════════════════════════════════════════════════════════════════════════════
-- REFILL_WISHLISTS_DRAFTS.sql — teacher wish lists for the Mid-Year Refill
-- store, drafted from real requests sent through /for-teachers (October and
-- November 2026).
--
-- Every row is inserted HIDDEN (active = false). Nothing shows on /refill
-- until an admin turns it on in /access → Mid-Year Refill. Run this AFTER
-- SUPABASE_REFRESH.sql. Safe to run more than once: a label already in the
-- table is skipped.
--
-- Labels follow what each teacher allowed on their request:
--   • Named only where the teacher ticked "You can use my name when we ask a
--     business or donor to cover this".
--   • Anonymous ("An English teacher, …") where they ticked nothing. Confirm
--     with those teachers before switching their list on.
-- No email addresses or room numbers are stored here.
-- ════════════════════════════════════════════════════════════════════════════

-- Mid-Year Refill request, 7 Oct. No permission given: anonymous.
insert into public.refill_wishlists (label, school, note, items, active, display_order)
select 'An English teacher, 140 students', 'Okemos High School',
       'Fine for now, running out by January: tissues, writer''s notebooks, pencils and dry-erase markers.',
       '[{"itemId":"tissues-12","qty":1},{"itemId":"notebooks-12","qty":3},{"itemId":"pencils-72","qty":2},{"itemId":"dry-erase-12","qty":1}]'::jsonb,
       false, 10
where not exists (select 1 from public.refill_wishlists where label = 'An English teacher, 140 students');

-- Mid-Year Refill request, 26 Oct. No permission given: anonymous.
-- Also asked for one or two replacement bean bags for reading time (a Target
-- item, about a classroom project rather than a refill), left off this list.
insert into public.refill_wishlists (label, school, note, items, active, display_order)
select 'An English teacher, 100 students', 'Okemos High School',
       'Colored pens for grading and tissues for the January restock.',
       '[{"itemId":"g2-pens-color","qty":2},{"itemId":"tissues-12","qty":1}]'::jsonb,
       false, 20
where not exists (select 1 from public.refill_wishlists where label = 'An English teacher, 100 students');

-- Classroom project request, 4 Nov. Name and quotes permitted.
insert into public.refill_wishlists (label, school, note, items, active, display_order)
select 'Caitlin Stansell-Greig, English 11', 'Haslett High School',
       'Eight hardcover dictionary-thesauruses, so 125 students build vocabulary and look up words in class novels without reaching for a phone or AI.',
       '[{"itemId":"dictionary-thesaurus","qty":8}]'::jsonb,
       false, 30
where not exists (select 1 from public.refill_wishlists where label = 'Caitlin Stansell-Greig, English 11');

-- "Any time" supply request, 3 Nov. Name permitted. Small and urgent: better
-- filled now than in January. Here in case it is still open by December.
insert into public.refill_wishlists (label, school, note, items, active, display_order)
select 'Ms. Schoon, Math', 'Okemos High School',
       'Out of the bandages students ask for and almost out of grading pens.',
       '[{"itemId":"bandages-100","qty":1},{"itemId":"gel-pens-color-8","qty":1}]'::jsonb,
       false, 40
where not exists (select 1 from public.refill_wishlists where label = 'Ms. Schoon, Math');

-- "Any time" supply request, 19 Oct. Name permitted. Same advice: fill now.
insert into public.refill_wishlists (label, school, note, items, active, display_order)
select 'Kristina Keathley, Math', 'Haslett High School',
       'Markers are running out for 120 students, and there is no black left at all.',
       '[{"itemId":"markers-basics","qty":5}]'::jsonb,
       false, 50
where not exists (select 1 from public.refill_wishlists where label = 'Kristina Keathley, Math');
