# CareerTwin

A production-minded career development platform, built incrementally. The current repository contains **Phase 1: Foundation**: the premium responsive marketing experience, Pip companion shell, local onboarding role draft, design tokens, and the automated testing baseline.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- npm 10+ or Bun 1.1+
- VS Code (recommended)

## Run locally (Windows, macOS, or Linux)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The primary development command is `npm run dev`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For browser tests, install Chromium once and run Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

## Configuration

Copy `.env.example` to `.env.local` only when beginning provider integrations. Phase 1 requires no credentials. Do not commit `.env.local`.

- Clerk keys: Clerk Dashboard → API keys (Phase 2)
- Supabase keys: Supabase project → Settings → API (Phase 2)
- OpenRouter key: OpenRouter → Keys (optional, Phase 6)

The sign-in page deliberately reports that authentication is unavailable until Clerk and Supabase are configured. It does not simulate a login. The onboarding page currently saves only the selected role draft in browser local storage and says so in the UI.

## Current routes

- `/` — responsive marketing experience
- `/onboarding` — working local role-draft step, explicitly labeled Foundation mode
- `/sign-in` — honest unconfigured-provider state

## Planned phases

1. **Foundation** — design system, landing page, motion, testing baseline (current)
2. **Authentication & database** — Clerk, Supabase schema/migrations, RLS, protected routes
3. **Onboarding & dashboard** — persistent profile, full wizard, dashboard, contextual Pip
4. **Career intelligence** — curated role framework, deterministic scoring, resume review
5. **Roadmaps & projects** — adaptive tasks and milestone persistence
6. **AI & interviews** — OpenRouter abstraction, validated responses, failure states
7. **Progress & polish** — activity history, accessibility and performance refinement
8. **Deployment** — full suite, CI, Vercel and production verification
