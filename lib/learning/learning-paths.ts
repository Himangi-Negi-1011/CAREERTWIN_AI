export interface PathCourse {
  slug: string;
  title: string;
  order: number;
  whyIncluded: string;
  lessonsCount: number;
  level: "beginner" | "intermediate" | "advanced";
}

export interface LearningPath {
  id: string;
  title: string;
  badge: string;
  description: string;
  targetRole: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  expectedDuration: string;
  prerequisites: string[];
  requiredSkills: string[];
  courses: PathCourse[];
  practicalLabsCount: number;
  assessmentsCount: number;
  finalProject: {
    title: string;
    objective: string;
    deliverable: string;
  };
  completionCriteria: string;
  nextRecommendedStep: string;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "python-developer",
    title: "Python Developer Learning Path",
    badge: "Most Popular",
    description: "Master modern Python programming from execution semantics to building robust APIs, asynchronous worker scripts, and automated test pipelines.",
    targetRole: "Python Developer",
    difficulty: "beginner",
    expectedDuration: "10–12 weeks · 5 hrs/week",
    prerequisites: ["Basic computer literacy", "Logical thinking fundamentals"],
    requiredSkills: ["Python", "SQL", "Git", "Testing & Debugging"],
    courses: [
      {
        slug: "python",
        title: "Python Programming",
        order: 1,
        whyIncluded: "Builds core syntax, execution models, data structures, exceptions, and object-oriented architectures.",
        lessonsCount: 6,
        level: "beginner",
      },
      {
        slug: "sql",
        title: "SQL & Relational Databases",
        order: 2,
        whyIncluded: "Essential for persisting application data, writing multi-table queries, and managing schema transactions.",
        lessonsCount: 4,
        level: "beginner",
      },
    ],
    practicalLabsCount: 5,
    assessmentsCount: 6,
    finalProject: {
      title: "Production-Grade CLI & API Pipeline",
      objective: "Build a modular Python application that extracts structured datasets, executes validation checks, and saves normalized data to PostgreSQL with unit tests.",
      deliverable: "GitHub repository with pytest test suite, Dockerfile, and reproducible README.",
    },
    completionCriteria: "Complete all course lessons, pass both module check-in assessments (>=70%), and complete the interactive Python lab.",
    nextRecommendedStep: "Proceed to Full-Stack Developer or AI/ML Developer Learning Paths.",
  },
  {
    id: "full-stack-developer",
    title: "Full-Stack Developer Learning Path",
    badge: "High Demand",
    description: "Learn end-to-end web engineering: typesafe client architectures with TypeScript & JavaScript, database schema design with SQL, and server-side APIs.",
    targetRole: "Full-Stack Developer",
    difficulty: "intermediate",
    expectedDuration: "14–16 weeks · 6 hrs/week",
    prerequisites: ["HTML & CSS foundations", "Basic programming familiarity"],
    requiredSkills: ["TypeScript", "JavaScript", "SQL", "REST APIs", "Modern Web Architecture"],
    courses: [
      {
        slug: "javascript",
        title: "Modern JavaScript",
        order: 1,
        whyIncluded: "Core language runtime, event loop, asynchronous promises, DOM manipulation, and browser APIs.",
        lessonsCount: 6,
        level: "beginner",
      },
      {
        slug: "typescript",
        title: "TypeScript Engineering",
        order: 2,
        whyIncluded: "Adds static typing, interfaces, generics, and compile-time error detection for large-scale codebases.",
        lessonsCount: 6,
        level: "intermediate",
      },
      {
        slug: "sql",
        title: "SQL for Application Engineering",
        order: 3,
        whyIncluded: "Enables design of normalized tables, foreign keys, ACID transactions, and optimized indexing.",
        lessonsCount: 4,
        level: "beginner",
      },
    ],
    practicalLabsCount: 7,
    assessmentsCount: 9,
    finalProject: {
      title: "Collaborative Task Management Web Application",
      objective: "Develop a full-stack dashboard featuring user authentication, PostgreSQL relational data persistence, optimistic UI updates, and automated integration tests.",
      deliverable: "Deployed web application URL and verified GitHub source code.",
    },
    completionCriteria: "Complete all 16 curriculum lessons across JavaScript, TypeScript, and SQL, and submit a verified deliverable URL.",
    nextRecommendedStep: "Advance to Cloud Security Engineer or DevOps Learning Path.",
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst Learning Path",
    badge: "Defense & SecOps",
    description: "Develop defensive security capabilities: network monitoring, threat detection, incident response, authentication mechanisms, and vulnerability analysis.",
    targetRole: "Cybersecurity Analyst",
    difficulty: "beginner",
    expectedDuration: "12–14 weeks · 5 hrs/week",
    prerequisites: ["Computer networking basics", "Operating systems overview"],
    requiredSkills: ["Cybersecurity", "Network Security", "Security Operations", "Incident Response"],
    courses: [
      {
        slug: "cybersecurity",
        title: "Cybersecurity Fundamentals & Operations",
        order: 1,
        whyIncluded: "Foundational threat modeling, CIA triad, access control lists, malware taxonomy, and security logging.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "cloud-computing",
        title: "Cloud Infrastructure Security",
        order: 2,
        whyIncluded: "Understanding shared responsibility models, IAM policies, VPC security boundaries, and zero-trust principles.",
        lessonsCount: 4,
        level: "intermediate",
      },
    ],
    practicalLabsCount: 6,
    assessmentsCount: 6,
    finalProject: {
      title: "Security Incident Detection & Response Report",
      objective: "Analyze a multi-stage simulated breach dataset, reconstruct the threat actor timeline, identify affected assets, and document a mitigation remediation strategy.",
      deliverable: "Formal SOC Incident Brief with technical log evidence and preventative policy recommendations.",
    },
    completionCriteria: "Pass all course assessments and complete the Security Log Analysis interactive lab.",
    nextRecommendedStep: "Prepare for CompTIA Security+ or CISSP domain studies.",
  },
  {
    id: "cloud-security-engineer",
    title: "Cloud Security Engineer Learning Path",
    badge: "Cloud Architecture",
    description: "Design, deploy, and safeguard cloud workloads on multi-tenant infrastructure using least-privilege identity boundaries, encryption, and automated compliance.",
    targetRole: "Cloud Security Engineer",
    difficulty: "intermediate",
    expectedDuration: "12–16 weeks · 6 hrs/week",
    prerequisites: ["Cloud computing concepts", "Linux CLI fundamentals"],
    requiredSkills: ["Cloud Computing", "Cybersecurity", "IAM Architecture", "Infrastructure as Code"],
    courses: [
      {
        slug: "cloud-computing",
        title: "Cloud Computing & Shared Infrastructure",
        order: 1,
        whyIncluded: "Covers compute virtualization, object storage, virtual private clouds, load balancers, and monitoring.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "cybersecurity",
        title: "Cloud Threat Modeling & Defense",
        order: 2,
        whyIncluded: "Teaches defensive controls, threat vector analysis, cryptographic keys (KMS), and SIEM integration.",
        lessonsCount: 4,
        level: "intermediate",
      },
      {
        slug: "go",
        title: "Go for Cloud & Systems Tooling",
        order: 3,
        whyIncluded: "The language of Kubernetes, Docker, and Terraform providers; builds high-concurrency security audit tooling.",
        lessonsCount: 6,
        level: "intermediate",
      },
    ],
    practicalLabsCount: 8,
    assessmentsCount: 9,
    finalProject: {
      title: "Automated Cloud Least-Privilege IAM Auditor",
      objective: "Write an automated audit utility that scans cloud IAM role configurations, flags wildcard permissions (`*`), and alerts on compliance deviations.",
      deliverable: "Source code repository with unit tests and a sample audit execution report.",
    },
    completionCriteria: "Complete all course curricula and achieve a minimum 75% score on the Cloud Security Mock Exam.",
    nextRecommendedStep: "Advance to DevOps Engineer Learning Path.",
  },
  {
    id: "data-analyst",
    title: "Data Analyst Learning Path",
    badge: "Analytics & BI",
    description: "Transform complex operational and market data into actionable business intelligence through rigorous SQL queries, statistical analysis, and Power BI dashboards.",
    targetRole: "Data Analyst",
    difficulty: "beginner",
    expectedDuration: "10–12 weeks · 5 hrs/week",
    prerequisites: ["Basic arithmetic", "Spreadsheet familiarity"],
    requiredSkills: ["SQL", "Power BI", "Python", "Data Modeling", "Statistical Analysis"],
    courses: [
      {
        slug: "sql",
        title: "SQL Data Analysis & Modeling",
        order: 1,
        whyIncluded: "Essential for querying tables, grouping metrics, window functions, and calculating time-series KPIs.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "power-bi",
        title: "Power BI & Interactive Dashboards",
        order: 2,
        whyIncluded: "Covers data ingestion, DAX calculations, relationship modeling, and executive KPI reporting.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "python",
        title: "Python for Data Analysis",
        order: 3,
        whyIncluded: "Enables automated data cleaning, statistical hypothesis testing, and exploratory visual analysis.",
        lessonsCount: 6,
        level: "intermediate",
      },
    ],
    practicalLabsCount: 6,
    assessmentsCount: 9,
    finalProject: {
      title: "Executive Revenue & Customer Retention Dashboard",
      objective: "Construct an end-to-end analytics workflow from raw transactional CSVs to normalized SQL views and a responsive Power BI report with DAX measures.",
      deliverable: "Published Power BI dashboard file / export and documented query file with analysis summary.",
    },
    completionCriteria: "Complete all SQL, Power BI, and Python lessons, and submit the final dashboard brief.",
    nextRecommendedStep: "Advance to AI/ML Developer Learning Path.",
  },
  {
    id: "ai-ml-developer",
    title: "AI & Machine Learning Developer Learning Path",
    badge: "Next Gen AI",
    description: "Build computational foundations for machine learning: mathematical data handling, Python vectorization, model evaluation, and deployment of predictive APIs.",
    targetRole: "AI/ML Engineer",
    difficulty: "intermediate",
    expectedDuration: "14–18 weeks · 6 hrs/week",
    prerequisites: ["Python fundamentals", "Linear algebra basics"],
    requiredSkills: ["Python", "SQL", "Model Evaluation", "REST APIs"],
    courses: [
      {
        slug: "python",
        title: "Python Core & Numerical Programming",
        order: 1,
        whyIncluded: "Master the primary programming language of AI research and production machine learning engineering.",
        lessonsCount: 6,
        level: "beginner",
      },
      {
        slug: "sql",
        title: "SQL & Data Extraction for ML",
        order: 2,
        whyIncluded: "Data engineering foundations for assembling training datasets, feature tables, and evaluation splits.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "c-programming",
        title: "C & Computational Memory Models",
        order: 3,
        whyIncluded: "Provides foundational understanding of memory layouts, hardware acceleration, and GPU execution pipelines.",
        lessonsCount: 6,
        level: "intermediate",
      },
    ],
    practicalLabsCount: 7,
    assessmentsCount: 9,
    finalProject: {
      title: "End-to-End Predictive Model API",
      objective: "Train a supervised regression or classification model on public benchmarks, evaluate with precision/recall curves, and package into a containerized FastAPI endpoint.",
      deliverable: "Model artifact, evaluation metrics report, and tested REST inference service.",
    },
    completionCriteria: "Complete all course curricula, pass all phase assessments, and submit the model API project.",
    nextRecommendedStep: "Explore Deep Learning and Distributed Systems.",
  },
  {
    id: "network-engineer",
    title: "Network Engineer Learning Path",
    badge: "Cisco NetAcad Inspired",
    description: "Inspired by Cisco Networking Academy principles: master OSI 7-layer architecture, IPv4/IPv6 subnetting, TCP/IP flow control, DNS, and secure router configurations.",
    targetRole: "Network Engineer",
    difficulty: "beginner",
    expectedDuration: "12–14 weeks · 5 hrs/week",
    prerequisites: ["Computer hardware familiarity", "Binary arithmetic basics"],
    requiredSkills: ["Networking", "Cybersecurity", "Routing & Switching", "Subnetting"],
    courses: [
      {
        slug: "cybersecurity",
        title: "Network Security & Defense",
        order: 1,
        whyIncluded: "Provides core understanding of ports, protocols, firewalls, TLS handshakes, and perimeter defenses.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "cloud-computing",
        title: "Virtual Networks & Cloud Routing",
        order: 2,
        whyIncluded: "Covers software-defined networking, CIDR subnets, gateway routing tables, and peering connections.",
        lessonsCount: 4,
        level: "beginner",
      },
    ],
    practicalLabsCount: 6,
    assessmentsCount: 6,
    finalProject: {
      title: "Enterprise Multi-Subnet Architecture Design",
      objective: "Design a fault-tolerant corporate network with segmented VLANs, redundant gateways, DHCP/DNS services, and an access control matrix.",
      deliverable: "Network topology diagram, IP allocation table, and firewall rule specification document.",
    },
    completionCriteria: "Complete the interactive Network Subnetting Lab and pass all phase assessments with >=75%.",
    nextRecommendedStep: "Advance to Cloud Security Engineer or DevOps Learning Path.",
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer Learning Path",
    badge: "Continuous Delivery",
    description: "Automate delivery pipelines from code to production: containerization with Docker, infrastructure as code, systems programming with Go/Rust, and observability.",
    targetRole: "DevOps Engineer",
    difficulty: "intermediate",
    expectedDuration: "14–16 weeks · 6 hrs/week",
    prerequisites: ["Linux basics", "Any programming language"],
    requiredSkills: ["Cloud Computing", "Go", "Rust", "CI/CD", "Containers"],
    courses: [
      {
        slug: "cloud-computing",
        title: "Cloud Infrastructure & Orchestration",
        order: 1,
        whyIncluded: "Understand compute instances, serverless, automated scaling, and object storage lifecycles.",
        lessonsCount: 4,
        level: "beginner",
      },
      {
        slug: "go",
        title: "Go for Systems & DevOps",
        order: 2,
        whyIncluded: "Build fast, compiled command-line automation tools and microservice health checks.",
        lessonsCount: 6,
        level: "intermediate",
      },
      {
        slug: "rust",
        title: "Rust for Reliable Infrastructure",
        order: 3,
        whyIncluded: "Zero-cost abstractions and memory safety for high-throughput network proxies and system utilities.",
        lessonsCount: 6,
        level: "advanced",
      },
    ],
    practicalLabsCount: 8,
    assessmentsCount: 9,
    finalProject: {
      title: "Automated CI/CD Pipeline & Health Monitor",
      objective: "Configure a complete automated testing, container build, and deployment pipeline with synthetic health probes and slack/webhook alerts.",
      deliverable: "Working GitHub Actions pipeline definition and documented deployment logs.",
    },
    completionCriteria: "Complete all courses, pass all mock exams, and submit the automated deployment repository.",
    nextRecommendedStep: "Prepare for Kubernetes CKA or Cloud DevOps certifications.",
  },
];

