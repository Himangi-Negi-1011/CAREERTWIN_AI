import { requirementsForRole } from "./roles";
import { twinInputSchema, twinOutputSchema, type TwinOutput } from "./schema";

function profileCompleteness(profile: ReturnType<typeof twinInputSchema.parse>["profile"]) {
  const checks = [profile.personal.fullName, profile.personal.status, profile.interests.targetRole, profile.interests.goals, profile.interests.experienceLevel, profile.education.length, profile.skills.length, profile.projects.length || profile.resume.fileName];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

export function calculateCareerTwin(raw: unknown, now = new Date()): TwinOutput {
  const { profile, source } = twinInputSchema.parse(raw);
  const targetRole = profile.interests.targetRole.trim();
  const requirements = targetRole ? requirementsForRole(targetRole) : [];
  const roleEvidence = source.evidence[targetRole]?.records ?? {};
  const profileSkills = new Map(profile.skills.map((skill) => [skill.name.toLowerCase(), skill]));
  const states = requirements.map((requirement) => {
    const record = roleEvidence[requirement.skill];
    const assessment = source.assessmentEvidence[requirement.skill];
    const listed = profileSkills.get(requirement.skill.toLowerCase());
    if (record?.status === "demonstrated" && record.evidence.trim()) return { name: requirement.skill, status: "demonstrated" as const, evidence: record.evidence };
    if (assessment?.score >= 70) return { name: requirement.skill, status: "assessed" as const, assessmentScore: assessment.score };
    if (record?.status === "learning" || listed?.learning || listed?.proficiency === "learning" || listed?.proficiency === "beginner") return { name: requirement.skill, status: "developing" as const };
    return { name: requirement.skill, status: "unverified" as const };
  });
  const demonstratedSkills = states.filter((state) => state.status === "demonstrated");
  const developingSkills = states.filter((state) => state.status === "developing" || state.status === "assessed");
  const unverifiedSkills = states.filter((state) => state.status === "unverified");
  const prioritizedGaps = requirements.flatMap((requirement, index) => {
    const state = states[index];
    if (state.status === "demonstrated") return [];
    const priority = index < 2 ? "high" as const : index < 4 ? "medium" as const : "low" as const;
    const reason = state.status === "assessed" ? `A short assessment showed understanding, but ${requirement.skill} still needs practical evidence.` : state.status === "developing" ? `${requirement.skill} is recorded as developing and needs a reviewable artifact or specific evidence.` : `CareerTwin has no evidence for ${requirement.skill}; this is not a claim that you lack the skill.`;
    return [{ skill: requirement.skill, status: state.status, priority, reason, prerequisites: requirement.prerequisites, estimatedMinutes: requirement.estimatedMinutes }];
  });
  const tasks = source.development.tasks;
  const completeTasks = tasks.filter((task) => task.done || task.status === "complete");
  const nextTasks = tasks.filter((task) => !task.done && task.status !== "complete").slice(0, 5).map((task) => ({ id: task.id, title: task.title, skill: task.skill || targetRole, status: task.status ?? "planned", estimatedMinutes: task.estimatedMinutes ?? 45 }));
  const weekly = source.weekly.activities;
  const completedWeekly = weekly.filter((activity) => activity.status === "complete");
  const latestAttempt = [...source.weekly.attempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const coverage = requirements.length ? Math.round(demonstratedSkills.length / requirements.length * 100) : null;
  let recommendedNextAction: TwinOutput["recommendedNextAction"];
  if (!targetRole) recommendedNextAction = { type: "profile", title: "Choose a target role", detail: "A target role is required before CareerTwin can compare evidence with role requirements.", destination: "/onboarding" };
  else if (!Object.keys(roleEvidence).length) recommendedNextAction = { type: "evidence", title: `Review ${requirements[0]?.skill ?? "your first role skill"}`, detail: "Record whether you are learning it or can demonstrate it, and add evidence when available.", destination: "/dashboard?view=skills" };
  else if (!tasks.length) recommendedNextAction = { type: "roadmap", title: `Plan practice for ${prioritizedGaps[0]?.skill ?? targetRole}`, detail: prioritizedGaps[0]?.reason ?? "Create a practical, evidence-led roadmap step.", destination: "/dashboard?view=roadmap" };
  else if (!weekly.length) recommendedNextAction = { type: "weekly", title: "Schedule the next unfinished roadmap task", detail: "Use your saved availability so the plan fits your actual week.", destination: "/dashboard?view=progress" };
  else if (!source.weekly.attempts.length) recommendedNextAction = { type: "assessment", title: "Take a relevant weekly assessment", detail: "The result can add limited knowledge evidence, but does not prove mastery.", destination: "/dashboard?view=progress" };
  else recommendedNextAction = { type: "review", title: nextTasks[0]?.title ?? `Review evidence for ${prioritizedGaps[0]?.skill ?? targetRole}`, detail: "Continue the highest-priority unfinished work recorded in your Twin.", destination: nextTasks.length ? "/dashboard?view=roadmap" : "/dashboard?view=skills" };
  return twinOutputSchema.parse({
    version: 1, targetRole, profileCompleteness: profileCompleteness(profile), demonstratedSkills, developingSkills, unverifiedSkills, requiredSkills: requirements.map((item) => item.skill), prioritizedGaps, recommendedNextAction,
    roadmap: { total: tasks.length, completed: completeTasks.length, nextTasks },
    weekly: { availableHours: source.weekly.settings.hours, plannedMinutes: weekly.reduce((sum, item) => sum + item.estimatedMinutes, 0), recordedMinutes: completedWeekly.reduce((sum, item) => sum + item.actualMinutes, 0), completed: completedWeekly.length, total: weekly.length },
    assessmentStatus: { attempts: source.weekly.attempts.length, lastCompletedAt: latestAttempt?.completedAt ?? null, assessedSkills: Object.keys(source.assessmentEvidence) },
    evidenceCoverage: { score: coverage, demonstrated: demonstratedSkills.length, required: requirements.length, meaning: "Percentage of this maintained role framework backed by user-recorded practical evidence. It is not job readiness or mastery." },
    limitations: ["Missing evidence is not proof that a skill is absent.", "Curated assessments measure a small sample and do not establish mastery.", "Role requirements are maintained reference guidance, not live labour-market data."],
    dataSources: ["Authenticated saved career profile", "User-recorded skill evidence", "Saved roadmap, projects, weekly activity, and curated assessment attempts", `CareerTwin maintained ${targetRole || "role"} framework`], calculatedAt: now.toISOString(),
  });
}
