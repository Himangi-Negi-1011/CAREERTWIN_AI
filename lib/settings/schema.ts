import { z } from "zod";

export const appSettingsSchema = z.object({
  // Privacy
  allowProfileContext: z.boolean().default(false),
  allowHistoryPersonalization: z.boolean().default(false),
  retainTranscripts: z.boolean().default(true),
  // Learning Preferences
  preferredField: z.string().default("Software Development"),
  learningDifficulty: z.enum(["foundation", "beginner", "intermediate", "advanced"]).default("beginner"),
  learningStyle: z.string().default("hands-on"),
  weeklyHoursGoal: z.number().int().min(1).max(60).default(10),
  dailyMinutesTarget: z.number().int().min(10).max(360).default(45),
  preferredStudyTime: z.string().default("evening"),
  courseInterests: z.array(z.string()).default(["Python", "JavaScript", "SQL"]),
  preferredLanguages: z.array(z.string()).default(["Python", "TypeScript"]),
  // AI Preferences
  aiTutorDifficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  explanationDepth: z.enum(["concise", "detailed"]).default("detailed"),
  assistanceMode: z.enum(["hint-first", "solution-first"]).default("hint-first"),
  aiLanguage: z.string().default("English"),
  // Appearance
  theme: z.enum(["dark", "light", "system"]).default("dark"),
  highContrast: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  // Notifications
  learningReminders: z.boolean().default(true),
  assessmentReminders: z.boolean().default(true),
  weeklyProgressSummaries: z.boolean().default(true),
  courseAnnouncements: z.boolean().default(true),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const defaultSettings: AppSettings = {
  allowProfileContext: false,
  allowHistoryPersonalization: false,
  retainTranscripts: true,
  preferredField: "Software Development",
  learningDifficulty: "beginner",
  learningStyle: "hands-on",
  weeklyHoursGoal: 10,
  dailyMinutesTarget: 45,
  preferredStudyTime: "evening",
  courseInterests: ["Python", "JavaScript", "SQL"],
  preferredLanguages: ["Python", "TypeScript"],
  aiTutorDifficulty: "beginner",
  explanationDepth: "detailed",
  assistanceMode: "hint-first",
  aiLanguage: "English",
  theme: "dark",
  highContrast: false,
  reducedMotion: false,
  learningReminders: true,
  assessmentReminders: true,
  weeklyProgressSummaries: true,
  courseAnnouncements: true,
};
