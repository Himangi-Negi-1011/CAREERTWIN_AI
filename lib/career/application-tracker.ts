import fs from "fs/promises";
import path from "path";
import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "saved",
  "preparing",
  "applied",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const applicationRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  opportunityId: z.string().optional(),
  company: z.string().trim().min(1).max(160),
  role: z.string().trim().min(1).max(160),
  jobUrl: z.string().url().or(z.literal("")).optional(),
  status: applicationStatusSchema,
  resumeVersion: z.string().max(80).optional(),
  notes: z.string().max(4000).default(""),
  appliedDate: z.string().nullable().optional(),
  upcomingInterviewDate: z.string().nullable().optional(),
  nextAction: z.string().max(300).optional(),
  followUpDate: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApplicationRecord = z.infer<typeof applicationRecordSchema>;

const DATA_FILE = path.join(process.cwd(), ".data", "career-applications.json");

async function readAllApplications(): Promise<ApplicationRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAllApplications(records: ApplicationRecord[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist applications to disk:", err);
  }
}

export async function getUserApplications(userId: string): Promise<ApplicationRecord[]> {
  const all = await readAllApplications();
  return all.filter((a) => a.userId === userId);
}

export async function saveUserApplication(
  userId: string,
  data: Partial<ApplicationRecord> & { company: string; role: string; status: ApplicationStatus }
): Promise<ApplicationRecord> {
  const all = await readAllApplications();
  const now = new Date().toISOString();

  let targetId = data.id;
  let existingIndex = -1;

  if (targetId) {
    existingIndex = all.findIndex((a) => a.id === targetId && a.userId === userId);
  }

  if (existingIndex >= 0) {
    const updated: ApplicationRecord = {
      ...all[existingIndex],
      ...data,
      id: all[existingIndex].id,
      userId,
      updatedAt: now,
    };
    all[existingIndex] = updated;
    await writeAllApplications(all);
    return updated;
  } else {
    const newRecord: ApplicationRecord = {
      id: targetId || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      opportunityId: data.opportunityId,
      company: data.company.trim(),
      role: data.role.trim(),
      jobUrl: data.jobUrl || "",
      status: data.status,
      resumeVersion: data.resumeVersion || "Standard Tech Resume v1",
      notes: data.notes || "",
      appliedDate: data.appliedDate || (data.status === "applied" ? now.slice(0, 10) : null),
      upcomingInterviewDate: data.upcomingInterviewDate || null,
      nextAction: data.nextAction || "Review role requirements in Career Twin",
      followUpDate: data.followUpDate || null,
      createdAt: now,
      updatedAt: now,
    };
    all.push(newRecord);
    await writeAllApplications(all);
    return newRecord;
  }
}

export async function deleteUserApplication(userId: string, applicationId: string): Promise<boolean> {
  const all = await readAllApplications();
  const filtered = all.filter((a) => !(a.userId === userId && a.id === applicationId));
  if (filtered.length !== all.length) {
    await writeAllApplications(filtered);
    return true;
  }
  return false;
}

export function exportApplicationsToCSV(applications: ApplicationRecord[]): string {
  const headers = [
    "ID",
    "Company",
    "Role",
    "Status",
    "Applied Date",
    "Upcoming Interview",
    "Next Action",
    "Follow Up Date",
    "Resume Version",
    "Job URL",
    "Notes",
    "Created At",
  ];

  const escapeCSV = (val: string | null | undefined) => {
    if (!val) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = applications.map((a) => [
    escapeCSV(a.id),
    escapeCSV(a.company),
    escapeCSV(a.role),
    escapeCSV(a.status),
    escapeCSV(a.appliedDate),
    escapeCSV(a.upcomingInterviewDate),
    escapeCSV(a.nextAction),
    escapeCSV(a.followUpDate),
    escapeCSV(a.resumeVersion),
    escapeCSV(a.jobUrl),
    escapeCSV(a.notes),
    escapeCSV(a.createdAt),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

