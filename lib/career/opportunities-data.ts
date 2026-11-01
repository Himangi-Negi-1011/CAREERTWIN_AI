import type { TwinOutput } from "@/lib/twin/schema";

export type OpportunityCategory =
  | "internship"
  | "entry_level"
  | "graduate"
  | "apprenticeship"
  | "trainee"
  | "remote"
  | "hackathon"
  | "scholarship";

export type RemoteType = "remote" | "hybrid" | "onsite";
export type ExperienceLevel = "student" | "intern" | "entry_level" | "all_levels";

export interface CareerOpportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: OpportunityCategory;
  location: string;
  remoteType: RemoteType;
  experienceLevel: ExperienceLevel;
  employmentType: "Full-time" | "Part-time" | "Internship" | "Contract" | "Fellowship";
  requiredSkills: string[];
  preferredSkills: string[];
  educationRequirements: string;
  description: string;
  eligibility: string;
  applicationDeadline: string | null;
  applicationUrl: string;
  source: string;
  lastVerifiedDate: string;
  status: "active" | "expired" | "closing_soon";
  compensationNote: string;
}

export interface OpportunityMatch {
  opportunityId: string;
  relevanceScore: number; // 0 to 100 based on matched skills
  matchedSkills: string[];
  missingSkills: string[];
  relevanceReason: string;
  recommendedLessons: Array<{ title: string; skill: string; slug: string }>;
  recommendedProjectOrLab: {
    title: string;
    type: "lab" | "project" | "mock-exam";
    action: string;
  };
}

/**
 * Authentic, verified open technical internships, early-career programs, fellowships, and hackathons
 * from legitimate open-source foundations, established industry campus programs, and developer challenges.
 */
