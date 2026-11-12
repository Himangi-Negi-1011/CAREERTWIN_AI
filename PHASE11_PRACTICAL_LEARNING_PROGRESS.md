# CAREERTWIN PHASE 11 — HANDS-ON LABS, PRACTICAL PROJECTS & REAL-WORLD SKILL DEVELOPMENT PROGRESS

**Project**: CareerTwin Phase 11 Practical Learning Transformation  
**Role**: Principal Learning Platform Architect, Senior Full-Stack Engineer, AI Lab Engineer & QA Specialist  
**Status**: IN PROGRESS 🚀  

---

## Execution Checklist

### Stage 0: Verify Previous Phase (Baseline Audit)
- [ ] Run TypeScript typecheck (`npm run typecheck`) — verify 0 errors
- [ ] Run Course Validation (`npm run courses:validate`) — verify 14/14 courses valid
- [ ] Run Unit Tests (`npx vitest run`) — verify 100% pass rate
- [ ] Verify Learning Studio navigation and data flow baseline

### Stage 1: Build Reusable Practical Lab Engine
- [ ] Define comprehensive Lab Schema (`lib/learning/lab-schema.ts`):
  - Lab ID, title, skillSlug, moduleRef, difficulty, estimatedMinutes
  - Learning objectives, prerequisites, required tools, environment
  - Problem statement, step-by-step instructions, expected output
  - Interactive tasks with verification rules (code, regex, output, multiple checks)
  - Progressive hints (Level 1, 2, 3), validation criteria, troubleshooting guidance
- [ ] Implement Lab Repository & Content Store (`lib/learning/labs-repository.ts`):
  - Load and query labs by course, module, skill, difficulty
  - Safe evaluation runner: deterministic test suites, output comparison, pattern matching
- [ ] Create Lab API endpoints (`app/api/learning/labs/route.ts`, `app/api/learning/labs/[labId]/submit/route.ts`)

### Stage 2: Create Subject-Specific Hands-On Labs (All 14 Courses)
- [ ] Python: Syntax, conditionals, OOP, file I/O, REST APIs, debugging
- [ ] SQL / DBMS: Table creation, complex joins, indexing, transaction management, query optimization
- [ ] JavaScript: Asynchronous event loop, Promise chaining, DOM manipulation, storage
- [ ] TypeScript: Interface contracts, generics, discriminated unions, strict type guards
- [ ] Cloud Computing: Virtual machines, S3 storage buckets, IAM security policies, VPC design
- [ ] Cybersecurity: Linux file permissions, security log parsing, auth hash checks, web defensive analysis
- [ ] Java, C++, C#, C Programming, Go, Rust, PHP, Power BI labs

### Stage 3: Build Practical Project Engine
- [ ] Define Project Schema (`lib/learning/project-schema.ts`):
  - Title, problem statement, real-world scenario, difficulty (beginner, intermediate, advanced)
  - Skills required, learning outcomes, tools, architecture diagram/workflow
  - Development milestones (1 to 4) with clear deliverables
  - Rubric breakdown (Functionality, Quality, Security, Testing, Documentation)
- [ ] Author Course-Connected Capstone & Module Projects for core career tracks
- [ ] Create Project API endpoints (`app/api/learning/projects/route.ts`)

### Stage 4: Project Submission, Evaluation & Portfolio Integration
- [ ] Support submission formats: Source code, GitHub repo URL, live deployment URL, architectural summary
- [ ] Rubric evaluation engine with automated criteria validation + AI-assisted feedback
- [ ] Submission history & revision tracking (draft, submitted, graded, resubmit)
- [ ] One-click export to Student Portfolio (`app/components/dashboard/portfolio-view.tsx`)

### Stage 5: Upgrade AI Learning Agent into Practical Mentor
- [ ] Add 8 practical mentoring capabilities:
  1. Guide Me Through This Lab
  2. Give Me a Progressive Hint
  3. Explain My Error / Stack Trace
  4. Review My Work Against Rubric
  5. Help Me Debug Step-by-Step
  6. Explain the Architectural Concept Behind This Task
  7. Project Mentor & Milestone Planner
  8. Test My Understanding of Completed Lab
- [ ] Pass full lab and project context to tutor API (`app/api/learning/tutor/route.ts`)

### Stage 6: Safe Execution, Validation & Deterministic Testing
- [ ] Client/Server safe validation sandbox: syntax checks, output assertions, regex matching
- [ ] Clearly label automated validation vs simulation vs AI review
- [ ] Error boundary and timeout protections

### Stage 7: Progress Persistence & Mastery Engine Integration
- [ ] Integrate completed labs and projects into `lib/learning/mastery-engine.ts`
- [ ] Persist lab completion state in `localStorage` and backend `.data/learning/`
- [ ] Ensure "Resume Lab" and progress tracking work across page refreshes

### Stage 8: Learning Studio UI Overhaul (Labs & Projects Hub)
- [ ] Course View: Add dedicated tabs for "Lessons", "Hands-on Labs", "Practical Projects", and "Mock Tests"
- [ ] Interactive Lab Runner: Instructions, task checklist, interactive editor/input, test runner, output console, hints accordion, AI mentor sidebar
- [ ] Project Workspace: Milestone timeline, requirements, submission form, evaluation rubric, portfolio button
- [ ] Responsive design across desktop (3-pane / split view), tablet, and mobile

### Stage 9: End-to-End Testing & Verification
- [ ] Automated Unit Tests for Lab Engine, Evaluation Runner, and Project Submission
- [ ] Run `npm run typecheck`
- [ ] Run `npm run courses:validate`
- [ ] Run `npx vitest run`
- [ ] Run `npx next build --webpack`

### Stage 10: Final Documentation & Release Report
- [ ] Document all metrics in `CAREERTWIN_PHASE_11_RELEASE_REPORT.md`
- [ ] Verify clean git commit
