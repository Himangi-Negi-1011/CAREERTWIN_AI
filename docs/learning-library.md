# Advance Learning Library

## Current verified state (2026-10-29)

The approved Supabase project contains the normalized advance-learning schema and 238 discovered catalogue skills. Repository-authored beginner content is now being completed before intermediate and advanced content. Python, JavaScript, TypeScript, Java, C Programming, C++, C#, Go, Rust, and PHP beginner are published. Each has 3 modules, 6 complete lessons, 9 quizzes/assessments, 93 unique questions, 3 mock tests, guided exercises, revision material, and a manually reviewed capstone. Their beginner jobs are ready; remaining jobs stay queued until complete packages pass the same checks.

This is intentional: schema creation, a job record, or a successful AI response does not make a course ready. Publication requires normalized lessons, content blocks, exercises, quizzes, three configured mock tests, answer explanations, a final assessment, and a passing validation report.

## Commands

```bash
npm run learning:status
npm run learning:seed
npm run learning:enqueue
npm run learning:generate
npm run learning:resume
npm run learning:retry
npm run learning:import-authored -- data/authored-courses/python-beginner.json
npm run check
npm run test:e2e
```

`learning:seed`, `learning:enqueue`, and worker commands require `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Generation additionally requires a supported server-only AI provider and an approved budget. The worker refuses to claim persistence when these values are absent.

## Persistence verification

1. Configure protected environment variables; never expose the service-role key to browser code.
2. Run `npm run learning:status` and record the counts.
3. Sign in and open a published course through `/api/learning/courses/{skillId}`.
4. Save progress through `/api/learning/progress`.
5. Restart the application.
6. Sign in as the same Clerk user and request the course again. The lesson-progress row must be returned from Supabase.
7. Sign in as a different user and verify that the first user's progress and attempts are not returned.
8. Start and submit a published mock test. Objective answers are graded server-side from `learning_question_keys`; manual tasks remain `awaiting-review`.

## Security and readiness

- Published shared content and per-user progress use separate tables.
- Answer keys, validation internals, administrator membership, and generation operations are not granted to authenticated browser clients.
- Administrative access requires an exact Clerk user ID in `learning_admins`; hiding buttons is not used as authorization.
- Cybersecurity generation prompts and validation must require owned or explicitly authorized labs.
- Generated code must be checked in an isolated runner; it must never execute on the main application server.
- A user-created skill is inserted as queued and remains unpublished until every required level passes validation.
