# Local setup guide

## Prerequisites

- Node.js 20.9+ (Node 22 LTS recommended)
- npm 10+ or Bun 1.1+
- VS Code

## Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

Phase 1 works without external credentials. Clerk and Supabase credentials become required only when Phase 2 routes are enabled.

Required Phase 2 values:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

Optional AI values:

- `OPENROUTER_API_KEY` (server only)
- `OPENROUTER_MODEL`

The application validates configuration shape centrally under `lib/env/`. It reports provider status without returning credential values.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Install Playwright's browser dependencies on a supported development machine before E2E tests:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```
