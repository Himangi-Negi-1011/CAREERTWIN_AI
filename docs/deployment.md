# Vercel deployment plan

No CareerTwin Vercel project currently exists and no deployment has been created.

## Pre-deployment checks

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

The repository currently uses `next build --webpack` because Turbopack exceeded the available sandbox resources. Vercel should use the package `build` script unless later verification supports changing it.

## Required Vercel variables

Public:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sensitive/server-only:
- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY` when AI is enabled
- `OPENROUTER_MODEL` when AI is enabled

Use separate values for preview and production where providers support separate instances. Do not retrieve or print values for test coverage.

## Approval gates

1. Approval to create/link the CareerTwin Vercel project.
2. Preview deployment and verification.
3. Clerk/Supabase callback and origin configuration.
4. Security, migration, and E2E verification.
5. Separate explicit approval for production deployment or custom-domain changes.
