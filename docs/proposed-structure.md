# Proposed Next.js 14 Repository Structure

```
myirishtax/
├─ app/                          # App Router entry; routes, layouts, metadata
│  ├─ (marketing)/               # Public marketing pages grouped with route groups
│  ├─ (authenticated)/           # Authenticated layouts for premium features
│  ├─ api/                       # Route handlers (edge/server) for JSON APIs
│  │  ├─ calculators/            # PAYE/CGT API endpoints
│  │  ├─ ai-chat/                # AI tax expert chat endpoints & streaming
│  │  └─ billing/                # Premium subscription webhooks & management
│  ├─ calculators/               # UI pages for PAYE/CGT calculators
│  ├─ dashboard/                 # Premium user dashboard, saved profiles
│  └─ layout.tsx                 # Root layout/theme
├─ components/                   # Shared UI components (forms, buttons, cards)
│  ├─ ui/                        # Design-system primitives (inputs, modals)
│  ├─ charts/                    # Reusable chart wrappers for tax visuals
│  └─ layout/                    # Navigation, footers, shells used across pages
├─ features/                     # Vertical feature modules with UI + hooks
│  ├─ calculators/               # Calculator-specific UI/logic composition
│  ├─ ai-chat/                   # Chat widget, message list, streaming hooks
│  └─ billing/                   # Pricing tables, upgrade flows, customer portal
├─ lib/                          # Framework-agnostic utilities and “tax engine”
│  ├─ tax/                       # Pure calculation modules, configs per tax year
│  ├─ api-clients/               # Typed clients for internal/external APIs
│  ├─ auth/                      # Auth helpers, middleware utilities
│  └─ utils/                     # Generic helpers (dates, currency, formatting)
├─ prisma/                       # Prisma schema and migrations
├─ scripts/                      # One-off scripts (seeding, data imports)
├─ public/                       # Static assets served by Next.js
├─ tests/                        # Unit/integration tests (Jest/Playwright)
└─ docs/                         # Architecture notes, ADRs, and onboarding
```

## Notes
- **Shared UI components** live in `components/` (small primitives in `components/ui`); feature-specific compositions stay in `features/*` to keep the design system lean.
- **Tax engine logic** stays in `lib/tax`, isolated from React so it can run in API routes or edge functions without UI dependencies.
- **API routes** use the App Router’s `app/api` convention with subfolders for calculators, AI chat, and billing/subscriptions. This keeps HTTP handlers close to the app while letting `lib/tax` remain framework-agnostic.
- **Feature modules** (`features/*`) combine UI, hooks, and data fetching for a domain (calculators, chat, billing) without duplicating shared primitives.
- **Testing**: colocate feature tests under `tests/` with mirrors of the folder names; pure tax-engine functions should have fast unit tests alongside their modules under `tests/lib/tax`.
