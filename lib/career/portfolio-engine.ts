import fs from "fs/promises";
import path from "path";
import { z } from "zod";

export const studentPortfolioSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  slug: z.string().min(2).max(100),
  name: z.string().min(1).max(120),
  headline: z.string().max(200),
  bio: z.string().max(2000),
  targetRole: z.string().max(120),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string().optional(),
    })
  ).default([]),
  verifiedSkills: z.array(
    z.object({
      name: z.string(),
      score: z.number().optional(),
      verifiedAt: z.string(),
      source: z.string().default("CareerTwin Competency Assessment"),
    })
  ).default([]),
  projects: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      outcome: z.string(),
      deliverableUrl: z.string().optional(),
      skills: z.array(z.string()).default([]),
      completedAt: z.string().optional(),
    })
  ).default([]),
  certificates: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      issueDate: z.string(),
      verificationUrl: z.string(),
    })
  ).default([]),
  links: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }).default({}),
  privacySettings: z.object({
    isPublic: z.boolean().default(false), // Private by default as required
    showEmail: z.boolean().default(false),
    showScores: z.boolean().default(true),
  }).default({ isPublic: false, showEmail: false, showScores: true }),
  updatedAt: z.string(),
});

export type StudentPortfolio = z.infer<typeof studentPortfolioSchema>;

async function getSupabaseSafe() {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

const PORTFOLIO_FILE = path.join(process.cwd(), ".data", "student-portfolios.json");

async function readPortfolios(): Promise<StudentPortfolio[]> {
  try {
    const raw = await fs.readFile(PORTFOLIO_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writePortfolios(records: StudentPortfolio[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(PORTFOLIO_FILE), { recursive: true });
    await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist student portfolios:", err);
  }
}

export async function getUserPortfolio(userId: string): Promise<StudentPortfolio | null> {
  // 1. Try Supabase cloud database first if configured
  try {
    const db = await getSupabaseSafe();
    if (db) {
      const { data, error } = await db
        .from("student_portfolios")
        .select("portfolio_document")
        .eq("owner_clerk_user_id", userId)
        .maybeSingle();

      if (!error && data?.portfolio_document) {
        return studentPortfolioSchema.parse(data.portfolio_document);
      }
    }
  } catch {
    // Fall back to local file
  }

  // 2. Fall back to local file
  const all = await readPortfolios();
  return all.find((p) => p.userId === userId) || null;
}

export async function getPublicPortfolioBySlugOrId(identifier: string): Promise<StudentPortfolio | null> {
  // 1. Try Supabase cloud database first if configured
  try {
    const db = await getSupabaseSafe();
    if (db) {
      const { data, error } = await db
        .from("student_portfolios")
        .select("portfolio_document, is_public")
        .or(`slug.eq.${identifier},id.eq.${identifier},owner_clerk_user_id.eq.${identifier}`)
        .eq("is_public", true)
        .maybeSingle();

      if (!error && data?.portfolio_document) {
        const parsed = studentPortfolioSchema.parse(data.portfolio_document);
        return {
          ...parsed,
          privacySettings: {
            isPublic: true,
            showEmail: parsed.privacySettings.showEmail,
            showScores: parsed.privacySettings.showScores,
          },
          verifiedSkills: parsed.privacySettings.showScores
            ? parsed.verifiedSkills
            : parsed.verifiedSkills.map((s) => ({ ...s, score: undefined })),
        };
      }
    }
  } catch {
    // Fall back to local file
  }

  // 2. Fall back to local file
  const all = await readPortfolios();
  const match = all.find(
    (p) => (p.slug === identifier || p.id === identifier || p.userId === identifier) && p.privacySettings.isPublic
  );
  if (!match) return null;

  // Clone and sanitize private data
  return {
    ...match,
    // Do not leak sensitive personal details
    privacySettings: {
      isPublic: true,
      showEmail: match.privacySettings.showEmail,
      showScores: match.privacySettings.showScores,
    },
    verifiedSkills: match.privacySettings.showScores
      ? match.verifiedSkills
      : match.verifiedSkills.map((s) => ({ ...s, score: undefined })),
  };
}

export async function saveUserPortfolio(
  userId: string,
  data: Partial<StudentPortfolio>
): Promise<StudentPortfolio> {
  const all = await readPortfolios();
  const now = new Date().toISOString();

  const existingIndex = all.findIndex((p) => p.userId === userId);
  const baseSlug = (data.name || "student").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  let resultRecord: StudentPortfolio;

  if (existingIndex >= 0) {
    const updated: StudentPortfolio = {
      ...all[existingIndex],
      ...data,
      userId,
      id: all[existingIndex].id,
      updatedAt: now,
    };
    all[existingIndex] = updated;
    resultRecord = updated;
  } else {
    const newRecord: StudentPortfolio = {
      id: `port-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      slug: data.slug || `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name || "CareerTwin Student",
      headline: data.headline || "Aspiring Engineer & Problem Solver",
      bio: data.bio || "Building industry skills and hands-on deliverables on CareerTwin.",
      targetRole: data.targetRole || "Software Developer",
      education: data.education || [],
      verifiedSkills: data.verifiedSkills || [],
      projects: data.projects || [],
      certificates: data.certificates || [],
      links: data.links || {},
      privacySettings: data.privacySettings || { isPublic: false, showEmail: false, showScores: true },
      updatedAt: now,
    };
    all.push(newRecord);
    resultRecord = newRecord;
  }

  // 1. Persist to Supabase cloud database if configured
  try {
    const db = await getSupabaseSafe();
    if (db) {
      await db.from("student_portfolios").upsert({
        id: resultRecord.id,
        owner_clerk_user_id: userId,
        slug: resultRecord.slug,
        portfolio_document: resultRecord,
        is_public: resultRecord.privacySettings.isPublic,
        updated_at: resultRecord.updatedAt,
      });
    }
  } catch (err) {
    console.warn("Supabase portfolio upsert skipped or failed:", err);
  }

  // 2. Persist locally as fallback
  await writePortfolios(all);
  return resultRecord;
}

