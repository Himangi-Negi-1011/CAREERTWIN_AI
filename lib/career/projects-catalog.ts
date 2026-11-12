import { z } from "zod";

export type ProjectTier = "beginner" | "intermediate" | "advanced" | "capstone";
export type ProjectCategory = "software_engineering" | "cybersecurity" | "cloud_devops" | "data_analytics" | "systems_programming";

export interface ProjectMilestone {
  milestone: number;
  title: string;
  instructions: string;
  deliverableCheck: string;
  hints?: string[];
  testCases?: string[];
}

export interface EvaluationCriterion {
  criterion: string;
  weightPercent: number;
  description: string;
}

export interface GuidedProject {
  id: string;
  title: string;
  category: ProjectCategory;
  difficulty: ProjectTier;
  problemStatement: string;
  whyItMatters: string;
  requiredSkills: string[];
  prerequisites: string[];
  toolsAndTech: string[];
  stepByStepMilestones: ProjectMilestone[];
  expectedDeliverables: string[];
  testingRequirements: string[];
  evaluationRubric: EvaluationCriterion[];
  suggestedGitHubStructure: string;
  portfolioPresentationGuidance: string;
}

export const GUIDED_PROJECTS: GuidedProject[] = [
  // ─── TIER 1: BEGINNER ────────────────────────────────────────────────────────
  {
    id: "proj-beg-cli-monitor",
    title: "CLI System Health & Memory Diagnostic Monitor",
    category: "software_engineering",
    difficulty: "beginner",
    problemStatement:
      "System administrators require lightweight terminal utilities to monitor CPU load, memory thresholds, and disk partition saturation without heavy third-party agent dependencies.",
    whyItMatters:
      "Teaches core programming fundamentals: process introspection, stream parsing, error handling, formatting, and building robust command-line tools.",
    requiredSkills: ["Python", "Linux", "Git"],
    prerequisites: ["Basic Python variables, loops, and functions"],
    toolsAndTech: ["Python 3.12", "psutil / os module", "argparse", "pytest"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "CLI Argument Parser & Flag Handling",
        instructions: "Implement an argparse interface supporting --interval, --threshold, and --json export flags.",
        deliverableCheck: "Running `python monitor.py --help` shows formatted usage instructions.",
        hints: ["Use argparse.ArgumentParser with description and custom epilog."],
        testCases: ["Test CLI returns exit code 0 on --help", "Test invalid flags return exit code 2"],
      },
      {
        milestone: 2,
        title: "System Metric Samplers",
        instructions: "Write functions to query CPU percent, virtual memory usage, and root disk partition free space.",
        deliverableCheck: "Functions return typed dictionaries with floating-point percentages.",
        hints: ["Safely handle division by zero for disk space calculations."],
        testCases: ["Assert sampled CPU percentage is between 0.0 and 100.0"],
      },
      {
        milestone: 3,
        title: "Threshold Alerting & Terminal UI",
        instructions: "Format output with color-coded ANSI escape codes (Green < 70%, Yellow 70-85%, Red > 85%).",
        deliverableCheck: "Alert prints warning message to stderr when threshold is breached.",
        hints: ["Use ANSI escape codes \\033[92m and \\033[91m for terminal colors."],
        testCases: ["Verify warning trigger fires when memory mock exceeds 85%"],
      },
    ],
    expectedDeliverables: [
      "monitor.py entrypoint script with modular structure.",
      "test_monitor.py with unit tests using pytest.",
      "README.md with installation instructions and screenshot/ASCII sample.",
    ],
    testingRequirements: ["Unit tests for calculation helpers with mocked system stats."],
    evaluationRubric: [
      { criterion: "Clean Modular Structure", weightPercent: 35, description: "Separation of CLI parsing, metric collection, and formatting." },
      { criterion: "Error Handling & Edge Cases", weightPercent: 35, description: "Graceful handling of Ctrl+C and permission exceptions." },
      { criterion: "Documentation & Code Style", weightPercent: 30, description: "PEP 8 compliant, type hints, and clear README." },
    ],
    suggestedGitHubStructure: `cli-health-monitor/
├── monitor.py
├── test_monitor.py
├── requirements.txt
└── README.md`,
    portfolioPresentationGuidance:
      "Highlight under 'Systems Programming': 'Authored a cross-platform Python CLI monitoring utility with automated threshold alerting and JSON reporting.'",
  },
  {
    id: "proj-beg-sqlite-inventory",
    title: "Relational Inventory & Booking Ledger with SQLite",
    category: "data_analytics",
    difficulty: "beginner",
    problemStatement:
      "Small organizations frequently track assets, equipment checkout, and returns in fragile spreadsheets. Build a normalized relational database ledger with transactional integrity.",
    whyItMatters:
      "Mastering SQL schema design, primary and foreign keys, joins, and ACID transactions is the bedrock of software engineering and analytics.",
    requiredSkills: ["SQL", "Python", "Relational Databases"],
    prerequisites: ["Basic SQL SELECT, INSERT, and CREATE TABLE queries"],
    toolsAndTech: ["SQLite3", "Python", "SQL", "pytest"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Normalized Schema Design",
        instructions: "Create tables for items, users, and checkouts with foreign keys and check constraints.",
        deliverableCheck: "schema.sql file runs cleanly without syntax errors.",
        hints: ["Enable foreign key support in SQLite using `PRAGMA foreign_keys = ON;`."],
        testCases: ["Test foreign key violation fails insertion"],
      },
      {
        milestone: 2,
        title: "Transactional Checkout Operations",
        instructions: "Implement checkout and return functions wrapped in database transactions to prevent double-booking.",
        deliverableCheck: "A checkout operation updates item status and records an audit log entry in one commit.",
        hints: ["Use `with connection:` context manager for automatic rollbacks on error."],
        testCases: ["Verify failed checkout does not alter item state"],
      },
      {
        milestone: 3,
        title: "Reporting Queries & Summary Metrics",
        instructions: "Write SQL views to calculate overdue loans, most popular assets, and current department utilization.",
        deliverableCheck: "Complex query uses INNER JOIN and GROUP BY with aggregation.",
        hints: ["Use `strftime('%Y-%m-%d', date)` for date comparison."],
        testCases: ["Verify overdue query correctly flags loans older than 14 days"],
      },
    ],
    expectedDeliverables: [
      "schema.sql schema migration file.",
      "inventory_manager.py implementation.",
      "test_inventory.py verifying transaction safety.",
    ],
    testingRequirements: ["Test database transactions and foreign key constraint enforcement."],
    evaluationRubric: [
      { criterion: "Database Normalization (3NF)", weightPercent: 40, description: "Proper entity relationship design without redundancy." },
      { criterion: "Transaction Safety (ACID)", weightPercent: 30, description: "Atomic commits and rollback handling." },
      { criterion: "Reporting & Aggregations", weightPercent: 30, description: "Efficient analytical SQL queries with indexes." },
    ],
    suggestedGitHubStructure: `sqlite-inventory-ledger/
├── schema.sql
├── inventory_manager.py
├── test_inventory.py
└── README.md`,
    portfolioPresentationGuidance:
      "Highlight under 'Data Engineering': 'Architected a normalized SQLite inventory system with atomic checkout transactions and automated overdue reporting.'",
  },

  // ─── TIER 2: INTERMEDIATE ──────────────────────────────────────────────────
  {
    id: "proj-int-rest-microservice",
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
        hints: ["Use SQLAlchemy or Pydantic V2 models for strict type validation."],
        testCases: ["Ensure unique email constraint prevents duplicates"],
      },
      {
        milestone: 2,
        title: "RESTful Endpoints & Validation",
        instructions: "Implement CRUD endpoints with strict JSON input validation, pagination, and error handlers.",
        deliverableCheck: "Endpoints respond with standard HTTP status codes (200, 201, 400, 404).",
        hints: ["Return detailed JSON error payloads on 422 validation errors."],
        testCases: ["Test POST /students with invalid email returns 422"],
      },
      {
        milestone: 3,
        title: "Automated Unit & Integration Tests",
        instructions: "Write test suites achieving at least 80% code coverage across routes and database operations.",
        deliverableCheck: "PyTest runs with zero failures.",
        hints: ["Use FastAPI TestClient and an in-memory SQLite fixture."],
        testCases: ["Run pytest --cov and ensure coverage >= 80%"],
      },
      {
        milestone: 4,
        title: "Containerization & CI Pipeline",
        instructions: "Author a multi-stage Dockerfile and configure a GitHub Actions workflow that runs tests on every pull request.",
        deliverableCheck: "Green checkmark on GitHub Actions build.",
        hints: ["Use python:3.12-slim base image to minimize container footprint."],
        testCases: ["Docker build succeeds in under 90 seconds"],
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
      "Highlight under 'Backend Systems': 'Engineered a containerized RESTful API handling course enrollments with 85% test coverage and CI/CD automation.'",
  },
  {
    id: "proj-int-websocket-pad",
    title: "Real-Time Collaborative Code Editor with WebSockets",
    category: "software_engineering",
    difficulty: "intermediate",
    problemStatement:
      "Distributed engineering teams need low-latency, real-time synchronization when conducting live technical interviews and pair programming.",
    whyItMatters:
      "Validates full-stack prowess in TypeScript, asynchronous event streams, state reconciliation, and bidirectional WebSocket communication.",
    requiredSkills: ["TypeScript", "JavaScript", "React", "REST APIs"],
    prerequisites: ["TypeScript interfaces", "React state management", "Node.js basics"],
    toolsAndTech: ["TypeScript", "Next.js / React", "ws / Socket.io", "Monaco Editor / CodeMirror", "Tailwind CSS"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "WebSocket Server & Room Multiplexing",
        instructions: "Implement a Node.js WebSocket server managing room subscriptions, client connections, and heartbeat pings.",
        deliverableCheck: "Clients can join rooms identified by unique UUIDs.",
        hints: ["Handle unexpected client disconnections cleanly without crashing server."],
        testCases: ["Test room broadcasting delivers message to all active room peers"],
      },
      {
        milestone: 2,
        title: "Editor Component & Delta Broadcasting",
        instructions: "Integrate Monaco Editor or CodeMirror and broadcast text diffs on content changes with debouncing.",
        deliverableCheck: "Typing in one browser window updates the peer window in real-time.",
        hints: ["Use Operational Transformation or debounced character diffs to prevent feedback loops."],
        testCases: ["Verify typing triggers throttled broadcast events"],
      },
      {
        milestone: 3,
        title: "Presence & User Cursors",
        instructions: "Broadcast cursor position (line and column) with unique avatars/colors for active participants.",
        deliverableCheck: "Peer cursor flags are visually positioned on the editor canvas.",
        hints: ["Track client metadata (color, username) upon handshake."],
        testCases: ["Test cursor position update arrives at peer client"],
      },
    ],
    expectedDeliverables: [
      "Full-stack GitHub repository with frontend and backend packages.",
      "Live deployed demonstration link (e.g. Vercel + Render).",
      "README documenting WebSocket protocol messages and architecture.",
    ],
    testingRequirements: ["Unit tests for room manager and protocol message schemas."],
    evaluationRubric: [
      { criterion: "Real-Time Concurrency & State Sync", weightPercent: 40, description: "Smooth low-latency synchronization without race conditions." },
      { criterion: "TypeScript Typing & Architecture", weightPercent: 30, description: "Strict type safety across client and server protocol." },
      { criterion: "UI & User Experience", weightPercent: 30, description: "Clean responsive interface with live presence indicators." },
    ],
    suggestedGitHubStructure: `collaborative-codepad/
├── client/
│   ├── src/components/Editor.tsx
│   └── src/hooks/useWebSocket.ts
├── server/
│   ├── src/roomManager.ts
│   └── src/index.ts
└── README.md`,
    portfolioPresentationGuidance:
      "Highlight under 'Full-Stack Engineering': 'Developed a real-time collaborative code editor supporting multi-user rooms, remote cursor tracking, and low-latency WebSocket synchronization.'",
  },

  // ─── TIER 3: ADVANCED ──────────────────────────────────────────────────────
  {
    id: "proj-adv-vuln-scanner",
    title: "Automated Network Vulnerability & Port Auditing Suite",
    category: "cybersecurity",
    difficulty: "advanced",
    problemStatement:
      "Enterprise security teams require automated vulnerability auditing to scan internal IP ranges, detect misconfigured services, verify TLS certificate expiries, and output structured SARIF reports.",
    whyItMatters:
      "Demonstrates high-level cybersecurity competencies: TCP/IP socket programming, protocol handshakes, vulnerability signature matching, and security compliance.",
    requiredSkills: ["Cybersecurity", "Python", "Networking", "Linux"],
    prerequisites: ["TCP three-way handshake", "Common port numbers", "Basic socket programming"],
    toolsAndTech: ["Python 3.12", "asyncio", "socket", "ssl", "scapy / raw sockets", "JSON / SARIF"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Asynchronous TCP Port Scanner",
        instructions: "Build a non-blocking asynchronous scanner capable of checking 1,000 ports in under 3 seconds using asyncio.",
        deliverableCheck: "Tool outputs open ports with banner grabbing information.",
        hints: ["Use `asyncio.open_connection` with a short timeout (0.5s)."],
        testCases: ["Assert open localhost ports are correctly identified"],
      },
      {
        milestone: 2,
        title: "Service Fingerprinting & Banner Grabber",
        instructions: "Send protocol-specific probes (HTTP, SSH, SMTP) to open sockets and parse server identification headers.",
        deliverableCheck: "Scanner accurately reports Apache/Nginx version and OpenSSH release.",
        hints: ["Parse Server and X-Powered-By HTTP headers safely."],
        testCases: ["Verify HTTP service banner extraction"],
      },
      {
        milestone: 3,
        title: "TLS/SSL Certificate Validator",
        instructions: "Initiate SSL handshakes on HTTPS/TLS ports, extract cipher suites, and flag expired or deprecated TLS 1.0/1.1 protocols.",
        deliverableCheck: "Security report alerts when certificate expires in < 30 days.",
        hints: ["Use `ssl.create_default_context()` and `getpeercert()`."],
        testCases: ["Test TLS expiry calculation against known test domains"],
      },
      {
        milestone: 4,
        title: "Structured SARIF / JSON Security Export",
        instructions: "Format findings using the standard Static Analysis Results Interchange Format (SARIF) for GitHub Security integration.",
        deliverableCheck: "Generated .sarif file validates against the official OASIS SARIF JSON schema.",
        hints: ["Ensure each vulnerability rule has an ID, severity level, and remediation text."],
        testCases: ["Validate output JSON against SARIF 2.1.0 schema"],
      },
    ],
    expectedDeliverables: [
      "Modular Python package installable via pip.",
      "Automated test suite mocking socket responses.",
      "Sample HTML and SARIF vulnerability audit report.",
      "Defensive remediation guide for identified findings.",
    ],
    testingRequirements: ["Unit tests with mock socket connections to avoid outbound network dependencies."],
    evaluationRubric: [
      { criterion: "Network Concurrency & Speed", weightPercent: 35, description: "Asynchronous I/O scanning efficiency and socket timeout handling." },
      { criterion: "Security Accuracy & Fingerprinting", weightPercent: 35, description: "Correct service detection and TLS compliance checks." },
      { criterion: "Reporting & Industry Standards", weightPercent: 30, description: "SARIF compliance and actionable remediation advice." },
    ],
    suggestedGitHubStructure: `vuln-audit-suite/
├── scanner/
│   ├── port_scanner.py
│   ├── banner_grabber.py
│   ├── ssl_auditor.py
│   └── report_generator.py
├── tests/
│   └── test_scanner.py
├── pyproject.toml
└── README.md`,
    portfolioPresentationGuidance:
      "Highlight under 'Cybersecurity Engineering': 'Built an asynchronous network vulnerability auditing tool in Python with automated TLS verification and SARIF compliance reporting.'",
  },
  {
    id: "proj-adv-distributed-queue",
    title: "Event-Driven Distributed Order Processing Pipeline",
    category: "cloud_devops",
    difficulty: "advanced",
    problemStatement:
      "High-volume e-commerce platforms experience burst traffic during flash sales. Design an asynchronous, fault-tolerant message processing pipeline with idempotent consumers and dead-letter queues.",
    whyItMatters:
      "Enterprise systems depend on event-driven architecture, at-least-once delivery guarantees, and backpressure management to prevent database starvation.",
    requiredSkills: ["Java", "SQL", "Cloud Computing", "Docker & Kubernetes"],
    prerequisites: ["Object-oriented Java", "Relational database transactions", "Message queue concepts"],
    toolsAndTech: ["Java 21 / Spring Boot", "Apache Kafka / RabbitMQ", "PostgreSQL", "Docker Compose", "Testcontainers"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Event Producer with Outbox Pattern",
        instructions: "Implement an order service that persists order state and outbox events in a single relational transaction.",
        deliverableCheck: "Zero dual-write inconsistency between database and event broker.",
        hints: ["Use a relational outbox table polled by a background publisher."],
        testCases: ["Verify transaction rollback also rolls back queued event"],
      },
      {
        milestone: 2,
        title: "Idempotent Consumer & Deduplication",
        instructions: "Consume order events with unique message IDs and prevent duplicate processing via Redis/PostgreSQL unique locks.",
        deliverableCheck: "Sending duplicate messages results in exactly one execution of inventory reservation.",
        hints: ["Maintain a processed_message_ids table with expiration."],
        testCases: ["Submit 10 duplicate events and verify exactly 1 order completed"],
      },
      {
        milestone: 3,
        title: "Dead Letter Queue & Retry Backoff",
        instructions: "Configure exponential backoff retries with maximum attempts before routing poison pills to a Dead Letter Queue (DLQ).",
        deliverableCheck: "Failing messages land in the DLQ and trigger alert logs.",
        hints: ["Use exponential multipliers (1s, 2s, 4s, 8s) up to 3 retries."],
        testCases: ["Assert poison pill message lands in DLQ after 3 failed attempts"],
      },
    ],
    expectedDeliverables: [
      "Spring Boot / Java repository with Gradle or Maven.",
      "docker-compose.yml running Kafka, PostgreSQL, and Zookeeper/Kraft.",
      "Integration tests with Testcontainers verifying end-to-end event flow.",
    ],
    testingRequirements: ["Testcontainers integration tests running live Kafka and PostgreSQL containers."],
    evaluationRubric: [
      { criterion: "Distributed Systems Architecture", weightPercent: 40, description: "Correct implementation of Outbox and Idempotency patterns." },
      { criterion: "Resilience & Error Handling", weightPercent: 35, description: "Exponential retry backoff and DLQ routing." },
      { criterion: "Automated Integration Testing", weightPercent: 25, description: "Testcontainers coverage without external manual dependencies." },
    ],
    suggestedGitHubStructure: `distributed-order-pipeline/
├── order-producer/
├── order-consumer/
├── docker-compose.yml
└── README.md`,
    portfolioPresentationGuidance:
      "Highlight under 'Distributed Cloud Systems': 'Architected an asynchronous order pipeline with the Transactional Outbox pattern, idempotent consumers, and automated DLQ routing.'",
  },

  // ─── TIER 4: CAPSTONE ──────────────────────────────────────────────────────
  {
    id: "proj-cap-multi-cloud-iac",
    title: "Enterprise Multi-Cloud Infrastructure as Code Platform",
    category: "cloud_devops",
    difficulty: "capstone",
    problemStatement:
      "Modern enterprises deploy distributed microservices across multi-region cloud providers. Build a production GitOps infrastructure repository provisioning VPC networks, Kubernetes clusters, load balancers, and observability pipelines with Terraform and GitHub Actions.",
    whyItMatters:
      "The pinnacle of Cloud & DevOps engineering: proves mastery of cloud architecture, immutable infrastructure, zero-trust network segregation, and automated CI/CD deployments.",
    requiredSkills: ["Cloud Computing", "Docker & Kubernetes", "Git", "Linux", "Cybersecurity"],
    prerequisites: ["Cloud networking (VPC, subnets, route tables)", "Kubernetes architecture", "Terraform basics"],
    toolsAndTech: ["Terraform / OpenTofu", "AWS / GCP", "Kubernetes (EKS/GKE)", "GitHub Actions", "Prometheus & Grafana"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Reusable Terraform Cloud Modules",
        instructions: "Author modular Terraform configurations for VPC (public/private subnets, NAT gateway), security groups, and IAM roles.",
        deliverableCheck: "`terraform validate` and `terraform fmt` pass with zero errors.",
        hints: ["Tag all resources with Environment, Project, and ManagedBy tags."],
        testCases: ["Verify terraform plan succeeds with remote state backend"],
      },
      {
        milestone: 2,
        title: "Managed Kubernetes Cluster Provisioning",
        instructions: "Provision a managed Kubernetes cluster with auto-scaling node groups across multiple availability zones.",
        deliverableCheck: "Kubectl can authenticate and query cluster nodes.",
        hints: ["Configure cluster security groups to restrict control plane access."],
        testCases: ["Assert worker nodes are spread across at least 2 AZs"],
      },
      {
        milestone: 3,
        title: "Observability Stack & Helm Deployment",
        instructions: "Deploy Prometheus, Grafana, and an NGINX Ingress controller using Helm charts with persistent volumes.",
        deliverableCheck: "Grafana dashboard visualizes cluster CPU, memory, and pod network metrics.",
        hints: ["Use Helm values.yaml overrides to configure persistent volume sizes."],
        testCases: ["Verify Prometheus scrapes metrics endpoint successfully"],
      },
      {
        milestone: 4,
        title: "Automated GitOps CI/CD Deployment Pipeline",
        instructions: "Configure GitHub Actions workflows to perform static security analysis (tfsec/checkov), terraform plan on PR, and automated apply on merge.",
        deliverableCheck: "Automated PR comments display clean terraform plan outputs.",
        hints: ["Use OIDC federated authentication instead of static AWS access keys."],
        testCases: ["Verify security scanner catches open 0.0.0.0/0 ingress violations"],
      },
    ],
    expectedDeliverables: [
      "Complete Infrastructure as Code GitHub repository.",
      "Comprehensive Architecture Diagram (Mermaid or PNG).",
      "Cost optimization breakdown report and disaster recovery plan.",
      "Live cluster demonstration video or verified terminal recording.",
    ],
    testingRequirements: ["Static code analysis with Checkov or tfsec; automated terraform plan verification."],
    evaluationRubric: [
      { criterion: "Security & Zero Trust Networking", weightPercent: 35, description: "Private subnets, least-privilege IAM, and security group lockdowns." },
      { criterion: "Modularity & Reusability", weightPercent: 30, description: "DRY Terraform modules with documented input variables." },
      { criterion: "GitOps Automation & Observability", weightPercent: 35, description: "OIDC-authenticated CI/CD and working Prometheus/Grafana stack." },
    ],
    suggestedGitHubStructure: `enterprise-multi-cloud-iac/
├── .github/workflows/
│   ├── tf-plan.yml
│   └── tf-apply.yml
├── modules/
│   ├── vpc/
│   ├── k8s/
│   └── monitoring/
├── environments/
│   ├── dev/
│   └── prod/
├── docs/architecture.png
└── README.md`,
    portfolioPresentationGuidance:
      "Feature as Primary Capstone: 'Designed and deployed an enterprise multi-region Kubernetes platform with Terraform, OIDC-secured GitHub Actions GitOps, and Prometheus observability.'",
  },
  {
    id: "proj-cap-ai-telehealth",
    title: "Full-Stack AI-Assisted Patient Records & Telehealth Portal",
    category: "software_engineering",
    difficulty: "capstone",
    problemStatement:
      "Healthcare clinics require secure, accessible digital portals where patients can review medical consultations, schedule appointments, and receive automated clinical summaries while adhering to strict HIPAA/GDPR data protection standards.",
    whyItMatters:
      "Validates enterprise full-stack engineering: complex relational schemas, role-based access control (RBAC), encrypted document storage, asynchronous AI pipelines, and accessible UI.",
    requiredSkills: ["TypeScript", "Python", "SQL", "Cybersecurity", "REST APIs"],
    prerequisites: ["Full-stack web application development", "Relational database modeling", "Authentication & JWTs"],
    toolsAndTech: ["Next.js 16 (App Router)", "TypeScript", "PostgreSQL", "Prisma / Drizzle", "Tailwind CSS", "AES-256 Encryption"],
    stepByStepMilestones: [
      {
        milestone: 1,
        title: "Role-Based Access Control (RBAC) & Encryption",
        instructions: "Implement multi-tenant auth distinguishing Patient, Physician, and Admin roles with field-level encryption for clinical notes.",
        deliverableCheck: "Patients cannot query or access unassigned physician records.",
        hints: ["Store encrypted notes using AES-256-GCM with distinct salt per tenant."],
        testCases: ["Test patient token cannot access /api/physician endpoints (403 Forbidden)"],
      },
      {
        milestone: 2,
        title: "Interactive Appointment Scheduling & CalDAV",
        instructions: "Build an interactive calendar UI with time slot collision detection and automated email appointment confirmations.",
        deliverableCheck: "Simultaneous booking requests for the same physician slot fail gracefully.",
        hints: ["Use database row locks (`SELECT ... FOR UPDATE`) during slot reservation."],
        testCases: ["Verify double-booking race condition is prevented"],
      },
      {
        milestone: 3,
        title: "Clinical Consultation Summary Pipeline",
        instructions: "Build an asynchronous worker parsing doctor consultation notes and generating patient-friendly vocabulary summaries and medication checklists.",
        deliverableCheck: "Generated summaries highlight dosage, frequency, and contraindication warnings.",
        hints: ["Sanitize all patient identifiers before passing text to analytical pipelines."],
        testCases: ["Ensure medical disclaimer is appended to every generated summary"],
      },
      {
        milestone: 4,
        title: "Production Security Audit & Performance Tuning",
        instructions: "Audit app with OWASP Top 10 guidelines: enforce strict Content Security Policy, rate limiting, and achieve 95+ Lighthouse score.",
        deliverableCheck: "Security headers and rate limiting active on all public endpoints.",
        hints: ["Configure helmet headers and in-memory rate limiting."],
        testCases: ["Run security audit and assert 0 high/critical vulnerabilities"],
      },
    ],
    expectedDeliverables: [
      "Production-ready GitHub repository with Next.js frontend and PostgreSQL schema.",
      "Live deployed application on Vercel with test demo credentials.",
      "Security compliance brief detailing HIPAA encryption and access controls.",
    ],
    testingRequirements: ["End-to-end Playwright tests of appointment booking and RBAC route protection."],
    evaluationRubric: [
      { criterion: "Security, Privacy & RBAC", weightPercent: 40, description: "Strict data isolation, encryption at rest, and role enforcement." },
      { criterion: "Full-Stack Architecture & Code Quality", weightPercent: 35, description: "Clean Next.js App Router patterns, TypeScript safety, and DB performance." },
      { criterion: "UX & Accessibility (WCAG 2.1 AA)", weightPercent: 25, description: "Accessible UI with keyboard navigation and high contrast support." },
    ],
    suggestedGitHubStructure: `ai-telehealth-portal/
├── app/
│   ├── (auth)/
│   ├── patient/
│   ├── physician/
│   └── api/
├── lib/
│   ├── crypto/encryption.ts
│   └── db/schema.prisma
├── tests/
│   └── rbac.test.ts
└── README.md`,
    portfolioPresentationGuidance:
      "Feature as Primary Capstone: 'Architected an accessible patient portal with AES-256 field encryption, role-based access control, appointment scheduling, and automated clinical summaries.'",
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

