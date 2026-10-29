export interface DegreeOption {
  code: string;
  name: string;
  category: "Undergraduate" | "Postgraduate" | "Diploma" | "Doctorate" | "Other";
  typicalYears: number;
}

export const standardDegrees: DegreeOption[] = [
  { code: "BCA", name: "Bachelor of Computer Applications (BCA)", category: "Undergraduate", typicalYears: 3 },
  { code: "B.Tech", name: "Bachelor of Technology (B.Tech / B.E.)", category: "Undergraduate", typicalYears: 4 },
  { code: "B.Sc", name: "Bachelor of Science (B.Sc)", category: "Undergraduate", typicalYears: 3 },
  { code: "B.Com", name: "Bachelor of Commerce (B.Com)", category: "Undergraduate", typicalYears: 3 },
  { code: "BBA", name: "Bachelor of Business Administration (BBA)", category: "Undergraduate", typicalYears: 3 },
  { code: "BA", name: "Bachelor of Arts (BA)", category: "Undergraduate", typicalYears: 3 },
  { code: "MCA", name: "Master of Computer Applications (MCA)", category: "Postgraduate", typicalYears: 2 },
  { code: "M.Tech", name: "Master of Technology (M.Tech / M.E.)", category: "Postgraduate", typicalYears: 2 },
  { code: "M.Sc", name: "Master of Science (M.Sc)", category: "Postgraduate", typicalYears: 2 },
  { code: "MBA", name: "Master of Business Administration (MBA)", category: "Postgraduate", typicalYears: 2 },
  { code: "Diploma", name: "Diploma in Engineering / Technology", category: "Diploma", typicalYears: 3 },
  { code: "PhD", name: "Doctor of Philosophy (PhD)", category: "Doctorate", typicalYears: 4 },
  { code: "Other", name: "Other / Self-Taught / Certificate", category: "Other", typicalYears: 1 },
];

export const commonSpecializations = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Analytics",
  "Cybersecurity & Digital Forensics",
  "Cloud Computing & DevOps",
  "Electronics & Communication (ECE)",
  "Electrical & Electronics (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Software Engineering",
  "Computer Applications",
  "Information Systems",
  "Mathematics & Computing",
  "Finance & Banking",
  "Business Analytics",
  "General / Other",
];

export const academicYears = [
  "1st Year (Semester 1 / 2)",
  "2nd Year (Semester 3 / 4)",
  "3rd Year (Semester 5 / 6)",
  "4th Year (Semester 7 / 8)",
  "Final Year",
  "Recent Graduate (Fresher)",
  "Alumni / Working Professional",
  "Not Applicable / Self-Taught",
];

export const targetRoleSuggestions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "AI/ML Engineer",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Mobile App Developer (iOS/Android)",
  "QA / Test Automation Engineer",
  "Systems Administrator",
  "Business Analyst",
];

export const popularSkillPills = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "SQL",
  "Data Analysis",
  "Machine Learning",
  "Docker",
  "AWS",
  "Git & GitHub",
  "Linux",
  "Cybersecurity",
  "Cloud Computing",
  "Tailwind CSS",
  "REST APIs",
  "Communication",
  "Problem Solving",
];

