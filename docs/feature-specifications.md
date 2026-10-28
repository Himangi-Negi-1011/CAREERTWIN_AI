# Feature specifications

## Authentication
Clerk owns sign-up, sign-in, sign-out, recovery, sessions, and account settings. All private routes verify the session server-side.

## Onboarding
Six resumable steps collect only relevant profile data, confirmed skills, a target role, experience/time preferences, and an optional resume. A failed save must preserve entered data.

## Dashboard
Displays only saved personal data or clearly labeled framework/demo information. Readiness is skill coverage—not employment probability—and links to its calculation.

## Resume analysis
Validates a private upload, extracts available text server-side, asks the user to review structured results, labels inferences, and never invents experience.

## Skill-gap engine
A deterministic weighted comparison classifies demonstrated, developing, unverified, prerequisite, and priority gaps. Identical inputs produce identical outputs.

## Roadmap
Role-specific stages contain objectives, prerequisites, durations, resources, tasks, criteria, and evidence. Task completion and demonstrated competency are separate.

## Projects
Recommendations target actual gaps and include milestones, architecture, tests, and portfolio outputs. Links must be verified or marked unverified.

## Pip and AI
Pip is dismissible, accessible, and contextual. AI is server-side, validated with Zod, rate-limited, and optional. Unavailable states are explicit.

## Interview preparation
Sessions save questions, answers, criteria-based guidance, and review history. Feedback is guidance—not an authoritative hiring decision.

## Progress
All progress derives from timestamped activities, evidence, tasks, assessments, projects, and interviews. Opening a screen does not inflate progress.
