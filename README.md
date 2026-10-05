# Funding Michigan Teachers

The website for [Funding Michigan Teachers](https://www.fundingmichiganteachers.org) — a
student-led 501(c)(3) nonprofit (EIN 93-4485967) in Okemos, Michigan that funds classroom
supplies, staff appreciation meals, and teacher recognition across Greater Lansing schools.

## Stack

- **React 19 + Vite 6 + Tailwind v4**, TypeScript. Routing is a small hand-rolled
  pathname matcher in `src/main.tsx`; every page except the homepage is `React.lazy`-loaded.
- **Cloudflare Workers** with static assets (`worker/index.ts`, `wrangler.jsonc`). The Worker
  serves the SPA, handles the two Stripe API routes, issues canonical 301s (apex→www,
  trailing slash), returns real 404s, and can block IPs via the `BLOCKED_IPS` variable.
- **Supabase** for editable site content, classroom-project votes, and a backup copy of form
  submissions. Content falls back to `src/data/initialData.ts` if the database is unreachable.
- **Stripe** embedded checkout for donations. **FormBold** delivers form submissions to email.

## Local development

```bash
npm install
npm run dev          # Vite dev server
npm run build        # production build into dist/
npm run lint         # tsc --noEmit
npx wrangler dev     # run the real Worker (routing, 301s, API) against dist/
```

## Configuration

| What | Where |
|---|---|
| `STRIPE_SECRET_KEY` | Cloudflare → Workers & Pages → funding-michigan-teachers → Settings → Variables and Secrets, as a **Secret**. Never prefix with `VITE_`. |
| `BLOCKED_IPS` | Same screen, as a plain Variable. Comma-separated; `1.2.3.*` wildcards allowed. Empty = nobody blocked. |
| Supabase URL + anon key | Baked into `src/lib/supabase.ts` (public by design, protected by Row Level Security). |
| Stripe publishable key | Baked into `src/lib/donate.ts` (public by design). |
| Google Analytics | `GA_MEASUREMENT_ID` in `src/lib/analytics.ts`. Empty = analytics off. |
| `BLOOMERANG_API_KEY` | Same screen as Stripe, as a **Secret**. See *Bloomerang* below. |
| `STRIPE_WEBHOOK_SECRET` | Same screen, as a **Secret**: the signing secret (`whsec_…`) of the Stripe webhook below. |
| `MERCH_CODES` | Same screen, as a **Secret**. Format and rotation advice in `shared/merch.ts`. |

**Vite inlines `VITE_*` variables at build time**, so anything the browser needs must be a
*build* variable or a baked-in constant — a Cloudflare *runtime* variable never reaches the
bundle. This is why the two public keys above are committed rather than read from env.

## Database

`SUPABASE_REFRESH.sql` creates every table and refreshes seeded content — paste it into the
Supabase SQL Editor. It is idempotent.

Then run `SUPABASE_LOCKDOWN.sql` (edit the admin email in step 1 first). On its own the
refresh lets **any** signed-in Supabase user read every form submission and edit every
content table; the lockdown limits both to the admins it lists. Then, in Supabase →
Authentication, turn **off** "Allow new users to sign up" and delete any user who is not an
FMT admin.

Admin access lives at `/access` and uses Supabase Auth. Create the login under
Supabase → Authentication → Users.

## Bloomerang

Every form posts to the Worker's `/api/crm`, which files the person in Bloomerang with a
private API key; completed Stripe payments reach it through `/api/stripe-webhook`. Neither
ever blocks a form or a payment: the CRM copy is extra.

**Setup**
1. In Bloomerang, signed in as an active Administrator: profile icon → Edit My User →
   API Keys 2.0 → Generate. Save it in Cloudflare as the Secret `BLOOMERANG_API_KEY` (a
   plain Variable is kept now, but a Secret is the right home for a key that can read
   the whole CRM).
2. In Stripe → Developers → Webhooks → Add endpoint:
   `https://www.fundingmichiganteachers.org/api/stripe-webhook`, event
   `checkout.session.completed`. Save its signing secret as `STRIPE_WEBHOOK_SECRET`.

**Where records appear:** on the person's timeline as an *interaction* ("Website — contact
form", "Website — donation"), not under Communications → Forms.

**Checking it works (5 minutes):** open the site, press F12 → Network, tick Preserve log,
filter `crm`, and send the contact form with your own email.

| Response | Meaning |
|---|---|
| 200 `{"filed":true}` | Filed. Search the email in Bloomerang. |
| 503 `not-configured` | `BLOOMERANG_API_KEY` is missing on the Worker. |
| 502 `search` / `constituent` | Bloomerang refused the key or the data. The reason is in Cloudflare → the Worker → Observability, search `[crm]`. |
| 502 `partial` | The person was saved, the note was not. |
| 403 | The request did not come from the site's own pages. |
| no `crm` request at all | The deployed version is older than the Worker path. Redeploy. |

Then filter `WebsiteVisit`: a 200 means the visit tracker ran. Bloomerang ties visits to a
person only when it can identify them, mainly after they click a link in an email sent from
Bloomerang, so send thank-yous and the Impact Report from Bloomerang.

**Data kept out on purpose:** returnables pickups are filed with name, email, phone and
town only. Street addresses and "bags on the porch" notes stay with the pickup request.

## Images

`node scripts/optimize-images.mjs` regenerates the display-sized AVIF/JPEG variants in
`public/images/` from the source photos. Commit the output.
