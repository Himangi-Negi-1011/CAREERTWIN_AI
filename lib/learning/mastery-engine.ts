import { z } from "zod";

export const MASTERY_LEVELS = [
  "not_started",
  "learning",
  "practising",
  "needs_improvement",
  "demonstrating_understanding",
  "mastered",
] as const;

export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export const MASTERY_LEVEL_METADATA: Record<
  MasteryLevel,
  { label: string; badgeClass: string; description: string; scoreThreshold: string }
> = {
  not_started: {
    label: "Not Started",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    description: "No study activity or assessment attempted yet.",
    scoreThreshold: "0%",
  },
  learning: {
    label: "Learning",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Actively studying lesson material; initial check pending.",
    scoreThreshold: "In Progress",
  },
  practising: {
    label: "Practising",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Practising exercises and checks with developing accuracy (60–74%).",
    scoreThreshold: "60%–74%",
  },
  needs_improvement: {
    label: "Needs Improvement",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Recent assessment or quiz scored below 60%; targeted revision required.",
    scoreThreshold: "< 60%",
  },
  demonstrating_understanding: {
    label: "Demonstrating Understanding",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Verified strong performance (>= 75%) on a validated assessment.",
    scoreThreshold: "75%–84%",
  },
  mastered: {
    label: "Mastered",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Consistently demonstrated high competence (>= 80%) across multiple distinct assessments.",
    scoreThreshold: ">= 80% (Verified)",
  },
};

export const evidenceTypeSchema = z.enum([
  "lesson_knowledge_check",
  "module_assessment",
  "mock_test",
  "practical_lab",
  "revision_recall",
  "coding_submission",
]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;

export const masteryEvidenceSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).slice(2)),
  type: evidenceTypeSchema,
  topic: z.string().trim().min(1),
  skillName: z.string().trim().min(1),
  courseSlug: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
  sourceTitle: z.string().trim().optional(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  notes: z.string().trim().optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
});
export type MasteryEvidence = z.infer<typeof masteryEvidenceSchema>;

export interface TopicMasteryRecord {
  topicId: string;
  topicName: string;
  skillName: string;
  courseSlug: string;
  level: MasteryLevel;
  averageScore: number;
  recentScore: number;
  totalAttempts: number;
  successfulAttempts: number;
  lastAttemptAt: string;
  history: MasteryEvidence[];
}

export interface SkillMasteryOverview {
  skillName: string;
  courseSlug: string;
  totalTopics: number;
  masteredCount: number;
  demonstratingCount: number;
  practisingCount: number;
  needsImprovementCount: number;
  learningCount: number;
  notStartedCount: number;
  masteryPercentage: number;
  weakTopics: string[];
}

export interface StudentMasteryState {
  userId: string;
  topics: Record<string, TopicMasteryRecord>;
  updatedAt: string;
}

/**
 * Deterministically evaluates the new mastery level for a topic based on accumulated evidence.
 * Strict rules:
 * - Needs improvement if most recent score < 60%.
 * - Mastered requires at least 2 distinct attempts with score >= 80% and no recent failure.
 * - Demonstrating understanding requires at least 1 attempt >= 75%.
 * - Practising for 60-74%.
 */
export function evaluateTopicMastery(
  existing: TopicMasteryRecord | null,
  newEvidence: MasteryEvidence
): TopicMasteryRecord {
  const history = existing ? [...existing.history, newEvidence] : [newEvidence];
  const totalAttempts = history.length;
  const successfulAttempts = history.filter((e) => e.passed && e.score >= 70).length;

  const totalScore = history.reduce((acc, e) => acc + e.score, 0);
  const averageScore = Math.round(totalScore / totalAttempts);
  const recentScore = newEvidence.score;

  let level: MasteryLevel = "learning";

  if (recentScore < 60) {
    level = "needs_improvement";
  } else {
    // Count how many recent high scores (>= 80%) exist
    const highScores = history.filter((e) => e.score >= 80).length;

    if (highScores >= 2 && recentScore >= 80 && successfulAttempts >= 2) {
      level = "mastered";
    } else if (recentScore >= 75) {
      level = "demonstrating_understanding";
    } else if (recentScore >= 60) {
      level = "practising";
    }
  }

  const topicId = existing ? existing.topicId : `${newEvidence.courseSlug}-${normalizeTopicKey(newEvidence.topic)}`;

  return {
    topicId,
    topicName: newEvidence.topic,
    skillName: newEvidence.skillName,
    courseSlug: newEvidence.courseSlug,
    level,
    averageScore,
    recentScore,
    totalAttempts,
    successfulAttempts,
    lastAttemptAt: newEvidence.timestamp,
    history: history.slice(-20), // retain last 20 evidence logs
  };
}

export function normalizeTopicKey(topic: string): string {
  return topic
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Aggregates all topic mastery records for a specific skill.
 */
export function calculateSkillMasteryOverview(
  skillName: string,
  courseSlug: string,
  topicRecords: TopicMasteryRecord[]
): SkillMasteryOverview {
  const relevant = topicRecords.filter(
    (t) => t.skillName.toLowerCase() === skillName.toLowerCase() || t.courseSlug === courseSlug
  );

  let masteredCount = 0;
  let demonstratingCount = 0;
  let practisingCount = 0;
  let needsImprovementCount = 0;
  let learningCount = 0;
  let notStartedCount = 0;
  const weakTopics: string[] = [];

  for (const t of relevant) {
    switch (t.level) {
      case "mastered":
        masteredCount++;
        break;
      case "demonstrating_understanding":
        demonstratingCount++;
        break;
      case "practising":
        practisingCount++;
        break;
      case "needs_improvement":
        needsImprovementCount++;
        weakTopics.push(t.topicName);
        break;
      case "learning":
        learningCount++;
        break;
      case "not_started":
      default:
        notStartedCount++;
        break;
    }
  }

  const totalTopics = relevant.length;
  // Weighted calculation based on real evidence:
  // Mastered = 100%, Demonstrating = 80%, Practising = 50%, Learning = 25%, Needs Improvement = 10%
  const totalWeighted =
    masteredCount * 1.0 +
    demonstratingCount * 0.8 +
    practisingCount * 0.5 +
    learningCount * 0.25 +
    needsImprovementCount * 0.1;

  const masteryPercentage = totalTopics > 0 ? Math.round((totalWeighted / totalTopics) * 100) : 0;

  return {
    skillName,
    courseSlug,
    totalTopics,
    masteredCount,
    demonstratingCount,
    practisingCount,
    needsImprovementCount,
    learningCount,
    notStartedCount,
    masteryPercentage,
    weakTopics,
  };
}

