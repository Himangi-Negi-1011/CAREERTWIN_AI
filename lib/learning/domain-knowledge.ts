import { type Exercise, type KnowledgeCheck } from "./lesson-schema";

export type DomainCategory =
  | "python"
  | "sql"
  | "web_frontend"
  | "systems_backend"
  | "excel"
  | "power_bi"
  | "data_science_ai"
  | "cybersecurity"
  | "linux_infra"
  | "cloud_devops"
  | "communication"
  | "problem_solving"
  | "management_agile"
  | "finance_accounting"
  | "design_product"
  | "marketing_growth"
  | "interview_prep"
  | "general_professional";

export function resolveDomainCategory(skillName: string): DomainCategory {
  const norm = skillName.toLowerCase().trim();

  if (norm.includes("python")) return "python";
  if (norm.includes("sql") || norm.includes("postgres") || norm.includes("mysql") || norm.includes("database")) return "sql";
  if (norm.includes("react") || norm.includes("next.js") || norm.includes("javascript") || norm.includes("typescript") || norm.includes("html") || norm.includes("css") || norm.includes("frontend")) return "web_frontend";
  if (norm.includes("java") || norm.includes("c++") || norm.includes("c#") || norm.includes("rust") || norm.includes("go") || norm.includes("backend")) return "systems_backend";
  if (norm.includes("excel") || norm.includes("spreadsheet")) return "excel";
  if (norm.includes("power bi") || norm.includes("tableau") || norm.includes("bi") || norm.includes("visualization")) return "power_bi";
  if (norm.includes("machine learning") || norm.includes("data analysis") || norm.includes("statistics") || norm.includes("deep learning") || norm.includes("prompt") || norm.includes("generative ai") || norm.includes("ai")) return "data_science_ai";
  if (norm.includes("security") || norm.includes("hacking") || norm.includes("vulnerability") || norm.includes("cryptography") || norm.includes("soc")) return "cybersecurity";
  if (norm.includes("linux") || norm.includes("networking") || norm.includes("tcp/ip") || norm.includes("bash") || norm.includes("powershell")) return "linux_infra";
  if (norm.includes("cloud") || norm.includes("aws") || norm.includes("azure") || norm.includes("docker") || norm.includes("kubernetes") || norm.includes("ci/cd") || norm.includes("git") || norm.includes("devops")) return "cloud_devops";
  if (norm.includes("communication") || norm.includes("writing") || norm.includes("presentation") || norm.includes("english")) return "communication";
  if (norm.includes("problem solving") || norm.includes("critical thinking") || norm.includes("research")) return "problem_solving";
  if (norm.includes("project management") || norm.includes("agile") || norm.includes("scrum") || norm.includes("leadership") || norm.includes("teamwork")) return "management_agile";
  if (norm.includes("finance") || norm.includes("accounting") || norm.includes("bookkeeping") || norm.includes("budget") || norm.includes("modelling")) return "finance_accounting";
  if (norm.includes("design") || norm.includes("ui") || norm.includes("ux") || norm.includes("figma") || norm.includes("product")) return "design_product";
  if (norm.includes("marketing") || norm.includes("seo") || norm.includes("content") || norm.includes("copywriting")) return "marketing_growth";
  if (norm.includes("interview") || norm.includes("resume") || norm.includes("career")) return "interview_prep";

  return "general_professional";
}

export interface DomainSubjectSpec {
  language: string;
  mentalModelText: string;
  codeSnippet: string;
  expectedOutput: string;
  codeExplanation: string;
  keyPoints: string[];
  commonMistakes: string[];
  productionPatternsText: string;
  productionSnippet: string;
  productionOutput: string;
  productionExplanation: string;
  exercise: Exercise;
  knowledgeChecks: KnowledgeCheck[];
  officialDocTitle: string;
  officialDocUrl: string;
}

