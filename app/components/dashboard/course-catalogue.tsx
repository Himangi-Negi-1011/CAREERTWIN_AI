"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  Code2,
  Terminal,
  Shield,
  Database,
  Cloud,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface CourseCatalogueItem {
  slug: string;
  title: string;
  category: "programming" | "cloud" | "data" | "security";
  categoryLabel: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessonsCount: number;
  mockTestsCount: number;
  practicalLabsCount: number;
  shortDescription: string;
  fullDescription: string;
  prerequisites: string[];
  learningOutcomes: string[];
  modules: Array<{
    title: string;
    lessons: string[];
    assessment: string;
  }>;
}

export const CATALOGUE_COURSES: CourseCatalogueItem[] = [
  {
    slug: "python",
    title: "Python Programming",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "beginner",
    duration: "4–6 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Core execution semantics, data structures, OOP architectures, and automated testing.",
    fullDescription: "From runtime internals and memory models to idiomatic object-oriented patterns, decorators, and automated unit testing with pytest. Prepare for software engineering and data pipelines.",
    prerequisites: ["Basic computer usage", "Fundamental algebraic logic"],
    learningOutcomes: [
      "Write clean, idiomatic, PEP 8 compliant Python code",
      "Model domain logic with classes, inheritance, and composition",
      "Build modular packages with unit tests using pytest",
      "Work with files, JSON, and network requests safely",
    ],
    modules: [
      {
        title: "Python Runtime Architecture, Memory Model & Primitives",
        lessons: [
          "Python Execution Architecture, Bytecode & Object Model",
          "Primitive Types, IEEE 754 Arithmetic & Formatted IO",
        ],
        assessment: "Python Runtime Architecture Phase Assessment",
      },
      {
        title: "Control Flow, Iteration Protocols & Defensive Error Handling",
        lessons: [
          "Decision Logic, Short-Circuit Evaluation & Pattern Matching",
          "The Iteration Protocol, Generators & Streaming Pipelines",
        ],
        assessment: "Control Flow and Iteration Phase Assessment",
      },
      {
        title: "Metaprogramming, OOP Architecture & Automated Verification",
        lessons: [
          "Closures, First-Class Functions & Decorator Metaprogramming",
          "OOP Architecture, Dunder Protocols & Automated Pytest Suites",
        ],
        assessment: "Python 100-Mark Professional Certification Exam",
      },
    ],
  },
  {
    slug: "javascript",
    title: "Modern JavaScript (ES6+)",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "beginner",
    duration: "4–6 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Asynchronous runtime, event loop, closures, promises, and DOM manipulation.",
    fullDescription: "Master modern ECMAScript standards, asynchronous control flow, prototype inheritance, browser APIs, and event-driven architectures powering modern web applications.",
    prerequisites: ["Basic HTML & CSS understanding"],
    learningOutcomes: [
      "Understand the V8 runtime, call stack, and event loop",
      "Manage async operations with Promises and async/await",
      "Structure modular front-end and Node.js applications",
      "Debug memory leaks and optimize event listeners",
    ],
    modules: [
      {
        title: "V8 Engine Internals, Scope Chain & Execution Contexts",
        lessons: [
          "V8 Engine Internals, Call Stack & Execution Contexts",
          "Lexical Scope Chain, Variable Lifetimes & Closures",
        ],
        assessment: "V8 Internals & Scopes Phase Assessment",
      },
      {
        title: "Asynchronous Event Loop & Concurrency Architecture",
        lessons: [
          "Macrotasks, Microtasks & The Event Loop Architecture",
          "Promises, Async/Await & Resilient Error Pipelines",
        ],
        assessment: "Event Loop & Concurrency Phase Assessment",
      },
      {
        title: "Prototypal Systems, Modern Modules & Web Architecture",
        lessons: [
          "Prototypes, Object Delegation & ES6 Class Systems",
          "ES Modules, Tree Shaking & High-Performance Architecture",
        ],
        assessment: "Modern JavaScript 100-Mark Professional Certification Exam",
      },
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript Engineering",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "intermediate",
    duration: "4–6 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Type system mechanics, interfaces, generics, utility types, and compiler configuration.",
    fullDescription: "Scale JavaScript codebases with compile-time type verification. Learn advanced structural typing, conditional types, mapped types, generics, and seamless build integrations.",
    prerequisites: ["Working knowledge of modern JavaScript"],
    learningOutcomes: [
      "Configure strict tsconfig compiler options for team workflows",
      "Author reusable generic algorithms with type constraints",
      "Implement discriminated unions for exhaustive state machines",
      "Safely integrate third-party untyped JavaScript libraries",
    ],
    modules: [
      {
        title: "Structural Typing, Inference & Discriminated Unions",
        lessons: [
          "TypeScript Architecture, Type Erasure & Structural Typing",
          "Type Inference, Narrowing & Discriminated Unions",
        ],
        assessment: "Structural Typing & Inference Phase Assessment",
      },
      {
        title: "Generic Engineering & Type Transformation",
        lessons: [
          "Generics, Constraints & Polymorphic Function Signatures",
          "Mapped Types, Keyof & Essential Utility Types",
        ],
        assessment: "Generic Engineering Phase Assessment",
      },
      {
        title: "Advanced Type Programming & Strict Production Systems",
        lessons: [
          "Conditional Types, Infer Keyword & Template Literal Types",
          "Strict Compiler Flags, Branded Types & Runtime Boundary Validation",
        ],
        assessment: "Enterprise TypeScript 100-Mark Professional Certification Exam",
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL & Relational Databases",
    category: "data",
    categoryLabel: "Data & Analytics",
    level: "beginner",
    duration: "4–6 weeks · 4 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Relational modeling, multi-table JOINs, CTEs, window functions, indexing, and ACID locks.",
    fullDescription: "From entity-relationship normalization (1NF–3NF) and ACID guarantees to complex multi-table joins, CTEs, analytical window functions, query plan diagnostics, and B-Tree composite indexing.",
    prerequisites: ["Basic data literacy"],
    learningOutcomes: [
      "Design normalized relational schemas up to 3NF",
      "Query datasets with complex JOINs, CTEs, GROUP BY, and Window Functions",
      "Optimize query execution with composite indexes and EXPLAIN plans",
      "Manage transactional integrity with atomic ACID locking",
    ],
    modules: [
      {
        title: "Module 1: Relational Modeling & Declarative Querying",
        lessons: ["Relational Schema Design, Keys & Normal Forms (1NF–3NF)", "Filtering, Sorting & Grouping Data with SELECT/WHERE/HAVING"],
        assessment: "Relational Foundations Phase Assessment",
      },
      {
        title: "Module 2: Multi-Table Joins, CTEs & Window Functions",
        lessons: ["Multi-Table INNER, LEFT, FULL Joins & CTEs", "Analytical Window Functions: ROW_NUMBER, RANK & Running Totals"],
        assessment: "Joins & Windows Phase Assessment",
      },
      {
        title: "Module 3: Indexing, Transactions & Performance Tuning",
        lessons: ["B-Tree Indexes, EXPLAIN Query Plans & Avoiding Scans", "ACID Transactions, Isolation Levels & Safe Migrations"],
        assessment: "Relational SQL 100-Mark Comprehensive Exam",
      },
    ],
  },
  {
    slug: "power-bi",
    title: "Power BI & Business Intelligence",
    category: "data",
    categoryLabel: "Data & Analytics",
    level: "beginner",
    duration: "4–6 weeks · 4 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 1,
    shortDescription: "Power Query ETL, Star Schema modeling, Date dimensions, DAX measures, and executive UX.",
    fullDescription: "Transform messy spreadsheets into interactive analytical semantic models. Master Power Query M unpivoting & query folding, conformed Star Schemas, contiguous Date dimensions, DAX filter/row contexts, and executive dashboard design.",
    prerequisites: ["Spreadsheet or basic data familiarity"],
    learningOutcomes: [
      "Extract and unpivot messy sources using foldable Power Query M pipelines",
      "Build performant single-direction Star Schemas with contiguous Date dimensions",
      "Author DAX formulas (SUMX, CALCULATE, time intelligence, DIVIDE)",
      "Design responsive, accessible executive dashboards with dynamic RLS",
    ],
    modules: [
      {
        title: "Module 1: Data Ingestion & Power Query ETL (M Language)",
        lessons: ["Power BI Workflow & Power Query Unpivoting (M Language)", "Data Profiling, Quality Gates & Query Folding"],
        assessment: "ETL & Query Folding Checkpoint",
      },
      {
        title: "Module 2: Star Schema Modeling & Date Dimensions",
        lessons: ["Fact vs Dimension Tables, Cardinality & Star Schema Design", "Dedicated Date Dimensions & Role-Playing Relationships"],
        assessment: "Dimensional Modeling Assessment",
      },
      {
        title: "Module 3: DAX Analytics & Executive Reporting",
        lessons: ["DAX Fundamentals: Row vs Filter Context, SUMX & CALCULATE", "Time Intelligence (YoY/MTD) & Executive Dashboard Design"],
        assessment: "Power BI Analytics 100-Mark Certification Exam",
      },
    ],
  },
  {
    slug: "cloud-computing",
    title: "Cloud Computing Foundations",
    category: "cloud",
    categoryLabel: "Infrastructure & Cloud",
    level: "beginner",
    duration: "4–6 weeks · 4 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Cloud Regions/AZs, containers, VPC subnets, private object storage, IAM roles & FinOps.",
    fullDescription: "Master fundamental cloud infrastructure architectures. Understand the Shared Responsibility Model, VMs vs Containers vs Serverless, VPC subnetting/NAT routing, private S3 storage with CDN OAC, keyless OIDC IAM, Auto Scaling, and FinOps.",
    prerequisites: ["Basic computer networking fundamentals"],
    learningOutcomes: [
      "Differentiate IaaS, PaaS, and SaaS under the Shared Responsibility Model",
      "Configure multi-AZ VPC subnets, security groups, and NAT/Endpoint routing",
      "Package stateless non-root containers and auto-scaling architectures",
      "Implement least-privilege JSON IAM identity policies & FinOps controls",
    ],
    modules: [
      {
        title: "Module 1: Cloud Architecture & Core Service Models",
        lessons: ["Cloud Architecture, Regions & Service Models (IaaS/PaaS/SaaS)", "Elastic Compute, Containers & Serverless Workloads"],
        assessment: "Cloud Architecture & Compute Checkpoint",
      },
      {
        title: "Module 2: Cloud Networking (VPC) & Storage Architectures",
        lessons: ["Virtual Private Clouds (VPC), Subnets & Routing", "Object Storage, Block Volumes & Managed Databases"],
        assessment: "VPC Networking & Storage Assessment",
      },
      {
        title: "Module 3: Identity (IAM), Auto-Scaling & Cloud FinOps",
        lessons: ["IAM Least-Privilege Policies & Keyless OIDC Identity", "Auto-Scaling, Load Balancing & FinOps Cost Governance"],
        assessment: "Cloud Foundations 100-Mark Certification Exam",
      },
    ],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity & Threat Defense",
    category: "security",
    categoryLabel: "Cybersecurity & Defense",
    level: "beginner",
    duration: "4–6 weeks · 4 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "CIA triad, STRIDE, TLS/PKI, Argon2 auth, OWASP SQLi/XSS defense, SOC triage & NIST IR.",
    fullDescription: "Establish core defensive security engineering skills. Master STRIDE threat modeling, stateful firewalling & TLS trust chains, Argon2id credential hashing, IDOR/SQLi/XSS remediation, SOC access log triage, and the NIST Incident Response lifecycle.",
    prerequisites: ["Basic computer and networking awareness"],
    learningOutcomes: [
      "Identify attack vectors via STRIDE threat modeling and CIA impact",
      "Implement secure authentication, Argon2 hashing, and HTTP cookie hardening",
      "Eliminate SQLi, XSS, and IDOR flaws cleanly in backend handlers",
      "Triage raw access logs and execute NIST SP 800-61 containment playbooks",
    ],
    modules: [
      {
        title: "Module 1: Security Principles & Network Defense",
        lessons: ["CIA Triad, Threat Modeling & Attack Surface", "Network Defense: Firewalls, Stateful Inspection & TLS 1.3"],
        assessment: "Network & Threat Defense Checkpoint",
      },
      {
        title: "Module 2: Authentication, Cryptography & OWASP AppSec",
        lessons: ["Authentication, Password Hashing (Argon2/bcrypt) & Access Control", "OWASP Top 10: Injection (SQLi), XSS & Cookie Hardening"],
        assessment: "AppSec & Access Control Assessment",
      },
      {
        title: "Module 3: Security Operations (SOC) & Incident Response",
        lessons: ["SOC Log Triage, SIEM Alerting & Anomaly Detection", "NIST Incident Response Lifecycle & Hardening Capstone"],
        assessment: "Cybersecurity Defense 100-Mark Certification Exam",
      },
    ],
  },
  {
    slug: "go",
    title: "Go for Systems & DevOps",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "intermediate",
    duration: "4–6 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Static compilation, goroutines, channels, interfaces, and microservices.",
    fullDescription: "Build blazing-fast command line tools, network microservices, and DevOps automation. Learn memory management, pointers, concurrency with goroutines and channels, and standard library HTTP servers.",
    prerequisites: ["Familiarity with any programming language"],
    learningOutcomes: [
      "Write idiomatic Go with error handling and pointers",
      "Manage concurrency safely using channels and sync primitives",
      "Build high-throughput REST microservices with standard library",
      "Package statically linked binaries for containerized deployment",
    ],
    modules: [
      {
        title: "Module 1: Toolchain, Types, Errors, and Control Flow",
        lessons: ["Go Toolchain, Modules, and Packages", "Types, Parsing, and Explicit Errors"],
        assessment: "Go Syntax & Error Handling Checkpoint",
      },
      {
        title: "Module 2: Slices, Maps, Functions, and Domain Models",
        lessons: ["Control Flow, Switches, and Boundaries", "Arrays, Slices, Maps, and Iteration"],
        assessment: "Slices, Maps & Boundaries Assessment",
      },
      {
        title: "Module 3: Concurrency, Persistence, and a Project",
        lessons: ["Functions, Structs, Methods, and Interfaces", "Goroutines, Channels, Context, and a Tracker"],
        assessment: "Go Systems Engineering Final Exam",
      },
    ],
  },
  {
    slug: "rust",
    title: "Rust Systems Programming",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "advanced",
    duration: "6–8 weeks · 6 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Ownership, borrow checker, lifetimes, traits, and fearless concurrency.",
    fullDescription: "Master systems-level performance without garbage collection or memory corruption vulnerabilities. Deep dive into the borrow checker, stack vs heap, lifetimes, traits, error handling with Result, and safe multithreading.",
    prerequisites: ["Solid foundational programming experience (C, C++, or Go helpful)"],
    learningOutcomes: [
      "Master compile-time memory safety via ownership and borrowing",
      "Design zero-cost abstractions with traits and generic parameters",
      "Prevent data races at compile time with Send and Sync markers",
      "Write robust applications with exhaustive match patterns",
    ],
    modules: [
      {
        title: "Module 1: Cargo, Types, Results, and Control Flow",
        lessons: ["Cargo Projects, Compilation, and Diagnostics", "Types, Parsing, Option, and Result"],
        assessment: "Cargo, Types & Result Checkpoint",
      },
      {
        title: "Module 2: Ownership, Collections, and Domain Models",
        lessons: ["Control Flow, Matching, and Boundaries", "Ownership, Borrowing, Slices, and Collections"],
        assessment: "Ownership & Borrowing Assessment",
      },
      {
        title: "Module 3: Persistence, Concurrency, and a Project",
        lessons: ["Functions, Structs, Enums, and Traits", "Files, Serialization, Threads, and a Tracker"],
        assessment: "Rust Systems Architect Certification Exam",
      },
    ],
  },
  {
    slug: "cpp",
    title: "C++ High-Performance Systems",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "intermediate",
    duration: "5–7 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Modern C++ (17/20), manual memory management, RAII, STL containers, and templates.",
    fullDescription: "Explore high-performance computing, low-latency networking, and gaming engines with modern C++. Cover smart pointers, RAII, move semantics, template metaprogramming, and standard template library algorithms.",
    prerequisites: ["Understanding of C syntax or object-oriented fundamentals"],
    learningOutcomes: [
      "Manage resources deterministically with RAII and smart pointers",
      "Implement move semantics and rvalue references to eliminate copies",
      "Leverage STL containers, iterators, and modern algorithms",
      "Debug memory leaks using address sanitizers and valgrind",
    ],
    modules: [
      {
        title: "Module 1: Builds, Types, and Control Flow",
        lessons: ["Compiling Modern C++ and Reading Diagnostics", "Values, Types, Initialization, and Streams"],
        assessment: "Modern C++ Builds & Types Checkpoint",
      },
      {
        title: "Module 2: Containers, Functions, and Classes",
        lessons: ["Conditions, Boolean Logic, and Boundaries", "Loops, std::array, and std::vector"],
        assessment: "Containers & Boundaries Assessment",
      },
      {
        title: "Module 3: RAII, Algorithms, Files, and a Project",
        lessons: ["Functions, References, Classes, and RAII", "STL Algorithms, Maps, and a Progress Tracker"],
        assessment: "C++ High-Performance Final Exam",
      },
    ],
  },
  {
    slug: "csharp",
    title: "C# & .NET Platform",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "intermediate",
    duration: "5–6 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Object-oriented C#, LINQ data pipelines, ASP.NET Core APIs, and async tasks.",
    fullDescription: "Build scalable enterprise backend services and modern cloud APIs with C# and the .NET runtime. Master LINQ, delegates, async/await, dependency injection, and RESTful ASP.NET Core Web APIs.",
    prerequisites: ["Basic understanding of object-oriented programming"],
    learningOutcomes: [
      "Master C# language syntax, records, and pattern matching",
      "Query memory collections and database sets with LINQ",
      "Build RESTful APIs with ASP.NET Core and dependency injection",
      "Write asynchronous services using Task-based asynchronous pattern (TAP)",
    ],
    modules: [
      {
        title: "Module 1: .NET, Types, and Control Flow",
        lessons: ["The .NET Build and Execution Model", "Types, Conversion, and Nullable References"],
        assessment: "C# Foundations Checkpoint",
      },
      {
        title: "Module 2: Collections, LINQ, and Domain Models",
        lessons: ["Conditions, Patterns, and Boundaries", "Collections, Iteration, and LINQ"],
        assessment: "LINQ & Boundaries Assessment",
      },
      {
        title: "Module 3: JSON, Async I/O, and a Project",
        lessons: ["Methods, Records, Classes, and Encapsulation", "Files, JSON, Async, and a Progress Tracker"],
        assessment: "Enterprise C# .NET Certification Exam",
      },
    ],
  },
  {
    slug: "c-programming",
    title: "C Programming & Memory Architecture",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "beginner",
    duration: "4–6 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Pointers, heap allocation (malloc/free), stack frames, struct layout, and POSIX I/O.",
    fullDescription: "Learn how computers actually execute programs. Master hardware memory organization, pointer arithmetic, manual heap allocation, stack frames, file descriptors, bitwise operators, and multi-file compilation with Makefiles.",
    prerequisites: ["Curiosity about low-level system internals"],
    learningOutcomes: [
      "Understand stack vs heap memory layout and pointer arithmetic",
      "Prevent memory leaks, buffer overflows, and dangling pointers",
      "Use structs, bitfields, and unions for packed binary protocols",
      "Compile and link multi-file C programs with gcc and make",
    ],
    modules: [
      {
        title: "Module 1: Build Process, Types, and Input",
        lessons: ["Compiling C and Reading Diagnostics", "Types, Expressions, and Safe Input"],
        assessment: "C Foundations Checkpoint",
      },
      {
        title: "Module 2: Control Flow, Arrays, and Functions",
        lessons: ["Conditions, Operators, and Boundaries", "Loops, Arrays, and Bounds"],
        assessment: "Control Flow & Arrays Assessment",
      },
      {
        title: "Module 3: Pointers, Structs, Files, and a Project",
        lessons: ["Functions, Pointers, and Ownership", "Structs, Text Files, and a Progress Tracker"],
        assessment: "Systems C Programming Final Exam",
      },
    ],
  },
  {
    slug: "java",
    title: "Java Enterprise Architecture",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "intermediate",
    duration: "5–7 weeks · 5 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "JVM internals, garbage collection, collections framework, multithreading, and Spring Boot.",
    fullDescription: "From bytecode compilation and JVM memory tuning to the Java Collections Framework, lambda streams, concurrent executors, and robust enterprise microservices.",
    prerequisites: ["Basic programming familiarity"],
    learningOutcomes: [
      "Understand JVM bytecode execution, garbage collectors, and heap memory",
      "Process collections efficiently using Java 8+ Streams and Lambdas",
      "Manage multithreading with ExecutorService and thread synchronization",
      "Build robust microservices with Spring Boot and JPA",
    ],
    modules: [
      {
        title: "Module 1: Compilation, Types, and Input",
        lessons: ["JDK, Compilation, and Program Structure", "Primitive Types, Strings, and Input"],
        assessment: "Java Foundations Checkpoint",
      },
      {
        title: "Module 2: Control Flow, Arrays, and Methods",
        lessons: ["Conditions, Boolean Logic, and Boundaries", "Loops, Arrays, and Iteration"],
        assessment: "Control Flow & Arrays Assessment",
      },
      {
        title: "Module 3: Classes, Collections, and a Project",
        lessons: ["Methods, Classes, and Encapsulation", "Collections and a Progress Tracker"],
        assessment: "Enterprise Java Final Exam",
      },
    ],
  },
  {
    slug: "php",
    title: "Modern PHP & Web Architecture",
    category: "programming",
    categoryLabel: "Programming Languages",
    level: "beginner",
    duration: "4–5 weeks · 4 hrs/week",
    lessonsCount: 6,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "PHP 8.x types, OOP, Composer package management, PDO security, and MVC frameworks.",
    fullDescription: "Modern PHP is fast, type-safe, and powers over 70% of the web. Learn PHP 8 typed properties, attributes, Composer autoloading, PDO prepared statements, and MVC architectural patterns (Laravel/Symfony).",
    prerequisites: ["Basic HTML & web concepts"],
    learningOutcomes: [
      "Write modern PHP 8.x code with strict types and match expressions",
      "Prevent SQL injection using PDO prepared statements",
      "Structure modular projects using Composer and PSR standards",
      "Build RESTful endpoints and MVC web applications",
    ],
    modules: [
      {
        title: "Module 1: Runtime, Types, Input, and Control Flow",
        lessons: ["PHP Runtime, Files, and Composer", "Types, Strings, Input, and Validation"],
        assessment: "PHP 8 Syntax Checkpoint",
      },
      {
        title: "Module 2: Functions, Errors, and Domain Models",
        lessons: ["Control Flow, Arrays, and Iteration", "Functions, Exceptions, and Boundaries"],
        assessment: "Functions & Errors Assessment",
      },
      {
        title: "Module 3: PDO, Web Security, and a Project",
        lessons: ["Classes, Value Objects, and Encapsulation", "PDO, Sessions, Security, and a Progress Tracker"],
        assessment: "Modern PHP Web Architecture Final Exam",
      },
    ],
  },
];

interface CourseCatalogueProps {
  onSelectCourse: (slug: string) => void;
  onNavigatePaths?: () => void;
  userRole?: string;
  preferredField?: string;
}

function isCourseRelevantToGoal(course: CourseCatalogueItem, userGoal: string): boolean {
  if (!userGoal) return false;
  const g = userGoal.toLowerCase();
  if (g.includes("cloud") || g.includes("devops") || g.includes("infrastructure") || g.includes("sre")) {
    return course.category === "cloud" || course.slug.includes("cloud") || course.slug.includes("devops");
  }
  if (g.includes("security") || g.includes("cyber") || g.includes("soc") || g.includes("penetration")) {
    return course.category === "security" || course.slug.includes("security") || course.slug.includes("cyber");
  }
  if (g.includes("data") || g.includes("analytics") || g.includes("sql") || g.includes("bi") || g.includes("analyst") || g.includes("ai") || g.includes("machine learning")) {
    return course.category === "data" || course.slug.includes("sql") || course.slug.includes("power-bi") || course.slug.includes("python");
  }
  if (g.includes("frontend") || g.includes("react") || g.includes("web") || g.includes("full-stack") || g.includes("software") || g.includes("developer") || g.includes("engineer")) {
    return course.category === "programming" || course.slug.includes("javascript") || course.slug.includes("typescript") || course.slug.includes("python") || course.slug.includes("go") || course.slug.includes("java");
  }
  return false;
}

export function CourseCatalogueView({ onSelectCourse, onNavigatePaths, userRole, preferredField }: CourseCatalogueProps) {
  const effectiveGoal = userRole || preferredField || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(effectiveGoal ? "recommended" : "all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeCourseDetail, setActiveCourseDetail] = useState<CourseCatalogueItem | null>(null);

  const filteredCourses = CATALOGUE_COURSES.filter((course) => {
    if (selectedCategory === "recommended" && effectiveGoal) {
      if (!isCourseRelevantToGoal(course, effectiveGoal)) return false;
    } else if (selectedCategory !== "all" && course.category !== selectedCategory) {
      return false;
    }
    if (selectedLevel !== "all" && course.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(q);
      const matchDesc = course.shortDescription.toLowerCase().includes(q);
      const matchCategory = course.categoryLabel.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in" data-testid="course-catalogue-view">
      {/* Header Banner */}
      <div className="rounded-2xl border border-ink/8 bg-gradient-to-r from-brand-forest/10 via-surface to-transparent p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-forest/20 bg-brand-forest/10 px-3 py-1 text-xs font-semibold text-brand-forest">
              <BookOpen className="h-3.5 w-3.5" />
              Verified Course Catalogue
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink font-serif">
              Explore 14 Authored Technical Courses
            </h1>
            <p className="text-sm md:text-base text-ink/70">
              Complete, production-verified courses across software engineering, cloud infrastructure,
              cyber defense, and data analytics. Each course includes full lesson content, practical
              labs, and server-graded mock exams.
            </p>
          </div>

          {onNavigatePaths && (
            <button
              type="button"
              onClick={onNavigatePaths}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-brand-forest/30 bg-white px-4 py-2.5 text-xs font-semibold text-brand-forest shadow-xs hover:bg-brand-forest/5 transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              View Multi-Course Paths <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-ink/10 pb-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by language, framework, topic (e.g. Python, SQL, Cloud)..."
            className="w-full rounded-xl border border-ink/15 bg-white pl-10 pr-4 py-2 text-xs md:text-sm text-ink placeholder:text-ink/40 focus:border-brand-forest focus:outline-hidden focus:ring-1 focus:ring-brand-forest"
          />
        </div>

        {/* Category & Level Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              ...(effectiveGoal
                ? [{ id: "recommended", label: `✨ For ${effectiveGoal}` }]
                : []),
              { id: "all", label: "All Topics" },
              { id: "programming", label: "Programming" },
              { id: "cloud", label: "Cloud" },
              { id: "security", label: "Security" },
              { id: "data", label: "Data & SQL" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-ink text-white"
                    : "bg-surface text-ink/70 hover:bg-ink/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-ink/15 hidden md:block" />

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-xs text-ink/70 focus:outline-hidden focus:border-brand-forest"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {selectedCategory === "recommended" && effectiveGoal && (
        <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-4 py-2.5 text-xs text-emerald-900">
          <span>Showing courses tailored to your target goal: <strong>{effectiveGoal}</strong></span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="font-semibold underline hover:text-emerald-950 cursor-pointer"
          >
            Explore all 14 courses →
          </button>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isMatch = Boolean(effectiveGoal && isCourseRelevantToGoal(course, effectiveGoal));
          return (
            <div
              key={course.slug}
              className={`group flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs hover:border-brand-forest/40 hover:shadow-md transition-all ${
                isMatch ? "border-emerald-300 ring-1 ring-emerald-100" : "border-ink/10"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink/70 uppercase tracking-wider">
                      {course.categoryLabel}
                    </span>
                    {isMatch && (
                      <span className="rounded-full bg-emerald-100/80 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        Role Match
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      course.level === "beginner"
                        ? "bg-emerald-50 text-emerald-700"
                        : course.level === "intermediate"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {course.level}
                  </span>
                </div>

              <div>
                <h3 className="text-lg font-bold text-ink group-hover:text-brand-forest transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-ink/70 line-clamp-2 leading-relaxed">
                  {course.shortDescription}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-ink/5 pt-3 text-[11px] text-ink/65">
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">{course.lessonsCount}</span>
                  <span className="text-[10px] text-ink/50">Lessons</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">{course.practicalLabsCount}</span>
                  <span className="text-[10px] text-ink/50">Hands-on Labs</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">{course.mockTestsCount}</span>
                  <span className="text-[10px] text-ink/50">Mock Tests</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/8 pt-4">
              <button
                type="button"
                onClick={() => setActiveCourseDetail(course)}
                className="text-xs font-semibold text-ink/70 hover:text-ink hover:underline"
              >
                Inspect Syllabus
              </button>

              <button
                type="button"
                onClick={() => onSelectCourse(course.slug)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-forest px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-forest/90 transition-all shadow-xs"
              >
                Study Course <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink/20 p-12 text-center space-y-3">
          <BookOpen className="mx-auto h-8 w-8 text-ink/30" />
          <h3 className="font-bold text-ink">No courses match your search criteria</h3>
          <p className="text-xs text-ink/60">
            Try adjusting your search terms or clearing your topic and difficulty filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
            className="text-xs font-semibold text-brand-forest hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Course Detail Drawer / Modal (Phase 4 Specification) */}
      {activeCourseDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-detail-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink/70 uppercase">
                    {activeCourseDetail.categoryLabel}
                  </span>
                  <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-xs font-semibold text-brand-forest capitalize">
                    {activeCourseDetail.level}
                  </span>
                  <span className="text-xs text-ink/50 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {activeCourseDetail.duration}
                  </span>
                </div>
                <h2 id="course-detail-title" className="text-2xl font-bold text-ink">
                  {activeCourseDetail.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveCourseDetail(null)}
                className="rounded-full p-1.5 text-ink/40 hover:bg-surface hover:text-ink transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Course Overview
              </h4>
              <p className="text-sm text-ink/80 leading-relaxed">
                {activeCourseDetail.fullDescription}
              </p>
            </div>

            {/* Prerequisites & Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-ink/8 bg-surface p-4 space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Prerequisites
                </h5>
                <ul className="space-y-1 text-xs text-ink/75">
                  {activeCourseDetail.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-ink/8 bg-surface p-4 space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Target Competencies
                </h5>
                <ul className="space-y-1 text-xs text-ink/75">
                  {activeCourseDetail.learningOutcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-forest mt-0.5" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Modules Syllabus Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Syllabus & Structured Modules ({activeCourseDetail.modules.length} Modules)
              </h4>
              <div className="space-y-3">
                {activeCourseDetail.modules.map((mod, idx) => (
                  <div key={idx} className="rounded-xl border border-ink/10 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-ink text-sm">{mod.title}</h5>
                      <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/70">
                        {mod.lessons.length} Lessons
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-3 border-l-2 border-brand-forest/20">
                      {mod.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2 text-xs text-ink/80">
                          <BookOpen className="h-3.5 w-3.5 text-brand-forest/70" />
                          <span>{lesson}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold">Module Assessment: {mod.assessment}</span>
                      </div>
                      <span className="text-[11px] text-amber-800">Pass: 70%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
              <button
                type="button"
                onClick={() => setActiveCourseDetail(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-surface transition-colors"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectCourse(activeCourseDetail.slug);
                  setActiveCourseDetail(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-forest px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90 transition-all"
              >
                Start Learning in Studio <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

