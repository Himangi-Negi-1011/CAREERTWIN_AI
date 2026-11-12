# CareerTwin Beta Student Onboarding Guide

**Version:** v1.0.0-beta  
**Last Updated:** 2026-11-11  
**Status:** Beta Programme — Not a production release  

---

> [!CAUTION]
> CareerTwin is currently in **controlled beta**. It is real software under active development, not a finished product. Features may change, some flows may have rough edges, and your feedback directly shapes the final release. By participating you agree to report issues honestly rather than simply giving up when something breaks.

---

## Table of Contents

1. [What is CareerTwin?](#1-what-is-careertwin)
2. [Beta Programme Rules of Engagement](#2-beta-programme-rules-of-engagement)
3. [Registration and Account Setup](#3-registration-and-account-setup)
4. [Onboarding Wizard](#4-onboarding-wizard)
5. [The Seven-Section Workspace](#5-the-seven-section-workspace)
6. [Learning Studio](#6-learning-studio)
7. [AI Tutor](#7-ai-tutor)
8. [Practical Labs and Exercises](#8-practical-labs-and-exercises)
9. [Mock Examinations](#9-mock-examinations)
10. [Projects and Portfolio](#10-projects-and-portfolio)
11. [Career Section](#11-career-section)
12. [Account Settings](#12-account-settings)
13. [Reporting Issues](#13-reporting-issues)
14. [Privacy Commitments](#14-privacy-commitments)
15. [Important Disclaimers](#15-important-disclaimers)

---

## 1. What is CareerTwin?

CareerTwin is a **personalised learning and career development platform** for students who want to build technical skills in programming, cybersecurity, cloud computing, data, and related disciplines.

Its core idea: instead of browsing a generic catalogue, CareerTwin builds a **learning profile** (your "Twin") from your career goals, education background, and existing skills — then recommends courses, exercises, mock examinations, and projects that fit where you actually are.

### What CareerTwin currently includes

| Feature | Status |
|---|---|
| 14 course packages (Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, PHP, SQL, Cloud Computing, Cybersecurity, Power BI) | ✅ Available |
| 3 modules × 2 lessons per course (42 modules, ~84 lessons total) | ✅ Available |
| Phase assessments per module (3 × knowledge checks per lesson) | ✅ Available |
| 3 full 100-mark mock examinations per course (42 total) | ✅ Available |
| Practical hands-on labs and exercises | ✅ Available |
| Guided capstone projects per course | ✅ Available |
| Portfolio builder | ✅ Available |
| AI Tutor (requires Gemini API key) | ✅ Available |
| Career readiness scoring | ✅ Available |
| Application tracker | ✅ Available |
| Account settings with theme/contrast preferences | ✅ Available |
| Real-time feedback system | ✅ Available |

### What CareerTwin does NOT include in this beta

- Video lectures or screen recordings
- Live instructor sessions
- Industry certifications or exam vouchers
- Job placement services or guaranteed employment outcomes
- Verified skill badges recognised by third parties

---

## 2. Beta Programme Rules of Engagement

As a beta student, you agree to:

1. **Use real credentials only** — do not share your account with others.
2. **Report every bug** — use the feedback button (bottom of workspace nav); include what you expected and what actually happened.
3. **Be honest about difficulty** — if a lesson is too hard or too easy, say so in feedback. This directly improves content.
4. **Respect your own privacy** — never paste real passwords, API keys, or sensitive personal data into the AI Tutor chat or feedback form.
5. **Not screen-record and publish sessions** without prior written consent from the CareerTwin team.

---

## 3. Registration and Account Setup

### Step 1 — Visit the application

Go to the CareerTwin URL provided to you by the beta coordinator.

> [!NOTE]
> The public Vercel preview URL (`https://careertwin-three.vercel.app`) expired after Phase 14 and currently returns 404. During beta, you will receive a direct link to the active deployment or will run the application locally.

### Step 2 — Create an account

Click **Get Started** or **Sign In** on the landing page. CareerTwin uses **Clerk** for authentication, which supports:

- Email + password registration
- Google single sign-on (if configured)

After confirming your email address, you will be redirected to the onboarding wizard.

### Step 3 — Verify your email

Check your inbox for a Clerk verification email. Click the link. If it does not arrive within 2 minutes, check your spam folder.

---

## 4. Onboarding Wizard

The first time you log in, CareerTwin walks you through a 3–5 step wizard to build your profile:

| Step | What You Enter | Why It Matters |
|---|---|---|
| Career Goal | Your target role (e.g., "Backend Developer", "Data Analyst") | Determines course recommendations |
| Education | Current level (high school / undergraduate / postgraduate / self-taught) | Adjusts lesson complexity |
| Existing Skills | Languages or tools you already know | Avoids showing beginner content you have already mastered |
| Learning Pace | Hours per week you can commit | Sets realistic module completion dates |
| Theme Preference | Light / Dark / High-contrast | Saves to your account immediately |

> [!TIP]
> Be honest in the wizard. The Twin recommendation is only as good as the information you provide. You can update your profile at any time from **Settings → Profile**.

After completing the wizard, CareerTwin generates your **Career Twin** — a personalised learning roadmap shown in the Home section.

---

## 5. The Seven-Section Workspace

After onboarding, you land in the workspace — a single-page application with seven sections in the left navigation:

| # | Section | Purpose |
|---|---|---|
| 1 | **Home** | Career Twin overview, recommended courses, learning streak |
| 2 | **Career Twin** | Your personalised roadmap and AI-driven profile recommendations |
| 3 | **Learning** | Course catalogue, lessons, AI tutor |
| 4 | **Practice** | Hands-on labs, coding exercises |
| 5 | **Projects** | Guided capstone projects, milestone tracking |
| 6 | **Career** | Resume analyser, application tracker, portfolio builder |
| 7 | **Settings** | Account, theme, notifications, privacy preferences |

### Navigation tips

- Click any section name in the left sidebar to navigate.
- On mobile, tap the hamburger menu (☰) to open the sidebar.
- Your current section is highlighted with an accent colour.
- Keyboard shortcut: `Ctrl + K` opens the command palette (search courses, go to section).

---

## 6. Learning Studio

The Learning section is where most of your time will be spent.

### Choosing a course

1. Navigate to **Learning** in the sidebar.
2. Browse the course catalogue. Courses recommended for your Twin profile appear first with a ★ badge.
3. Click a course card to open the course overview: objectives, prerequisites, modules, and estimated hours.
4. Click **Start Course** (or **Continue** if you have already begun).

### Inside a course

Each course contains **3 modules**. Each module contains:

- **2 lessons** — read the lesson sections at your own pace.
- **Knowledge checks** — 3 inline questions per lesson to confirm understanding.
- **Phase assessment** — a module-end assessment you must pass at 70%+ to mark the module complete.

### Reading a lesson

Lessons are structured as:

1. **Core Model** — the key concept explained clearly, with worked examples.
2. **Worked Example** — a runnable code sample. Try to predict the output before you run it.
3. **Guided Practice** — a step-by-step exercise you complete yourself.

> [!TIP]
> Do not skip the Guided Practice steps. The knowledge checks are designed around the same actions — if you do the practice first, the checks feel natural.

### Knowledge checks

After each lesson section you will see inline multiple-choice questions. These are:

- Instant-feedback (the correct answer is shown immediately after you select).
- Not graded — they are diagnostic only.
- Revisitable — you can retake them as many times as you like.

### Module completion

After both lessons in a module are read and their knowledge checks are attempted, the **Phase Assessment** unlocks. Pass it at 70%+ to mark the module complete and unlock the next one.

---

## 7. AI Tutor

The AI Tutor is an interactive assistant that answers questions about the topic you are studying.

### How to use it effectively

**Good prompts:**
- "Explain why `price = price + 1` does not modify the original integer object in Python."
- "My code gives `TypeError: unsupported operand type(s) for +: 'int' and 'str'`. What is the most likely cause?"
- "Show me a worked example of a Python list comprehension with a condition."

**Less useful prompts:**
- "Tell me everything about Python." (too broad — ask one specific question)
- "Write my exercise for me." (the tutor explains and hints; it does not submit work for you)
- "What is the answer to Question 3?" (questions are closed-answer; the tutor guides you to understand, not to guess)

### Rate limits

The AI Tutor is rate-limited to **25 requests per minute** to prevent abuse. If you exceed this, wait 60 seconds and try again.

### Privacy note

The tutor session is not stored permanently. Never paste real passwords, authentication tokens, or sensitive personal data into the tutor chat.

---

## 8. Practical Labs and Exercises

Each lesson contains **1 coding exercise**. Navigate to **Practice** in the sidebar to see all available labs across your enrolled courses.

### Exercise types

| Type | Description |
|---|---|
| **Coding** | Write a small program, run it, observe the output, explain the result |
| **Debugging** | A broken program is provided — find and fix the fault |
| **Modify and Explain** | A working program is provided — change one value and explain the effect |
| **Build and Submit** | A multi-step practical project milestone |

### Submitting an exercise

1. Write your solution in your own development environment (VS Code, online IDE, etc.).
2. Copy the runnable source code and your observed output.
3. Paste both into the submission form in CareerTwin.
4. The system records your submission. In the beta there is no automated grading of open-ended code — the evaluation criteria are listed so you can self-assess.

> [!NOTE]
> Automated code execution and grading is a planned post-beta feature. In this beta, exercises are self-assessed against the listed evaluation criteria.

---

## 9. Mock Examinations

Each course has **3 full mock examinations** (42 total across the platform). These are professional-grade 100-mark papers designed to simulate a real technical assessment.

### Exam structure

| Section | Questions | Marks | Topic |
|---|---|---|---|
| A — Fundamentals | ~8 | 20 | Core concepts, definitions |
| B — Debugging | ~5 | 15 | Reading tracebacks, diagnosing errors |
| C — Technical Problem Solving | ~8 | 25 | Applied reasoning questions |
| D — Practical Implementation | ~8 | 25 | Code output, implementation scenarios |
| E — System Architecture | ~5 | 15 | Design decisions, trade-offs |

**Total: 28 questions, 100 marks, 60 minutes, 70% pass threshold.**

### Taking an exam

1. Navigate to **Practice → Mock Exams**.
2. Select a course and choose Test 1, 2, or 3.
3. Click **Start Exam**. A timer begins.
4. Answer all questions. You can review and change answers before submitting.
5. Click **Submit Exam**. Your score report is shown immediately.

### Score report

After submission you receive:
- Overall score (marks and percentage)
- Section-by-section breakdown
- For each wrong answer: the correct answer and an explanation
- Recommended lessons to revisit based on wrong answers

> [!IMPORTANT]
> Exam results are stored in your account. You can retake each test as many times as you like, but each attempt creates a new record — so your history is preserved.

---

## 10. Projects and Portfolio

### Guided Projects

Each course includes a **capstone project** that integrates the skills from all 3 modules. Navigate to **Projects** to see your available projects.

Each project has:
- A clear problem statement
- 3–5 milestones with submission requirements
- Evaluation criteria so you know what "done" looks like

### Submitting a milestone

1. Open the project in the Projects section.
2. Click the milestone you have completed.
3. Paste your work (code, writeup, or link to a repository).
4. Click **Submit Milestone**.

### Portfolio Builder

Completed project milestones automatically contribute to your **Portfolio** in the Career section. The portfolio generates a shareable summary of your completed work.

Navigate to **Career → Portfolio** to:
- Review your completed projects
- Edit the portfolio description
- Copy the portfolio share link

> [!NOTE]
> Portfolio share links are public by default. If you do not want your work publicly accessible, do not share the link.

---

## 11. Career Section

The Career section contains four tools:

| Tool | Purpose |
|---|---|
| **Career Twin Profile** | Your AI-generated career roadmap |
| **Resume Analyser** | Upload your CV — get AI feedback on skills gaps |
| **Application Tracker** | Log job applications, interview dates, follow-ups |
| **Portfolio** | View and share your project work |

### Resume Analyser

1. Navigate to **Career → Resume Analyser**.
2. Paste your resume text into the input box.
3. Click **Analyse**. The AI returns structured feedback in under 30 seconds.

> [!CAUTION]
> Do not paste resumes that contain your home address, phone number, or other sensitive personal information into the AI analyser if you are using a shared or public device.

---

## 12. Account Settings

Navigate to **Settings** to manage:

| Setting | Description |
|---|---|
| **Profile** | Update career goal, education level, skills |
| **Appearance** | Light / Dark / High-contrast theme; font size |
| **Notifications** | Email reminders for incomplete modules |
| **Privacy** | Data deletion request; interview memory preferences |
| **Account** | Change email, change password, sign out |

### Signing out

Click **Sign Out** in Settings (or the user menu at the top of the sidebar). This calls the secure logout endpoint and clears your Clerk session. You will be redirected to the landing page.

---

## 13. Reporting Issues

Your feedback is the most valuable asset in this beta.

### How to report a bug

1. Click the **Feedback** button at the bottom of the left sidebar.
2. Select the category that best matches your issue:
   - **Login / Auth** — sign-in, sign-out, session problems
   - **Course Content** — wrong information, broken examples, confusing explanations
   - **Learning Studio** — lesson rendering, progress not saving
   - **Mock Exam** — scoring errors, timer issues, wrong answers
   - **AI Tutor** — irrelevant responses, errors, rate limit problems
   - **Performance** — slow loading, timeouts
   - **UI / Layout** — broken layout, mobile display issues
   - **Other** — anything that does not fit above
3. Fill in:
   - **What were you trying to do?**
   - **What did you expect to happen?**
   - **What actually happened?**
   - **Severity** (P0 = cannot use the app, P3 = minor inconvenience)
4. Click **Submit**.

> [!TIP]
> The more specific your report, the faster it gets fixed. "The page is broken" is hard to act on. "On the Python mock exam, Test 2, Question 7 — clicking Submit Exam redirects me to the landing page instead of showing my score" is immediately actionable.

### Direct channel (if the feedback form itself is broken)

Email the beta coordinator directly with the subject line `[CareerTwin Beta Bug]`.

---

## 14. Privacy Commitments

CareerTwin collects only what is necessary to provide the service:

| Data | Stored Where | Retention |
|---|---|---|
| Account credentials | Clerk (encrypted) | Until account deleted |
| Learning progress, scores | Supabase PostgreSQL | Until account deleted |
| Portfolio and project submissions | Supabase PostgreSQL | Until account deleted |
| AI Tutor chat | Not stored permanently | Session only |
| Feedback reports | Supabase PostgreSQL (scoped to your account) | 90 days |
| Resume paste text | Not stored | Used only during the analysis request |

**What CareerTwin does NOT do:**

- Sell your data to third parties
- Use your learning data to train external AI models
- Share your progress or portfolio without your explicit action (share link)
- Store payment information (there is no payment in the beta)

You can request account deletion from **Settings → Privacy → Delete My Account**. This removes all your data from Supabase within 30 days.

---

## 15. Important Disclaimers

> [!CAUTION]
> Please read these carefully before participating in the beta.

**Beta software disclaimer:**  
CareerTwin v1.0.0-beta is pre-release software. It may contain bugs, incomplete features, and unexpected behaviour. The CareerTwin team makes no warranty — express or implied — regarding the reliability, availability, or fitness for any purpose of this beta software.

**No certification guarantees:**  
Completing courses, passing mock exams, and finishing projects on CareerTwin does **not** grant any industry certification, professional qualification, or credential recognised by employers, educational institutions, or certification bodies (such as CompTIA, Microsoft, Google, AWS, Cisco, or any other organisation). CareerTwin is a learning aid, not an accredited certification provider.

**No employment guarantees:**  
Using CareerTwin does not guarantee, promise, or imply any likelihood of employment, job placement, salary increase, or career advancement. Any career outcome depends entirely on your own effort, skills, employer requirements, and market conditions beyond CareerTwin's control.

**AI content accuracy:**  
The AI Tutor is powered by a large language model. Its responses may occasionally be incorrect, out of date, or misleading. Always verify AI explanations against official documentation (linked in each course's Resources section) before treating them as authoritative.

**Data loss risk:**  
As beta software, CareerTwin may undergo database migrations or resets during the programme. While the team will make every reasonable effort to preserve your progress, **there is no data persistence guarantee during beta**. Back up any important work you submit.

---

*CareerTwin Beta Programme — Guide v1.0.0-beta*  
*Questions? Use the in-app Feedback button or contact the beta coordinator directly.*
