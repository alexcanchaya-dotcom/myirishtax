# MyIrishTax

Next.js Irish tax calculators (PAYE, contractor, rent credit, redundancy, auto-enrolment). Built to replace the live Hostinger static page on **myirishtax.com**.

## Domains

- **Production target:** [myirishtax.com](https://myirishtax.com) (currently a different Hostinger static site — deploy this app in its place).
- **myirishtax.ie** currently does not resolve (NXDOMAIN). Point DNS only after the name is registered and this app is live.

Sister sites: [wealthmodeler.com](https://wealthmodeler.com), [longevitymodeler.com](https://longevitymodeler.com).

## Quick start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Core calculators work without login.

Optional (accounts, saved calculations):

```bash
npx prisma generate
npx prisma db push
```

Copy `.env.example` to `.env` if you need NextAuth or Stripe. Card checkout stays off until `NEXT_PUBLIC_STRIPE_ENABLED=true` and real Stripe price IDs are set.

## What the app does

- **PAYE calculator** (`/`) — income tax, USC, PRSI from the single rate book in `lib/config/taxYearConfig.ts`. Credits reduce income tax only.
- **Contractor calculator** (`/contractor-calculator`) — same rate book; personal credit only (no PAYE credit).
- **Rent tax credit, redundancy, auto-enrolment** — free tools.
- **Rental income** (`/rental-calculator`) — coming soon. The old 75% interest rule is out of date, so that calculator is not shown in the main nav.
- **Legal:** `/privacy`, `/terms`, `/cookies`, `/disclaimer`.

Calculators that POST to `/api/calc` send the figures you type to the server to compute a result. That is described on the Privacy page. Results are estimates: “Based on published Irish tax bands; not advice.”

## Rate book

`lib/config/taxYearConfig.ts` is the only rate book used by the Next.js calculators. 2025/2026 figures follow Budget notes in that file. `config/tax_years/*.yml` is an older draft and is not used here.

## Still to do before this replaces live

1. Deploy this Next.js app (not the Hostinger static `public/index.html` page).
2. Point **myirishtax.com** DNS at that host.
3. Register and point **myirishtax.ie** when you want that name (it is NXDOMAIN today).
4. Supply real company details (CRO, address) if you want them on the legal pages — the app uses contact email only until then.
5. Turn on Stripe only when price IDs and keys are real (`NEXT_PUBLIC_STRIPE_ENABLED=true`).

## Tests

```bash
npm test
```

## Scripts

- `npm run dev` — Next.js development server
- `npm run build` / `npm start` — production
- `npm test` — Jest unit tests
