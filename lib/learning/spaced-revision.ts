import path from "path";
import fs from "fs/promises";
import { getSubjectSpec } from "./domain-knowledge";
import { recordTopicEvidence } from "./repository";

export const INTERVAL_DAYS_MAP: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export interface SpacedRevisionItem {
  id: string;
  topicName: string;
  skillName: string;
  courseSlug: string;
  box: number; // 1 to 5
  intervalDays: number;
  lastReviewedAt: string;
  nextReviewDate: string; // ISO date YYYY-MM-DD
  consecutiveSuccesses: number;
  totalReviews: number;
  struggling: boolean;
  recallQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  conceptCard: {
    summary: string;
    keyTakeaway: string;
    codeSnippet?: string;
    commonTrap: string;
  };
}

export interface StudentRevisionState {
  userId: string;
  items: Record<string, SpacedRevisionItem>;
  history: Array<{
    itemId: string;
    topicName: string;
    correct: boolean;
    reviewedAt: string;
    boxBefore: number;
    boxAfter: number;
  }>;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data", "learning", "spaced_revision");

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // Ignore
  }
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, filePath);
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Creates or retrieves the spaced revision queue for a user.
 */
export async function getStudentRevisionState(userId: string): Promise<StudentRevisionState> {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  const existing = await readJson<StudentRevisionState>(filePath);
  if (existing) return existing;

  return {
    userId,
    items: {},
    history: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function saveStudentRevisionState(
  userId: string,
  state: StudentRevisionState
): Promise<void> {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  await writeJson(filePath, state);
}

/**
 * Enqueues or updates a topic in the student's spaced revision schedule.
 * If the student struggled with the topic (e.g. failed an assessment or quiz),
 * the item drops to Box 1 (1-day review) immediately.
 */
export async function enqueueTopicForRevision(
  userId: string,
  input: {
    topicName: string;
    skillName: string;
    courseSlug: string;
    struggled?: boolean;
  }
): Promise<SpacedRevisionItem> {
  const state = await getStudentRevisionState(userId);
  const itemId = `${input.courseSlug}-${input.topicName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const now = new Date();
  const existing = state.items[itemId];

  const spec = getSubjectSpec(input.skillName, input.topicName, "rev-1");

  const box = input.struggled ? 1 : existing ? existing.box : 1;
  const intervalDays = INTERVAL_DAYS_MAP[box] || 1;
  const nextReviewDate = formatDate(addDays(now, input.struggled ? 0 : intervalDays));

  const item: SpacedRevisionItem = {
    id: itemId,
    topicName: input.topicName,
    skillName: input.skillName,
    courseSlug: input.courseSlug,
    box,
    intervalDays,
    lastReviewedAt: existing ? existing.lastReviewedAt : now.toISOString(),
    nextReviewDate,
    consecutiveSuccesses: input.struggled ? 0 : existing ? existing.consecutiveSuccesses : 0,
    totalReviews: existing ? existing.totalReviews : 0,
    struggling: input.struggled || (existing ? existing.struggling : false),
    recallQuestion: {
      prompt: `Regarding ${input.topicName} in ${input.skillName}, what is the critical architectural invariant to uphold?`,
      options: [
        spec.keyPoints[0] || "Validate contract boundaries and handle edge cases defensively upfront.",
        "Perform deep mutation on global state across asynchronous callbacks.",
        "Disable runtime assertions to minimize binary size.",
        "Rely on implicit coercion instead of explicit type guards.",
      ],
      correctIndex: 0,
      explanation:
        spec.codeExplanation ||
        "Upholding explicit contracts and defensive guards prevents unexpected runtime side-effects.",
    },
    conceptCard: {
      summary: spec.mentalModelText.slice(0, 300),
      keyTakeaway: spec.keyPoints[0] || "Maintain explicit type safety and separation of concerns.",
      codeSnippet: spec.codeSnippet,
      commonTrap: spec.commonMistakes[0] || "Overlooking boundary cases on empty or null inputs.",
    },
  };

  state.items[itemId] = item;
  state.updatedAt = now.toISOString();
  await saveStudentRevisionState(userId, state);
  return item;
}

/**
 * Returns all topics that are due for revision today or overdue.
 */
export async function getDueRevisionItems(
  userId: string,
  targetDate?: string
): Promise<SpacedRevisionItem[]> {
  const state = await getStudentRevisionState(userId);
  const checkDate = targetDate || formatDate(new Date());

  return Object.values(state.items).filter((item) => item.nextReviewDate <= checkDate);
}

/**
 * Submits a recall attempt for a revision card.
 * If correct: advances to next box (e.g. 1d -> 3d -> 7d -> 14d -> 30d).
 * If incorrect: resets to Box 1 (1d interval).
 */
export async function submitRecallAttempt(
  userId: string,
  itemId: string,
  correct: boolean
): Promise<{ item: SpacedRevisionItem; boxChanged: boolean; message: string }> {
  const state = await getStudentRevisionState(userId);
  const item = state.items[itemId];
  if (!item) {
    throw new Error(`Revision item "${itemId}" not found for user.`);
  }

  const now = new Date();
  const boxBefore = item.box;
  let boxAfter = boxBefore;

  if (correct) {
    boxAfter = Math.min(5, boxBefore + 1);
    item.consecutiveSuccesses += 1;
    item.struggling = false;
  } else {
    boxAfter = 1;
    item.consecutiveSuccesses = 0;
    item.struggling = true;
  }

  const intervalDays = INTERVAL_DAYS_MAP[boxAfter] || 1;
  item.box = boxAfter;
  item.intervalDays = intervalDays;
  item.lastReviewedAt = now.toISOString();
  item.nextReviewDate = formatDate(addDays(now, intervalDays));
  item.totalReviews += 1;

  state.history.unshift({
    itemId,
    topicName: item.topicName,
    correct,
    reviewedAt: now.toISOString(),
    boxBefore,
    boxAfter,
  });
  if (state.history.length > 50) state.history = state.history.slice(0, 50);

  state.updatedAt = now.toISOString();
  await saveStudentRevisionState(userId, state);

  // Automatically sync to topic mastery evidence
  void recordTopicEvidence(userId, {
    id: `rev-${itemId}-${Date.now()}`,
    type: "revision_recall",
    topic: item.topicName,
    skillName: item.skillName,
    courseSlug: item.courseSlug,
    sourceId: itemId,
    sourceTitle: `Spaced Revision: ${item.topicName}`,
    score: correct ? 100 : 40,
    passed: correct,
    notes: correct ? `Promoted to Box ${boxAfter} (${intervalDays}d interval)` : `Reset to Box 1 for rapid reinforcement`,
    timestamp: now.toISOString(),
  }).catch(() => {});

  return {
    item,
    boxChanged: boxBefore !== boxAfter,
    message: correct
      ? `Great recall! Scheduled next review in ${intervalDays} days (Box ${boxAfter}).`
      : `Marked for reinforcement. Scheduled for review tomorrow (Box 1).`,
  };
}

/**
 * Returns summary statistics of the student's spaced revision system.
 */
export async function getRevisionAnalytics(userId: string) {
  const state = await getStudentRevisionState(userId);
  const items = Object.values(state.items);
  const today = formatDate(new Date());

  const dueToday = items.filter((i) => i.nextReviewDate <= today);
  const struggling = items.filter((i) => i.struggling);
  const masteredRetention = items.filter((i) => i.box >= 4);

  return {
    totalTrackedTopics: items.length,
    dueTodayCount: dueToday.length,
    strugglingCount: struggling.length,
    masteredRetentionCount: masteredRetention.length,
    recentHistory: state.history.slice(0, 5),
  };
}

