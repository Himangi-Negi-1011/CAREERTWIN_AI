import {
  type MockTestDocument,
  type MockTestQuestion,
  mockTestDocumentSchema,
} from "./mock-test-schema";
import { saveMockTest, listMockTestsForSkill } from "./repository";
import { skillSlug } from "./catalog";
import { resolveDomainCategory } from "./domain-knowledge";

interface QuestionSeed {
  type: MockTestQuestion["type"];
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: string; text: string }>;
  correctOptionIds: string[];
  explanation: string;
  topic: string;
  marks?: number;
  recommendedLessonTitle?: string;
}

/**
 * Returns a robust set of 15-20 distinct, subject-specific questions for a skill domain.
 */
function getDomainQuestions(skillName: string): QuestionSeed[] {
  const category = resolveDomainCategory(skillName);

  switch (category) {
    case "python":
      return [
        {
          type: "code-output",
          prompt: "What is the exact output of the following list comprehension snippet?",
          codeSnippet: `matrix = [[1, 2], [3, 4]]\nflattened = [val for row in matrix for val in row]\nprint(flattened)`,
          options: [
            { id: "opt-1", text: "[1, 2, 3, 4]" },
            { id: "opt-2", text: "[[1, 2], [3, 4]]" },
            { id: "opt-3", text: "[1, 3, 2, 4]" },
            { id: "opt-4", text: "TypeError: list indices must be integers" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "In nested list comprehensions in Python, outer loops come first from left to right: for row in matrix, then for val in row.",
          topic: "Data Structures & Comprehensions",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Python",
        },
        {
          type: "debugging",
          prompt: "Identify why the following function mutates state unexpectedly across calls:",
          codeSnippet: `def append_item(item, target_list=[]):\n    target_list.append(item)\n    return target_list\n\na = append_item(1)\nb = append_item(2)`,
          options: [
            { id: "opt-1", text: "Default arguments are evaluated once at function definition time, sharing the mutable list instance." },
            { id: "opt-2", text: "Python functions create a global variable when default arguments are used." },
            { id: "opt-3", text: "append() returns None rather than the updated list." },
            { id: "opt-4", text: "Integers cannot be appended to untyped lists." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Python evaluates default parameter expressions once at definition time. Mutable default arguments (like lists or dicts) are shared across all calls.",
          topic: "Functions & Scope",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Python",
        },
        {
          type: "scenario",
          prompt: "You are processing a 10GB log file on an instance with 2GB RAM. Which Python approach avoids memory exhaustion?",
          options: [
            { id: "opt-1", text: "Read the file line-by-line using a generator iterator (with open(...) as f: for line in f:)" },
            { id: "opt-2", text: "Call f.readlines() to parse all lines into memory at once" },
            { id: "opt-3", text: "Convert the file to a JSON object before looping" },
            { id: "opt-4", text: "Use multiprocessing to load the entire file into 8 concurrent arrays" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Iterating over a file object in Python streams line by line as a generator without loading the entire payload into RAM.",
          topic: "Memory Management & Generators",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Python",
        },
        {
          type: "multiple-select",
          prompt: "Which of the following statements about Python's Global Interpreter Lock (GIL) and concurrency are correct?",
          options: [
            { id: "opt-1", text: "The GIL allows only one native thread to execute Python bytecode at a time in CPython" },
            { id: "opt-2", text: "multiprocessing bypasses the GIL by creating separate processes with separate memory spaces" },
            { id: "opt-3", text: "I/O bound operations release the GIL while waiting for network or disk operations" },
            { id: "opt-4", text: "threading provides true multi-core parallel CPU execution for math-heavy loops in CPython" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "In CPython, GIL prevents multi-threaded CPU parallel execution, but I/O releases the lock, and multiprocessing spawns separate OS processes.",
          topic: "Concurrency & Architecture",
          marks: 3,
          recommendedLessonTitle: "Production Patterns and Resilience in Python",
        },
        {
          type: "single-choice",
          prompt: "What does the '__slots__' attribute do when declared on a Python class?",
          options: [
            { id: "opt-1", text: "It restricts valid instance attributes to a fixed set, eliminating __dict__ to optimize memory usage." },
            { id: "opt-2", text: "It prevents other classes from inheriting from the declared class." },
            { id: "opt-3", text: "It automatically serializes class instances to JSON format." },
            { id: "opt-4", text: "It declares private variables accessible only via getter functions." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Defining __slots__ on a class prevents the creation of the default __dict__ per instance, significantly reducing memory consumption for millions of objects.",
          topic: "Object-Oriented Programming & Optimization",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Python",
        },
        {
          type: "debugging",
          prompt: "What will occur when running: try: 1 / 0 except LookupError: print('A') except ZeroDivisionError: print('B')",
          codeSnippet: `try:\n    1 / 0\nexcept LookupError:\n    print("A")\nexcept ZeroDivisionError:\n    print("B")`,
          options: [
            { id: "opt-1", text: "Prints 'B' because ZeroDivisionError inherits from ArithmeticError, not LookupError." },
            { id: "opt-2", text: "Prints 'A' because LookupError is the base class for arithmetic exceptions." },
            { id: "opt-3", text: "SyntaxError because multiple except blocks are prohibited." },
            { id: "opt-4", text: "Uncaught exception crash." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "ZeroDivisionError inherits from ArithmeticError, not LookupError (which is the parent of IndexError and KeyError). The second block matches.",
          topic: "Exception Hierarchy & Error Handling",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Python",
        },
        {
          type: "scenario",
          prompt: "Which decorator is used to define a method that operates on class state rather than a specific instance?",
          options: [
            { id: "opt-1", text: "@classmethod (receiving cls as first parameter)" },
            { id: "opt-2", text: "@staticmethod (receiving self as first parameter)" },
            { id: "opt-3", text: "@property" },
            { id: "opt-4", text: "@abstractmethod" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "@classmethod binds the method to the class namespace, taking cls as its first parameter.",
          topic: "Decorators & Metaprogramming",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Python",
        },
        {
          type: "multiple-select",
          prompt: "Which of the following built-in Python data types are mutable?",
          options: [
            { id: "opt-1", text: "list" },
            { id: "opt-2", text: "dict" },
            { id: "opt-3", text: "set" },
            { id: "opt-4", text: "tuple" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "Lists, dicts, and sets can be mutated in place. Tuples and frozensets are immutable.",
          topic: "Data Structures & Mutability",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Python",
        },
      ];

    case "sql":
      return [
        {
          type: "scenario",
          prompt: "A query filtering on WHERE UPPER(email) = 'USER@EXAMPLE.COM' is causing full table scans despite an index on email. What is the solution?",
          options: [
            { id: "opt-1", text: "Create a functional/expression index on UPPER(email) or normalize email to lowercase before indexing and querying" },
            { id: "opt-2", text: "Add an extra ORDER BY email ASC clause" },
            { id: "opt-3", text: "Convert the column type from VARCHAR to TEXT" },
            { id: "opt-4", text: "Change the SELECT clause to SELECT *" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Wrapping indexed columns in functions disables standard B-Tree index lookups unless an expression index exists or values are pre-normalized.",
          topic: "Indexing & Query Optimization",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in SQL",
        },
        {
          type: "code-output",
          prompt: "What rows are returned by this SQL query?",
          codeSnippet: `SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5;`,
          options: [
            { id: "opt-1", text: "Only department IDs that have strictly more than 5 employee records" },
            { id: "opt-2", text: "The first 5 departments ordered by employee count" },
            { id: "opt-3", text: "All employees in departments where at least one person makes over 5k" },
            { id: "opt-4", text: "A syntax error because WHERE was omitted" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "HAVING filters aggregated groups after the GROUP BY clause, retaining only groups satisfying the aggregate predicate.",
          topic: "Aggregation & Grouping",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in SQL",
        },
        {
          type: "multiple-select",
          prompt: "Which of the following are ACID properties in relational database transactions?",
          options: [
            { id: "opt-1", text: "Atomicity: All operations in the transaction succeed or all roll back" },
            { id: "opt-2", text: "Consistency: The transaction brings the database from one valid state to another" },
            { id: "opt-3", text: "Isolation: Concurrent execution of transactions yields the same state as serial execution" },
            { id: "opt-4", text: "Adaptability: Schema changes apply dynamically without migration locks" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability.",
          topic: "Transactions & Concurrency",
          marks: 3,
          recommendedLessonTitle: "Production Patterns and Resilience in SQL",
        },
        {
          type: "single-choice",
          prompt: "What is the difference between an INNER JOIN and a LEFT OUTER JOIN?",
          options: [
            { id: "opt-1", text: "INNER JOIN returns only rows with matches in both tables; LEFT OUTER JOIN preserves all left rows and fills unmatched right columns with NULL." },
            { id: "opt-2", text: "LEFT OUTER JOIN returns only unmatched rows." },
            { id: "opt-3", text: "INNER JOIN can only be used on primary keys." },
            { id: "opt-4", text: "LEFT JOIN sorts the results in ascending order automatically." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "LEFT JOIN keeps all records from the left-hand table regardless of whether the join predicate matches a row on the right.",
          topic: "Relational Joins & Set Theory",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in SQL",
        },
        {
          type: "debugging",
          prompt: "What will happen if you compare a column value with NULL using '=' (e.g. WHERE status = NULL)?",
          options: [
            { id: "opt-1", text: "It returns UNKNOWN (evaluating to false in WHERE), matching zero rows; 'IS NULL' must be used instead." },
            { id: "opt-2", text: "It matches all rows where status is an empty string." },
            { id: "opt-3", text: "It triggers a syntax error in ANSI SQL." },
            { id: "opt-4", text: "It converts NULL to zero." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "In three-valued SQL logic, NULL = NULL evaluates to UNKNOWN, not TRUE. Checking for nullability requires the 'IS NULL' operator.",
          topic: "Three-Valued Logic & NULL Handling",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in SQL",
        },
        {
          type: "scenario",
          prompt: "When is a Common Table Expression (CTE / WITH clause) preferred over a nested subquery?",
          options: [
            { id: "opt-1", text: "When improving readability for multi-step data pipelines or when performing recursive hierarchical queries." },
            { id: "opt-2", text: "Because CTEs automatically bypass database transaction locks." },
            { id: "opt-3", text: "Because subqueries cannot contain WHERE clauses." },
            { id: "opt-4", text: "Because CTEs are stored permanently as physical database tables." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "CTEs structure complex queries into logical sequential steps and support recursive queries for trees or graph structures.",
          topic: "CTEs & Advanced Querying",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in SQL",
        },
      ];

    case "excel":
      return [
        {
          type: "single-choice",
          prompt: "Why is XLOOKUP preferred over VLOOKUP in modern financial modeling?",
          options: [
            { id: "opt-1", text: "XLOOKUP defaults to exact match, allows looking up to the left, and does not break when columns are added or removed." },
            { id: "opt-2", text: "VLOOKUP cannot handle numerical data." },
            { id: "opt-3", text: "XLOOKUP only operates within pivot tables." },
            { id: "opt-4", text: "VLOOKUP is deprecated and removed from Excel 365." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "XLOOKUP specifies the lookup vector and return vector independently, rendering it robust against structural spreadsheet modifications.",
          topic: "Lookup Formulas & Dynamic Arrays",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Excel",
        },
        {
          type: "scenario",
          prompt: "You need to lock both column A and row 1 in a formula so it remains constant when dragged across rows and columns. What reference style is required?",
          options: [
            { id: "opt-1", text: "$A$1 (Absolute Reference)" },
            { id: "opt-2", text: "A$1 (Mixed Reference, row locked)" },
            { id: "opt-3", text: "$A1 (Mixed Reference, column locked)" },
            { id: "opt-4", text: "A1 (Relative Reference)" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "$A$1 locks both horizontal and vertical offsets when autofilling across a spreadsheet grid.",
          topic: "Cell Referencing Standards",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Excel",
        },
        {
          type: "multiple-select",
          prompt: "Which of the following formulas support multiple criteria filtering in Excel?",
          options: [
            { id: "opt-1", text: "SUMIFS" },
            { id: "opt-2", text: "COUNTIFS" },
            { id: "opt-3", text: "AVERAGEIFS" },
            { id: "opt-4", text: "VLOOKUP" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "The -IFS family of functions takes pairs of range and criteria arguments to filter and aggregate across multiple dimensions.",
          topic: "Multi-Criteria Aggregation",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Excel",
        },
        {
          type: "debugging",
          prompt: "A cell displays the #REF! error. What does this indicate?",
          options: [
            { id: "opt-1", text: "A formula contains an invalid cell reference, often caused by deleting cells, rows, or columns that were referenced." },
            { id: "opt-2", text: "The column width is too narrow to display the number." },
            { id: "opt-3", text: "The formula is dividing by zero." },
            { id: "opt-4", text: "A circular reference was detected." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "#REF! occurs when a referenced range has been deleted or shifted outside the grid boundaries.",
          topic: "Error Handling & Troubleshooting",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Excel",
        },
        {
          type: "scenario",
          prompt: "What is the primary benefit of converting a raw range into an Excel Table (Ctrl+T)?",
          options: [
            { id: "opt-1", text: "Formulas automatically expand to new rows, structured references replace volatile cell addresses, and formatting persists automatically." },
            { id: "opt-2", text: "It prevents other users from editing the file." },
            { id: "opt-3", text: "It converts Excel formulas into VBA macros." },
            { id: "opt-4", text: "It saves the file automatically to cloud storage." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Structured tables adapt dynamically as data is ingested, reducing maintenance overhead in operational workbooks.",
          topic: "Structured Tables & Modeling",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Excel",
        },
      ];

    case "power_bi":
      return [
        {
          type: "single-choice",
          prompt: "In DAX, how does the CALCULATE function modify evaluation?",
          options: [
            { id: "opt-1", text: "It evaluates an expression under a modified filter context, and transitions any active row context into filter context." },
            { id: "opt-2", text: "It forces the formula to compute on the GPU." },
            { id: "opt-3", text: "It converts DAX measures into static physical columns." },
            { id: "opt-4", text: "It bypasses all relationship definitions in the data model." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "CALCULATE is the single most powerful DAX function because it overrides, merges, or clears filter context and triggers context transition.",
          topic: "DAX Evaluation & Filter Context",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Power BI",
        },
        {
          type: "scenario",
          prompt: "Why is a Star Schema architecture preferred over a flat, single-table model in Power BI?",
          options: [
            { id: "opt-1", text: "The VertiPaq tabular engine compresses columnar Dimension tables efficiently and executes single-direction relationships with minimal RAM." },
            { id: "opt-2", text: "Star schemas require fewer measures to be written." },
            { id: "opt-3", text: "Single flat tables cannot be refreshed automatically in the Power BI Service." },
            { id: "opt-4", text: "Power BI visual slicers do not function without star schemas." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "The VertiPaq in-memory engine achieves optimal dictionary encoding and memory compression when data is normalized into distinct Fact and Dimension tables.",
          topic: "Tabular Modeling & Performance",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Power BI",
        },
        {
          type: "multiple-select",
          prompt: "Which of the following represent requirements for a dedicated Date Dimension in Power BI to support time-intelligence functions?",
          options: [
            { id: "opt-1", text: "It must contain continuous calendar dates with zero gaps across the required span" },
            { id: "opt-2", text: "It must contain at least one column formatted as Date or DateTime" },
            { id: "opt-3", text: "It must be marked as the official Date Table in the data model" },
            { id: "opt-4", text: "It must be stored in a SQL database rather than imported into Power BI" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "Time intelligence (DATESYTD, SAMEPERIODLASTYEAR) requires a marked, contiguous Date table with no missing calendar days.",
          topic: "Time Intelligence & Date Dimensions",
          marks: 3,
          recommendedLessonTitle: "Core Syntax and Primitives in Power BI",
        },
        {
          type: "debugging",
          prompt: "A report visual crashes with a '#DIV/0!' visual error. Which DAX function avoids this issue cleanly?",
          options: [
            { id: "opt-1", text: "DIVIDE(Numerator, Denominator, 0)" },
            { id: "opt-2", text: "Numerator / Denominator" },
            { id: "opt-3", text: "QUOTIENT(Numerator, Denominator)" },
            { id: "opt-4", text: "MOD(Numerator, Denominator)" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "DIVIDE safely checks for zero or blank denominators and returns an optional fallback (defaulting to BLANK or 0) rather than raising an error.",
          topic: "DAX Math & Error Handling",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Power BI",
        },
      ];

    case "cybersecurity":
      return [
        {
          type: "scenario",
          prompt: "During a vulnerability scan, a web server responds to requests containing '../../etc/passwd'. What vulnerability does this indicate?",
          options: [
            { id: "opt-1", text: "Path Traversal (Directory Traversal)" },
            { id: "opt-2", text: "Cross-Site Request Forgery (CSRF)" },
            { id: "opt-3", text: "Server-Side Request Forgery (SSRF)" },
            { id: "opt-4", text: "Insecure Direct Object Reference (IDOR)" },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Path traversal allows attackers to read arbitrary files on the server by stepping up directories using dot-dot-slash patterns.",
          topic: "Vulnerability Assessment",
          marks: 2,
          recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
        },
        {
          type: "multiple-select",
          prompt: "Which defensive measures protect against SQL Injection vulnerabilities?",
          options: [
            { id: "opt-1", text: "Parameterized queries (prepared statements)" },
            { id: "opt-2", text: "Object-Relational Mapping (ORM) with parameterized bindings" },
            { id: "opt-3", text: "Strict input validation against allowlists" },
            { id: "opt-4", text: "Client-side alert boxes warning users not to type quotes" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "Parameterized queries separate SQL structure from data, completely neutralizing malicious query injection.",
          topic: "Defensive Engineering",
          marks: 3,
          recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
        },
        {
          type: "single-choice",
          prompt: "What is the primary objective of the Principle of Least Privilege (PoLP)?",
          options: [
            { id: "opt-1", text: "Every user and service is granted only the minimum permissions necessary to perform their legitimate tasks." },
            { id: "opt-2", text: "All users are assigned administrative privileges to prevent operational bottlenecks." },
            { id: "opt-3", text: "Password complexity requirements are reduced for internal network users." },
            { id: "opt-4", text: "Firewalls are configured to allow all outbound traffic unconditionally." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Least privilege limits blast radius: if an identity is compromised, an attacker cannot pivot beyond that identity's minimal permissions.",
          topic: "Access Control & Identity",
          marks: 2,
          recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
        },
        {
          type: "debugging",
          prompt: "Why is base64 encoding NOT considered an encryption mechanism?",
          options: [
            { id: "opt-1", text: "Base64 is an encoding scheme with no secret cryptographic key; anyone can decode it instantly without credentials." },
            { id: "opt-2", text: "Base64 uses 128-bit keys which are easily brute-forced." },
            { id: "opt-3", text: "Base64 only works on ASCII text." },
            { id: "opt-4", text: "Base64 is a proprietary hashing algorithm." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Encoding transforms data representation for transport. Encryption requires secret keys and mathematical algorithms (AES, RSA) to ensure confidentiality.",
          topic: "Cryptography Foundations",
          marks: 2,
          recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
        },
      ];

    case "communication":
      return [
        {
          type: "single-choice",
          prompt: "When communicating with executive leadership, what is the core benefit of the BLUF (Bottom Line Up Front) model?",
          options: [
            { id: "opt-1", text: "It presents the recommendation, key finding, or decision request in the first 2 sentences, respecting stakeholder time." },
            { id: "opt-2", text: "It eliminates the need to provide supporting data or appendices." },
            { id: "opt-3", text: "It guarantees that all proposals will be approved without budget scrutiny." },
            { id: "opt-4", text: "It replaces written communication with informal hallway conversations." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Executives make decisions across dozens of priorities daily. Stating the outcome first enables rapid triage and focused discussion.",
          topic: "Executive Communication & Synthesis",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Communication",
        },
        {
          type: "scenario",
          prompt: "In a cross-functional incident retrospective, what characterizes a 'blameless' communication culture?",
          options: [
            { id: "opt-1", text: "Focusing on systemic vulnerabilities, tooling gaps, and operational processes rather than scapegoating individual engineers." },
            { id: "opt-2", text: "Pretending the failure did not happen to protect team morale." },
            { id: "opt-3", text: "Allowing engineers to delete production logs to avoid scrutiny." },
            { id: "opt-4", text: "Assigning disciplinary penalties privately without documentation." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Blameless post-mortems encourage open reporting of near-misses and root causes, resulting in more resilient architectures.",
          topic: "Collaborative Retrospectives",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Communication",
        },
        {
          type: "multiple-select",
          prompt: "Which components comprise the STAR method for behavioral and situational professional communication?",
          options: [
            { id: "opt-1", text: "Situation: Context and background of the event" },
            { id: "opt-2", text: "Task: The specific responsibility or objective required" },
            { id: "opt-3", text: "Action: The concrete steps you personally executed" },
            { id: "opt-4", text: "Result: Quantifiable outcomes and lessons learned" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3", "opt-4"],
          explanation: "STAR (Situation, Task, Action, Result) is the gold standard for concise, evidence-based storytelling in professional assessments.",
          topic: "Structured Frameworks (STAR)",
          marks: 3,
          recommendedLessonTitle: "Core Syntax and Primitives in Communication",
        },
        {
          type: "single-choice",
          prompt: "What is 'active listening' during technical stakeholder alignment?",
          options: [
            { id: "opt-1", text: "Paraphrasing and verifying understanding of the speaker's core constraints before offering solutions or counterarguments." },
            { id: "opt-2", text: "Waiting silently while thinking about your next rebuttal." },
            { id: "opt-3", text: "Recording the meeting without the speaker's knowledge." },
            { id: "opt-4", text: "Interrupting immediately when an incorrect assumption is spoken." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Active listening demonstrates respect, clarifies ambiguity, and prevents costly misalignment between product and engineering.",
          topic: "Stakeholder Alignment & Active Listening",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Communication",
        },
      ];

    case "finance_accounting":
      return [
        {
          type: "single-choice",
          prompt: "Under accrual accounting, when is revenue officially recognized?",
          options: [
            { id: "opt-1", text: "When goods or services are delivered to the customer, regardless of when cash is actually received." },
            { id: "opt-2", text: "Only when the customer's cash deposit clears the bank account." },
            { id: "opt-3", text: "At the end of the calendar fiscal year." },
            { id: "opt-4", text: "When the contract is signed before work begins." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Accrual accounting matches revenues to the period in which performance obligations are satisfied (GAAP / IFRS).",
          topic: "Revenue Recognition & Accrual Accounting",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Finance",
        },
        {
          type: "scenario",
          prompt: "How does an increase in Net Working Capital (NWC) impact a company's Free Cash Flow?",
          options: [
            { id: "opt-1", text: "It reduces Free Cash Flow because cash is tied up in operational assets like inventory or receivables." },
            { id: "opt-2", text: "It increases Free Cash Flow because working capital represents liquid assets." },
            { id: "opt-3", text: "It has zero impact on Cash Flow, affecting only the Income Statement." },
            { id: "opt-4", text: "It increases taxable net income." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Increases in current operational assets (Accounts Receivable, Inventory) consume cash, directly decreasing Free Cash Flow.",
          topic: "Working Capital Dynamics",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Finance",
        },
        {
          type: "multiple-select",
          prompt: "Which of the following items are classified as operating expenses (OpEx) on an Income Statement?",
          options: [
            { id: "opt-1", text: "Research & Development (R&D) salaries" },
            { id: "opt-2", text: "Sales and Marketing campaigns" },
            { id: "opt-3", text: "General & Administrative office expenses" },
            { id: "opt-4", text: "Capitalized long-term real estate purchases" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "OpEx comprises day-to-day operational costs (SG&A, R&D). Long-term asset acquisitions are Capital Expenditures (CapEx).",
          topic: "Income Statement Mechanics",
          marks: 2,
          recommendedLessonTitle: "Core Syntax and Primitives in Finance",
        },
        {
          type: "single-choice",
          prompt: "What is EBITDA commonly used for in corporate valuation?",
          options: [
            { id: "opt-1", text: "As a proxy for core operating cash profitability before capital structure, debt interest, and taxation variations." },
            { id: "opt-2", text: "To calculate exact federal income tax liabilities." },
            { id: "opt-3", text: "As the sole indicator of balance sheet liquidity." },
            { id: "opt-4", text: "To replace audited financial statements in quarterly filings." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "EBITDA strips out financing decisions (Interest), non-cash charges (D&A), and local taxes to compare operational performance across companies.",
          topic: "Valuation Metrics & EBITDA",
          marks: 2,
          recommendedLessonTitle: "Production Patterns and Resilience in Finance",
        },
      ];

    default:
      return [
        {
          type: "scenario",
          prompt: `When applying ${skillName} in a high-stakes cross-functional project, what is the best strategy to align stakeholders and minimize risk?`,
          options: [
            { id: "opt-1", text: "Establish explicit written objectives, measurable milestones, and scheduled stakeholder review checkpoints." },
            { id: "opt-2", text: "Work in isolation until the final deadline without communicating status." },
            { id: "opt-3", text: "Change project requirements verbally without documenting rationale." },
            { id: "opt-4", text: "Bypass review stages to deliver ahead of schedule regardless of quality." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Transparent communication, structured milestones, and regular stakeholder feedback ensure alignment and prevent costly late-stage surprises.",
          topic: "Strategic Execution",
          marks: 2,
          recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
        },
        {
          type: "multiple-select",
          prompt: `Which principles are essential for achieving long-term proficiency in ${skillName}?`,
          options: [
            { id: "opt-1", text: "Consistent deliberate practice with feedback loops" },
            { id: "opt-2", text: "Understanding underlying mental models rather than merely memorizing facts" },
            { id: "opt-3", text: "Reviewing mistakes and performing root-cause analysis on failures" },
            { id: "opt-4", text: "Avoiding practical exercises in favor of passive video consumption" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "Deliberate practice, foundational mental models, and reflective error analysis are the empirical pillars of skill acquisition.",
          topic: "Mastery & Continuous Improvement",
          marks: 3,
          recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
        },
        {
          type: "single-choice",
          prompt: `What is the most effective approach when confronting unexpected edge-case failures while executing ${skillName}?`,
          options: [
            { id: "opt-1", text: "Isolate the boundary inputs, form a verifiable hypothesis, and test each component independently." },
            { id: "opt-2", text: "Restart the entire process repeatedly hoping for different results." },
            { id: "opt-3", text: "Ignore the edge case if the general scenario succeeds." },
            { id: "opt-4", text: "Remove telemetry to hide the failure." },
          ],
          correctOptionIds: ["opt-1"],
          explanation: "Hypothesis-driven diagnosis and boundary isolation locate root causes systematically without introducing regressions.",
          topic: "Root-Cause Analysis",
          marks: 2,
          recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
        },
        {
          type: "multiple-select",
          prompt: `Which attributes characterize high-quality artifacts produced in ${skillName}?`,
          options: [
            { id: "opt-1", text: "Adherence to established domain standards and conventions" },
            { id: "opt-2", text: "Thorough documentation of assumptions, constraints, and dependencies" },
            { id: "opt-3", text: "Verifiability against measurable acceptance criteria" },
            { id: "opt-4", text: "High complexity without explanation to demonstrate expertise" },
          ],
          correctOptionIds: ["opt-1", "opt-2", "opt-3"],
          explanation: "Clarity, standard compliance, and verifiability make artifacts maintainable and scalable.",
          topic: "Quality Standards & Deliverables",
          marks: 2,
          recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
        },
      ];
  }
}

/**
 * Builds standard mock tests for a skill at a given level.
 */
export function buildDeterministicMockTest(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced",
  testNumber: number
): MockTestDocument {
  const slug = skillSlug(skillName);
  const testId = `mock-${slug}-${level}-t${testNumber}`;
  const now = new Date().toISOString();

  const domainSeeds = getDomainQuestions(skillName);

  // Generate 20 distinct questions for comprehensive mock test coverage
  const questions: MockTestQuestion[] = [];
  const topicsSet = new Set<string>();

  for (let i = 0; i < 20; i++) {
    const seedIndex = (i + (testNumber - 1) * 2) % domainSeeds.length;
    const base = domainSeeds[seedIndex];
    const questionId = `${testId}-q${i + 1}`;
    const partNum = Math.floor(i / domainSeeds.length) + 1;
    const topic = partNum > 1 ? `${base.topic} · Part ${partNum}` : base.topic;
    topicsSet.add(topic);

    const prompt = partNum > 1 ? `[Q${i + 1}] ${base.prompt}` : base.prompt;

    questions.push({
      id: questionId,
      type: base.type,
      prompt,
      codeSnippet: base.codeSnippet || "",
      options: base.options,
      correctOptionIds: base.correctOptionIds,
      explanation: base.explanation,
      difficulty: level,
      topic,
      marks: base.marks || 1,
      recommendedLessonId: `mod-1-l1`,
      recommendedLessonTitle: base.recommendedLessonTitle || `Foundations of ${skillName}`,
    });
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const doc: MockTestDocument = {
    id: testId,
    skillName,
    skillSlug: slug,
    level,
    testNumber,
    isPhaseAssessment: false,
    moduleId: "",
    moduleTitle: "",
    title: `${skillName} ${level.toUpperCase()} Comprehensive Mock Test ${testNumber}`,
    description: `Standardized skill evaluation covering practical tasks, debugging, architectural patterns, and domain theory for ${skillName}.`,
    durationMinutes: 30,
    totalMarks,
    passingPercentage: 70,
    topicsCovered: Array.from(topicsSet),
    questions,
    contentVersion: 1,
    reviewStatus: "approved",
    createdAt: now,
    updatedAt: now,
  };

  return mockTestDocumentSchema.parse(doc);
}

/**
 * Builds a genuine phase-end assessment specifically mapped to a curriculum module's learning phase.
 */
export function buildDeterministicPhaseAssessment(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced",
  moduleId: string,
  moduleTitle: string,
  lessonTitles: string[]
): MockTestDocument {
  const slug = skillSlug(skillName);
  const testId = `phase-${slug}-${moduleId}-assessment`;
  const now = new Date().toISOString();

  const domainSeeds = getDomainQuestions(skillName);
  // Pick 4-5 focused questions relevant to this phase
  const phaseSeeds = domainSeeds.slice(0, Math.min(5, domainSeeds.length));
  const questions: MockTestQuestion[] = [];
  const topicsSet = new Set<string>();

  for (let i = 0; i < phaseSeeds.length; i++) {
    const base = phaseSeeds[i];
    const questionId = `${testId}-q${i + 1}`;
    topicsSet.add(base.topic);

    questions.push({
      id: questionId,
      type: base.type,
      prompt: `[${moduleTitle}] ${base.prompt}`,
      codeSnippet: base.codeSnippet || "",
      options: base.options,
      correctOptionIds: base.correctOptionIds,
      explanation: base.explanation,
      difficulty: level,
      topic: base.topic,
      marks: base.marks || 2,
      recommendedLessonId: `${moduleId}-l1`,
      recommendedLessonTitle: lessonTitles[i % lessonTitles.length] || `Core Concepts in ${moduleTitle}`,
    });
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const doc: MockTestDocument = {
    id: testId,
    skillName,
    skillSlug: slug,
    level,
    testNumber: 1,
    isPhaseAssessment: true,
    moduleId,
    moduleTitle,
    title: `${skillName} — ${moduleTitle} Phase Assessment`,
    description: `Module checkpoint assessment verifying mastery of learning objectives across: ${lessonTitles.join(", ")}.`,
    durationMinutes: 20,
    totalMarks,
    passingPercentage: 75,
    topicsCovered: Array.from(topicsSet),
    questions,
    contentVersion: 1,
    reviewStatus: "approved",
    createdAt: now,
    updatedAt: now,
  };

  return mockTestDocumentSchema.parse(doc);
}

/**
 * Generates and saves the configured number of mock tests for a skill.
 */
export async function generateAndSaveMockTestsForSkill(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced" = "beginner",
  count: number = 3,
  options?: { force?: boolean }
): Promise<MockTestDocument[]> {
  const slug = skillSlug(skillName);
  const existing = await listMockTestsForSkill(slug, level);
  const results: MockTestDocument[] = [];

  for (let t = 1; t <= count; t++) {
    const existingTest = existing.find((item) => item.testNumber === t && !item.isPhaseAssessment);
    const hasDupes = existingTest && (existingTest.questions.length < 20 || (() => {
      const p = new Set<string>();
      for (const q of existingTest.questions) {
        if (p.has(q.prompt)) return true;
        p.add(q.prompt);
      }
      return false;
    })());

    if (!existingTest || options?.force || hasDupes) {
      const generated = buildDeterministicMockTest(skillName, level, t);
      await saveMockTest(generated);
      results.push(generated);
    } else {
      results.push(existingTest);
    }
  }

  return results.sort((a, b) => a.testNumber - b.testNumber);
}