export function findLearningPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id);
}

export function recommendLearningPath(targetRole: string, knownSkills: string[] = []): LearningPath {
  const normalizedRole = (targetRole || "").toLowerCase();
  if (normalizedRole.includes("data") || normalizedRole.includes("analyst") || normalizedRole.includes("bi")) {
    return LEARNING_PATHS.find((p) => p.id === "data-analyst")!;
  }
  if (normalizedRole.includes("cyber") || normalizedRole.includes("security") || normalizedRole.includes("soc")) {
    return LEARNING_PATHS.find((p) => p.id === "cybersecurity-analyst")!;
  }
  if (normalizedRole.includes("cloud") || normalizedRole.includes("aws") || normalizedRole.includes("azure")) {
    return LEARNING_PATHS.find((p) => p.id === "cloud-security-engineer")!;
  }
  if (normalizedRole.includes("frontend") || normalizedRole.includes("full") || normalizedRole.includes("web")) {
    return LEARNING_PATHS.find((p) => p.id === "full-stack-developer")!;
  }
  if (normalizedRole.includes("ai") || normalizedRole.includes("ml") || normalizedRole.includes("machine")) {
    return LEARNING_PATHS.find((p) => p.id === "ai-ml-developer")!;
  }
  if (normalizedRole.includes("network") || normalizedRole.includes("cisco") || normalizedRole.includes("telecom")) {
    return LEARNING_PATHS.find((p) => p.id === "network-engineer")!;
  }
  if (normalizedRole.includes("devops") || normalizedRole.includes("sre") || normalizedRole.includes("platform")) {
    return LEARNING_PATHS.find((p) => p.id === "devops-engineer")!;
  }
  // Default to Python Developer
  return LEARNING_PATHS[0];
}

