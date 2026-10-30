# CareerTwin — rebuild (two self-contained pages)

A rebuilt, upgraded version of https://careertwin.vercel.app — same sections, same
framer-motion style entrance animations, plus a real interactive 3D hero that replaces
the original design (no third-party runtime, no network calls, no imported scene files).

Three self-contained pages: **`index.html`** (marketing site), **`login.html`** (auth,
demo only) and **`dashboard.html`** (the signed-in workspace, nine sections behind
hash routes).

## Run it

Open **`index.html`** in a browser. `login.html` is the auth page (the header’s Login / Get Started buttons link to it); logging in takes you to `dashboard.html`, which is also linked from the footer. Everything (CSS, JS, three.js,
the 3D robot scene) is inlined, so the file works from disk, from a static host,
or attached in an email.

Files:
- `index.html` — landing page
- `login.html` — log in / create account page, with its own robot

Both are fully self-contained (CSS, JS, three.js and the 3D scenes inlined), so they work
from disk or any static host with no build step and no network calls.

## What's inside

| Area | Notes |
| --- | --- |
| Character | Hand-built in three.js (`src/robot.js`) to match the original design: black glossy helmet with a raised bezel around a **shallow recessed visor**, glowing white arch eyes + smile with additive bloom, coral ear pods and a coral chest ring around a black centre, teardrop torso, chunky two-segment arms ending in rounded mitt hands (palm + knuckle block + three fat curled digits and an offset thumb). No third-party scene file is shipped — the art is ours, ~540 KB inlined instead of ~3.4 MB. |
| Motion | Spring-driven: float bob, head/body look-at with lag, idle glances, blinks (sometimes double), a greeting wave with finger follow-through, squash-and-stretch hops, breathing chest/ear glow with an occasional white flash. |
| Interactions | Hover to make it squint; the **Say hi** chip or a click/tap triggers a hop + blink (`careertwin:cheer`). All of it honours `prefers-reduced-motion`. |
| FAQ | Eight genuine pre-analysis questions (cost, account, how the analysis works, privacy, turnaround, formats, freshers/switchers, whether it writes your resume). One open at a time, ↑ ↓ Home End / Escape keyboard support, deep links like `#faq-q3`. The answer panel animates with `grid-template-rows: 0fr → 1fr`, so it can never clip, overlap or be left half-open after a resize or font swap. |
| Dashboard (round 12) | `dashboard.html` is now a full workspace with the same information architecture as the real product: **Dashboard, Skill Gap Analysis, Career Intelligence, Career Roadmap, Learning Studio, AI Career Coach, My Documents, Progress & Weekly Tests, Privacy & Settings** — nine views behind a hash router (deep links like `dashboard.html#skills` work, so the routes can be proxied). Header holds the live section title, a **Quick find** palette (⌘K / Ctrl-K, arrow keys, searches views, roadmap steps, skills, lessons and roles), theme toggle and user chip; a floating **Career guide** button jumps into the coach. The hero of the Dashboard view is the hand-built robot with its own `dash` camera pose and a Say-hi chip. It is genuinely interactive, not a mock-up: recording evidence on a skill moves coverage, the priority gap, the status line and the next recommended action; setting a target role from Career Intelligence re-points the target card, gaps and roadmap hints; roadmap ticks, lesson reviews, document additions (name/size/date only) and weekly check-in scores all persist in `localStorage` and recompute everything; Settings edits name/email/hours/target and can export the whole workspace as JSON or clear it. Every number states what it is and what it is not. |
| Login page | Split layout: the same robot (closer camera, faster waving, angled three-quarter pose, same say-hi reaction) beside a real form — email/password with inline validation, show/hide password, remember me, Google button, forgot-password, log in ↔ create-account switch, loading state and a success panel. Demo only: nothing is sent anywhere. |
| Animations | Hero copy slides in (same `initial/animate` values as the original), floating product cards, drifting gradient blobs, gradient-animated headline, scroll progress bar, scroll reveals, card tilt + cursor glow, magnetic buttons, shine sweep, FAQ accordion. |
| Sections | Header + mobile menu, hero, workflow strip, features (3 cards), how-it-works steps, FAQ (8 questions, accordion + intro + closing CTA), CTA band, footer. |
| Theme | Deep, near-black dark palette (violet `#8b5cf6` accent, calmer cyan) with a light mode — the 3D scene re-lights itself to match (materials, key light, dust and shadow all adjust). |
| Analyze flow | Working `/analyze` experience as a full-screen view: paste or upload a resume (or load a sample), an animated scan pass, then a generated report — match score ring, detected skills bars, best-fit paths and a 4-week roadmap. Runs entirely on-device. |
| Accessibility | Keyboard focus states, `aria-expanded` / `aria-controls` / labelled regions on every FAQ item, ESC closes the analyze view, full `prefers-reduced-motion` fallback. |
| Design (round 7) | Monochrome black-and-white system with a single violet accent used only as light: white-on-black primary buttons (black-on-white in the light theme), neutral FAQ and section washes, a new black CTA card with a three-step list, and a **See it first** card under the FAQ replacing the old "Still deciding?" strip. |
| Brand (round 7) | New mark: a rounded white/black tile carrying the robot's own smiley face, with a `Career`/`Twin` weight contrast wordmark instead of the old rocket glyph and gradient text. |
| Preview-safe (round 8b) | `localStorage` throws inside sandboxed iframes, which aborted both page scripts before the 3D booted — every storage read/write now goes through a try/catch shim in `app.js` / `login.js`, so the character renders in the in-app preview as well as in a normal browser. |
| Copy (round 12) | Dashboard copy follows the real product's honest framing: "Evidence coverage is the share of this role framework backed by skills you have recorded yourself. It is not job readiness or mastery." No salary, hiring-odds or scraped-job claims, and the coach explicitly says its replies are scripted from local data. |
| Copy (round 10) | Nothing is sold here, so the closing CTA now reads **Get Started** instead of "Get Your Free Analysis", and every "free analysis" mention was neutralised (`Free · no account needed`, `Skip login and get started`). |
| Fixed issues (round 10) | The FAQ intro column was `position: sticky` and, once the FAQ list scrolled past, it slid down over the answer list and the *See it first* card. It now scrolls in place, so overlap is impossible at any scroll position or width. |
| Rebuild (round 9) | The original Spline scene was dropped as the source and the character re-authored from scratch: sphere shell with a circular front opening, recessed dish visor, bezel + lip, coral pods, teardrop torso, per-shape bloom sprites. Pages went from ~3.5 MB back to ~640 KB while keeping the same look. |
| Fixed issues (round 7) | The lathe torso was wound inside-out (showing its dark interior as a hole in the chest), the chest bib cut a visible diagonal line across the body, the face glow plane sliced a grey band through the shell, the contact-shadow plane rendered as a floating dark ellipse, and the hover rings intersected the torso. Key light softened, fill raised so the plastic shows shape instead of a single hotspot. |
| Fixed issues (round 4) | Intro rotation was accumulating per frame (robot drifted off-camera); the head was tracking a phantom pointer parked at the page corner; canvas could zoom out spuriously on short containers; hero copy could be left invisible when the entrance animation was starved; a composited opacity animation was stopping the login canvas from repainting; FAQ answers could be clipped by a stale max-height; stray seam line across the shoulders removed. |
| Fixed issues (round 3) | Frame-rate-independent intro animation (the robot could get stuck half-size on slow GPUs), hand/arm colour, clipped mobile header, robot framing in short containers. |
| Fixed issues | Skip-to-content link, dialog semantics + inert background for the analyze view, native focus rings, mobile menu closes on resize/Escape, scroll-hint is a real button, native `<button>` background reset (removed grey "Use sample resume" pill), inline file notice instead of an `alert()`, disabled + re-enabled submit state, invalid-input styling, honest file-format copy, tightened section spacing. |
| Honest content | No invented testimonials, ratings, user counts or "trusted by" logos — social proof was replaced with factual product guarantees (free, no card, private) and a workflow strip. |

## Editing

Source lives in `src/` (`index.html`, `style.css`, `app.js`, `robot.js`). Rebuild the
single file with:

```bash
npm install three esbuild      # once, in this folder
node build.js
```

`build.js` bundles `robot.js` (three.js) once and inlines it — with `app.js` / `login.js` /
`dashboard.js` and `style.css` / `login.css` / `dashboard.css` — into `index.html`,
`login.html` and `dashboard.html` respectively. `dashboard.js` only ever touches classes
and ids that exist on the dashboard, so the shared CSS can't collide with it.