export function getSubjectSpec(skillName: string, lessonTitle: string, lessonId: string): DomainSubjectSpec {
  const category = resolveDomainCategory(skillName);
  const objId1 = `${lessonId}-obj-1`;
  const objId2 = `${lessonId}-obj-2`;

  switch (category) {
    case "python":
      return {
        language: "python",
        mentalModelText: `Python emphasizes code readability, explicit namespaces, and deterministic execution. When working with ${lessonTitle}, understanding how references, mutability, and scoping operate is essential to building bug-free pipelines and algorithms.`,
        codeSnippet: `# Python Idiom: ${lessonTitle}\nfrom typing import List, Optional\n\ndef process_items(items: List[str], prefix: Optional[str] = None) -> List[str]:\n    """Process and sanitize input strings deterministically."""\n    if not items:\n        return []\n    clean_prefix = prefix.strip() if prefix else "item"\n    return [f"{clean_prefix}_{idx}:{val.strip().lower()}" for idx, val in enumerate(items) if val.strip()]\n\nprint(process_items([" Python ", " DATA ", ""]))`,
        expectedOutput: `['item_0:python', 'item_1:data']`,
        codeExplanation: `Type hints, explicit None checks for default arguments, and generator-backed list comprehensions ensure type safety and avoid mutable default argument traps.`,
        keyPoints: [
          `Never use mutable objects (like [] or {}) as default parameter values.`,
          `Use list comprehensions and generators for memory-efficient iteration.`,
          `Enforce explicit type hints (typing / mypy) to catch contract mismatches before execution.`,
        ],
        commonMistakes: [
          `Modifying a list or dictionary while iterating over it, causing skipped elements.`,
          `Using broad except: blocks that catch KeyboardInterrupt and SystemExit rather than specific exceptions.`,
        ],
        productionPatternsText: `In production services, Python code must handle unexpected I/O failures, resource leaks, and concurrent thread limitations via context managers and decoupled error handling.`,
        productionSnippet: `import contextlib\nimport logging\nfrom typing import Iterator\n\nlogger = logging.getLogger(__name__)\n\n@contextlib.contextmanager\ndef safe_resource_session(name: str) -> Iterator[dict]:\n    session = {"name": name, "status": "active"}\n    try:\n        yield session\n    except Exception as exc:\n        logger.error("Session %s failed: %s", name, exc)\n        raise\n    finally:\n        session["status"] = "closed"\n        logger.info("Session %s safely terminated.", name)`,
        productionOutput: `Session safely terminated context log with guaranteed cleanup`,
        productionExplanation: `Context managers guarantee resource teardown (database connections, file descriptors) even during unhandled exceptions.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "coding",
          title: `Python Lab: ${lessonTitle}`,
          objective: `Implement a robust, typed Python utility for ${lessonTitle} with proper exception handling.`,
          description: `Construct a production-ready Python module for ${lessonTitle}. Validate input boundaries and return clean, normalized data.`,
          instructions: [
            `Define a function with PEP-484 type annotations for inputs and outputs.`,
            `Include docstrings and defensive validation raising ValueError on invalid parameters.`,
            `Demonstrate proper idiomatic collection processing.`,
          ],
          starterCode: `def execute_${lessonId.replace(/-/g, "_")}(data: list[str]) -> dict:\n    # TODO: Implement domain processing for ${lessonTitle}\n    if not isinstance(data, list):\n        raise TypeError("Expected list input")\n    return {"processed_count": len(data), "status": "success"}`,
          hints: [
            `Use try...except blocks specifically targeting expected exceptions.`,
            `Leverage Python 3.10+ union syntax (int | None) or typing module.`,
          ],
          submissionRequirements: `Submit valid Python 3 code with type annotations and deterministic error handling.`,
          evaluationCriteria: [
            `Correctness: Passes edge cases including empty lists and invalid data types.`,
            `Pythonic idioms: Follows PEP 8 formatting and clean comprehension syntax.`,
          ],
          solutionExplanation: `The optimal solution separates boundary validation from core data transformation, utilizing context managers or list comprehensions for predictable memory consumption.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `In Python, why is using a mutable collection (e.g., target_list=[]) as a default function parameter considered a dangerous anti-pattern?`,
            options: [
              { id: "opt-1", text: "Default parameter expressions are evaluated once at function definition time, sharing the exact same list instance across all invocations." },
              { id: "opt-2", text: "Python's garbage collector immediately purges default arguments after the first invocation." },
              { id: "opt-3", text: "Mutable default arguments trigger a syntax error in Python 3.10 and newer." },
              { id: "opt-4", text: "Default parameters can only accept primitive types like int and float." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `Python binds default arguments once when the function is defined. If a mutable object like a list is mutated within the function, subsequent calls without arguments reuse that same mutated list.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following are recommended best practices when developing production Python code?`,
            options: [
              { id: "opt-2a", text: "Using context managers (with statements) to guarantee cleanup of files and connections" },
              { id: "opt-2b", text: "Using generator expressions instead of massive in-memory lists when streaming large datasets" },
              { id: "opt-2c", text: "Silently suppressing exceptions with empty 'except Exception: pass' blocks" },
              { id: "opt-2d", text: "Specifying type annotations and validating external data contracts at service boundaries" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
            explanation: `Context managers, generators for memory efficiency, and type contracts are core tenets of production Python. Silently swallowing exceptions hides critical failures.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "Official Python 3 Documentation",
        officialDocUrl: "https://docs.python.org/3/",
      };

    case "sql":
      return {
        language: "sql",
        mentalModelText: `Relational SQL databases operate on set theory and declarative logic. Rather than specifying how to iterate over rows, you declare the desired result set. In ${lessonTitle}, understanding query execution plans, relational integrity, and indexing strategies is crucial for low-latency queries.`,
        codeSnippet: `-- Relational Optimization: ${lessonTitle}\nSELECT \n    d.department_name,\n    COUNT(e.id) AS total_employees,\n    ROUND(AVG(e.salary), 2) AS avg_salary\nFROM departments d\nINNER JOIN employees e ON d.id = e.department_id\nWHERE e.is_active = TRUE\nGROUP BY d.department_name\nHAVING COUNT(e.id) >= 5\nORDER BY avg_salary DESC;`,
        expectedOutput: `department_name | total_employees | avg_salary\nEngineering     | 14              | 112500.00\nProduct         | 6               | 98400.00`,
        codeExplanation: `Filtering active rows in the WHERE clause reduces joined volume before aggregation, while HAVING filters groups after aggregation. Indexes on foreign keys and filter columns prevent table scans.`,
        keyPoints: [
          `WHERE filters rows before aggregation; HAVING filters aggregated groups.`,
          `Join on indexed foreign keys to avoid costly nested-loop full table scans.`,
          `Avoid SELECT * in production queries to minimize I/O and network payload.`,
        ],
        commonMistakes: [
          `Applying functions on indexed columns in the WHERE clause (e.g. WHERE YEAR(created_at) = 2026), disabling index lookups.`,
          `Accidental Cartesian products caused by omitting join predicates on relational joins.`,
        ],
        productionPatternsText: `In production database architectures, transaction management (ACID), locking considerations, and idempotent migrations guarantee consistency under heavy concurrency.`,
        productionSnippet: `BEGIN TRANSACTION;\n\n-- Safe optimistic update with row lock\nUPDATE accounts \nSET balance = balance - 500.00, updated_at = CURRENT_TIMESTAMP\nWHERE id = 'acc-101' AND balance >= 500.00;\n\nINSERT INTO audit_log (account_id, action, amount, logged_at)\nVALUES ('acc-101', 'WITHDRAWAL', 500.00, CURRENT_TIMESTAMP);\n\nCOMMIT;`,
        productionOutput: `COMMIT; Transaction applied atomically with audit log.`,
        productionExplanation: `Wrapping interrelated financial or status updates in an explicit transaction prevents partial failures from corrupting relational state.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "coding",
          title: `SQL Lab: ${lessonTitle}`,
          objective: `Write an optimized SQL query demonstrating aggregation, filtering, and joins.`,
          description: `Construct a multi-table SQL query resolving the practical task in ${lessonTitle}. Ensure indices are respected and aggregations are accurate.`,
          instructions: [
            `Join the primary entity with its related transaction or child entity.`,
            `Apply selective filtering in the WHERE clause.`,
            `Group results and calculate aggregate totals with an appropriate filter on groups.`,
          ],
          starterCode: `-- SQL Lab for ${lessonTitle}\nSELECT \n    -- TODO: Specify columns explicitly\nFROM primary_table p\n-- TODO: Add JOIN and WHERE clauses\n;`,
          hints: [
            `Check whether you need an INNER JOIN (intersection only) or LEFT JOIN (preserve all parent rows).`,
            `Always verify column data types when comparing timestamps.`,
          ],
          submissionRequirements: `Submit clean, formatted SQL with explicit column names and valid joins.`,
          evaluationCriteria: [
            `Syntax: Valid ANSI SQL query with correct operator precedence.`,
            `Optimization: Correct use of WHERE vs HAVING without redundant subqueries.`,
          ],
          solutionExplanation: `The optimal query applies filtering early in the execution pipeline, joins on indexed foreign keys, and aggregates only necessary dimensions.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `What is the critical semantic difference between the WHERE clause and the HAVING clause in SQL?`,
            options: [
              { id: "opt-1", text: "WHERE filters individual rows before grouping occurs; HAVING filters aggregated groups after GROUP BY." },
              { id: "opt-2", text: "WHERE works only on numeric data; HAVING works only on strings and dates." },
              { id: "opt-3", text: "HAVING executes before table joins are resolved." },
              { id: "opt-4", text: "WHERE and HAVING are completely interchangeable syntax aliases in ANSI SQL." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `WHERE evaluates predicates on raw table rows before grouping and aggregate calculations. HAVING evaluates predicates on the grouped aggregate results.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following actions prevent unnecessary full table scans on relational databases?`,
            options: [
              { id: "opt-2a", text: "Creating B-Tree indexes on foreign keys and frequently filtered columns" },
              { id: "opt-2b", text: "Avoiding functions wrapping indexed columns in WHERE predicates (e.g. avoiding UPPER(column))" },
              { id: "opt-2c", text: "Using SELECT * across all tables in a multi-table join" },
              { id: "opt-2d", text: "Normalizing tables and analyzing query execution plans with EXPLAIN" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
            explanation: `Indexes, sargable predicates (no function wraps on columns), and EXPLAIN analysis allow index seeks instead of sequential table scans. SELECT * does not prevent table scans and increases network I/O.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "PostgreSQL Official Documentation",
        officialDocUrl: "https://www.postgresql.org/docs/",
      };

    case "excel":
      return {
        language: "excel",
        mentalModelText: `Spreadsheets are structured computational engines where formulas, absolute references ($A$1), and relational lookups model business operations. Mastering ${lessonTitle} requires building auditable, scalable workbooks that withstand data expansion and prevent broken formula chains (#N/A, #REF!).`,
        codeSnippet: `=XLOOKUP(D2, Products[SKU], Products[UnitPrice], "Not Found", 0)\n=SUMIFS(Orders[Revenue], Orders[Region], "North", Orders[Date], ">=2026-01-01")`,
        expectedOutput: `Dynamic cell value updating instantly as source table rows change.`,
        codeExplanation: `XLOOKUP replaces legacy VLOOKUP by searching left or right without column index numbers, and includes built-in default values for missing keys.`,
        keyPoints: [
          `Always use structured Excel Tables (Ctrl+T) so formulas automatically expand with new rows.`,
          `Use XLOOKUP or INDEX/MATCH instead of hardcoded column offset numbers in VLOOKUP.`,
          `Separate Raw Data, Assumptions/Calculations, and Final Dashboards into distinct sheets.`,
        ],
        commonMistakes: [
          `Hardcoding numbers directly inside calculation formulas instead of pointing to dedicated parameter cells.`,
          `Mixing text representations of numbers with real numbers, causing SUM and XLOOKUP to return 0 or #N/A.`,
        ],
        productionPatternsText: `Enterprise financial and analytical workbooks require strict input data validation, conditional formatting for anomaly detection, and automated reconciliation checks.`,
        productionSnippet: `=IF(ROUND(Assets_Total - Liabilities_Equity_Total, 2) = 0, "BALANCED", "ERROR: Balance Sheet Variance")`,
        productionOutput: `"BALANCED" check verification cell with conditional green formatting.`,
        productionExplanation: `Automated zero-tolerance reconciliation checks catch accounting or formula variances immediately before reports are shared with stakeholders.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "analysis",
          title: `Spreadsheet Modeling Lab: ${lessonTitle}`,
          objective: `Construct an auditable spreadsheet calculation model with dynamic lookup and aggregation formulas.`,
          description: `Build a structured workbook solving the scenario in ${lessonTitle}. Include lookup logic, dynamic aggregation, and an error reconciliation check.`,
          instructions: [
            `Format the data range as an Excel Table with explicit column headers.`,
            `Implement XLOOKUP or INDEX/MATCH to pull pricing or category data.`,
            `Calculate summary metrics using SUMIFS or Pivot Table aggregations.`,
            `Add a validation check cell verifying that row totals equal summary totals.`,
          ],
          starterCode: `// Excel Formula Specifications for ${lessonTitle}\nCell B2: =XLOOKUP(A2, LookupTable[ID], LookupTable[Value], 0)\nCell C2: =SUMIFS(DataTable[Amount], DataTable[Category], "Selected")\nCheck: =IF(SUM(DataTable[Amount]) = TotalCell, "OK", "RECONCILE")`,
          hints: [
            `Lock reference ranges using $ (e.g., $A$2:$A$100) or structured table references (Table[Column]).`,
            `Check for trailing spaces in text keys using TRIM().`,
          ],
          submissionRequirements: `Submit formula formulas and cell references adhering to institutional financial modeling standards.`,
          evaluationCriteria: [
            `Auditability: Formulas reference parameter cells rather than hardcoded magic numbers.`,
            `Integrity: Reconciles totals and handles missing lookup keys cleanly.`,
          ],
          solutionExplanation: `The optimal workbook employs structured table syntax, dynamic XLOOKUP formulas with error defaults, and visible audit reconciliation checks.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `Why is XLOOKUP considered superior to legacy VLOOKUP in modern financial and operational spreadsheets?`,
            options: [
              { id: "opt-1", text: "XLOOKUP defaults to exact match, can search to the left of the lookup column, and does not break when columns are inserted or deleted." },
              { id: "opt-2", text: "XLOOKUP only works on non-numerical text data." },
              { id: "opt-3", text: "VLOOKUP can look up values in closed workbooks while XLOOKUP cannot." },
              { id: "opt-4", text: "XLOOKUP requires a complex VBA macro to execute." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `XLOOKUP decouples the search array from the return array. Therefore, inserting or deleting columns between them does not break the formula, unlike VLOOKUP's static column index number.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following practices reduce errors in complex business spreadsheets?`,
            options: [
              { id: "opt-2a", text: "Organizing workbooks into separate tabs for Inputs, Calculations, and Summary Dashboards" },
              { id: "opt-2b", text: "Using structured Excel Tables (Table[Column]) so calculations adapt dynamically to new data" },
              { id: "opt-2c", text: "Hardcoding growth rates directly into formulas like =B2 * 1.05 instead of pointing to an assumption cell" },
              { id: "opt-2d", text: "Building automated reconciliation checks (e.g. verifying Assets = Liabilities + Equity)" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
            explanation: `Separation of concerns (Inputs/Calcs/Outputs), structured references, and reconciliation checks are industry standards (FAST standard). Hardcoding assumptions within formulas is a major source of financial modeling errors.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "Microsoft Excel Documentation & Formulas",
        officialDocUrl: "https://support.microsoft.com/en-us/excel",
      };

    case "power_bi":
      return {
        language: "dax",
        mentalModelText: `Power BI combines a relational tabular data engine with the DAX (Data Analysis Expressions) formula language. In ${lessonTitle}, the fundamental mental model is understanding Filter Context vs Row Context, star schema relationships, and distinguishing Calculated Columns from Measures.`,
        codeSnippet: `-- DAX Measure: ${lessonTitle}\nTotal Revenue = SUM(Sales[Revenue])\n\nRevenue YoY Growth = \nVAR CurrentRevenue = [Total Revenue]\nVAR PriorRevenue = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[Date]))\nRETURN\n    DIVIDE(CurrentRevenue - PriorRevenue, PriorRevenue, 0)`,
        expectedOutput: `Percentage metric reacting dynamically to visual slicers (Date, Region, Product).`,
        codeExplanation: `CALCULATE alters the active filter context, while DIVIDE safely handles division by zero. Declaring variables (VAR) improves readability and query performance.`,
        keyPoints: [
          `Always model data as a Star Schema: central Fact table surrounded by 1-to-many Dimension tables.`,
          `Use Measures (calculated at query time) instead of Calculated Columns (which consume RAM in the tabular model).`,
          `Use DIVIDE(num, denom, alternate) instead of '/' to avoid #DIV/0! visual errors.`,
        ],
        commonMistakes: [
          `Creating bidirectional cross-filtering relationships across multiple tables, causing ambiguous filter propagation.`,
          `Using calculated columns for aggregation metrics instead of explicit DAX measures.`,
        ],
        productionPatternsText: `Production enterprise Power BI models require a dedicated Date dimension table marked as Date Table, explicit measures grouped in display folders, and optimized cardinality.`,
        productionSnippet: `Sales MTD = \nCALCULATE(\n    [Total Revenue],\n    DATESMTD('Date'[Date])\n)`,
        productionOutput: `Month-to-date cumulative metric resetting on the first of each calendar month.`,
        productionExplanation: `Time intelligence DAX functions rely strictly on a continuous, contiguous Date dimension with no missing calendar days.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "analysis",
          title: `Power BI & DAX Lab: ${lessonTitle}`,
          objective: `Formulate a Star Schema data model and construct dynamic DAX measures for ${lessonTitle}.`,
          description: `Design the relational model and write the core DAX measures to calculate metrics required for ${lessonTitle}.`,
          instructions: [
            `Define the Fact table and related Dimension tables with their primary/foreign keys.`,
            `Write the base aggregation measure.`,
            `Write a time-intelligence or ratio measure using CALCULATE and DIVIDE.`,
            `Explain how visual slicers affect the measure's filter context.`,
          ],
          starterCode: `-- DAX Measure Formulation for ${lessonTitle}\n[Base Metric] = SUM(FactTable[Value])\n\n[Advanced Metric] = \nVAR BaseVal = [Base Metric]\nRETURN\n    CALCULATE(BaseVal, ... -- Add filter condition)`,
          hints: [
            `Remember that CALCULATE transitions row context to filter context.`,
            `Check whether relationships are 1-to-many from Dimension to Fact.`,
          ],
          submissionRequirements: `Submit valid DAX code formatted with VAR/RETURN syntax and relational modeling notes.`,
          evaluationCriteria: [
            `DAX Syntax: Valid measure definitions with proper handling of filter context.`,
            `Modeling: Star schema principles adhered to without circular or ambiguous relationships.`,
          ],
          solutionExplanation: `The optimal solution uses a clean star schema with single-direction filtering and computes metrics via explicit DAX measures leveraging CALCULATE and time intelligence.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `What is the primary difference between a Calculated Column and a Measure in Power BI?`,
            options: [
              { id: "opt-1", text: "Calculated columns are evaluated during data refresh and stored in memory row-by-row; Measures are dynamic formulas calculated on the fly based on current filter context." },
              { id: "opt-2", text: "Calculated columns can only contain numbers, while measures can only contain text." },
              { id: "opt-3", text: "Measures increase the storage file size of the PBIX file substantially more than columns." },
              { id: "opt-4", text: "Calculated columns adapt dynamically when a user clicks a slicer in a report." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `Calculated columns consume RAM and disk storage because values are computed row-by-row at refresh time. Measures consume minimal memory and compute dynamically in response to visual filters and slicers.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following represent data modeling best practices in Power BI?`,
            options: [
              { id: "opt-2a", text: "Structuring the data model into a Star Schema with Fact and Dimension tables" },
              { id: "opt-2b", text: "Using the DIVIDE function instead of the '/' operator to prevent division-by-zero errors" },
              { id: "opt-2c", text: "Enabling bidirectional cross-filtering on all relationships indiscriminately" },
              { id: "opt-2d", text: "Marking a dedicated Date dimension as an official Date Table for time-intelligence calculations" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
            explanation: `Star schema design, DIVIDE for error safety, and a dedicated Date table are foundational Power BI best practices. Indiscriminate bidirectional filtering creates relationship ambiguity and degrades performance.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "Microsoft Power BI DAX Reference",
        officialDocUrl: "https://learn.microsoft.com/en-us/dax/",
      };

    case "cybersecurity":
      return {
        language: "bash",
        mentalModelText: `Cybersecurity operates under the principle of defense-in-depth and the CIA Triad (Confidentiality, Integrity, Availability). In ${lessonTitle}, defensive controls, least privilege, threat modeling, and telemetry monitoring prevent adversaries from gaining unauthorized footholds or escalating privileges.`,
        codeSnippet: `# Defensive Security & Telemetry Inspection for ${lessonTitle}\n# 1. Audit listening network sockets\nsudo ss -tulpn\n\n# 2. Inspect authentication failure anomalies in system logs\nsudo grep -i "failed password" /var/log/auth.log | awk '{print $1, $2, $3, $11}' | sort | uniq -c | sort -nr | head -n 10\n\n# 3. Verify file permissions on critical system assets\nsudo find /etc/shadow -perm /o+rwx`,
        expectedOutput: `Summary list of top attacker source IP addresses attempting brute-force authentication.`,
        codeExplanation: `Auditing active listening ports and parsing authentication logs identifies unauthorized reconnaissance or intrusion attempts before exploitation occurs.`,
        keyPoints: [
          `Enforce the Principle of Least Privilege: users and processes receive only minimum necessary access.`,
          `Validate and sanitize all ingress data at service boundaries using parameterized constructs.`,
          `Log security events (authentication, privilege escalation, policy violations) centrally to an immutable SIEM.`,
        ],
        commonMistakes: [
          `Relying on security through obscurity (such as changing a default port without hardening authentication).`,
          `Storing plain-text credentials or API tokens in source code or configuration files.`,
        ],
        productionPatternsText: `Modern security architectures adopt Zero Trust: verify explicitly, enforce least-privilege access, and assume breach across all network segments.`,
        productionSnippet: `# Zero-Trust Network Policy Example (iptables / UFW)\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow from 10.0.10.0/24 to any port 22 proto tcp\nsudo ufw enable`,
        productionOutput: `Firewall active and enabled on system startup with default-deny inbound posture.`,
        productionExplanation: `Default-deny network ingress policies isolate workloads so only authorized subnets and ports can establish connections.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "scenario",
          title: `Security Case Study Lab: ${lessonTitle}`,
          objective: `Diagnose a security vulnerability scenario and propose defense-in-depth mitigations.`,
          description: `Analyze the security incident scenario outlined in ${lessonTitle}. Identify the threat vector, determine impacted CIA triad components, and define mitigation steps.`,
          instructions: [
            `Classify the threat vector using STRIDE or MITRE ATT&CK categories.`,
            `Identify the root-cause vulnerability in configuration, code, or architecture.`,
            `Provide immediate containment steps and long-term preventive controls.`,
          ],
          starterCode: `// Security Incident Analysis: ${lessonTitle}\nIncident Type: Unauthorized Access Attempt\nAffected Asset: Production Database Ingress\nIdentified Vulnerability: Missing network ACL & weak credential policy\nProposed Containment:\n1. Revoke compromised credentials immediately\n2. Restrict IP ingress via security group\n3. Rotate all dependent service secrets`,
          hints: [
            `Consider both network layer and application layer controls.`,
            `Think about how authentication and authorization differ in this scenario.`,
          ],
          submissionRequirements: `Submit an actionable incident response summary with technical mitigation steps.`,
          evaluationCriteria: [
            `Threat Understanding: Accurately identifies root cause and attack surface.`,
            `Mitigation Feasibility: Recommendations follow defense-in-depth principles without breaking legitimate services.`,
          ],
          solutionExplanation: `The optimal security response contains active exposure through immediate credential revocation and firewall isolation, followed by root-cause remediation (e.g. MFA enforcement and principle of least privilege).`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `What is the foundational principle of a 'Zero Trust' security architecture?`,
            options: [
              { id: "opt-1", text: "Never trust, always verify: every access request must be authenticated, authorized, and encrypted regardless of network location." },
              { id: "opt-2", text: "Internal network requests behind a corporate VPN are automatically trusted." },
              { id: "opt-3", text: "Zero Trust means eliminating all user passwords in favor of IP address whitelisting alone." },
              { id: "opt-4", text: "Zero Trust applies exclusively to physical data center badge access." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `Zero Trust assumes that threats exist both inside and outside the traditional network perimeter. Every request is explicitly verified, given least-privilege access, and assumed to operate in an untrusted environment.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following represent effective defense-in-depth controls against unauthorized access and data breaches?`,
            options: [
              { id: "opt-2a", text: "Multi-Factor Authentication (MFA) on all administrative and corporate accounts" },
              { id: "opt-2b", text: "Centralized, tamper-evident audit logging sent to a SIEM" },
              { id: "opt-2c", text: "Disabling firewall rules to reduce network latency during high-load periods" },
              { id: "opt-2d", text: "Encrypting sensitive data both at rest (AES-256) and in transit (TLS 1.3)" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
            explanation: `MFA, centralized logging, and end-to-end encryption are critical layers of defense in depth. Disabling firewall rules removes perimeter protection and exposes internal services to attack.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "NIST Cybersecurity Framework (CSF)",
        officialDocUrl: "https://www.nist.gov/cyberframework",
      };

    case "communication":
      return {
        language: "markdown",
        mentalModelText: `Professional communication is the structured transfer of intent and actionable information between individuals and organizations. In ${lessonTitle}, clarity of message, audience awareness, active listening, and structured delivery frameworks (such as BLUF: Bottom Line Up Front, and STAR) ensure alignment and reduce friction in collaborative workflows.`,
        codeSnippet: `### Professional Executive Summary Template for ${lessonTitle}\n\n**BLUF (Bottom Line Up Front):**\nWe recommend migrating our reporting pipeline to an automated daily sync, reducing manual reconciliation effort by 12 hours weekly.\n\n**Context & Problem:**\nManual data aggregation currently delays executive reports until Wednesday noon and causes recurring discrepancies.\n\n**Proposed Solution & Roadmap:**\n1. Automate database views by Friday.\n2. Validate parity during parallel run (Week 2).\n3. Decommission manual spreadsheets (Week 3).\n\n**Requested Action:**\nApprove access credentials for the analytics service account by 5:00 PM Thursday.`,
        expectedOutput: `Concise, actionable executive communication with clear next steps and ownership.`,
        codeExplanation: `Structuring communication with BLUF respects the stakeholder's time by stating the recommendation and requested action in the opening sentences before supporting detail.`,
        keyPoints: [
          `Bottom Line Up Front (BLUF): State the core finding or decision request first.`,
          `Tailor the altitude: Executives need outcomes and strategic impact; engineering teams need technical constraints and parameters.`,
          `Close the loop: Every professional communication should state owners, deadlines, and next steps clearly.`,
        ],
        commonMistakes: [
          `Burying the lead: Writing four paragraphs of backstory before revealing the actual problem or request.`,
          `Using ambiguous language like 'as soon as possible' instead of concrete dates and time zones.`,
        ],
        productionPatternsText: `In cross-functional collaboration, asynchronous written memos and structured meeting summaries establish a shared source of truth and reduce misunderstandings across distributed teams.`,
        productionSnippet: `### Incident Retrospective Summary\n- **What Happened:** API service degradation for 18 minutes (14:12 - 14:30 UTC).\n- **Root Cause:** Unindexed foreign key query on accounts table during peak traffic.\n- **Impact:** ~4% of user requests encountered 504 Gateway Timeouts. Zero data corruption.\n- **Action Items:**\n  1. Add compound B-tree index (Owner: DevTeam, Due: Oct 30).\n  2. Update alert threshold from 5m to 2m (Owner: DevOps, Due: Oct 31).`,
        productionOutput: `Blameless, structured retrospective communication shared across engineering and product leadership.`,
        productionExplanation: `Blameless post-mortems and structured summaries focus objectively on systems, timelines, and measurable preventive actions rather than personal fault.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "written",
          title: `Communication Synthesis Lab: ${lessonTitle}`,
          objective: `Draft a concise, audience-tailored executive communication resolving a business challenge.`,
          description: `Construct a professional written brief for the scenario in ${lessonTitle}. Apply the BLUF framework to align cross-functional stakeholders.`,
          instructions: [
            `Formulate a 1-sentence Bottom Line Up Front (BLUF) summarizing the situation and proposal.`,
            `Provide 3 bullet points of high-impact context (cost, time, risk).`,
            `Explicitly state the requested decision, deadline, and assigned owner.`,
          ],
          starterCode: `// Communication Brief: ${lessonTitle}\nTo: Leadership Team\nFrom: Lead Engineer\nSubject: [Decision Needed] Proposal for ${lessonTitle}\n\nBLUF: ...\nKey Context: ...\nNext Steps: ...`,
          hints: [
            `Avoid technical jargon when communicating with non-technical business partners.`,
            `Ensure every proposed action has a named owner and clear completion date.`,
          ],
          submissionRequirements: `Submit a polished, structured communication memo adhering to executive clarity standards.`,
          evaluationCriteria: [
            `Clarity: The core message and request are immediately evident within the first 30 seconds of reading.`,
            `Audience Alignment: Tone and technical altitude match executive decision-makers.`,
          ],
          solutionExplanation: `The optimal communication delivers the recommendation up front, supports it with concise quantitative data, and specifies an exact owner and deadline.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `What is the core purpose of applying the 'BLUF' (Bottom Line Up Front) framework in professional communication?`,
            options: [
              { id: "opt-1", text: "It states the conclusion, key recommendation, or decision request immediately, allowing decision-makers to grasp the core message without wading through background narrative." },
              { id: "opt-2", text: "It prevents team members from asking follow-up questions during meetings." },
              { id: "opt-3", text: "It requires all communication to be delivered verbally rather than in writing." },
              { id: "opt-4", text: "It ensures email messages contain at least 2,000 words of technical background." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `BLUF respects reader attention by placing the most critical takeaway or action request at the very beginning of the document or message.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following techniques improve cross-functional collaboration and alignment across remote teams?`,
            options: [
              { id: "opt-2a", text: "Documenting decisions and action items in shared, written meeting notes with explicit owners and dates" },
              { id: "opt-2b", text: "Adapting technical explanations to the audience's background rather than using unexplained acronyms" },
              { id: "opt-2c", text: "Making decisions privately in direct messages without notifying affected team members" },
              { id: "opt-2d", text: "Active listening: summarizing and confirming understanding before responding to feedback" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
            explanation: `Written records with owners, audience-appropriate language, and active listening foster transparent collaboration. Private decisions without broad communication create organizational silos.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "Harvard Business Review Guide to Better Business Writing",
        officialDocUrl: "https://hbr.org/",
      };

    case "finance_accounting":
      return {
        language: "markdown",
        mentalModelText: `Corporate finance and accounting quantify organizational performance through structured statements: the Income Statement, Balance Sheet, and Cash Flow Statement. In ${lessonTitle}, understanding accrual accounting, working capital, EBITDA, and discounted cash flow (DCF) valuation grounds strategic business decisions in financial reality.`,
        codeSnippet: `### Financial Statement Mechanics for ${lessonTitle}\n\n1. Net Income = Revenue - Operating Expenses - Deprec/Amort - Interest - Taxes\n2. Free Cash Flow to Firm (FCFF) = EBIT*(1 - TaxRate) + D&A - CapEx - Change in Net Working Capital\n3. Balance Sheet Identity: Assets = Liabilities + Shareholders' Equity\n\nDCF Present Value Formula:\nPV = CF_t / (1 + WACC)^t`,
        expectedOutput: `Audited financial model linking revenue, operational cash flows, and terminal valuation.`,
        codeExplanation: `Net income does not equal cash generated: non-cash depreciation must be added back, and capital expenditures and working capital swings must be deducted to find true free cash flow.`,
        keyPoints: [
          `Revenue is recognized when earned, not necessarily when cash is collected (Accrual Accounting).`,
          `Cash Flow is the lifeblood of liquidity; a company can be profitable on paper yet insolvent if cash collections lag.`,
          `EBITDA serves as a proxy for operational profitability before capital structure and tax jurisdictions.`,
        ],
        commonMistakes: [
          `Confusing Net Income with Cash Flow from Operations by ignoring capital expenditures or accounts receivable increases.`,
          `Using unlinked financial projections where balance sheet items do not tie out to cash flow statements.`,
        ],
        productionPatternsText: `Institutional financial modeling demands dynamic sensitivity tables, scenario switches (Base, Upside, Downside), and built-in reconciliation checks ensuring balanced balance sheets across all forecast years.`,
        productionSnippet: `| Metric ($M)          | 2024A | 2025E | 2026E |\n|----------------------|-------|-------|-------|\n| Revenue              | 100.0 | 120.0 | 144.0 |\n| EBITDA (25% margin)  |  25.0 |  30.0 |  36.0 |\n| Less: CapEx (5% rev) |  (5.0)|  (6.0)|  (7.2)|\n| Less: Delta NWC      |  (2.0)|  (2.4)|  (2.9)|\n| Unlevered Free Cash  |  18.0 |  21.6 |  25.9 |`,
        productionOutput: `3-Year Unlevered Free Cash Flow forecast model with consistent margin assumptions.`,
        productionExplanation: `Standard financial schedules derive unlevered cash flow from top-line revenue using clearly documented margin and reinvestment assumptions.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "analysis",
          title: `Financial Analysis Lab: ${lessonTitle}`,
          objective: `Construct a 3-statement financial schedule and calculate Free Cash Flow for ${lessonTitle}.`,
          description: `Analyze the financial figures in ${lessonTitle}. Link operating profit to free cash flow and calculate key operational efficiency ratios.`,
          instructions: [
            `Calculate Operating Income (EBIT) from gross revenue and operational costs.`,
            `Derive Free Cash Flow by factoring in CapEx, D&A, and changes in working capital.`,
            `Assess the firm's liquidity and operational margin sustainability.`,
          ],
          starterCode: `// Financial Model Schedule: ${lessonTitle}\nRevenue = 50,000,000\nCOGS = 20,000,000\nOpEx = 15,000,000\nCapEx = 4,000,000\nDepreciation = 3,000,000\nTax Rate = 21%\n\nCalculate:\n1. Operating Profit (EBIT)\n2. Net Operating Profit After Tax (NOPAT)\n3. Free Cash Flow (FCF)`,
          hints: [
            `Remember: FCF = NOPAT + Depreciation - CapEx - Delta NWC.`,
            `Depreciation is a non-cash expense added back to operating profit.`,
          ],
          submissionRequirements: `Submit completed financial schedule with formulas, ratios, and analytical commentary.`,
          evaluationCriteria: [
            `Accuracy: Calculations tie out mathematically and match standard accounting principles.`,
            `Analysis: Commentary identifies cash conversion and liquidity implications accurately.`,
          ],
          solutionExplanation: `The optimal financial analysis bridges Net Income to Free Cash Flow, demonstrating how reinvestment in CapEx and working capital impact liquidity and business valuation.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `Why can a rapidly growing company report strong positive Net Income on its Income Statement while facing a severe cash shortage?`,
            options: [
              { id: "opt-1", text: "Under accrual accounting, revenues are recorded when sales occur, but if customers purchase on credit (increasing Accounts Receivable) and inventory requires upfront cash, operating cash flow can be negative." },
              { id: "opt-2", text: "Net Income always equals cash in the bank at the end of each fiscal month." },
              { id: "opt-3", text: "Positive Net Income automatically forces the balance sheet to liquidate short-term liabilities." },
              { id: "opt-4", text: "Depreciation reduces cash in the bank directly every quarter." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `Revenue recognition occurs upon delivery of goods or services. If revenue is locked in Accounts Receivable while inventory and payroll demand immediate cash, cash flows can deplete even while reported Net Income is high.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following items are added back or deducted when bridging Net Income to Operating Cash Flow?`,
            options: [
              { id: "opt-2a", text: "Adding back non-cash Depreciation & Amortization expenses" },
              { id: "opt-2b", text: "Deducting increases in Accounts Receivable (cash not yet collected)" },
              { id: "opt-2c", text: "Adding increases in Accounts Payable (cash not yet disbursed)" },
              { id: "opt-2d", text: "Adding dividends paid out to common shareholders" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2c"],
            explanation: `D&A is non-cash and added back. An increase in Accounts Receivable ties up cash (subtracted), while an increase in Accounts Payable delays cash outflow (added). Dividends paid belong to Financing Cash Flow, not Operating Cash Flow.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: "Corporate Finance Institute (CFI) Standards",
        officialDocUrl: "https://corporatefinanceinstitute.com/",
      };

    default:
      // General Professional / Technical Default
      return {
        language: "markdown",
        mentalModelText: `Mastering ${lessonTitle} requires building an accurate conceptual model of how core principles operate and interact within the larger ${skillName} domain. Every successful practitioner balances foundational theory with practical, verifiable execution.`,
        codeSnippet: `### Core Framework for ${lessonTitle}\n\n1. **Define the Objective:** Identify the primary outcome and measurable criteria for success.\n2. **Deconstruct the Problem:** Break the domain challenge into independent, testable sub-components.\n3. **Execute & Iterate:** Apply targeted techniques and validate results against established standards.\n4. **Review & Refine:** Conduct root-cause analysis on deviations to drive continuous improvement.`,
        expectedOutput: `Structured execution plan aligned with industry standards for ${skillName}.`,
        codeExplanation: `Systematic decomposition and objective verification ensure consistent, repeatable outcomes regardless of complexity.`,
        keyPoints: [
          `Clear mental models prevent premature optimization and procedural errors.`,
          `Establish verifiable feedback loops early in the execution process.`,
          `Document core decisions and assumptions to facilitate review and scaling.`,
        ],
        commonMistakes: [
          `Proceeding to execution without verifying requirements and boundary constraints.`,
          `Failing to measure outcomes against objective criteria.`,
        ],
        productionPatternsText: `In professional practice, resilient workflows adapt to operational constraints through structured checkpoints, risk mitigation strategies, and transparent peer review.`,
        productionSnippet: `### Professional Workflow Checklist for ${skillName}\n- [ ] Input Validation: Verify prerequisites and baseline data.\n- [ ] Execution: Implement core technique following best practices.\n- [ ] Verification: Test boundary cases and confirm alignment.\n- [ ] Sign-off: Document results and archive audit evidence.`,
        productionOutput: `Verified artifact ready for production deployment or stakeholder review.`,
        productionExplanation: `Standardized checklists and verification gates eliminate human omission errors in mission-critical workflows.`,
        exercise: {
          id: `${lessonId}-ex-1`,
          type: "scenario",
          title: `Applied Practice Lab: ${lessonTitle}`,
          objective: `Demonstrate mastery of ${lessonTitle} through structured problem analysis and execution.`,
          description: `Analyze the scenario presented in ${lessonTitle}. Develop an actionable plan adhering to the foundational principles of ${skillName}.`,
          instructions: [
            `Identify the primary challenge and its boundary constraints.`,
            `Formulate a step-by-step resolution strategy.`,
            `Define objective verification criteria proving successful execution.`,
          ],
          starterCode: `// Execution Plan for ${lessonTitle}\nObjective: ...\nScope & Constraints: ...\nImplementation Steps:\n1. ...\n2. ...\nVerification Method: ...`,
          hints: [
            `Focus on root causes rather than superficial symptoms.`,
            `Ensure every proposed step is actionable and verifiable.`,
          ],
          submissionRequirements: `Submit a structured execution plan addressing all scenario objectives.`,
          evaluationCriteria: [
            `Thoroughness: Addresses all critical requirements and constraints.`,
            `Actionability: Steps are practical, clear, and measurable.`,
          ],
          solutionExplanation: `The optimal approach combines structured problem decomposition with objective verification criteria and clear accountability.`,
        },
        knowledgeChecks: [
          {
            id: `${lessonId}-kc-1`,
            type: "single-choice",
            prompt: `When implementing ${lessonTitle} in a modern workflow, what is the primary consideration to ensure stability and correctness?`,
            options: [
              { id: "opt-1", text: "Enforce strict boundary validation, clear operational standards, and automated feedback loops." },
              { id: "opt-2", text: "Bypass verification steps to maximize delivery velocity." },
              { id: "opt-3", text: "Rely solely on undocumented assumptions without stakeholder alignment." },
              { id: "opt-4", text: "Eliminate measurement and logging to minimize overhead." },
            ],
            correctOptionIds: ["opt-1"],
            explanation: `Operational stability requires rigorous boundary checks, clear standards, and continuous feedback loops before production deployment.`,
            objectiveIds: [objId1],
          },
          {
            id: `${lessonId}-kc-2`,
            type: "multiple-select",
            prompt: `Which of the following represent industry best practices when working with ${skillName}?`,
            options: [
              { id: "opt-2a", text: "Designing modular, decoupled components with single responsibilities" },
              { id: "opt-2b", text: "Establishing verifiable quality gates and feedback mechanisms" },
              { id: "opt-2c", text: "Documenting architectural trade-offs and operational constraints" },
              { id: "opt-2d", text: "Ignoring failure modes under the assumption that conditions remain ideal" },
            ],
            correctOptionIds: ["opt-2a", "opt-2b", "opt-2c"],
            explanation: `Modularity, verifiable quality gates, and transparent documentation are core best practices. Assuming ideal conditions leads to unhandled failures in live environments.`,
            objectiveIds: [objId2],
          },
        ],
        officialDocTitle: `Official ${skillName} Reference & Standards`,
        officialDocUrl: "https://en.wikipedia.org/wiki/" + encodeURIComponent(skillName),
      };
  }
}
