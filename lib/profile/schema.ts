import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).default("");

export const educationSchema = z.object({
  id: z.string(),
  institution: optionalText(160),
  degree: optionalText(120),
  field: optionalText(120),
  course: optionalText(120),
  startYear: optionalText(4),
  graduationYear: optionalText(4),
  status: optionalText(40),
  grade: optionalText(30),
  currentYear: z.string().optional(),
  currentSemester: z.string().optional(),
  coursework: z.string().optional(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(80),
  category: optionalText(60),
  proficiency: z.enum(["learning", "beginner", "intermediate", "advanced"]),
  learning: z.boolean(),
  evidence: z.string().optional(),
  yearsExperience: z.string().optional(),
  isStrength: z.boolean().optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  kind: z.enum(["project", "internship", "experience", "certification", "achievement"]),
  title: z.string().trim().min(1).max(160),
  description: optionalText(1200),
  technologies: optionalText(500),
  contribution: optionalText(600),
  url: optionalText(500),
  status: optionalText(40),
});

export const careerProfileSchema = z.object({
  personal: z.object({
    fullName: optionalText(120),
    headline: optionalText(160),
    status: z.enum(["", "student", "fresher", "employed", "career-switcher", "other"]),
    location: optionalText(120),
    bio: optionalText(800),
    photoUrl: optionalText(1000),
    linkedInUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
    preferredLanguage: z.string().optional(),
  }),
  education: z.array(educationSchema).max(12),
  skills: z.array(skillSchema).max(100),
  projects: z.array(projectSchema).max(30),
  resume: z.object({
    fileName: optionalText(255),
    size: z.number().nonnegative().max(5_242_880).default(0),
    status: z.enum(["none", "selected", "uploaded", "processing", "review", "failed"]).default("none"),
    storagePath: optionalText(1000),
  }),
  interests: z.object({
    desiredCareer: optionalText(120),
    targetRole: optionalText(120),
    industry: optionalText(120),
    goals: optionalText(1000),
    experienceLevel: optionalText(80),
    workArrangement: optionalText(80),
    preferredLocation: optionalText(120),
    shortTermGoals: z.string().optional(),
    longTermGoals: z.string().optional(),
    targetCompanies: z.string().optional(),
    weeklyHours: z.string().optional(),
    learningStyle: z.string().optional(),
  }),
  completedSteps: z.array(z.number().int().min(1).max(7)).max(7).default([]),
  currentStep: z.number().int().min(1).max(7).default(1),
  updatedAt: z.string().datetime().optional(),
});

export type CareerProfileData = z.infer<typeof careerProfileSchema>;

export const emptyCareerProfile: CareerProfileData = {
  personal: {
    fullName: "",
    headline: "",
    status: "",
    location: "",
    bio: "",
    photoUrl: "",
    linkedInUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    preferredLanguage: "English",
  },
  education: [],
  skills: [],
  projects: [],
  resume: {
    fileName: "",
    size: 0,
    status: "none",
    storagePath: "",
  },
  interests: {
    desiredCareer: "",
    targetRole: "",
    industry: "",
    goals: "",
    experienceLevel: "",
    workArrangement: "",
    preferredLocation: "",
    shortTermGoals: "",
    longTermGoals: "",
    targetCompanies: "",
    weeklyHours: "10",
    learningStyle: "Hands-on practice",
  },
  completedSteps: [],
  currentStep: 1,
};
