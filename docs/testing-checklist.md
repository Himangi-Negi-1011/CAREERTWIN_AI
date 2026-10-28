# Testing checklist

## Per-feature gate

- [ ] Acceptance criteria written
- [ ] Unit/integration tests added
- [ ] Lint passed
- [ ] Typecheck passed
- [ ] Relevant unit tests passed
- [ ] Critical Playwright path executed
- [ ] Narrow viewport inspected
- [ ] Keyboard and focus behavior inspected
- [ ] Reduced-motion behavior checked
- [ ] Console errors and failed requests resolved
- [ ] External credential blockers reported

## Security-critical cases

- [ ] Missing and expired Clerk session
- [ ] User A cannot read/update/delete User B data
- [ ] RLS tested with two distinct identities
- [ ] Service role never reaches a browser bundle/response
- [ ] Resume object access requires ownership or short-lived signed URL
- [ ] Invalid upload type and oversize upload rejected
- [ ] User input safely rendered
- [ ] AI context cannot cross user boundaries

## Current verified baseline

- ESLint passes.
- TypeScript passes.
- Vitest passes.
- Production build passes with Webpack.
- Playwright specs exist, but this sandbox cannot launch Chromium because `libnspr4.so` is absent. Run them in CI or a machine with Playwright system dependencies.
