import { z } from "zod";

export interface GuidedProject {
  id: string;
  title: string;
  category: "software_engineering" | "cybersecurity" | "cloud_devops" | "data_analytics";
  difficulty: "beginner" | "intermediate" | "advanced";
  problemStatement: string;
  whyItMatters: string;
  requiredSkills: string[];
  prerequisites: string[];
  toolsAndTech: string[];
  stepByStepMilestones: Array<{
    milestone: number;
    title: string;
    instructions: string;
    deliverableCheck: string;
  }>;
  expectedDeliverables: string[];
  testingRequirements: string[];
  evaluationRubric: Array<{
    criterion: string;
    weightPercent: number;
    description: string;
  }>;
  suggestedGitHubStructure: string;
  portfolioPresentationGuidance: string;
}

export const GUIDED_PROJECTS: GuidedProject[] = [
  {
    id: "proj-rest-microservice",
    title: "Production Student API Microservice with Automated CI/CD",
    category: "software_engineering",
    difficulty: "intermediate",
    problemStatement:
      "Educational institutions struggle with fragmented student course records. Build a robust, scalable REST API service with schema validation, authentication middleware, SQLite/PostgreSQL persistence, and automated GitHub Actions testing.",
    whyItMatters:
      "Modern backend hiring requires demonstrable proof of REST design, relational transactions, test coverage, and automated containerization.",
    requiredSkills: ["Python", "SQL", "Git", "REST APIs", "Docker & Kubernetes"],
    prerequisites: ["Python Syntax Fundamentals", "Relational Database Schema Design"],
    toolsAndTech: ["Python 3.12", "FastAPI / Flask", "PostgreSQL / SQLite", "PyTest", "Docker", "GitHub Actions"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Database Modeling & Migrations",
        instructions: "Design normalized tables for students, courses, enrollments, and grades with foreign key constraints.",
        deliverableCheck: "SQL schema script or Alembic migration files committed.",
      },
      {
        milestone: 2,
        title: "RESTful Endpoints & Validation",
        instructions: "Implement CRUD endpoints with strict JSON input validation, pagination, and error handlers.",
        deliverableCheck: "Endpoints respond with standard HTTP status codes (200, 201, 400, 404).",
      },
      {
        milestone: 3,
        title: "Automated Unit & Integration Tests",
        instructions: "Write test suites achieving at least 80% code coverage across routes and database operations.",
        deliverableCheck: "PyTest runs with zero failures.",
      },
      {
        milestone: 4,
        title: "Containerization & CI Pipeline",
        instructions: "Author a multi-stage Dockerfile and configure a GitHub Actions workflow that runs tests on every pull request.",
        deliverableCheck: "Green checkmark on GitHub Actions build.",
      },
    ],
    expectedDeliverables: [
      "Public GitHub repository URL with MIT License.",
      "Comprehensive README.md with architecture diagram and setup guide.",
      "Dockerfile and docker-compose.yml file.",
      "Passing CI workflow badge.",
    ],
    testingRequirements: [
      "At least 10 automated unit tests testing input boundaries.",
      "Database integration tests verifying cascade deletes and unique constraints.",
      "Clean execution without mock hardcoding in production routes.",
    ],
    evaluationRubric: [
      { criterion: "Code Architecture & Separation of Concerns", weightPercent: 30, description: "Modular routes, services, and models." },
      { criterion: "Automated Test Coverage", weightPercent: 25, description: "PyTest coverage of happy paths and edge cases." },
      { criterion: "Documentation & Readability", weightPercent: 25, description: "Clear API documentation with curl examples." },
      { criterion: "DevOps & Containerization", weightPercent: 20, description: "Working Dockerfile and CI workflow." },
    ],
    suggestedGitHubStructure: `student-api-microservice/
├── .github/workflows/ci.yml
├── app/
│   ├── api/v1/routes.py
│   ├── models/schemas.py
│   ├── db/database.py
│   └── main.py
├── tests/
│   └── test_api.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md`,
    portfolioPresentationGuidance:
      "Highlight this project under 'Backend Systems' on your resume. Mention: 'Engineered a containerized RESTful API handling course enrollments with 85% test coverage and CI/CD automation.'",
  },
  {
    id: "proj-cyber-soc-defense",
    title: "SOC Threat Intelligence & Intrusion Detection Lab",
    category: "cybersecurity",
    difficulty: "intermediate",
    problemStatement:
      "Security Operations Centers are bombarded with thousands of false alerts daily. Develop an automated log parser and anomaly detection tool that ingests authentication and firewall logs, identifies brute-force or unauthorized port scans, and generates defensive alert reports.",
    whyItMatters:
      "Cybersecurity hiring managers look for hands-on proof that you understand log forensics, network protocols, MITRE ATT&CK techniques, and threat triage.",
    requiredSkills: ["Cybersecurity", "Python", "Computer Networks", "Linux"],
    prerequisites: ["IPv4 Subnetting & Network Layers", "Linux Command Line Basics"],
    toolsAndTech: ["Python", "Suricata / Zeek / Wireshark", "Syslog", "Regex", "Markdown Reporting"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Log Parsing & Telemetry Normalization",
        instructions: "Parse raw Linux auth.log or web server access logs to extract timestamps, source IPs, HTTP codes, and user agents.",
        deliverableCheck: "Structured JSON output for each log event.",
      },
      {
        milestone: 2,
        title: "Heuristic Anomaly Detection",
        instructions: "Implement detection logic for > 5 failed logins within 60 seconds and geographic IP anomalies.",
        deliverableCheck: "Trigger alert events with severity classifications.",
      },
      {
        milestone: 3,
        title: "Incident Response Playbook & Report",
        instructions: "Create an Incident Summary Report documenting the incident timeline, affected assets, and mitigation firewall rules.",
        deliverableCheck: "Defensive report PDF or Markdown document in repository.",
      },
    ],
    expectedDeliverables: [
      "Python analysis script with sample sanitised log fixtures.",
      "Incident Response summary report mapped to MITRE ATT&CK framework.",
      "Clear README detailing detection logic and prevention steps.",
    ],
    testingRequirements: [
      "Demonstrate detection on mock attack log datasets.",
      "Verify false-positive threshold handling.",
    ],
    evaluationRubric: [
      { criterion: "Forensic Accuracy", weightPercent: 35, description: "Accurate extraction of attacker IOCs (IPs, user agents, targets)." },
      { criterion: "Security Defense Playbook", weightPercent: 35, description: "Pragmatic incident response and iptables rules." },
      { criterion: "Code Cleanliness & Documentation", weightPercent: 30, description: "Clear explanations and reproducibility." },
    ],
    suggestedGitHubStructure: `threat-intel-log-parser/
├── logs/sample-attack.log
├── parser.py
├── rules/detection_rules.json
├── report/incident_report.md
└── README.md`,
    portfolioPresentationGuidance:
      "Feature this under 'Security & Defensive Infrastructure'. State: 'Built automated SOC telemetry parser detecting brute-force intrusions across Linux server logs with MITRE ATT&CK mapping.'",
  },
  {
    id: "proj-data-pipeline",
    title: "E-Commerce Customer Analytics & Retention Dashboard",
    category: "data_analytics",
    difficulty: "beginner",
    problemStatement:
      "Online retail operations generate millions of transactions without clear customer cohort tracking. Clean a transactional dataset with SQL and Python, compute customer lifetime value (CLV) and churn cohorts, and build an interactive Power BI dashboard.",
    whyItMatters:
      "Data Analyst recruiters need to see business acumen, robust SQL aggregation, data cleanliness verification, and compelling visual storytelling.",
    requiredSkills: ["SQL", "Python", "Power BI", "Data Analysis"],
    prerequisites: ["Basic SQL Queries (GROUP BY, JOINs)", "Spreadsheet or Python Dataframes"],
    toolsAndTech: ["PostgreSQL / DuckDB", "Python Pandas", "Power BI / Tableau / Metabase", "Jupyter Notebook"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Data Cleaning & Anomaly Imputation",
        instructions: "Inspect null values, duplicate transaction IDs, and negative price records. Write reproducible cleaning scripts.",
        deliverableCheck: "Jupyter Notebook or SQL script with documented cleaning decisions.",
      },
      {
        milestone: 2,
        title: "Cohort & Retention Analysis (SQL)",
        instructions: "Author multi-table SQL queries with CTEs to calculate monthly retention rates and customer lifetime spend.",
        deliverableCheck: "SQL query file with CTEs and window functions.",
      },
      {
        milestone: 3,
        title: "Interactive Visual Dashboard",
        instructions: "Build an executive dashboard displaying revenue by product category, monthly active users, and cohort drop-off curves.",
        deliverableCheck: "Dashboard export screenshots and interactive report file.",
      },
    ],
    expectedDeliverables: [
      "SQL scripts with documented window functions and CTEs.",
      "Interactive dashboard file (.pbix) or exported report deck.",
      "README summarizing 3 key business recommendations derived from data.",
    ],
    testingRequirements: [
      "SQL queries must execute with zero syntax errors on test database.",
      "Data reconciles accurately without double-counted transactions.",
    ],
    evaluationRubric: [
      { criterion: "SQL Query Craftsmanship", weightPercent: 40, description: "Effective use of JOINs, CTEs, and window functions." },
      { criterion: "Business Insights & Communication", weightPercent: 30, description: "Actionable recommendations backed by charts." },
      { criterion: "Visual Design & Usability", weightPercent: 30, description: "Clean visual hierarchy and intuitive chart choices." },
    ],
    suggestedGitHubStructure: `ecommerce-retention-analytics/
├── data/raw_sample.csv
├── sql/
│   ├── 01_data_cleaning.sql
│   └── 02_cohort_analysis.sql
├── notebooks/eda_cleaning.ipynb
├── dashboard/report_preview.png
└── README.md`,
    portfolioPresentationGuidance:
      "Showcase this under 'Data Analytics & Business Intelligence'. Highlight: 'Authored multi-table SQL cohort queries and designed executive Power BI dashboard revealing 22% churn drop-off.'",
  },
];

export const projectSubmissionSchema = z.object({
  projectId: z.string().min(1),
  projectTitle: z.string().min(1),
  githubUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .regex(/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/, "Must be a valid GitHub repository URL"),
  liveDemoUrl: z.string().trim().url().or(z.literal("")).optional(),
  deliverableSummary: z.string().trim().min(20, "Please provide at least 20 characters explaining your deliverable"),
  selfEvaluationNotes: z.string().trim().max(2000).optional(),
});

export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;

