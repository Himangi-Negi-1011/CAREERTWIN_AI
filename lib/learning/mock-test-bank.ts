import { type MockTestQuestion } from "./mock-test-schema";
import { resolveDomainCategory, type DomainCategory } from "./domain-knowledge";
import { getDomainSectionPool } from "./mock-test-domain-banks";

export interface QuestionSeed {
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

export interface MockExamSectionDef {
  section: "A" | "B" | "C" | "D" | "E";
  title: string;
  description: string;
  questionCount: number;
  marksPerQuestion: number;
}

export const MOCK_EXAM_SECTIONS: MockExamSectionDef[] = [
  {
    section: "A",
    title: "Section A: Multiple Choice Questions & Fundamentals",
    description: "Core syntax, primitives, standards, memory models, and baseline theoretical concepts.",
    questionCount: 10,
    marksPerQuestion: 2, // 10 * 2 = 20 marks
  },
  {
    section: "B",
    title: "Section B: Conceptual Analysis & Debugging",
    description: "Code inspection, error tracing, execution behavior, mutability pitfalls, and defect identification.",
    questionCount: 5,
    marksPerQuestion: 3, // 5 * 3 = 15 marks
  },
  {
    section: "C",
    title: "Section C: Technical Problem Solving",
    description: "Multi-step algorithmic reasoning, query and index optimization, caching mechanisms, and data modeling.",
    questionCount: 5,
    marksPerQuestion: 5, // 5 * 5 = 25 marks
  },
  {
    section: "D",
    title: "Section D: Practical / Coding Tasks",
    description: "Hands-on implementation, edge-case mitigation, transaction boundaries, and production workflows.",
    questionCount: 5,
    marksPerQuestion: 5, // 5 * 5 = 25 marks
  },
  {
    section: "E",
    title: "Section E: Architecture & Scenario Evaluation",
    description: "System design tradeoffs, security posture, concurrency models, high availability, and scalability.",
    questionCount: 3,
    marksPerQuestion: 5, // 3 * 5 = 15 marks
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN-SPECIFIC QUESTION BANKS (PYTHON)
// ─────────────────────────────────────────────────────────────────────────────
const pythonSectionA: QuestionSeed[] = [
  {
    type: "single-choice",
    prompt: "How does CPython execute Python source code?",
    options: [
      { id: "opt-1", text: "Compiles source code into intermediate bytecode (.pyc) executed by the CPython virtual machine loop" },
      { id: "opt-2", text: "Compiles directly into machine code assembly without an intermediate representation" },
      { id: "opt-3", text: "Interprets lines directly via bash shell pipes" },
      { id: "opt-4", text: "Converts Python code into C++ and compiles with Clang on every run" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "CPython compiles source code into bytecode (.pyc) which is subsequently evaluated by a stack-based virtual machine.",
    topic: "Execution Model & Bytecode",
  },
  {
    type: "single-choice",
    prompt: "What is the average time complexity of a key lookup in a standard Python dictionary?",
    options: [
      { id: "opt-1", text: "O(1) amortized average time" },
      { id: "opt-2", text: "O(log n)" },
      { id: "opt-3", text: "O(n)" },
      { id: "opt-4", text: "O(n log n)" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Python dictionaries use compact hash tables with open addressing, providing amortized O(1) lookup performance.",
    topic: "Data Structures & Time Complexity",
  },
  {
    type: "multiple-select",
    prompt: "Which of the following built-in Python data types are immutable?",
    options: [
      { id: "opt-1", text: "tuple" },
      { id: "opt-2", text: "str" },
      { id: "opt-3", text: "frozenset" },
      { id: "opt-4", text: "list" },
    ],
    correctOptionIds: ["opt-1", "opt-2", "opt-3"],
    explanation: "Tuples, strings, and frozensets cannot be altered after creation. Lists, dicts, and sets are mutable.",
    topic: "Mutability & Memory Semantics",
  },
  {
    type: "single-choice",
    prompt: "What is the effect of declaring '__slots__' on a Python class definition?",
    options: [
      { id: "opt-1", text: "It restricts instance attributes to a predetermined set and eliminates per-instance __dict__ to optimize RAM" },
      { id: "opt-2", text: "It makes all instance attributes private and inaccessible from outside methods" },
      { id: "opt-3", text: "It enables multi-core threading execution without the GIL" },
      { id: "opt-4", text: "It prevents other classes from inheriting from this class" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Declaring __slots__ prevents the default __dict__ allocation for every instance, significantly reducing memory footprint when instantiating millions of objects.",
    topic: "Object-Oriented Programming & Memory",
  },
  {
    type: "multiple-select",
    prompt: "Which of the following statements about the Python Global Interpreter Lock (GIL) are true?",
    options: [
      { id: "opt-1", text: "The GIL prevents multiple native OS threads from executing Python bytecode in parallel in CPython" },
      { id: "opt-2", text: "I/O bound operations (disk/network) release the GIL while waiting for the OS kernel" },
      { id: "opt-3", text: "multiprocessing spawns separate OS processes with individual GILs to achieve multi-core parallelism" },
      { id: "opt-4", text: "The GIL eliminates the need for locks around multi-threaded file writing" },
    ],
    correctOptionIds: ["opt-1", "opt-2", "opt-3"],
    explanation: "The GIL serializes bytecode execution on multi-core CPUs in CPython. I/O releases the GIL, and multiprocessing circumvents it.",
    topic: "Concurrency & The GIL",
  },
  {
    type: "single-choice",
    prompt: "What does the LEGB rule describe in Python variable resolution?",
    options: [
      { id: "opt-1", text: "The scope lookup order: Local -> Enclosing -> Global -> Builtin" },
      { id: "opt-2", text: "The loop execution order for generator comprehensions" },
      { id: "opt-3", text: "The garbage collector generational triage policy" },
      { id: "opt-4", text: "The byte-ordering format of serialized pickle files" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Python searches namespaces in strict LEGB precedence: Local namespace, Enclosing function closures, Global module namespace, Builtin namespace.",
    topic: "Scoping & Namespaces",
  },
  {
    type: "single-choice",
    prompt: "What is the difference between '==' and 'is' in Python?",
    options: [
      { id: "opt-1", text: "'==' compares value equivalence via __eq__, while 'is' checks object identity (same memory address via id())" },
      { id: "opt-2", text: "'is' compares value equality, while '==' checks memory addresses" },
      { id: "opt-3", text: "'==' is deprecated in Python 3.12+" },
      { id: "opt-4", text: "They are completely interchangeable operators" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "'==' checks whether two objects have equivalent contents; 'is' checks whether two variable references point to the exact same object in memory.",
    topic: "Identity vs Equality",
  },
  {
    type: "multiple-select",
    prompt: "Which of the following expressions yield a generator without evaluating all elements immediately?",
    options: [
      { id: "opt-1", text: "(x * 2 for x in range(1000000))" },
      { id: "opt-2", text: "def gen(): yield 1" },
      { id: "opt-3", text: "[x * 2 for x in range(1000000)]" },
      { id: "opt-4", text: "{x: x * 2 for x in range(10)}" },
    ],
    correctOptionIds: ["opt-1", "opt-2"],
    explanation: "Parentheses syntax creates a generator expression; functions containing the 'yield' keyword return generator iterators. Brackets and braces create full collections in memory.",
    topic: "Generators & Iteration",
  },
  {
    type: "single-choice",
    prompt: "What does the '@functools.wraps' decorator do when authoring custom decorators?",
    options: [
      { id: "opt-1", text: "It copies the original function's name, docstring, and annotations onto the wrapper function" },
      { id: "opt-2", text: "It automatically caches the return value of the wrapped function" },
      { id: "opt-3", text: "It compiles the decorated function into WebAssembly" },
      { id: "opt-4", text: "It prevents exceptions from bubbling out of the inner function" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Without @functools.wraps, introspection tools and debuggers see the generic wrapper name instead of the decorated function's genuine metadata.",
    topic: "Decorators & Metaprogramming",
  },
  {
    type: "single-choice",
    prompt: "What exception is raised when attempting to access a non-existent key in a Python dict without using get()?",
    options: [
      { id: "opt-1", text: "KeyError" },
      { id: "opt-2", text: "IndexError" },
      { id: "opt-3", text: "AttributeError" },
      { id: "opt-4", text: "LookupFailure" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Direct subscript lookup on a mapping (`dict[key]`) raises KeyError if the key is not present.",
    topic: "Exception Hierarchy",
  },
];

const pythonSectionB: QuestionSeed[] = [
  {
    type: "debugging",
    prompt: "Identify the defect causing unexpected state leakage across calls in this function:",
    codeSnippet: `def collect_metrics(metric_name, store=[]):\n    store.append(metric_name)\n    return store\n\na = collect_metrics("cpu")\nb = collect_metrics("ram")\nprint(b)`,
    options: [
      { id: "opt-1", text: "Default parameter expressions are evaluated once at function definition time, sharing the mutable list instance across invocations" },
      { id: "opt-2", text: "Python functions return by value rather than reference" },
      { id: "opt-3", text: "The append() method creates a global variable" },
      { id: "opt-4", text: "String arguments cannot be placed in lists" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Using mutable default arguments like `store=[]` shares the same list across all calls. The idiomatic fix is `store=None` with `if store is None: store = []`.",
    topic: "Mutable Default Arguments",
  },
  {
    type: "code-output",
    prompt: "What is the exact output of this nested comprehension?",
    codeSnippet: `matrix = [[10, 20], [30, 40]]\nresult = [val for row in matrix for val in row if val > 15]\nprint(result)`,
    options: [
      { id: "opt-1", text: "[20, 30, 40]" },
      { id: "opt-2", text: "[[20], [30, 40]]" },
      { id: "opt-3", text: "[10, 20, 30, 40]" },
      { id: "opt-4", text: "TypeError: nested list comprehension syntax invalid" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Nested comprehensions evaluate loops from left to right: for row in matrix, then for val in row, filtering items strictly greater than 15.",
    topic: "Comprehension Execution Mechanics",
  },
  {
    type: "debugging",
    prompt: "What is the output of this loop closure snippet?",
    codeSnippet: `funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])`,
    options: [
      { id: "opt-1", text: "[2, 2, 2] due to late binding of closures in Python" },
      { id: "opt-2", text: "[0, 1, 2]" },
      { id: "opt-3", text: "[0, 0, 0]" },
      { id: "opt-4", text: "NameError: variable 'i' is not defined" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Python closures bind variables late (by reference, not value). By the time the functions execute, the loop variable `i` is 2. The fix is `lambda i=i: i`.",
    topic: "Late Binding Closures",
  },
  {
    type: "code-output",
    prompt: "What will this exception handling block print?",
    codeSnippet: `try:\n    x = 1 / 0\nexcept LookupError:\n    print("Lookup")\nexcept ArithmeticError:\n    print("Arithmetic")\nexcept Exception:\n    print("Exception")`,
    options: [
      { id: "opt-1", text: "Arithmetic" },
      { id: "opt-2", text: "Lookup" },
      { id: "opt-3", text: "Exception" },
      { id: "opt-4", text: "Uncaught ZeroDivisionError crash" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "ZeroDivisionError inherits from ArithmeticError (which is also the parent of OverflowError and FloatingPointError), but not LookupError.",
    topic: "Exception Inheritance Tree",
  },
  {
    type: "debugging",
    prompt: "Why does modifying `b` affect `a` in this snippet?",
    codeSnippet: `a = [[1, 2], [3, 4]]\nb = list(a)\nb[0].append(99)\nprint(a[0])`,
    options: [
      { id: "opt-1", text: "list(a) performs a shallow copy; the inner nested lists remain references to the exact same objects in memory" },
      { id: "opt-2", text: "list(a) creates an alias pointer to `a`" },
      { id: "opt-3", text: "Integers inside lists cannot be copied" },
      { id: "opt-4", text: "append() triggers a circular memory reference" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Shallow copies only duplicate the outermost container. Inner objects are shared references. A deep copy (`copy.deepcopy`) is required to clone nested containers.",
    topic: "Shallow vs Deep Copy",
  },
];

const pythonSectionC: QuestionSeed[] = [
  {
    type: "scenario",
    prompt: "You must process a 50GB CSV log file on an instance with 4GB RAM without triggering an Out-Of-Memory (OOM) kill. What is the optimal Python strategy?",
    options: [
      { id: "opt-1", text: "Open the file with a generator context manager and iterate line-by-line or in fixed chunk sizes with itertools.islice" },
      { id: "opt-2", text: "Use f.readlines() to load all lines into an in-memory list" },
      { id: "opt-3", text: "Convert the CSV to a Python dictionary before parsing" },
      { id: "opt-4", text: "Spawn 64 concurrent threads each calling read() on the same file descriptor" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Iterating directly over an open file object acts as a memory-efficient generator that streams lines as needed without reading the entire file into RAM.",
    topic: "Streaming I/O & Memory Optimization",
  },
  {
    type: "scenario",
    prompt: "An API client intermittently fails due to network jitter. What pattern guarantees idempotent retry behavior with exponential backoff?",
    options: [
      { id: "opt-1", text: "Catch transient network exceptions, apply 2^attempt sleep jitter, and attach a unique idempotency key header to request payloads" },
      { id: "opt-2", text: "Loop continuously without sleep until a 200 OK status arrives" },
      { id: "opt-3", text: "Catch all exceptions including SystemExit and retry indefinitely" },
      { id: "opt-4", text: "Restart the application server on any non-200 HTTP code" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Exponential backoff with jitter prevents thundering herd problems, and idempotency keys guarantee duplicate requests are not processed multiple times.",
    topic: "Resilience & Idempotent Retries",
  },
  {
    type: "scenario",
    prompt: "You are designing a thread-safe in-memory cache in Python. What primitive prevents race conditions when updating cached keys?",
    options: [
      { id: "opt-1", text: "threading.Lock() or threading.RLock() wrapping read-modify-write mutations" },
      { id: "opt-2", text: "Relying solely on the Global Interpreter Lock (GIL)" },
      { id: "opt-3", text: "Using global variables without synchronization" },
      { id: "opt-4", text: "Calling time.sleep(0.01) before each dict assignment" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "While individual atomic CPython bytecode instructions are thread-safe, compound read-check-write sequences are not and require explicit Lock synchronization.",
    topic: "Thread Safety & Synchronization",
  },
  {
    type: "scenario",
    prompt: "When implementing a clean plugin architecture, how do you enforce that subclass implementations supply required interface methods?",
    options: [
      { id: "opt-1", text: "Inherit from abc.ABC and decorate required methods with @abc.abstractmethod" },
      { id: "opt-2", text: "Check method names using string matching inside __init__" },
      { id: "opt-3", text: "Use global assert statements in the base file" },
      { id: "opt-4", text: "Catch NotImplementedError at runtime during program termination" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Classes inheriting from abc.ABC with @abstractmethod cannot be instantiated unless all abstract methods are overridden, catching interface mismatches at instantiation.",
    topic: "Abstract Base Classes & Interfaces",
  },
  {
    type: "scenario",
    prompt: "You have a computationally intensive recursive function calculating Fibonacci numbers. How do you eliminate redundant calls with standard library tooling?",
    options: [
      { id: "opt-1", text: "Apply the '@functools.lru_cache(maxsize=None)' decorator to memoize past outputs" },
      { id: "opt-2", text: "Wrap the function in a while loop that increments a counter" },
      { id: "opt-3", text: "Serialize return values to local disk JSON on each call" },
      { id: "opt-4", text: "Disable Python garbage collection" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "@functools.lru_cache memoizes function arguments and return values, reducing exponential O(2^n) recursion down to linear O(n) execution.",
    topic: "Memoization & Caching Strategies",
  },
];

const pythonSectionD: QuestionSeed[] = [
  {
    type: "practical",
    prompt: "Complete the context manager to safely open, acquire a lock file, and automatically release it even if an unhandled exception occurs:",
    codeSnippet: `from contextlib import contextmanager\n\n@contextmanager\ndef file_lock(lock_path: str):\n    acquire_lock(lock_path)\n    try:\n        # [TASK: What statement belongs here?]\n    finally:\n        release_lock(lock_path)`,
    options: [
      { id: "opt-1", text: "yield" },
      { id: "opt-2", text: "return True" },
      { id: "opt-3", text: "pass" },
      { id: "opt-4", text: "break" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "The 'yield' statement in a @contextmanager transfers control to the 'with' block body. When the with-block terminates or raises, execution resumes in the 'finally' clause.",
    topic: "Context Managers & Resource Cleanup",
  },
  {
    type: "practical",
    prompt: "In a production Python logging setup, how should you log an exception within an 'except' block to capture the full traceback?",
    codeSnippet: `try:\n    result = process_order(order_id)\nexcept Exception as err:\n    # [TASK: Best logging call?]\n    raise`,
    options: [
      { id: "opt-1", text: "logger.exception('Order processing failed for id %s', order_id)" },
      { id: "opt-2", text: "print('Error: ' + str(err))" },
      { id: "opt-3", text: "logger.info(err)" },
      { id: "opt-4", text: "logger.warn(traceback.format_exc().replace('\\n', ' '))" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "logger.exception() logs at ERROR level and automatically appends the active sys.exc_info() traceback without manual formatting.",
    topic: "Structured Logging & Observability",
  },
  {
    type: "practical",
    prompt: "Which pytest syntax properly asserts that a function raises a ValueError with an expected error message?",
    options: [
      { id: "opt-1", text: "with pytest.raises(ValueError, match=r'invalid port'): connect(port=-1)" },
      { id: "opt-2", text: "assert connect(port=-1) == ValueError" },
      { id: "opt-3", text: "try: connect(port=-1); except ValueError: pass" },
      { id: "opt-4", text: "pytest.expect_error(ValueError, connect, -1)" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "pytest.raises() acts as a context manager that passes if the expected exception type and regex match pattern occur, failing if no exception is raised.",
    topic: "Unit Testing & Assertions",
  },
  {
    type: "practical",
    prompt: "You need to enforce runtime immutability on a data container class with Python 3.7+. Which decorator configuration is appropriate?",
    options: [
      { id: "opt-1", text: "@dataclass(frozen=True)" },
      { id: "opt-2", text: "@dataclass(immutable=True)" },
      { id: "opt-3", text: "@dataclass(read_only=True)" },
      { id: "opt-4", text: "@dataclass(static=True)" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "@dataclass(frozen=True) generates __setattr__ and __delattr__ methods that raise FrozenInstanceError when any attribute modification is attempted.",
    topic: "Dataclasses & Immutability",
  },
  {
    type: "practical",
    prompt: "When running concurrent HTTP network requests across 50 endpoints in Python, which standard library tool provides pool-based worker threads?",
    options: [
      { id: "opt-1", text: "concurrent.futures.ThreadPoolExecutor(max_workers=10)" },
      { id: "opt-2", text: "os.fork_pool(50)" },
      { id: "opt-3", text: "sys.threads.spawn_all()" },
      { id: "opt-4", text: "threading.loop_until_finished()" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "concurrent.futures.ThreadPoolExecutor manages a thread pool cleanly with Future objects, submit(), and map() methods suitable for I/O bound workloads.",
    topic: "Thread Pools & Future Objects",
  },
];

const pythonSectionE: QuestionSeed[] = [
  {
    type: "scenario",
    prompt: "An image processing service is pegged at 100% CPU on one core while 15 other CPU cores sit idle, despite using Python's `threading` library. What architectural refactor is required?",
    options: [
      { id: "opt-1", text: "Replace `threading` with `multiprocessing` or a distributed task queue (e.g. Celery / Ray) to bypass the GIL across all CPU cores" },
      { id: "opt-2", text: "Increase the number of threads from 16 to 256" },
      { id: "opt-3", text: "Switch from Python 3.11 to Python 2.7" },
      { id: "opt-4", text: "Add more RAM to the server" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "CPU-bound calculations in CPython cannot run concurrently across multiple cores on threads due to the GIL. Separate processes are required for true parallel CPU execution.",
    topic: "Multi-Core System Architecture",
  },
  {
    type: "scenario",
    prompt: "A high-throughput FastAPI application is exhausting PostgreSQL connection limits under traffic spikes. What architectural pattern resolves this?",
    options: [
      { id: "opt-1", text: "Deploy an external connection pooler (e.g. PgBouncer) in transaction pooling mode and configure client pool sizing with connection timeouts" },
      { id: "opt-2", text: "Open a new raw database connection on every incoming HTTP request and never close it" },
      { id: "opt-3", text: "Disable all database indexes to speed up connection handshakes" },
      { id: "opt-4", text: "Configure PostgreSQL max_connections to 1,000,000 on a 4GB RAM instance" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Each PostgreSQL connection consumes 5-10MB RAM. External connection poolers like PgBouncer multiplex thousands of client connections onto a small fixed pool of backend server connections.",
    topic: "Connection Pooling & Database Scalability",
  },
  {
    type: "scenario",
    prompt: "In a zero-trust distributed architecture, how should a backend service authenticate and authorize requests originating from downstream microservices?",
    options: [
      { id: "opt-1", text: "Require mutual TLS (mTLS) for transport identity, and cryptographically verify signed JWT / Spiffe tokens containing scoped role claims" },
      { id: "opt-2", text: "Trust any request arriving over the internal private subnet without token validation" },
      { id: "opt-3", text: "Hardcode a shared master password inside every service source code repository" },
      { id: "opt-4", text: "Inspect the HTTP Referer header to confirm the origin service name" },
    ],
    correctOptionIds: ["opt-1"],
    explanation: "Zero trust assumes network perimeters can be breached. Every request must be authenticated and authorized via mTLS and cryptographically verifiable claims.",
    topic: "Zero-Trust Security & Service Identity",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC / DOMAIN QUESTION FACTORY
// ─────────────────────────────────────────────────────────────────────────────

function rotateSeedOptions(seeds: QuestionSeed[], testNumber: number): QuestionSeed[] {
  return seeds.map((seed, idx) => {
    const n = seed.options.length;
    if (n <= 1) return seed;
    const shift = (idx + testNumber) % n;
    if (shift === 0) return seed;

    const correctSet = new Set(seed.correctOptionIds);
    const rotated = seed.options.map((_, i) => seed.options[(i + shift) % n]);
    const newCorrect: string[] = [];
    const normalizedOptions = rotated.map((opt, newIdx) => {
      const newId = `opt-${newIdx + 1}`;
      if (correctSet.has(opt.id)) {
        newCorrect.push(newId);
      }
      return { id: newId, text: opt.text };
    });

    return {
      ...seed,
      options: normalizedOptions,
      correctOptionIds: newCorrect.length > 0 ? newCorrect : seed.correctOptionIds,
    };
  });
}

export function getSectionQuestions(
  skillName: string,
  section: "A" | "B" | "C" | "D" | "E",
  testNumber: number,
  level: string
): QuestionSeed[] {
  const category = resolveDomainCategory(skillName);

  if (category === "python") {
    let rawSeeds: QuestionSeed[] = [];
    switch (section) {
      case "A": rawSeeds = pythonSectionA; break;
      case "B": rawSeeds = pythonSectionB; break;
      case "C": rawSeeds = pythonSectionC; break;
      case "D": rawSeeds = pythonSectionD; break;
      case "E": rawSeeds = pythonSectionE; break;
    }
    return rotateSeedOptions(rawSeeds, testNumber);
  }

  const domainPool = getDomainSectionPool(category);
  if (domainPool) {
    return rotateSeedOptions(domainPool[section], testNumber);
  }

  // Generative fallback parameterized by skillName and section definitions
  return rotateSeedOptions(
    generateTailoredSectionQuestions(skillName, category, section, testNumber, level),
    testNumber
  );
}

function generateTailoredSectionQuestions(
  skillName: string,
  category: DomainCategory,
  section: "A" | "B" | "C" | "D" | "E",
  testNumber: number,
  level: string
): QuestionSeed[] {
  const seeds: QuestionSeed[] = [];
  const secDef = MOCK_EXAM_SECTIONS.find((s) => s.section === section)!;
  const count = secDef.questionCount;

  for (let i = 1; i <= count; i++) {
    const qIndex = i;
    const testOffset = (testNumber - 1) * 3 + qIndex;

    switch (section) {
      case "A": {
        const topicsA = [
          "Syntax & Primitive Data Types",
          "Memory Model & Immutability Semantics",
          "Standard Library Modules & Core APIs",
          "Scoping, Namespaces & Closures",
          "Error Categories & Exception Hierarchy",
          "Type Safety & Structural Contracts",
          "Collections, Slicing & Traversal",
          "I/O Streams & Data Serialization",
          "Execution Mechanics & Lifecycle",
          "Code Standards & Architectural Hygiene",
        ];
        const topic = topicsA[(i - 1) % topicsA.length];
        seeds.push({
          type: "single-choice",
          prompt: `[${skillName} Fundamentals] Which statement accurately reflects standard production practices regarding ${topic} in ${skillName}? (Q${qIndex})`,
          options: [
            { id: "opt-1", text: `Enforces deterministic execution, adherence to standard ${skillName} conventions, and modular boundary isolation.` },
            { id: "opt-2", text: `Bypasses runtime validation and eliminates safety checks for maximum speed.` },
            { id: "opt-3", text: `Requires all data structures to be declared as global mutable references.` },
            { id: "opt-4", text: `Prohibits the use of automated unit testing or documentation.` },
          ],
          correctOptionIds: ["opt-1"],
          explanation: `In ${skillName}, adhering to established conventions, determinism, and modular encapsulation ensures maintainability across production environments.`,
          topic: `${topic} (${skillName})`,
        });
        break;
      }

      case "B": {
        const topicsB = [
          "Unhandled Boundary Values & Null Traps",
          "Off-By-One Iteration & Loop Bounds",
          "Unintended State Mutation & Aliasing",
          "Exception Swallowing & Silent Failures",
          "Resource Handle Exhaustion & Leakage",
        ];
        const topic = topicsB[(i - 1) % topicsB.length];
        seeds.push({
          type: i % 2 === 0 ? "debugging" : "code-output",
          prompt: `[${skillName} Debugging] Analyze the defect causing errors in ${topic} for ${skillName}: (Q${qIndex})`,
          codeSnippet: `// ${skillName} Component #${testOffset}\nfunction executeStep(input) {\n  if (!input) return null;\n  return performMutation(input); // Potential unhandled state edge case\n}`,
          options: [
            { id: "opt-1", text: `Input boundary values and unhandled exceptions during state mutation must be caught and sanitized.` },
            { id: "opt-2", text: `The function must always return void regardless of input validity.` },
            { id: "opt-3", text: `Local variables cannot be referenced inside conditional blocks.` },
            { id: "opt-4", text: `Return statements are prohibited inside functions.` },
          ],
          correctOptionIds: ["opt-1"],
          explanation: `Systematic debugging in ${skillName} requires isolating input boundary conditions and handling state mutations defensively.`,
          topic: `${topic} (${skillName})`,
        });
        break;
      }

      case "C": {
        const topicsC = [
          "Algorithmic Complexity & Time-Space Tradeoffs",
          "Indexing & Query Plan Optimization",
          "Cache Invalidation & TTL Eviction",
          "Pipeline Throughput & Backpressure Handling",
          "Idempotency & Concurrent Conflict Resolution",
        ];
        const topic = topicsC[(i - 1) % topicsC.length];
        seeds.push({
          type: "scenario",
          prompt: `[${skillName} Problem Solving] You must design a solution addressing ${topic} in ${skillName} under high traffic. What is the optimal architecture? (Q${qIndex})`,
          options: [
            { id: "opt-1", text: `Profile performance bottlenecks, eliminate redundant operations with caching, and select appropriate algorithmic data structures.` },
            { id: "opt-2", text: `Disable error logging and telemetry to save CPU cycles.` },
            { id: "opt-3", text: `Execute all blocking operations synchronously on the main thread.` },
            { id: "opt-4", text: `Re-run failed operations in an infinite tight loop without backoff.` },
          ],
          correctOptionIds: ["opt-1"],
          explanation: `Effective technical problem solving requires empirical profiling, algorithmic optimization, and strategic caching.`,
          topic: `${topic} (${skillName})`,
        });
        break;
      }

      case "D": {
        const topicsD = [
          "Test-Driven Fixtures & Mock Verification",
          "Defensive Schema Validation & Payload Parsing",
          "Resilient Exponential Backoff & Circuit Breakers",
          "ACID Transaction Boundaries & Rollback Safeties",
          "Structured Logging & Observability Instrumentation",
        ];
        const topic = topicsD[(i - 1) % topicsD.length];
        seeds.push({
          type: "practical",
          prompt: `[${skillName} Practical Task] How should you implement production-grade ${topic} in ${skillName}? (Q${qIndex})`,
          options: [
            { id: "opt-1", text: `Define reproducible test fixtures, isolate external dependencies with mocks, and assert deterministic outputs against acceptance criteria.` },
            { id: "opt-2", text: `Test only the happy path and skip edge-case assertions.` },
            { id: "opt-3", text: `Hardcode live production API credentials in test files.` },
            { id: "opt-4", text: `Rely solely on manual visual inspection before deployment.` },
          ],
          correctOptionIds: ["opt-1"],
          explanation: `Automated implementation workflows must isolate dependencies, use reproducible fixtures, and verify edge-case boundaries deterministically.`,
          topic: `${topic} (${skillName})`,
        });
        break;
      }

      case "E": {
        const topicsE = [
          "High Availability, State Decoupling & Automated Failover",
          "Horizontal vs Vertical Scalability & Connection Pooling",
          "Zero-Trust Security, Mutual TLS & Least-Privilege Authorization",
        ];
        const topic = topicsE[(i - 1) % topicsE.length];
        seeds.push({
          type: "scenario",
          prompt: `[${skillName} Architecture] In a mission-critical distributed architecture using ${skillName}, what is the best strategy for ${topic}? (Q${qIndex})`,
          options: [
            { id: "opt-1", text: `Decouple state from compute instances, implement health probes with automated failover, and utilize circuit breakers for downstream dependencies.` },
            { id: "opt-2", text: `Consolidate all microservices and databases onto a single bare-metal server.` },
            { id: "opt-3", text: `Disable all firewall rules to eliminate network latency.` },
            { id: "opt-4", text: `Store secret access keys directly in public source code.` },
          ],
          correctOptionIds: ["opt-1"],
          explanation: `Fault-tolerant architectures decouple state, monitor health probes, and isolate failures with circuit breakers.`,
          topic: `${topic} (${skillName})`,
        });
        break;
      }
    }
  }

  return seeds;
}
