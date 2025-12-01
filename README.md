# My Irish Tax – Calculator-first Landing + Automation Scaffolding

A refreshed, mobile-first site for **myirishtax.com** with an Irish tax calculator, service overviews, compliant legal pages, Google Ads–ready consent, and backend scaffolding for automation hooks.

## Project structure
```
/public
  index.html            # Main landing page with hero, calculator, services, pricing, FAQ, automation overview
  privacy.html          # Privacy Policy
  terms.html            # Terms & Conditions
  cookies.html          # Cookie Policy
  refunds.html          # Refund Policy
  about.html            # About page with placeholder credentials
  /assets
    /css/main.min.css   # Minified CSS generated from src/styles/main.css
    /js/main.min.js     # Minified JS generated from src/assets/main.js
    /images/og-graphic.svg     # Lightweight SVG placeholder
/src
  /styles/main.css      # Source styles (edit here, then run build)
  /assets/main.js       # Source JS (cookie banner, nav scroll, FAQ toggle, calculator)
  /backend/server.js    # Express server exposing API routes and static hosting
  /automations/workflows.js # Automation stubs (onboarding, uploads, reminders, upsell)
  /email/emailClient.js # Nodemailer client with environment-driven credentials
/scripts/build.js       # Simple minifier to emit /public assets
```

## Running locally
1. Install Node.js 18+.
2. Install dependencies: `npm install` (requires internet access to npm registry).
3. Build minified assets: `node scripts/build.js`.
4. Start server: `npm start` then open `http://localhost:3000`.

> Note: In offline or restricted environments, `npm install` may fail. When available, allow outbound access to `registry.npmjs.org`.

### Environment variables
- `PORT` (default `3000`)
- `SUPPORT_EMAIL` – destination inbox for contact form
- `FROM_EMAIL` – sender email
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – SMTP credentials for Nodemailer
- `ENABLE_SSL` – set to `true` to indicate SSL health in `/health`

## API routes
- `POST /api/contact` – sends enquiry email (expects `name`, `email`, `message`, `consent`)
- `POST /api/onboarding` – creates onboarding record and schedules reminder
- `POST /api/upload` – accepts single file upload (ready for S3 wiring)
- `POST /api/reminders` – schedules reminder emails
- `POST /api/upsell` – creates upsell intent scaffolding
- `GET /health` – basic status + SSL flag

## Automation stubs
`src/automations/workflows.js` stores records in-memory but is structured for:
- User onboarding flow (email + filing type)
- Secure document upload (replace with S3/Blob storage API)
- Reminder scheduling (hook to cron/queue provider)
- Upsell intents (e.g., tax residency assessment, PAYE refund estimator, income categorizer)

## Compliance and trust
- Google Ads–ready legal pages: Privacy, Terms, Cookies, Refunds, About
- Cookie consent banner with accept/reject paths
- Business identity surfaced in the footer (CRO, address, contact details)
- SEO metadata and Schema.org (LocalBusiness, FAQ)

## Deployment
- Serve `/public` as static assets behind HTTPS.
- Run `node src/backend/server.js` (or containerize) to handle forms/uploads; configure reverse proxy (Nginx/Cloudflare) with SSL.
- Point Google Tag Manager/Analytics, Stripe, and CRM/Airtable credentials via environment variables when integrating.

## Optional enhancements
- Wire `/api/upload` to S3 with server-side encryption and signed URLs.
- Replace in-memory automation store with a database or Airtable/CRM connector.
- Add GA4 + GTM with consent mode in `public/index.html`.
- Activate Stripe Checkout/Payment Links for paid services.
- Add PDF generation for summaries and onboarding confirmation.
