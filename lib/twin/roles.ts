export type RoleRequirement = { skill: string; importance: "foundation" | "core" | "supporting"; prerequisites: string[]; estimatedMinutes: number };

const make = (skills: string[]): RoleRequirement[] => skills.map((skill, index) => ({ skill, importance: index < 2 ? "foundation" : index < 4 ? "core" : "supporting", prerequisites: index ? [skills[index - 1]] : [], estimatedMinutes: index < 2 ? 360 : 270 }));

export const roleRequirements: Record<string, RoleRequirement[]> = {
  "Software Engineer": make(["Programming fundamentals", "Data structures", "Testing", "Version control", "System design", "Technical communication"]),
  "Frontend Developer": make(["Semantic HTML", "Responsive CSS", "JavaScript and TypeScript", "React patterns", "Accessibility", "Frontend testing"]),
  "Backend Developer": make(["API design", "Data modelling", "Authentication and authorization", "Testing", "Performance", "Observability"]),
  "Data Analyst": make(["Spreadsheet analysis", "SQL", "Data cleaning", "Statistical reasoning", "Data visualization", "Stakeholder communication"]),
  "AI/ML Engineer": make(["Python", "Data preparation", "Model evaluation", "Machine-learning fundamentals", "Experiment tracking", "Responsible AI"]),
  "Cybersecurity Analyst": make(["Security fundamentals", "Threat analysis", "Network monitoring", "Incident response", "Vulnerability management", "Security reporting"]),
  "Cloud Engineer": make(["Cloud fundamentals", "Identity and access", "Infrastructure as code", "Networking", "Monitoring", "Cost awareness"]),
  "DevOps Engineer": make(["Linux and scripting", "CI/CD", "Containers", "Infrastructure as code", "Observability", "Reliability practices"]),
};

export const fallbackRequirements = make(["Domain fundamentals", "Core tools", "Problem solving", "Quality assurance", "Collaboration", "Communication"]);
export function requirementsForRole(role: string) { return roleRequirements[role] ?? fallbackRequirements; }
