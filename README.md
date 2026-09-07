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

**Vite inlines `VITE_*` variables at build time**, so anything the browser needs must be a
*build* variable or a baked-in constant — a Cloudflare *runtime* variable never reaches the
bundle. This is why the two public keys above are committed rather than read from env.

## Database

`SUPABASE_REFRESH.sql` is the only file that needs running — paste it into the Supabase SQL
Editor. It creates every table, sets Row Level Security (public reads; writes require a
signed-in admin), and refreshes seeded content. It is idempotent.

Admin access lives at `/access` and uses Supabase Auth. Create the login under
Supabase → Authentication → Users.

## Images

`node scripts/optimize-images.mjs` regenerates the display-sized AVIF/JPEG variants in
`public/images/` from the source photos. Commit the output.
