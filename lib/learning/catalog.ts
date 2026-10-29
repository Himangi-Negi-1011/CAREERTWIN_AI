import type { Skill } from "./schema";

const domainSeeds: Record<string, string[]> = {
  "Software Development": ["Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "SQL", "Bash", "PowerShell", "HTML", "CSS", "Object-Oriented Programming", "Data Structures", "Algorithms", "API Design", "Debugging", "Software Testing", "Software Architecture"],
  "Web Development": ["React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "FastAPI", "REST APIs", "GraphQL", "Web Authentication", "Web Security", "Responsive Design", "Frontend Testing", "Backend Testing", "Full-Stack Development", "Backend Development"],
  "Data and Databases": ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Database Design", "Normalization", "Database Indexing", "Query Optimization", "ETL", "Data Pipelines", "Data Warehousing", "Apache Spark", "Workflow Orchestration"],
  "AI and Machine Learning": ["Python for AI", "Statistics", "Linear Algebra", "Data Preprocessing", "Supervised Learning", "Unsupervised Learning", "Machine Learning", "AI Fundamentals", "Applied AI Development", "Model Evaluation", "Neural Networks", "Deep Learning", "Natural Language Processing", "Computer Vision", "Generative AI", "Prompt Engineering", "LLM APIs", "Retrieval-Augmented Generation", "Vector Search", "AI Evaluation", "Responsible AI"],
  "Analytics and BI": ["Excel", "SQL Analytics", "Python Analytics", "Data Analysis", "Power BI", "Tableau", "Data Visualization", "Business Analysis", "Data Storytelling", "Reporting"],
  Cybersecurity: ["Networking", "Linux", "Security Fundamentals", "Cryptography Fundamentals", "Access Control", "Identity and Access Management", "Vulnerability Management", "Secure Coding", "SIEM", "Incident Response", "Digital Forensics", "Malware Analysis Fundamentals", "Ethical Hacking", "Penetration Testing Methodology", "Threat Modelling", "Cloud Security"],
  "Cloud and DevOps": ["Cloud Computing", "AWS", "Microsoft Azure", "Google Cloud", "Cloud Networking", "Cloud Storage", "Containers", "Kubernetes", "Serverless Computing", "Infrastructure as Code", "Cloud Architecture", "Cost Optimization", "Cloud Governance", "Git", "GitHub", "Docker", "CI/CD", "GitHub Actions", "Terraform", "Configuration Management", "Logging", "Monitoring", "Observability", "Reliability Engineering", "Deployment Automation"],
  "Networking and IT": ["TCP/IP", "DNS", "HTTP", "HTTPS", "Routing", "Switching", "Subnetting", "Firewalls", "VPNs", "Network Troubleshooting", "Windows Administration", "Linux Administration", "Virtualization", "Infrastructure Troubleshooting"],
  "Design and Product": ["UI Design", "UX Research", "Figma", "Prototyping", "Accessibility", "Design Systems", "Product Discovery", "Product Management", "Requirements Analysis", "Product Analytics", "Usability Testing"],
  "Business and Management": ["Communication", "Problem Solving", "Project Management", "Agile", "Scrum", "Leadership", "Strategic Planning", "Entrepreneurship", "Customer Research", "Sales", "Negotiation", "Operations Management"],
  "Marketing and Content": ["SEO", "Content Strategy", "Digital Marketing", "Email Marketing", "Social Media Marketing", "Paid Advertising", "Copywriting", "Brand Strategy", "Campaign Analytics", "Marketing Automation"],
  "Finance and Accounting": ["Financial Literacy", "Bookkeeping", "Accounting Fundamentals", "Financial Modelling", "Budgeting", "Financial Analysis", "Business Finance", "Spreadsheet Modelling"],
  "Professional Skills": ["English Communication", "Business Writing", "Presentations", "Teamwork", "Critical Thinking", "Time Management", "Research", "Workplace Communication", "Resume Writing", "Portfolio Creation", "Professional Networking", "Interview Preparation"],
  "Creative and Education": ["Research Methods", "Teaching", "Language Learning", "Photography", "Video Editing", "Creative Writing", "Mathematics", "Science Communication"],
};

const aliases: Record<string, string[]> = {
  "JavaScript": ["JS"], "TypeScript": ["TS"], "C#": ["C Sharp"], "C++": ["CPP"],
  "PostgreSQL": ["Postgres"], "Identity and Access Management": ["IAM"],
  "Retrieval-Augmented Generation": ["RAG"], "Natural Language Processing": ["NLP"],
  "Continuous Integration and Delivery": ["CI/CD"], "Amazon Web Services": ["AWS"],
  "Search Engine Optimization": ["SEO"], "User Experience Research": ["UX Research"],
  "Microsoft Azure": ["Azure"],
  "Deployment Automation": ["Deployment"],
  "Vulnerability Management": ["Vulnerability Assessment"],
  "Security Fundamentals": ["Defensive Security"],
  "Ethical Hacking": ["Ethical Hacking Fundamentals"],
  "REST APIs": ["APIs"],
  "Machine Learning": ["ML"],
  "Cloud Computing": ["Cloud"],
  "Python": ["Python 3", "Python Programming"],
  "Data Analysis": ["Data Analytics"],
  "Teamwork": ["Collaboration"],
};

export function normalizeSkillName(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en").replace(/[._/]+/g, " ").replace(/[^a-z0-9+#\s-]/g, "").replace(/\s+/g, " ");
}
export function skillSlug(value: string) { return normalizeSkillName(value).replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

let ordinal = 0;
export const seededSkills: Skill[] = Object.entries(domainSeeds).flatMap(([domain, names]) => names.map((canonicalName) => {
  ordinal += 1;
  const itemAliases = aliases[canonicalName] ?? [];
  return {
    id: `00000000-0000-4000-8000-${String(ordinal).padStart(12, "0")}`,
    canonicalName,
    slug: skillSlug(canonicalName),
    aliases: itemAliases,
    keywords: [canonicalName, ...itemAliases, domain],
    domain,
    subdomain: domain,
    description: `${canonicalName} knowledge and practical application within ${domain.toLowerCase()}.`,
    learningOutcomes: [`Explain the foundations of ${canonicalName}`, `Apply ${canonicalName} in an appropriate practical task`],
    difficulty: "foundation" as const,
    prerequisites: [],
    relatedRoles: [],
    proficiencyCriteria: [`Explain core ${canonicalName} concepts accurately`, `Produce and review a practical ${canonicalName} artifact`],
    contentVersion: 1,
    lastReviewedAt: null,
    reviewStatus: "draft" as const,
  };
}));

const exactIndex = new Map<string, Skill>();
for (const skill of seededSkills) for (const term of [skill.canonicalName, ...skill.aliases]) exactIndex.set(normalizeSkillName(term), skill);

export function findCanonicalSkill(value: string) { return exactIndex.get(normalizeSkillName(value)) ?? null; }
export function searchSkills(query: string, limit = 20) {
  const normalized = normalizeSkillName(query);
  if (!normalized) return seededSkills.slice(0, Math.min(limit, 50));
  return seededSkills
    .map((skill) => ({ skill, score: normalizeSkillName(skill.canonicalName) === normalized ? 0 : [skill.canonicalName, ...skill.aliases, ...skill.keywords].some((value) => normalizeSkillName(value).startsWith(normalized)) ? 1 : [skill.canonicalName, ...skill.aliases, ...skill.keywords].some((value) => normalizeSkillName(value).includes(normalized)) ? 2 : 99 }))
    .filter((item) => item.score < 99)
    .sort((a, b) => a.score - b.score || a.skill.canonicalName.localeCompare(b.skill.canonicalName))
    .slice(0, Math.min(limit, 50)).map((item) => item.skill);
}

export function validateNewSkillName(value: string) {
  const canonicalName = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (canonicalName.length < 2 || canonicalName.length > 120) throw new Error("Skill names must contain 2 to 120 characters.");
  if (!/[\p{L}\p{N}]/u.test(canonicalName)) throw new Error("Skill names must contain a letter or number.");
  return { canonicalName, normalizedName: normalizeSkillName(canonicalName), slug: skillSlug(canonicalName), existing: findCanonicalSkill(canonicalName) };
}
