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
        title: "Module 1: Foundations & Control Flow",
        lessons: ["Python Syntax and Data Types", "Control Flow and Functions"],
        assessment: "Foundation Checkpoint: Syntax & Flow",
      },
      {
        title: "Module 2: Data Structures & OOP",
        lessons: ["Data Structures and Algorithms", "Object-Oriented Programming in Python"],
        assessment: "Mid-Term Exam: Data Structures & Classes",
      },
      {
        title: "Module 3: Errors, Packages & Testing",
        lessons: ["Modules, Packages, and Virtual Environments", "Error Handling and Testing with Pytest"],
        assessment: "Comprehensive Python Final Exam",
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
        title: "Module 1: JavaScript Foundations & Scopes",
        lessons: ["JavaScript Fundamentals & Scope", "Functions, Closures, and Higher-Order Functions"],
        assessment: "Scope & Closure Checkpoint",
      },
      {
        title: "Module 2: Asynchronous Programming",
        lessons: ["Asynchronous JavaScript & Promises", "DOM Manipulation and Event Handling"],
        assessment: "Asynchronous & DOM Assessment",
      },
      {
        title: "Module 3: Modern Tooling & Architecture",
        lessons: ["Modern ES6+ Features and Modules", "Testing and Debugging JavaScript Applications"],
        assessment: "Modern JavaScript Certification Exam",
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
      "Implement disciminated unions for exhaustive state machines",
      "Safely integrate third-party untyped JavaScript libraries",
    ],
    modules: [
      {
        title: "Module 1: Type Fundamentals & Interfaces",
        lessons: ["Introduction to TypeScript & Type Annotations", "Interfaces, Type Aliases, and Object Types"],
        assessment: "Type Systems & Interfaces Checkpoint",
      },
      {
        title: "Module 2: Generics & Advanced Types",
        lessons: ["Generics and Type Constraints", "Union, Intersection, and Literal Types"],
        assessment: "Generics & Advanced Types Assessment",
      },
      {
        title: "Module 3: Production Tooling & Strict Mode",
        lessons: ["Classes and Object-Oriented TypeScript", "TypeScript Configuration, Tooling, and Strict Mode"],
        assessment: "Enterprise TypeScript Final Exam",
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL & Relational Databases",
    category: "data",
    categoryLabel: "Data & Analytics",
    level: "beginner",
    duration: "3–4 weeks · 4 hrs/week",
    lessonsCount: 4,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Relational modeling, multi-table JOINs, aggregations, window functions, and indexing.",
    fullDescription: "From entity-relationship modeling and ACID guarantees to complex multi-table queries, subqueries, analytical window functions, query plan analysis, and performance indexing.",
    prerequisites: ["Basic data literacy"],
    learningOutcomes: [
      "Design normalized relational schemas up to 3NF",
      "Query datasets with complex JOINs, GROUP BY, and HAVING",
      "Optimize query execution with indexes and EXPLAIN plans",
      "Manage transactional integrity with ACID guarantees",
    ],
    modules: [
      {
        title: "Module 1: Relational Schema & Basic Queries",
        lessons: ["Relational Database Foundations & SQL Basics", "Filtering, Sorting, and Aggregating Data"],
        assessment: "Query Basics & Filtering Checkpoint",
      },
      {
        title: "Module 2: Advanced Joins, Transactions & Tuning",
        lessons: ["Joining Multiple Tables and Subqueries", "Database Design, Transactions, and Performance"],
        assessment: "Relational SQL Comprehensive Exam",
      },
    ],
  },
  {
    slug: "power-bi",
    title: "Power BI & Business Intelligence",
    category: "data",
    categoryLabel: "Data & Analytics",
    level: "beginner",
    duration: "3–4 weeks · 4 hrs/week",
    lessonsCount: 4,
    mockTestsCount: 3,
    practicalLabsCount: 1,
    shortDescription: "Power Query ETL, star schema data modeling, DAX measures, and executive dashboards.",
    fullDescription: "Transform messy raw datasets into interactive visual analytics. Master Power Query data cleaning, star schema dimensional modeling, DAX calculated columns and measures, and executive dashboard design.",
    prerequisites: ["Spreadsheet or basic data familiarity"],
    learningOutcomes: [
      "Extract and transform data using Power Query M language",
      "Build performant star schemas with active relationships",
      "Author DAX formulas (CALCULATE, RELATED, time intelligence)",
      "Design responsive, accessible executive report dashboards",
    ],
    modules: [
      {
        title: "Module 1: Data Ingestion & Star Schema",
        lessons: ["Power BI Environment & Data Ingestion", "Data Modeling and Star Schema Design"],
        assessment: "ETL & Star Schema Checkpoint",
      },
      {
        title: "Module 2: DAX Measures & Report Design",
        lessons: ["DAX Formulas and Calculated Measures", "Interactive Visualizations and Dashboard Publishing"],
        assessment: "Power BI Analytics Certification Exam",
      },
    ],
  },
  {
    slug: "cloud-computing",
    title: "Cloud Computing Foundations",
    category: "cloud",
    categoryLabel: "Infrastructure & Cloud",
    level: "beginner",
    duration: "3–4 weeks · 4 hrs/week",
    lessonsCount: 4,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "Cloud architectures, virtual networks, compute instances, object storage, and IAM.",
    fullDescription: "Understand fundamental cloud provider paradigms (AWS, Azure, GCP). Master shared responsibility models, Virtual Private Clouds (VPC), subnetting, compute instances, blob storage, and least-privilege IAM.",
    prerequisites: ["Basic computer networking fundamentals"],
    learningOutcomes: [
      "Differentiate IaaS, PaaS, and SaaS cloud architectures",
      "Configure VPC subnets, security groups, and routing tables",
      "Deploy elastic compute and serverless function workloads",
      "Implement least-privilege IAM identity policies",
    ],
    modules: [
      {
        title: "Module 1: Cloud Architecture & IAM",
        lessons: ["Cloud Architecture and Service Models", "Compute, Virtualization, and Containers"],
        assessment: "Architecture & Compute Checkpoint",
      },
      {
        title: "Module 2: Networking & Security Operations",
        lessons: ["Cloud Storage, Databases, and Networking", "Cloud Security, IAM, and Cost Governance"],
        assessment: "Cloud Foundations Comprehensive Exam",
      },
    ],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity & Threat Defense",
    category: "security",
    categoryLabel: "Cybersecurity & Defense",
    level: "beginner",
    duration: "3–4 weeks · 4 hrs/week",
    lessonsCount: 4,
    mockTestsCount: 3,
    practicalLabsCount: 2,
    shortDescription: "CIA triad, threat vectors, authentication protocols, firewalls, and SOC log analysis.",
    fullDescription: "Establish core cyber defense competencies. Explore threat modeling, OWASP Top 10 web vulnerabilities, cryptographic encryption, multi-factor authentication, network security perimeters, and incident response.",
    prerequisites: ["Basic computer and networking awareness"],
    learningOutcomes: [
      "Identify common attack vectors (phishing, MITM, injection, DoS)",
      "Analyze authentication mechanisms and cryptographic hashes",
      "Read server auth logs to identify brute-force attacks",
      "Apply the NIST cybersecurity incident response framework",
    ],
    modules: [
      {
        title: "Module 1: Security Fundamentals & Vectors",
        lessons: ["Cybersecurity Principles and Threat Landscape", "Network Security, Firewalls, and Protocols"],
        assessment: "Threat Landscape Checkpoint",
      },
      {
        title: "Module 2: Identity, Defense & Incident Triage",
        lessons: ["Authentication, Cryptography, and Access Control", "Application Security, Vulnerability Assessment, and Incident Response"],
        assessment: "Cybersecurity Defense Certification Exam",
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
        title: "Module 1: Language Syntax & Pointers",
        lessons: ["Go Fundamentals & Syntax", "Pointers, Structs, and Methods"],
        assessment: "Go Syntax & Pointers Checkpoint",
      },
      {
        title: "Module 2: Interfaces & Concurrency",
        lessons: ["Interfaces and Polymorphism in Go", "Goroutines, Channels, and Concurrency"],
        assessment: "Goroutines & Concurrency Assessment",
      },
      {
        title: "Module 3: Microservices & Testing",
        lessons: ["Standard Library, I/O, and Networking", "Testing, Benchmarking, and Production Deployment in Go"],
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
        title: "Module 1: Ownership & The Borrow Checker",
        lessons: ["Rust Fundamentals & Ownership", "Borrowing, References, and Slices"],
        assessment: "Ownership & Borrowing Checkpoint",
      },
      {
        title: "Module 2: Structs, Enums & Error Handling",
        lessons: ["Structs, Enums, and Pattern Matching", "Error Handling with Result and Option"],
        assessment: "Pattern Matching & Errors Assessment",
      },
      {
        title: "Module 3: Generics, Traits & Concurrency",
        lessons: ["Generics, Traits, and Lifetimes", "Fearless Concurrency and Memory Safety in Rust"],
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
        title: "Module 1: Modern Syntax & RAII",
        lessons: ["Modern C++ Foundations and Syntax", "Object-Oriented Programming and RAII in C++"],
        assessment: "Modern C++ & RAII Checkpoint",
      },
      {
        title: "Module 2: Memory & STL Containers",
        lessons: ["Memory Management, Pointers, and References", "Standard Template Library (STL) Containers & Algorithms"],
        assessment: "Memory & STL Algorithms Assessment",
      },
      {
        title: "Module 3: Templates & Move Semantics",
        lessons: ["Templates and Generic Programming", "Move Semantics, Concurrency, and Modern C++ Practices"],
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
        title: "Module 1: Foundations & OOP in C#",
        lessons: ["C# Language Basics and Type System", "Object-Oriented Programming with C#"],
        assessment: "C# Foundations Checkpoint",
      },
      {
        title: "Module 2: LINQ & Asynchronous C#",
        lessons: ["LINQ and Data Manipulation", "Asynchronous Programming and Multithreading in C#"],
        assessment: "LINQ & Async Programming Assessment",
      },
      {
        title: "Module 3: ASP.NET Core & Enterprise Patterns",
        lessons: ["Generics, Collections, and Exception Handling", "Building Applications with .NET and Modern C#"],
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
        title: "Module 1: C Syntax & Functions",
        lessons: ["C Language Foundations & Execution Model", "Functions, Variable Scope, and the Call Stack"],
        assessment: "C Foundations Checkpoint",
      },
      {
        title: "Module 2: Pointers & Dynamic Memory",
        lessons: ["Pointers and Memory Addressing", "Arrays, Strings, and Dynamic Memory Allocation"],
        assessment: "Pointers & Dynamic Memory Assessment",
      },
      {
        title: "Module 3: Structures, File I/O & Tooling",
        lessons: ["Structures, Unions, and Bit Manipulation", "File I/O, Preprocessor Directives, and Build Tooling"],
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
        title: "Module 1: Java OOP & JVM Internals",
        lessons: ["Java Foundations and JVM Architecture", "Object-Oriented Design and Inheritance in Java"],
        assessment: "Java Foundations Checkpoint",
      },
      {
        title: "Module 2: Collections & Concurrency",
        lessons: ["Java Collections Framework and Generics", "Concurrency and Multithreading in Java"],
        assessment: "Collections & Concurrency Assessment",
      },
      {
        title: "Module 3: Streams, I/O & Enterprise Java",
        lessons: ["Streams API and Functional Programming in Java", "File I/O, Networking, and Enterprise Patterns in Java"],
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
        title: "Module 1: PHP 8 Syntax & Web Basics",
        lessons: ["PHP Fundamentals and Environment Setup", "Object-Oriented PHP and Class Design"],
        assessment: "PHP 8 Syntax Checkpoint",
      },
      {
        title: "Module 2: Databases & Security with PDO",
        lessons: ["Database Integration with PDO and Security", "Composer, Autoloading, and Dependency Management"],
        assessment: "PDO & Security Assessment",
      },
      {
        title: "Module 3: Web MVC & REST APIs",
        lessons: ["Building Web Applications and REST APIs with PHP", "Testing, Quality Assurance, and Modern PHP Standards"],
        assessment: "Modern PHP Web Architecture Final Exam",
      },
    ],
  },
];

interface CourseCatalogueProps {
  onSelectCourse: (slug: string) => void;
  onNavigatePaths?: () => void;
}

export function CourseCatalogueView({ onSelectCourse, onNavigatePaths }: CourseCatalogueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeCourseDetail, setActiveCourseDetail] = useState<CourseCatalogueItem | null>(null);

  const filteredCourses = CATALOGUE_COURSES.filter((course) => {
    if (selectedCategory !== "all" && course.category !== selectedCategory) return false;
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.slug}
            className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-xs hover:border-brand-forest/40 hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink/70 uppercase tracking-wider">
                  {course.categoryLabel}
                </span>
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
        ))}
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

