# CareerTwin design system — bright intelligent workspace

## Product character
CareerTwin combines a guided opportunity-profile workflow with a visually organized creative workspace. It must feel optimistic, credible, and useful—not like a generic analytics dashboard. The attached dashboard reference informs hierarchy and density only; CareerTwin retains original branding, copy, components, and evidence rules.

## Palette
- Workspace canvas: `#F4F5FB`
- Surface: `#FFFFFF`
- Primary ink: `#202440`
- Muted text: `#69708A`
- Primary violet: `#6D3DF5`
- Strong violet: `#5424D6`
- Supporting lavender: `#DDD6FE`
- Highlight gradient: violet `#6547F1` to magenta `#A127EC`
- Borders: 8–12% primary ink

## Typography and hierarchy
- Geist for interface and display typography.
- Large, tightly tracked headlines; compact readable forms.
- Use uppercase micro-labels only for section identity and status.
- Never let decorative typography compete with the current action.

## Public website
- Sticky public-only navigation: Home, Features, How It Works, About, Log In, Get Started.
- Bright hero with the exact CareerTwin value proposition and a realistic product preview.
- Product preview uses honest labels such as “No score until assessed.”
- Sections: hero, dashboard preview, features, workflow, audience/value, about, final CTA, footer.

## Auth
- Desktop split panel: violet product narrative left, compact Clerk authentication right.
- Mobile prioritizes the authentication form.
- Clerk remains the only identity provider; no fake credential form.

## Profile wizard
- Seven resumable steps with left progress navigation, central form, and right contextual help.
- Browser autosave plus secure Supabase save for authenticated users.
- Optional sections can be skipped.
- Resume import never occurs without explicit review.
- Completion percentage reflects completed steps, not field count or an invented score.

## Application workspace
- White navigation rail, compact top bar, warm-light central canvas.
- Exact primary modules: Twin Dashboard, Career Intelligence, Skill Gap Analysis, Career Roadmap, AI Interview, Documents & Resumes, My Profile, Privacy & Settings.
- Active navigation uses lavender surface and violet text.
- Cards have 12–20px radii, subtle borders, low-opacity shadows, and useful empty/error states.
- Dense enough to feel like a working product, but never crowded.

## Integrity guardrails
- No readiness, alignment, or progress score without stored source data.
- AI-generated content is labeled and unavailable when the provider is not configured.
- Resume extraction suggestions require review before import.
- Interview roadmap changes require explicit approval.
- User-owned records are authorized server-side and protected by Supabase RLS.

## Accessibility and responsive behavior
- 40px minimum interactive targets.
- Visible violet focus rings.
- Keyboard-accessible Quick Find and mobile navigation.
- Reduced-motion preferences disable nonessential animation.
- Dashboard rail becomes a drawer below desktop width.
- Wizard help panel collapses before the main form becomes cramped.