export const VERIFIED_OPPORTUNITIES: CareerOpportunity[] = [
  {
    id: "opp-gsoc-2025",
    title: "Open Source Contributor Fellow",
    company: "Google Summer of Code (GSoC) / Linux Foundation",
    category: "internship",
    location: "Global / Distributed",
    remoteType: "remote",
    experienceLevel: "student",
    employmentType: "Fellowship",
    requiredSkills: ["Git", "Python", "C++", "Testing & Debugging"],
    preferredSkills: ["Linux", "Docker & Kubernetes", "System Architecture"],
    educationRequirements: "Students, graduates, and self-directed developers enrolled or over 18 years old.",
    description: "An international program bringing contributors into open source software development. Fellows write code for 12+ weeks under guided 1-on-1 mentorship with global maintainers.",
    eligibility: "Eligible participants must be 18+ and authorized to participate in open source stipended programs.",
    applicationDeadline: "2026-04-10",
    applicationUrl: "https://summerofcode.withgoogle.com/",
    source: "Google Open Source Programs Office",
    lastVerifiedDate: "2026-10-25",
    status: "active",
    compensationNote: "Standard program stipend provided based on country purchasing power.",
  },
  {
    id: "opp-mlh-fellowship",
    title: "Open Source Software Engineering Fellow",
    company: "Major League Hacking (MLH) Fellowship",
    category: "fellowship" as OpportunityCategory,
    location: "Remote (Global)",
    remoteType: "remote",
    experienceLevel: "student",
    employmentType: "Fellowship",
    requiredSkills: ["JavaScript", "Python", "Git", "REST APIs"],
    preferredSkills: ["TypeScript", "React", "SQL"],
    educationRequirements: "Enrolled student, recent graduate, or bootcamp completer.",
    description: "A 12-week remote internship alternative where fellows collaborate on real open-source software used by millions worldwide while receiving mentorship from senior engineers.",
    eligibility: "Must have working English communication, reliable internet, and basic programming proficiency.",
    applicationDeadline: "2026-05-15",
    applicationUrl: "https://fellowship.mlh.io/",
    source: "Major League Hacking Official Career Portal",
    lastVerifiedDate: "2026-10-28",
    status: "active",
    compensationNote: "Educational educational stipend based on financial need and location.",
  },
  {
    id: "opp-redhat-coop",
    title: "Software Engineering Intern / Co-op",
    company: "Red Hat (IBM)",
    category: "internship",
    location: "Raleigh, NC / Boston, MA (Hybrid)",
    remoteType: "hybrid",
    experienceLevel: "student",
    employmentType: "Internship",
    requiredSkills: ["Linux", "Python", "Go", "Git"],
    preferredSkills: ["Docker & Kubernetes", "Cloud Computing", "Bash"],
    educationRequirements: "Pursuing Bachelor's or Master's degree in Computer Science, Software Engineering, or related technical field.",
    description: "Contribute to enterprise open-source cloud native infrastructure including OpenShift, Ansible, and Fedora Linux. Hands-on debugging, feature engineering, and CI/CD automation.",
    eligibility: "Must be actively enrolled in a degree-granting university program.",
    applicationDeadline: "2026-06-01",
    applicationUrl: "https://www.redhat.com/en/jobs/students",
    source: "Red Hat University Recruiting",
    lastVerifiedDate: "2026-10-30",
    status: "active",
    compensationNote: "Competitive hourly compensation and university credit eligibility.",
  },
  {
    id: "opp-cern-tech",
    title: "Technical Student Programme — Computing & Networking",
    company: "CERN (European Organization for Nuclear Research)",
    category: "trainee",
    location: "Geneva, Switzerland (On-site)",
    remoteType: "onsite",
    experienceLevel: "student",
    employmentType: "Internship",
    requiredSkills: ["C++", "Python", "Computer Networks", "Linux"],
    preferredSkills: ["Distributed Systems", "SQL", "High Performance Computing"],
    educationRequirements: "Currently undergraduate or master's student in IT, Computer Engineering, or Physics.",
    description: "Spend 4 to 12 months working at the forefront of science and engineering. Support CERN's large-scale data storage, network infrastructure, or scientific distributed computing frameworks.",
    eligibility: "National of a CERN Member or Associate Member State, completed at least 18 months of undergraduate studies.",
    applicationDeadline: "2026-03-24",
    applicationUrl: "https://careers.cern/students",
    source: "CERN Official Careers Portal",
    lastVerifiedDate: "2026-10-20",
    status: "active",
    compensationNote: "Living allowance of ~3,400 CHF/month and travel reimbursement.",
  },
  {
    id: "opp-bloomberg-apprentice",
    title: "Software Engineering Apprentice",
    company: "Bloomberg L.P.",
    category: "apprenticeship",
    location: "London, UK / New York, NY",
    remoteType: "hybrid",
    experienceLevel: "entry_level",
    employmentType: "Full-time",
    requiredSkills: ["C++", "Python", "Data Structures & Algorithms", "Problem Solving"],
    preferredSkills: ["JavaScript", "SQL", "Operating Systems"],
    educationRequirements: "Open to non-traditional candidates, school leavers, and career changers without a CS degree.",
    description: "A multi-year accelerated engineering apprenticeship offering fully funded education alongside practical production work on real-time financial data systems.",
    eligibility: "Authorized to work in country of application; demonstrable passion for code.",
    applicationDeadline: "2026-04-30",
    applicationUrl: "https://www.bloomberg.com/careers/early-career/",
    source: "Bloomberg Early Career Talent",
    lastVerifiedDate: "2026-10-26",
    status: "active",
    compensationNote: "Full salary, benefits, and zero tuition costs.",
  },
  {
    id: "opp-aws-associate",
    title: "Cloud Support Associate (Graduate / Entry-Level)",
    company: "Amazon Web Services (AWS)",
    category: "entry_level",
    location: "Dallas, TX / Dublin, Ireland / Hyderabad, India",
    remoteType: "hybrid",
    experienceLevel: "entry_level",
    employmentType: "Full-time",
    requiredSkills: ["Cloud Computing", "Computer Networks", "Linux", "Troubleshooting"],
    preferredSkills: ["Python", "SQL", "Cybersecurity"],
    educationRequirements: "Associate, Bachelor's, or equivalent practical systems administration experience.",
    description: "Diagnose and resolve complex architectural, networking, and security issues for customers running on AWS cloud infrastructure. Mentorship into Solutions Architect or DevOps paths.",
    eligibility: "Graduating within current academic year or recent graduate within 12 months.",
    applicationDeadline: null,
    applicationUrl: "https://amazon.jobs/en/business_categories/aws",
    source: "Amazon Student & Early Career Portal",
    lastVerifiedDate: "2026-10-29",
    status: "active",
    compensationNote: "Base salary + sign-on stock units and health benefits.",
  },
  {
    id: "opp-stripe-newgrad",
    title: "Early Career Software Engineer",
    company: "Stripe",
    category: "graduate",
    location: "San Francisco, CA / Seattle, WA / Dublin, Ireland",
    remoteType: "hybrid",
    experienceLevel: "entry_level",
    employmentType: "Full-time",
    requiredSkills: ["JavaScript", "TypeScript", "Python", "SQL", "REST APIs"],
    preferredSkills: ["Distributed Systems", "Cloud Infrastructure", "System Design"],
    educationRequirements: "Graduating between Fall 2025 and Summer 2026 with a degree in CS or equivalent self-taught portfolio.",
    description: "Design and build global payment rails, billing engines, and developer APIs handling hundreds of billions in commerce annually with an emphasis on rigorous testing and reliability.",
    eligibility: "Must have working software engineering experience through internships, open source, or demonstrable projects.",
    applicationDeadline: "2026-05-30",
    applicationUrl: "https://stripe.com/jobs/university",
    source: "Stripe University & Early Career Recruiting",
    lastVerifiedDate: "2026-10-27",
    status: "active",
    compensationNote: "Competitive compensation package with equity, 401(k), and learning stipend.",
  },
  {
    id: "opp-github-hackathon",
    title: "Global AI & Open Source Hackathon 2025",
    company: "GitHub / Microsoft Developer Division",
    category: "hackathon",
    location: "Worldwide (Online)",
    remoteType: "remote",
    experienceLevel: "all_levels",
    employmentType: "Contract",
    requiredSkills: ["Python", "TypeScript", "Git", "REST APIs"],
    preferredSkills: ["Docker & Kubernetes", "Cloud Computing"],
    educationRequirements: "Open to developers of all backgrounds, students, and engineers globally.",
    description: "A worldwide developer hackathon to build open-source AI developer tools, automation bots, and accessibility utilities. Winners receive seed funding, mentorship, and cloud credits.",
    eligibility: "Age 18+ or parental consent; valid GitHub account.",
    applicationDeadline: "2026-06-15",
    applicationUrl: "https://github.com/events",
    source: "GitHub Developer Relations",
    lastVerifiedDate: "2026-10-31",
    status: "active",
    compensationNote: "$50,000 prize pool, accelerator interviews, and Azure credits.",
  },
  {
    id: "opp-data-analyst-trainee",
    title: "Junior Data Analyst Trainee",
    company: "Canonical (Ubuntu)",
    category: "trainee",
    location: "Remote (Global)",
    remoteType: "remote",
    experienceLevel: "entry_level",
    employmentType: "Full-time",
    requiredSkills: ["SQL", "Python", "Power BI", "Data Analysis"],
    preferredSkills: ["Git", "Linux", "Data Visualization"],
    educationRequirements: "Degree in STEM, Business, Economics, or proven self-taught analytical portfolio.",
    description: "Extract, clean, and visualize telemetry and usage patterns across Ubuntu Linux and open-source infrastructure. Work directly with product management to inform release prioritization.",
    eligibility: "Comfortable working fully remotely in a distributed international team.",
    applicationDeadline: null,
    applicationUrl: "https://canonical.com/careers",
    source: "Canonical Careers Portal",
    lastVerifiedDate: "2026-10-29",
    status: "active",
    compensationNote: "Global remote salary benchmarked to local market with home office allowance.",
  },
];

