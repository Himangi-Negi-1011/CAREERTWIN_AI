# CAREERTWIN PHASE 13 — BUG TRACKER

**Date:** 2026-11-11  
**Status:** ALL DEFECTS RESOLVED & VERIFIED (0 OPEN)  

| Bug ID | Severity | Category | Description | Status | Fix Verification |
|:---|:---|:---|:---|:---|:---|
| **BUG-01** | P1 | Testing / E2E | `tests/e2e/landing.spec.ts` tested obsolete `<Pip>` button removed in Phase 12. | **Resolved** | Updated to assert `<Pip>` absent, hero CTAs intact, analyzer drawer opens. 20/20 Playwright tests pass. |
| **BUG-02** | P2 | Settings / UI | Theme setting (Light / Dark / High Contrast) in `SettingsHub` did not update `document.documentElement` attributes. | **Resolved** | Added `applyAppearanceToDocument`, DOM attributes `data-theme`, `data-contrast`, `data-reduced-motion`, and CSS tokens in `dashboard-clone.css`. |
| **BUG-03** | P2 | Git / Cleanliness | Temporary files, caches, and screenshots in `.temp_zip/` and `.temp_workspace_clone/`. | **Resolved** | Added to `.gitignore` and `eslint.config.mjs` global ignores; removed from build paths. |
| **BUG-04** | P1 | Course Quality | 4 courses (`cloud-computing`, `cybersecurity`, `sql`, `power-bi`) had generic placeholder lessons; Python had `//` starter code. | **Resolved** | Upgraded via rich blueprint generator (`scripts/upgrade-courses-phase13.ts`); 14/14 packages validated with 0 errors via `npm run courses:validate`. |
| **BUG-05** | P0 | Security / Auth | `/dashboard?demo=true` allowed unauthenticated workspace access; APIs lacked 401 enforcement. | **Resolved** | Removed `?demo=true` query check in `dashboard/page.tsx`; added strict `auth()` checks returning 401 across protected endpoints. |
| **BUG-06** | P0 | Assessment | `MockExamsHub` hardcoded dummy 5-question client exams and answer keys; content had non-100-mark tests. | **Resolved** | Rewrote `MockExamsHub` to fetch sanitized 28-question, 100-mark exams from `/api/learning/mock-tests` across all 14 courses. |
| **BUG-07** | P1 | Hydration | React hydration error #418 on `/login` and `/sign-in` due to SSR theme mismatch in `AuthShell`. | **Resolved** | Replaced inline localStorage conditional swap with deterministic mount hydration in `AuthShell` and `Landing`. |
