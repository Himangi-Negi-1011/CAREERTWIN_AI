import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { z } from "zod";

export const achievementRecordSchema = z.object({
  id: z.string().min(1), // CT-VERIFY-XXXXXX
  userId: z.string().min(1),
  studentName: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  category: z.enum([
    "course_completion",
    "learning_path",
    "phase_assessment",
    "practical_lab",
    "applied_project",
    "mock_interview",
    "skill_verification",
  ]),
  courseOrAssessment: z.string().min(1).max(200),
  issueDate: z.string(),
  verificationUrl: z.string(),
  issuingOrganization: z.literal("CareerTwin AI"),
  disclaimer: z.string(),
  skills: z.array(z.string()).default([]),
  score: z.number().optional(),
});

export type AchievementRecord = z.infer<typeof achievementRecordSchema>;

const ACHIEVEMENTS_FILE = path.join(process.cwd(), ".data", "career-achievements.json");

async function readAchievements(): Promise<AchievementRecord[]> {
  try {
    const raw = await fs.readFile(ACHIEVEMENTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAchievements(records: AchievementRecord[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(ACHIEVEMENTS_FILE), { recursive: true });
    await fs.writeFile(ACHIEVEMENTS_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist achievement records:", err);
  }
}

export function generateVerificationId(): string {
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CT-VERIFY-${randomHex}`;
}

export async function getUserAchievements(userId: string): Promise<AchievementRecord[]> {
  const all = await readAchievements();
  return all.filter((a) => a.userId === userId);
}

export async function getAchievementById(id: string): Promise<AchievementRecord | null> {
  const all = await readAchievements();
  return all.find((a) => a.id === id) || null;
}

export async function issueAchievement(params: {
  userId: string;
  studentName: string;
  title: string;
  category: AchievementRecord["category"];
  courseOrAssessment: string;
  skills: string[];
  score?: number;
}): Promise<AchievementRecord> {
  const all = await readAchievements();
  const id = generateVerificationId();
  const now = new Date().toISOString();

  const record: AchievementRecord = {
    id,
    userId: params.userId,
    studentName: params.studentName || "CareerTwin Scholar",
    title: params.title,
    category: params.category,
    courseOrAssessment: params.courseOrAssessment,
    issueDate: now,
    verificationUrl: `/verify/${id}`,
    issuingOrganization: "CareerTwin AI",
    disclaimer:
      "This achievement record verifies that the recipient completed the hands-on curriculum, practical labs, and competency evaluations on CareerTwin. It is issued directly by CareerTwin and does not constitute an accredited university degree or proprietary third-party vendor certification.",
    skills: params.skills,
    score: params.score,
  };

  all.push(record);
  await writeAchievements(all);
  return record;
}