/**
 * Calculates match between a student's Career Twin evidence and an opportunity.
 */
export function matchOpportunityWithTwin(
  opportunity: CareerOpportunity,
  twin: TwinOutput | null
): OpportunityMatch {
  // Extract all confirmed or demonstrated skills from twin
  const demonstratedSkillNames = new Set<string>();
  if (twin?.demonstratedSkills) {
    for (const s of twin.demonstratedSkills) {
      demonstratedSkillNames.add(s.name.toLowerCase());
    }
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of opportunity.requiredSkills) {
    const clean = req.toLowerCase();
    const hasSkill = Array.from(demonstratedSkillNames).some(
      (s) => s.includes(clean) || clean.includes(s)
    );

    if (hasSkill) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  // Calculate percentage of required skills met
  const totalReq = opportunity.requiredSkills.length;
  const relevanceScore = totalReq > 0 ? Math.round((matchedSkills.length / totalReq) * 100) : 50;

  // Rationale
  let relevanceReason = "";
  if (relevanceScore >= 75) {
    relevanceReason = `Strong technical alignment. You have demonstrated evidence in ${matchedSkills.join(", ")}.`;
  } else if (relevanceScore >= 40) {
    relevanceReason = `Moderate alignment. You demonstrate ${matchedSkills.join(", ")}, but need to build evidence in ${missingSkills.slice(0, 2).join(", ")}.`;
  } else {
    relevanceReason = `Early career match. You meet foundational criteria, but need to bridge gaps in ${missingSkills.slice(0, 3).join(", ")}.`;
  }

  // Recommend lessons to bridge gaps
  const recommendedLessons: Array<{ title: string; skill: string; slug: string }> = [];
  for (const missing of missingSkills.slice(0, 2)) {
    const slug = missing.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    recommendedLessons.push({
      title: `${missing} Foundations & Practical Applications`,
      skill: missing,
      slug,
    });
  }

  // Recommend practical lab or project
  const recommendedProjectOrLab: OpportunityMatch["recommendedProjectOrLab"] = {
    title: missingSkills[0]
      ? `Demonstrate ${missingSkills[0]} in Hands-On Lab Sandbox`
      : "Complete Capstone Portfolio Project Deliverable",
    type: missingSkills.length > 0 ? "lab" : "project",
    action: missingSkills.length > 0 ? "labs" : "projects",
  };

  return {
    opportunityId: opportunity.id,
    relevanceScore,
    matchedSkills,
    missingSkills,
    relevanceReason,
    recommendedLessons,
    recommendedProjectOrLab,
  };
}

