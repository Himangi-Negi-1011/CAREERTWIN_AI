# CareerTwin architecture

## System boundary

```text
Browser
  → Next.js App Router
    → Clerk authentication/session
    → server actions and route handlers
      → Supabase PostgreSQL + private Storage
      → deterministic career services
      → optional OpenRouter provider
```

## Responsibilities

- **Clerk:** identity, sessions, account lifecycle, sign-in and sign-up UI.
- **Supabase:** application records, career frameworks, activity history, and private resume assets. Supabase Auth will not be used.
- **Next.js server layer:** validates Clerk sessions, validates inputs with Zod, performs ownership checks, and calls database/storage/AI services.
- **Career services:** deterministic skill coverage, priority ordering, roadmap rules, and progress calculations.
- **AI service:** explanations, chat, and interview guidance only. It cannot assign arbitrary readiness scores or authorize access.

## Security invariants

- A Clerk subject is the canonical owner identifier.
- Service-role credentials are server-only and never included in browser bundles or responses.
- Database RLS and server checks both enforce ownership.
- Resume objects are private and scoped by owner ID.
- Signed file URLs are short-lived.
- AI prompts receive only the minimum user context needed for the request.
- Provider failures cannot block deterministic profile, score, or task operations.

## Delivery phases

1. Foundation — completed locally.
2. Clerk, Supabase schema, RLS, private storage, and protected routes.
3. Persistent onboarding and data-backed dashboard.
4. Resume analysis and deterministic career intelligence.
5. Adaptive roadmaps and projects.
6. Validated AI and interview preparation.
7. Progress, accessibility, performance, and operational polish.
8. CI, preview deployment, security review, and approval-gated production release.
