# myirishtax.com Enhancement Recommendations

This plan details UI/UX, content, SEO, performance, and compliance upgrades to make myirishtax.com polished, ad-ready, and trustworthy (drawing inspiration from longevitymodeler.com).

## Quick Wins (Day 1–2)
- Add a clean hero with a single CTA ("Start calculating") and a subline such as "Free, accurate Irish income tax estimates in minutes." Include last-updated tax year near the CTA.
- Ship a sticky top bar with anchors (Calculator, Rates, FAQs, Contact) plus Privacy/Terms links in the footer.
- Publish Privacy Policy, Terms, and Cookie Policy pages; add a cookie banner with Consent Mode v2 support.
- Add unique `<title>`, meta description, Open Graph/Twitter tags, and a `WebApplication` schema block.
- Instrument GA4 + Google Ads conversions for CTA clicks and calculator completion.

## Page Structure & Layout
- **Hero**: Full-width, soft gradient or subtle illustration; headline, supporting line, CTA button, and a "See tax rates" secondary link. Show trust chips (GDPR-safe, updated 2024, data from Revenue Commissioners).
- **Benefits row**: 3–4 cards with icons: Accuracy, Up-to-date USC/PRSI, Privacy-first, Fast results. Mirror the airy spacing of longevitymodeler.com.
- **Guided calculator**: 3–4 steps with a visible progress indicator; inline validation and helper text; keep labels above fields.
- **Results section**: Cards for Net pay, Total tax, PAYE/USC/PRSI breakdown, and an optional mini bar chart. Include "Download PDF" and "Email results" (with consent checkbox) to improve conversions.
- **Education + FAQs**: Collapsible FAQs and short explainers for resident status, USC bands, PRSI classes, PAYE credits, and examples for common salary ranges.
- **Footer**: Contact info, social/email, policies, and a short statement on data handling (calculations client-side, no storage).

## Visual & Interaction System
- **Typography**: Use a friendly sans-serif body (e.g., Inter) with a stronger display font for headings; 1.5+ line height and 8px spacing scale.
- **Palette**: Light background, navy/teal primary for CTAs, soft accent gradients for hero cards; ensure WCAG AA contrast.
- **Components**: Buttons with clear focus states, cards with subtle shadows/borders, form fields with clear error states, tooltip pattern for definitions.
- **Motion**: Gentle fade/slide on section entrances and button hover states; keep transitions under 200ms for responsiveness.

## Content, Copy, and IA
- **Keyword-rich but natural copy**: Work in "Irish tax calculator", "USC calculator", "PRSI", "PAYE", and the current tax year without stuffing.
- **Examples**: Provide ready-made examples (e.g., "€55,000 PAYE employee, single" → output) to build trust and speed trial.
- **Trust messaging**: Cite Revenue Commissioners as data source; display "Updated for 2024" and a changelog link for rate updates.
- **IA**: Primary nav anchors to Calculator, Rates, FAQs, About, Contact. Secondary nav in footer to policies and support.

## SEO Implementation Checklist
- Semantic structure with `header`, `main`, `section`, `nav`, `form`, `article`, `footer`; single H1, logical H2/H3 hierarchy.
- Unique metadata: `<title>Irish Income Tax Calculator 2024 – Free & Accurate</title>` and matching `<meta name="description" ...>`; canonical tag; robots tag set to index/follow.
- Open Graph/Twitter cards: `og:title`, `og:description`, `og:image` (1200x630), `og:type=website`, `og:url`; equivalent Twitter tags.
- Schema.org JSON-LD: `WebApplication` (or `FinancialService`) with name, description, url, operatingRegion "IE", provider, price "0", and applicationCategory "FinanceApplication".
- Technical SEO: XML sitemap, humans-readable /robots.txt, clean URLs, gzip/brotli enabled, preload critical fonts, defer non-critical scripts.
- Internal links between calculator, tax rates, FAQs, and educational snippets to reinforce topical authority.

## Google Ads Readiness & Compliance
- **Policy fit**: Avoid exaggerated claims; show last updated year; provide data source citation and support contact.
- **Privacy & consent**: Implement Consent Mode v2, CMP banner with granular toggles; store consent state and pass to GTM/Ads/GA4.
- **Conversion tracking**: Fire events for CTA click (start), calculator step completions, and result view/download/email. Use consistent event names and ensure server response codes are 200.
- **Landing quality**: Above-the-fold clarity, fast load, no intrusive interstitials, clear navigation to policies, and visible trust indicators.
- **Form handling**: Explicit consent checkbox for emailing results; clarify retention (or lack thereof) and deletion contact.

## Performance & Core Web Vitals
- Budgets: LCP < 2.5s, CLS < 0.1, INP < 200ms on 4G mid-tier devices; total JS < 200KB gzipped for landing page.
- Optimize hero imagery (compress, modern formats, lazy-load non-hero media), preconnect to fonts, self-host minimal weights, use system font fallback.
- Reserve layout space for charts/cards to avoid CLS; lazy-load charts and non-critical sections after interaction or when in view.
- Enable HTTP caching, etags, and compression; consider static prerender/SSR for the landing page; audit with Lighthouse + Web Vitals in GA4.

## Accessibility
- WCAG AA color contrast; visible focus outlines on all interactive elements; keyboard support for form steps and accordions.
- Inputs with associated `<label>` elements and descriptive `aria-label` where needed; helpful error text and inline validation.
- Alt text on illustrations/icons; ensure tooltip content is accessible via focus/keyboard and not hover-only.

## Analytics & Measurement Plan
- GA4 baseline events: `view_home`, `start_calculator`, `complete_step_{n}`, `view_results`, `download_pdf`, `email_results`, `cta_contact`.
- Define conversions for `view_results` and `start_calculator` (as secondary) plus Google Ads conversion for primary CTA.
- Dashboard: Track completion rate per step, device split, load times (LCP/INP), and drop-off points; set alerts for significant rate changes after tax updates.

## Engineering Implementation Steps
1. Build a layout shell with semantic landmarks and sticky header/footer; add hero, benefits, calculator, results, education, FAQ sections.
2. Implement the guided calculator with schema-driven steps (fields, validation rules, helper text) to simplify future rate changes.
3. Add a results view component that supports PDF/Email export and small chart module (lazy-loaded). Gate email send with explicit consent.
4. Wire GA4 + Ads via GTM with Consent Mode v2; add dataLayer events for the measurement plan.
5. Add metadata tags, JSON-LD schema, sitemap, robots, and canonical. Validate in Rich Results and URL Inspection tools.
6. Apply performance budget: image optimization, font strategy, script/code-splitting, and Lighthouse verification.
7. Run accessibility check (axe/lighthouse) and fix color contrast, labels, focus, and keyboard flow issues.
8. Document rate-update procedure and change log; add automated tests for tax logic if/when code is added.

## Launch Checklist
- ✅ Policies published and linked; cookie banner operating with consent mode.
- ✅ GA4 + Ads conversions firing and verified; dataLayer events mapped.
- ✅ Page passes Lighthouse (Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90) on mobile emulation.
- ✅ Forms validate inline; consent required for emails; privacy statement visible near inputs.
- ✅ Schema/metadata validated; sitemap and robots reachable; canonical set.
- ✅ Core Web Vitals within budget; no major CLS shifts; images optimized; JS bundle within limit.
