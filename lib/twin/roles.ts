export type RoleRequirement = { skill: string; importance: "foundation" | "core" | "supporting"; prerequisites: string[]; estimatedMinutes: number };

const make = (skills: string[]): RoleRequirement[] => skills.map((skill, index) => ({ skill, importance: index < 2 ? "foundation" : index < 4 ? "core" : "supporting", prerequisites: index ? [skills[index - 1]] : [], estimatedMinutes: index < 2 ? 360 : 270 }));

export const roleRequirements: Record<string, RoleRequirement[]> = {
  "Software Engineer": make(["Programming fundamentals", "Data structures", "Testing", "Version control", "System design", "Technical communication"]),
  "Frontend Developer": make(["Semantic HTML", "Responsive CSS", "JavaScript and TypeScript", "React patterns", "Accessibility", "Frontend testing"]),
  "Backend Developer": make(["API design", "Data modelling", "Authentication and authorization", "Testing", "Performance", "Observability"]),
  "Full Stack Developer": make(["Frontend UI (React/Next.js)", "Backend APIs (Node/Express/Python)", "Database Design & SQL", "Authentication & Security", "Containerization & Docker", "CI/CD & Cloud Deployment"]),
  "Full Stack Engineer": make(["Frontend UI (React/Next.js)", "Backend APIs (Node/Express/Python)", "Database Design & SQL", "Authentication & Security", "Containerization & Docker", "CI/CD & Cloud Deployment"]),
  "Data Analyst": make(["Spreadsheet analysis", "SQL", "Data cleaning", "Statistical reasoning", "Data visualization", "Stakeholder communication"]),
  "Data Scientist": make(["Python for Data Science", "Data Wrangling & Pandas", "Statistical Analysis & Inference", "Machine Learning & Scikit-Learn", "Data Visualization", "Model Deployment & MLOps"]),
  "AI/ML Engineer": make(["Python", "Data preparation", "Model evaluation", "Machine-learning fundamentals", "Experiment tracking", "Responsible AI"]),
  "Cybersecurity Analyst": make(["Security fundamentals", "Threat analysis", "Network monitoring", "Incident response", "Vulnerability management", "Security reporting"]),
  "Cloud Engineer": make(["Cloud fundamentals", "Identity and access", "Infrastructure as code", "Networking", "Monitoring", "Cost awareness"]),
  "DevOps Engineer": make(["Linux and scripting", "CI/CD", "Containers", "Infrastructure as code", "Observability", "Reliability practices"]),
  "Product Manager": make(["Product Strategy & Roadmapping", "User Research & PRDs", "Agile & Scrum Execution", "Metrics & Data Analysis", "Stakeholder Communication", "Go-To-Market Execution"]),
  "Mobile App Developer (iOS/Android)": make(["Mobile Architecture & Patterns", "Cross-Platform UI (Flutter/React Native)", "State Management", "Device APIs & Offline Storage", "REST API Integration", "App Store & Play Store Deployment"]),
  "QA / Test Automation Engineer": make(["Software Testing Fundamentals", "Test Case Design & Bug Reporting", "API Testing (Postman)", "UI Automation (Playwright/Selenium)", "CI/CD Test Integration", "Performance & Load Testing"]),
  "Systems Administrator": make(["Linux System Administration", "Networking & DNS", "Shell Scripting & Automation", "User Access & IAM", "Backup & Disaster Recovery", "Server Hardening & Security"]),
  "Business Analyst": make(["Requirements Gathering & User Stories", "Business Process Modeling", "SQL & Relational Databases", "Dashboarding & PowerBI/Tableau", "Stakeholder Presentation", "Cost-Benefit & ROI Analysis"]),
  "UI/UX Designer": make(["User Research & Personas", "Information Architecture", "Wireframing & Prototyping (Figma)", "Visual Design Systems", "Usability Testing", "Design-to-Dev Handoff"]),
  "Blockchain Developer": make(["Cryptography Fundamentals", "Smart Contract Development (Solidity)", "Ethereum & EVM Mechanics", "Decentralized Storage & IPFS", "Web3 Integration (Ethers.js)", "Smart Contract Security & Auditing"]),
};

export const fallbackRequirements = make(["Core Technical Architecture", "Data Structures & Problem Solving", "Modern Tooling & Version Control", "Quality Assurance & Testing", "System Integration & Security", "Technical Communication & Portfolio"]);

export function requirementsForRole(role: string): RoleRequirement[] {
  if (!role || !role.trim()) return fallbackRequirements;
  const trimmed = role.trim();
  if (roleRequirements[trimmed]) return roleRequirements[trimmed];

  const lower = trimmed.toLowerCase();
  if (lower.includes("full stack") || lower.includes("fullstack")) return roleRequirements["Full Stack Developer"];
  if (lower.includes("front") || lower.includes("react") || lower.includes("vue") || lower.includes("angular") || lower.includes("web dev")) return roleRequirements["Frontend Developer"];
  if (lower.includes("back") || lower.includes("node") || lower.includes("django") || lower.includes("spring") || lower.includes("fastapi")) return roleRequirements["Backend Developer"];
  if (lower.includes("data sci")) return roleRequirements["Data Scientist"];
  if (lower.includes("data") || lower.includes("analyst") || lower.includes("sql") || lower.includes("bi ")) return roleRequirements["Data Analyst"];
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("machine learning") || lower.includes("deep learning") || lower.includes("nlp") || lower.includes("computer vision")) return roleRequirements["AI/ML Engineer"];
  if (lower.includes("security") || lower.includes("cyber") || lower.includes("soc") || lower.includes("pen test") || lower.includes("infosec")) return roleRequirements["Cybersecurity Analyst"];
  if (lower.includes("cloud") || lower.includes("aws") || lower.includes("azure") || lower.includes("gcp")) return roleRequirements["Cloud Engineer"];
  if (lower.includes("devops") || lower.includes("sre") || lower.includes("reliability") || lower.includes("platform")) return roleRequirements["DevOps Engineer"];
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("ios") || lower.includes("flutter") || lower.includes("react native") || lower.includes("swift") || lower.includes("kotlin")) return roleRequirements["Mobile App Developer (iOS/Android)"];
  if (lower.includes("qa") || lower.includes("test") || lower.includes("automation") || lower.includes("quality")) return roleRequirements["QA / Test Automation Engineer"];
  if (lower.includes("product") || lower.includes("pm") || lower.includes("scrum")) return roleRequirements["Product Manager"];
  if (lower.includes("sysadmin") || lower.includes("system admin") || lower.includes("systems admin") || lower.includes("linux admin")) return roleRequirements["Systems Administrator"];
  if (lower.includes("business analyst") || lower.includes("ba")) return roleRequirements["Business Analyst"];
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma")) return roleRequirements["UI/UX Designer"];
  if (lower.includes("block") || lower.includes("web3") || lower.includes("crypto") || lower.includes("solidity")) return roleRequirements["Blockchain Developer"];
  if (lower.includes("software") || lower.includes("engineer") || lower.includes("developer") || lower.includes("coder") || lower.includes("programmer")) return roleRequirements["Software Engineer"];

  return fallbackRequirements;
}
