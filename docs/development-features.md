# CareerTwin development workspace

## Scope

CareerTwin now provides account-scoped, browser-local tools that work for any career domain:

- Learning roadmap: starter and custom steps with explicit completion criteria.
- Evidence projects: user-defined projects with planned, building, and complete states.
- Interview practice: six cross-domain question types, answer guidance, self-rating, and reflection history.
- Progress: transparent activity completion summary and JSON export.
- In-product guide: six-step usage workflow, privacy guidance, and product limitations.

## Data and privacy

Development records use `careertwin-development-v1:<clerk-user-id>` in browser local storage. They are scoped to the authenticated Clerk subject passed by the protected server route. These records are not synced to Supabase yet.

Users are warned not to store confidential, proprietary, personal, health, credential, or otherwise sensitive data. Exported JSON may contain user-entered notes and must be reviewed before sharing.

## Product integrity

- Starter roadmap items are labeled suggestions, not generated assessments.
- Project completion is set by the user.
- Interview ratings are self-ratings, not AI scores.
- Progress is activity completion, not job readiness.
- CareerTwin does not verify credentials or predict hiring outcomes.
- Provider integrations remain unavailable until secure OAuth and token storage are configured.

## Validation completed

- ESLint: passed without warnings.
- TypeScript: passed.
- Vitest: 19/19 tests passed across 7 test files.
- Next.js production build: passed, including `/dashboard` prerender and server route generation.
- Vercel production deployment: READY and PROMOTED.
- Production guest dashboard protection: redirect marker present; private feature content absent.
- Production onboarding route: HTTP 200 and Save and continue control present.

Authenticated production interaction requires a real Clerk user session and should be smoke-tested manually after sign-in.
