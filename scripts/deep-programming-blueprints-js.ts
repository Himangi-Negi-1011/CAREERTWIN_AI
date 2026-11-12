import { RichCourseBlueprint } from "./course-upgrades-data";

export const JAVASCRIPT_COURSE: RichCourseBlueprint = {
  slug: "javascript",
  skillId: "00000000-0000-4000-8000-000000000002",
  skillName: "JavaScript",
  docTitle: "MDN Web Docs: JavaScript Language Reference & ECMAScript Standard",
  docOrg: "Mozilla Developer Network / ECMA TC39",
  docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  videoTitle: "JavaScript Full Course: Beginner to Advanced Architecture",
  videoChannel: "freeCodeCamp / JavaScript Mastery",
  videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
  prerequisites: [
    "Basic HTML and CSS understanding",
    "Familiarity with web browser developer tools (Console, Network, Sources tab)",
  ],
  practiceActivities: [
    "Profile execution contexts, call stacks, and closure memory retention in Chrome DevTools Memory profiler",
    "Implement an unhandled rejection watchdog and async concurrency pool with Promise.allSettled and AbortController",
    "Architect a high-performance EventEmitter implementing prototypal delegation and WeakMap private encapsulation",
    "Build a production-grade Tree-Shakeable ES Module with automated unit tests using Vitest",
  ],
  projects: [
    "Enterprise Real-Time Event Dispatcher & Asynchronous Data Pipeline Engine",
  ],
  proficiencyCriteria: [
    "Explain V8 engine execution phases: Ignition bytecode interpreter, TurboFan JIT compiler, and Hidden Classes",
    "Predict microtask vs macrotask execution order across Promise resolutions, queueMicrotask, and setTimeout",
    "Prevent memory leaks caused by closures, detached DOM trees, and orphaned event listeners",
    "Design asynchronous workflows with cancelable AbortSignal tokens and deterministic error boundaries",
  ],
  modules: [
    {
      id: "mod-1-javascript-beginner-module-1",
      title: "Module 1: V8 Engine Internals, Scope Chain & Execution Contexts",
      summary: "Understand the V8 JavaScript engine, memory heap, call stack, execution context phases, hoisting, TDZ, and lexical closures.",
      estimatedMinutes: 120,
      checkpoint: "Analyze call stack execution frames, Temporal Dead Zone boundaries, and closure memory retention.",
      lessons: [
        {
          title: "V8 Engine Internals, Call Stack & Execution Contexts",
          summary: "Learn how the V8 engine compiles and executes JavaScript code via execution contexts, call stacks, variable environments, and the Temporal Dead Zone.",
          estimatedMinutes: 50,
          objectives: [
            "Trace code execution through Global and Function Execution Contexts on the V8 Call Stack",
            "Differentiate var, let, and const scoping behaviors and explain Temporal Dead Zone (TDZ) mechanics",
          ],
          prerequisites: ["Browser developer tools basics"],
          coreHeading: "1. V8 Engine Architecture & Execution Context Lifecycle",
          coreContent:
            "JavaScript does not execute directly on hardware; it runs inside an execution engine—most notably Google's V8 (used in Chrome, Node.js, and Deno).\n\nV8 Architecture Pipeline:\n1. Parser: Converts source text into an Abstract Syntax Tree (AST).\n2. Ignition Interpreter: Compiles the AST into bytecode instructions and begins execution immediately.\n3. TurboFan JIT Optimizer: Profiles runtime behavior ('hot functions'). If types remain stable, TurboFan compiles bytecode into optimized machine code; if type assumptions break, it de-optimizes back to bytecode.\n\nEvery time JavaScript executes, it creates an Execution Context containing:\n- Variable Environment: Holds local variables (`var`).\n- Lexical Environment: Holds block-scoped bindings (`let`, `const`) and an outer environment reference (the Scope Chain).\n- 'this' Binding: Evaluated dynamically based on invocation site.\n\nExecution happens in two distinct phases:\n1. Creation Phase (Memory Allocation / Hoisting): Memory space is reserved for functions and variables. Function declarations are hoisted completely into memory. Variables declared with `var` are initialized to `undefined`. Variables declared with `let` and `const` are allocated but remain uninitialized in the Temporal Dead Zone (TDZ). Accessing a `let` or `const` in the TDZ throws a `ReferenceError`.\n2. Execution Phase: Code runs line-by-line, evaluating expressions and assigning values.",
          diagramCode:
`+-------------------------------------------------------------------+
| V8 ENGINE CALL STACK & EXECUTION CONTEXT CREATION                 |
|                                                                   |
|  Global Execution Context (GEC) -> Function Execution Context     |
|                                                                   |
|  Call Stack (LIFO):                                               |
|  +-------------------------------------------------------------+  |
|  | [calculateTax(amount)]  <- Current execution frame          |  |
|  |   - LexicalEnv: { amount: 100, tax: TDZ }                   |  |
|  |   - OuterRef: GlobalScope                                   |  |
|  +-------------------------------------------------------------+  |
|  | [processOrder()]                                            |  |
|  +-------------------------------------------------------------+  |
|  | [Global Execution Context]                                  |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Execution contexts are pushed onto the call stack during invocation and popped off upon completion.",
          coreKeyPoints: [
            "V8 uses a two-tier compilation model: Ignition (bytecode) and TurboFan (optimizing JIT compiler).",
            "The Creation Phase sets up variable memory before any code line executes.",
            "let and const are hoisted but remain uninitialized in the Temporal Dead Zone until their declaration line runs.",
            "Function declarations are hoisted completely, allowing them to be invoked before their textual declaration.",
          ],
          coreMistakes: [
            "Assuming 'let' and 'const' are not hoisted; they are hoisted, but access is blocked by the Temporal Dead Zone.",
            "Relying on 'var' hoisting in loops, causing asynchronous callbacks to share a single mutated variable.",
          ],
          prodHeading: "2. Diagnosing TDZ Violations and Call Stack Overflow in Production",
          prodContent:
            "In production JavaScript and Node.js microservices, accidental recursion or TDZ access crashes processes instantly with `RangeError: Maximum call stack size exceeded` or `ReferenceError: Cannot access 'X' before initialization`. Understanding execution contexts enables proactive stack safety.",
          codeLang: "javascript",
          codeSnippet:
`// 1. Demonstrating Hoisting vs Temporal Dead Zone
console.log("Hoisted var value:", typeof hoistedVar, hoistedVar); // undefined

try {
  // Accessing let before declaration throws ReferenceError (TDZ)
  console.log(hoistedLet);
} catch (err) {
  console.log("TDZ Guard Triggered:", err.name, "-", err.message);
}

var hoistedVar = "I am initialized now";
let hoistedLet = "I exited the TDZ";

// 2. Preventing Stack Overflow with Tail Recursion / Trampoline Pattern
function safeFactorial(n, acc = 1n) {
  // Using BigInt to prevent 64-bit integer overflow
  while (n > 1n) {
    acc *= n;
    n -= 1n;
  }
  return acc;
}

console.log("Safe factorial (no stack overflow):", safeFactorial(10n).toString());`,
          codeExpectedOutput:
`Hoisted var value: undefined undefined
TDZ Guard Triggered: ReferenceError - Cannot access 'hoistedLet' before initialization
Safe factorial (no stack overflow): 3628800`,
          codeExplanation: "Demonstrates that var is initialized to undefined, let remains in the TDZ, and iterative loops protect against call stack exhaustion.",
          prodKeyPoints: [
            "Always prefer const by default, let when reassignment is required, and avoid var entirely.",
            "Iterative loops avoid call stack growth, ensuring O(1) stack memory consumption.",
          ],
          prodMistakes: [
            "Using recursion on unbounded user data without tail-call optimization or iterative trampolining.",
          ],
          exerciseTitle: "Refactor a Leaked Var Loop to Block-Scoped Scoping",
          exerciseType: "coding",
          exerciseObjective: "Fix a classic closure-in-a-loop bug by replacing function-scoped var with block-scoped let.",
          exerciseDescription:
            "An asynchronous task scheduler creates three delayed telemetry emitters using a for-loop. Due to 'var i = 0', all emitters print the final loop index (3) instead of their intended sequential indices (0, 1, 2). Refactor the code to use block-scoped let and verify sequential execution.",
          exerciseInstructions: [
            "Identify the shared variable problem caused by var.",
            "Replace var with let to give each loop iteration its own lexical binding.",
            "Write a function generate_handlers() that returns an array of functions.",
            "Verify that calling each handler returns its corresponding index.",
          ],
          starterCode:
`function createBadHandlers() {
  var handlers = [];
  // BUG: 'var i' creates a single shared variable across all closures
  for (var i = 0; i < 3; i++) {
    handlers.push(function() {
      return i;
    });
  }
  return handlers;
}
`,
          hints: [
            "Replace `for (var i = 0; ...)` with `for (let i = 0; ...)`. In ES6, `let` creates a brand-new binding for every loop iteration.",
          ],
          solutionExplanation:
            "Because 'let' is block-scoped, every iteration of the loop creates a distinct lexical environment, capturing the correct index value.",
          checks: [
            {
              prompt: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
              options: [
                "The duration during which a browser tab is suspended in the background.",
                "The time between the creation of a block scope and the actual execution of a let or const declaration where accessing the variable throws a ReferenceError.",
                "A garbage collection cycle that cleans up circular object references.",
                "The time spent waiting for an asynchronous network fetch to resolve.",
              ],
              correctIdx: 1,
              explanation: "The TDZ begins when the block execution context is created and ends when the variable's declaration line is executed.",
            },
            {
              prompt: "What error occurs when a function calls itself indefinitely without a base case in JavaScript?",
              options: [
                "TypeError: Out of bounds",
                "RangeError: Maximum call stack size exceeded",
                "SyntaxError: Infinite loop",
                "ReferenceError: Execution context depleted",
              ],
              correctIdx: 1,
              explanation: "Every function call adds a frame to the V8 call stack. When available stack memory is exhausted, V8 raises a RangeError: Maximum call stack size exceeded.",
            },
          ],
          recap: "The V8 engine compiles code through Ignition and TurboFan. Execution contexts manage call stack frames and scope chains. Always use let/const to prevent var hoisting bugs and observe the TDZ.",
          realWorldApps: [
            "Node.js backend servers preventing stack exhaustion on deep recursive AST or JSON traversal.",
            "Frontend state management libraries avoiding stale variable capture in UI event listeners.",
          ],
        },
        {
          title: "Lexical Scope Chain, Variable Lifetimes & Closures",
          summary: "Master lexical scoping, the scope chain, garbage collection mark-and-sweep, and data privacy patterns through closures.",
          estimatedMinutes: 50,
          objectives: [
            "Trace identifier resolution through parent lexical environments along the scope chain",
            "Construct encapsulated module patterns and memoization caches using stateful closures",
          ],
          prerequisites: ["Execution contexts and function basics"],
          coreHeading: "1. The Scope Chain & Closure Memory Mechanics",
          coreContent:
            "Lexical Scope means that scope is determined at author time by the physical location of variables and blocks in source code—NOT where functions are called.\n\nEvery execution context contains an outer environment reference (`[[Scopes]]`). When code references an identifier, JavaScript searches:\n1. The current local Lexical Environment.\n2. The outer enclosing function's Lexical Environment.\n3. The next outer enclosing environment... all the way up to the Global Environment.\n4. If not found in the Global scope, it throws a `ReferenceError`.\n\nA Closure is created whenever an inner function references variables in an outer function's lexical scope, and that inner function survives beyond the execution of the outer function.\n\nMemory Mechanics of Closures:\nNormally, when a function returns, its execution frame is popped off the Call Stack and its local variables are freed by garbage collection. However, if an inner function retains a reference to those variables, the V8 garbage collector (using Mark-and-Sweep) detects that the variables remain reachable. The outer lexical environment is retained in Heap Memory.\n\nThis enables true data privacy: internal state cannot be modified from the outside except through exposed closure functions.",
          diagramCode:
`+-------------------------------------------------------------------+
| CLOSURE HEAP RETENTION & DATA PRIVACY PATTERN                     |
|                                                                   |
|  function createCounter() {                                       |
|    let count = 0; // Heap-retained closure variable               |
|    return {                                                       |
|      increment: () => ++count,                                    |
|      get: () => count                                             |
|    };                                                             |
|  }                                                                |
|                                                                   |
|  Call Stack (Popped!)                  Heap Memory (Retained!)    |
|  +---------------------+              +-------------------------+ |
|  | createCounter()     |              | Closure Environment:    | |
|  | [Frame Cleared]     |              |  count: 0               | |
|  +---------------------+              +-------------------------+ |
|                                                    ^              |
|  counter.increment() ------------------------------+              |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Even after the outer function finishes, inner methods retain a reference to variables preserved on the heap.",
          coreKeyPoints: [
            "Lexical scoping resolves variable names based on where functions were written, not where they are invoked.",
            "Closures bundle an inner function with references to its surrounding lexical environment.",
            "V8 preserves closure variables on the heap as long as the inner function is reachable.",
          ],
          coreMistakes: [
            "Retaining massive objects (e.g., raw response buffers) inside long-lived closures, causing silent memory leaks.",
            "Believing closures copy variables; closures capture references, so mutations are visible across all sibling closures.",
          ],
          prodHeading: "2. Production-Grade Memoization Cache Engine using Closures",
          prodContent:
            "High-traffic API services frequently compute expensive cryptographic hashes or transform heavy payloads. A memoization closure stores previous calculation results by arguments, returning cached outputs in O(1) time without polluting the global namespace.",
          codeLang: "javascript",
          codeSnippet:
`/**
 * Creates a memoized version of an expensive calculation function.
 * Encapsulates the cache map privately within a closure.
 */
function createMemoizer(expensiveFn) {
  const cache = new Map(); // Private to this closure instance
  let cacheHits = 0;
  let cacheMisses = 0;

  return {
    execute(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        cacheHits++;
        return { result: cache.get(key), fromCache: true };
      }

      cacheMisses++;
      const result = expensiveFn(...args);
      cache.set(key, result);
      return { result, fromCache: false };
    },
    getMetrics() {
      return { size: cache.size, hits: cacheHits, misses: cacheMisses };
    },
    clear() {
      cache.clear();
      cacheHits = 0;
      cacheMisses = 0;
    }
  };
}

// Verification with simulated CPU work
const hashCompute = (text) => text.split("").reverse().join("").toUpperCase();
const memoizedService = createMemoizer(hashCompute);

console.log(memoizedService.execute("careertwin")); // fromCache: false
console.log(memoizedService.execute("careertwin")); // fromCache: true
console.log("Metrics:", memoizedService.getMetrics());`,
          codeExpectedOutput:
`{ result: 'NIWTRERAC', fromCache: false }
{ result: 'NIWTRERAC', fromCache: true }
Metrics: { size: 1, hits: 1, misses: 1 }`,
          codeExplanation: "Demonstrates stateful closures encapsulating private cache maps and metric counters with zero global variable leakage.",
          prodKeyPoints: [
            "Closures provide true encapsulation: the cache map cannot be inspected or corrupted externally.",
            "Always provide cache eviction or clear() mechanisms to prevent unbounded memory growth in long-running processes.",
          ],
          prodMistakes: [
            "Using JSON.stringify() as a cache key on circular objects or objects with non-deterministic key orders.",
          ],
          exerciseTitle: "Build a Debounce Rate-Limiter using Closures",
          exerciseType: "coding",
          exerciseObjective: "Implement a debounce(fn, delayMs) utility that delays execution until a burst of calls has ceased.",
          exerciseDescription:
            "Implement a debounce function commonly used in search-as-you-type UI inputs. It accepts a callback function and a delay in milliseconds. It must return a debounced wrapper that clears any pending timer on every invocation, ensuring the underlying function only fires after user typing has paused.",
          exerciseInstructions: [
            "Define debounce(fn, delayMs).",
            "Store timerId inside the outer closure.",
            "Clear timeout on each call and schedule a fresh timeout.",
            "Forward the latest arguments to the wrapped function.",
          ],
          starterCode:
`function debounce(fn, delayMs) {
  // Implement debounce closure
}
`,
          hints: [
            "Declare `let timer = null;` in the outer function.",
            "Inside the returned function, call `clearTimeout(timer);` before setting a new `setTimeout`.",
          ],
          solutionExplanation:
            "The closure preserves timer state across multiple rapid invocations, resetting the delay window each time.",
          checks: [
            {
              prompt: "What enables a JavaScript closure to access variables of a parent function after the parent has returned?",
              options: [
                "Variables are copied into the browser's localStorage.",
                "The garbage collector retains the parent function's lexical environment on the heap because the inner function holds an active reference to it.",
                "JavaScript converts the outer function into an asynchronous Promise.",
                "Variables are permanently registered in the global Window object.",
              ],
              correctIdx: 1,
              explanation: "Mark-and-sweep garbage collection traces active references. Since the inner function references the parent's lexical scope, the parent environment cannot be collected.",
            },
            {
              prompt: "What is a common performance hazard when creating closures inside event listeners without cleanup?",
              options: [
                "CPU thermal throttling.",
                "Memory leaks caused by retaining references to parent objects or DOM nodes long after they are needed.",
                "Automatic conversion to strict mode.",
                "Deadlocks in the V8 compiler.",
              ],
              correctIdx: 1,
              explanation: "If a closure retains a reference to an outer object (e.g. large arrays or DOM elements) and the listener is never removed, garbage collection cannot reclaim that memory.",
            },
          ],
          recap: "Lexical scope is determined at author time. Closures capture references to enclosing scopes, providing powerful data privacy and stateful functional patterns.",
          realWorldApps: [
            "React custom hooks (useState, useEffect) utilizing closures to maintain component state between renders.",
            "Security tokens and encryption keys hidden inside closures to prevent theft via global window script injection.",
          ],
        },
      ],
    },
    {
      id: "mod-2-javascript-beginner-module-2",
      title: "Module 2: Asynchronous Event Loop & Concurrency Architecture",
      summary: "Explore the single-threaded event loop, call stack, macrotask vs microtask queues, Promise internals, and async/await error pipelines.",
      estimatedMinutes: 120,
      checkpoint: "Trace execution ordering between microtasks and macrotasks and build cancelable async pipelines.",
      lessons: [
        {
          title: "Macrotasks, Microtasks & The Event Loop Architecture",
          summary: "Master the browser and Node.js event loop: understand the call stack, Web APIs, the microtask queue, macrotask queue, and rendering intervals.",
          estimatedMinutes: 50,
          objectives: [
            "Predict exact console output ordering across synchronous code, Promise microtasks, and setTimeout macrotasks",
            "Prevent UI freezes and event loop starvation by breaking heavy computational work into non-blocking chunks",
          ],
          prerequisites: ["Call stack and closure fundamentals"],
          coreHeading: "1. The Single-Threaded Event Loop & Queue Priorities",
          coreContent:
            "JavaScript is single-threaded: it has one Call Stack and executes one instruction at a time. Concurrency in JavaScript is provided by the Event Loop host environment (browser or Node.js runtime).\n\nWhen asynchronous operations (network fetch, disk read, timer) are initiated, JavaScript delegates them to background threads (browser C++ Web APIs or Node's libuv thread pool) and continues executing synchronous code on the call stack.\n\nWhen background tasks complete, their callbacks enter one of two queues:\n1. Microtask Queue: Highest priority! Holds `Promise.then/catch/finally` callbacks, `queueMicrotask()`, and `MutationObserver` (or `process.nextTick` in Node). The event loop DRAINS THE ENTIRE microtask queue immediately as soon as the Call Stack becomes empty, before processing any other work.\n2. Macrotask (Task) Queue: Lower priority. Holds `setTimeout`, `setInterval`, `setImmediate`, and I/O callbacks. The event loop processes exactly ONE macrotask per tick, then immediately checks and drains the microtask queue again before executing UI renders.\n\nEvent Loop Cycle:\nCall Stack -> Drain ALL Microtasks -> (Render UI if scheduled) -> Take ONE Macrotask -> Repeat.",
          diagramCode:
`+-------------------------------------------------------------------+
| THE JAVASCRIPT EVENT LOOP EXECUTION LIFECYCLE                     |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   | 1. CALL STACK: Executes synchronous code until EMPTY.    |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|                                 v                                 |
|   +-----------------------------------------------------------+   |
|   | 2. MICROTASK QUEUE: Drain ALL items (Promises,           |   |
|   |    queueMicrotask). If microtasks spawn microtasks,       |   |
|   |    they run immediately! (Risk: Starvation)               |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|                                 v                                 |
|   +-----------------------------------------------------------+   |
|   | 3. BROWSER RENDERING: DOM layout, paint (at 60/120Hz).   |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|                                 v                                 |
|   +-----------------------------------------------------------+   |
|   | 4. MACROTASK QUEUE: Dequeue and execute EXACTLY ONE task  |   |
|   |    (setTimeout, setInterval, I/O). Then repeat loop!      |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Microtasks are always drained completely before the event loop advances to rendering or macrotasks.",
          coreKeyPoints: [
            "JavaScript handles concurrency via the Event Loop, not multi-threaded call stacks.",
            "Microtasks (Promises) always run before the next macrotask (setTimeout).",
            "An infinite chain of microtasks will starve the event loop, freezing browser tabs or Node.js servers.",
          ],
          coreMistakes: [
            "Expecting setTimeout(fn, 0) to execute immediately; it waits until the call stack and all pending microtasks are cleared.",
            "Running CPU-intensive loops synchronously on the main thread, locking up UI rendering and user interactions.",
          ],
          prodHeading: "2. Verifying Queue Scheduling and Non-Blocking Chunking",
          prodContent:
            "When performing heavy data transformations (e.g. processing 100,000 array items), running synchronously freezes the thread. Yielding to the event loop using `queueMicrotask` or `setTimeout` lets the browser render frames and respond to user clicks smoothly.",
          codeLang: "javascript",
          codeSnippet:
`// 1. Verifying Execution Priority Order
console.log("1. Synchronous Start");

setTimeout(() => {
  console.log("5. Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Microtask 1 (Promise.then)");
});

queueMicrotask(() => {
  console.log("4. Microtask 2 (queueMicrotask)");
});

console.log("2. Synchronous End");

// 2. Non-blocking Array Chunker to prevent UI freezing
async function processHeavyArray(items, chunkSize = 2) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    // Process chunk...
    // Yield to the event loop macrotask queue so UI can render
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}`,
          codeExpectedOutput:
`1. Synchronous Start
2. Synchronous End
3. Microtask 1 (Promise.then)
4. Microtask 2 (queueMicrotask)
5. Macrotask (setTimeout)`,
          codeExplanation: "Demonstrates that synchronous lines run first, followed by all queued microtasks, and finally macrotasks.",
          prodKeyPoints: [
            "Synchronous execution always finishes before the event loop checks queues.",
            "Microtask queue drains completely on every turn.",
          ],
          prodMistakes: [
            "Assuming queueMicrotask yields to UI rendering; only macrotasks (or requestAnimationFrame) allow paint cycles.",
          ],
          exerciseTitle: "Predict and Verify Event Loop Task Order",
          exerciseType: "analysis",
          exerciseObjective: "Analyze a complex snippet containing Promises, setTimeout, and synchronous calls to trace execution.",
          exerciseDescription:
            "Given a snippet interweaving new Promise executor callbacks, .then() chains, and setTimeout calls, write an explanation of the exact execution order connecting each step to Call Stack, Microtask Queue, and Macrotask Queue mechanics.",
          exerciseInstructions: [
            "Remember: Promise executor functions `new Promise((resolve) => {...})` execute synchronously!",
            "Identify all synchronous log statements first.",
            "List all microtasks queued by resolved promises.",
            "List all macrotasks queued by setTimeout.",
            "Document the final execution sequence.",
          ],
          starterCode:
`// Trace the output sequence:
console.log("A");
setTimeout(() => console.log("B"), 0);
new Promise((resolve) => {
  console.log("C");
  resolve();
}).then(() => {
  console.log("D");
});
console.log("E");
`,
          hints: [
            "new Promise executes its callback synchronously, so C prints immediately after A and before E.",
            "Expected order: A -> C -> E -> D -> B.",
          ],
          solutionExplanation:
            "'A' runs, setTimeout queues 'B' in macrotasks, Promise executor runs 'C' synchronously and queues 'D' in microtasks, 'E' runs, microtasks drain ('D'), macrotask runs ('B').",
          checks: [
            {
              prompt: "In what order are the queues processed once the call stack is empty?",
              options: [
                "Macrotasks first, followed by microtasks.",
                "All microtasks in the queue are drained completely before the next macrotask is executed.",
                "Microtasks and macrotasks alternate execution 1-by-1.",
                "Only macrotasks execute; microtasks are dropped unless explicitly awaited.",
              ],
              correctIdx: 1,
              explanation: "The event loop specification mandates draining the entire microtask queue before moving to rendering or the next macrotask.",
            },
            {
              prompt: "Why does the callback inside 'new Promise((resolve) => console.log('X'))' execute immediately?",
              options: [
                "Because Promise executor functions are called synchronously during object construction.",
                "Because V8 compiles promises to WebAssembly.",
                "Because it is hoisted to the top of the file.",
                "Because console.log bypasses the event loop.",
              ],
              correctIdx: 0,
              explanation: "The function passed to the Promise constructor is executed synchronously during initialization; only .then() and .catch() callbacks are deferred to microtasks.",
            },
          ],
          recap: "JavaScript's event loop prioritizes synchronous code first, followed by draining all pending microtasks, and finally executing macrotasks one by one.",
          realWorldApps: [
            "Web applications keeping input typing responsiveness at 60 FPS by offloading heavy data parsing into chunks.",
            "Node.js servers scheduling cleanup jobs with setImmediate vs high-priority telemetry with queueMicrotask.",
          ],
        },
        {
          title: "Promises, Async/Await & Resilient Error Pipelines",
          summary: "Master Promise internals, state machines, async/await mechanics, error propagation, and combinators (all, allSettled, race, any).",
          estimatedMinutes: 50,
          objectives: [
            "Select and implement optimal Promise combinators (allSettled, race, any) based on fault tolerance requirements",
            "Build resilient asynchronous workflows incorporating AbortController cancellation tokens and retry policies",
          ],
          prerequisites: ["Event loop and callback fundamentals"],
          coreHeading: "1. The Promise State Machine & Async/Await Under the Hood",
          coreContent:
            "A Promise represents the eventual result of an asynchronous operation. Internally, a Promise operates as a strict state machine with three mutually exclusive states:\n1. Pending: Initial state; neither fulfilled nor rejected.\n2. Fulfilled: Operation completed successfully; holds a permanent value.\n3. Rejected: Operation failed; holds a permanent reason (error).\n\nState transitions are irreversible: once fulfilled or rejected, a Promise is 'settled' and can never change state or fire callbacks again.\n\nPromise Combinators:\n- `Promise.all([p1, p2])`: Fails fast! Rejects immediately if ANY promise rejects. Resolves only when all succeed.\n- `Promise.allSettled([p1, p2])`: Resilient! Waits for all promises to settle and returns an array of `{status: 'fulfilled', value}` or `{status: 'rejected', reason}` objects. Ideal for batch jobs where partial success is acceptable.\n- `Promise.race([p1, p2])`: Settles with the outcome of the FASTEST promise (whether success or error). Used for request timeouts.\n- `Promise.any([p1, p2])`: Resolves with the first SUCCESSFUL promise. Rejects with an `AggregateError` only if all promises fail.\n\n`async`/`await` is syntactic sugar built on top of Promises and Generators. An `async` function always returns a Promise; `await` pauses execution of the async function until the awaited promise settles, without blocking the main event loop.",
          diagramCode:
`+-------------------------------------------------------------------+
| PROMISE STATE MACHINE & ASYNC/AWAIT SUSPENSION                    |
|                                                                   |
|                   +------------------+                            |
|                   |     PENDING      |                            |
|                   +------------------+                            |
|                      /            \\                              |
|          resolve(v) /              \\ reject(err)                  |
|                    v                v                             |
|          +-------------+      +-------------+                     |
|          |  FULFILLED  |      |  REJECTED   |                     |
|          +-------------+      +-------------+                     |
|                 |                    |                            |
|                 v                    v                            |
|           .then(onSuccess)     .catch(onError)                    |
|                                                                   |
|  await promise:                                                   |
|  Function frame suspended -> Event Loop continues other work      |
|  On settlement -> Microtask resumes function execution frame.     |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Promises transition from pending to fulfilled or rejected once. Await pauses function execution without blocking the event loop.",
          coreKeyPoints: [
            "Promises are immutable once settled; state changes cannot be undone.",
            "Use Promise.allSettled when individual failures should not cancel remaining independent requests.",
            "Unhandled promise rejections crash Node.js processes; always attach .catch() or wrap in try/catch.",
          ],
          coreMistakes: [
            "Using sequential 'await' inside a loop when operations are independent, accidentally turning parallel work into a slow waterfall.",
            "Creating naked Promises with 'new Promise' when existing APIs already return standard promises.",
          ],
          prodHeading: "2. Production-Grade Fetch with Timeout via AbortController",
          prodContent:
            "In production networks, hanging HTTP requests tie up connection pools. Using `AbortController` allows clients to enforce strict timeout deadlines, freeing resources immediately if a remote service fails to respond.",
          codeLang: "javascript",
          codeSnippet:
`async function fetchWithTimeout(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // In browser or Node 18+: pass controller.signal to fetch
    const simulatedFetch = new Promise((resolve, reject) => {
      const id = setTimeout(() => resolve({ ok: true, data: "Payload" }), 500);
      controller.signal.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new Error("TimeoutError: Request exceeded deadline"));
      });
    });

    const response = await simulatedFetch;
    return response;
  } catch (err) {
    if (err.message.includes("TimeoutError")) {
      return { ok: false, error: "Network timeout: upstream did not answer in time" };
    }
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(timer); // Prevent timer leak
  }
}

// Verification
fetchWithTimeout("https://api.careertwin.ai/orders", 1000).then((res) => {
  console.log("Fetch outcome:", res);
});`,
          codeExpectedOutput:
`Fetch outcome: { ok: true, data: 'Payload' }`,
          codeExplanation: "Demonstrates defensive timeout management using AbortController and strict cleanup in finally blocks.",
          prodKeyPoints: [
            "Always clear timer IDs in finally blocks to prevent memory leaks.",
            "AbortController signals can be shared across multiple child promises for unified cancellation.",
          ],
          prodMistakes: [
            "Awaiting requests inside for-loops sequentially instead of firing concurrently with Promise.all() or Promise.allSettled().",
          ],
          exerciseTitle: "Implement a Batch Task Runner with Partial Failure Resilience",
          exerciseType: "coding",
          exerciseObjective: "Build a batch job runner using Promise.allSettled that reports successful items and aggregates failures.",
          exerciseDescription:
            "Create runBatch(tasks) where tasks is an array of functions returning promises. Execute them concurrently, aggregate outcomes using Promise.allSettled, and return `{ successful: [...], failed: [...] }` without throwing unhandled exceptions.",
          exerciseInstructions: [
            "Execute all tasks concurrently using Promise.allSettled.",
            "Iterate through results and classify fulfilled vs rejected outcomes.",
            "Return structured summary report.",
          ],
          starterCode:
`async function runBatch(taskFunctions) {
  // Implement resilient batch runner using Promise.allSettled
}
`,
          hints: [
            "Map functions to promises: `const promises = taskFunctions.map(fn => fn());`.",
            "Use `Promise.allSettled(promises)` and filter by `.status === 'fulfilled'`.",
          ],
          solutionExplanation:
            "Promise.allSettled prevents one failing task from terminating the batch, enabling partial success reporting.",
          checks: [
            {
              prompt: "How does Promise.allSettled differ from Promise.all?",
              options: [
                "Promise.allSettled rejects if any promise fails; Promise.all waits for all.",
                "Promise.allSettled always waits for every promise to finish regardless of success or failure; Promise.all rejects immediately upon the first failure.",
                "Promise.allSettled runs tasks in sequential order; Promise.all runs in parallel.",
                "Promise.allSettled can only be used in Node.js.",
              ],
              correctIdx: 1,
              explanation: "Promise.all fails fast on the first rejection, whereas Promise.allSettled waits for all promises to settle, capturing all results and errors.",
            },
            {
              prompt: "What happens if an error is thrown inside an async function without a try/catch block?",
              options: [
                "The JavaScript runtime crashes immediately.",
                "The function returns a Promise in the rejected state containing the thrown error.",
                "The function converts the error to null.",
                "The function retries automatically.",
              ],
              correctIdx: 1,
              explanation: "Any uncaught exception inside an async function automatically rejects the returned promise with the thrown exception.",
            },
          ],
          recap: "Promises model asynchronous state. Use Promise.allSettled for resilient batch operations, AbortController for deadline cancellation, and try/catch/finally for clean error propagation.",
          realWorldApps: [
            "E-commerce checkout pipelines charging credit cards, updating inventory, and sending confirmation emails concurrently.",
            "Microservice dashboards aggregating data from multiple microservices with graceful degradation for offline services.",
          ],
        },
      ],
    },
    {
      id: "mod-3-javascript-beginner-module-3",
      title: "Module 3: Prototypal Systems, Modern Modules & Web Architecture",
      summary: "Understand prototype delegation, ES6 classes, static resolution of ES Modules, tree shaking, and memory leak prevention.",
      estimatedMinutes: 120,
      checkpoint: "Implement prototype-delegated event emitters and build tree-shakeable modular components.",
      lessons: [
        {
          title: "Prototypes, Object Delegation & ES6 Class Systems",
          summary: "Master the prototype chain, [[Prototype]] vs .prototype, Object.create, and ES6 class syntax with private fields and inheritance.",
          estimatedMinutes: 50,
          objectives: [
            "Explain prototypal inheritance and lookup resolution along the [[Prototype]] chain",
            "Implement secure, encapsulated ES6 classes utilizing native private fields (#field) and inheritance",
          ],
          prerequisites: ["Objects and closures"],
          coreHeading: "1. The Prototype Chain & Behavior Delegation Mechanics",
          coreContent:
            "Unlike traditional class-based languages (Java, C++) where classes are blueprints that copy methods into instances upon creation, JavaScript uses Behavior Delegation through Prototypes.\n\nKey Concepts:\n- `[[Prototype]]`: An internal hidden slot on every JavaScript object pointing to another object (its prototype).\n- `Object.prototype`: The root of the prototype chain. Its prototype is `null`.\n- Property Lookup: When accessing `obj.prop`, V8 checks `obj` directly. If not found, it checks `obj.[[Prototype]]`, then `obj.[[Prototype]].[[Prototype]]`, continuing up the chain until it finds the property or reaches `null` (returning `undefined`).\n- Function `.prototype`: Every standard function has a public `.prototype` property. When invoked with `new Constructor()`, the newly created object's `[[Prototype]]` is set to `Constructor.prototype`.\n\nES6 Classes:\nES6 `class` syntax is syntactic sugar over prototype delegation, providing cleaner structure while preserving prototypal inheritance:\n- Methods defined on the class body are attached to `ClassName.prototype` (shared across all instances in memory).\n- Private fields (`#privateField`) are enforced natively by V8 at the engine level; they cannot be accessed or overridden from outside the class.",
          diagramCode:
`+-------------------------------------------------------------------+
| JAVASCRIPT PROTOTYPE DELEGATION CHAIN                             |
|                                                                   |
|  const admin = new AdminUser("Alice");                            |
|                                                                   |
|  [admin instance]                                                 |
|    - name: "Alice"                                                |
|    - [[Prototype]] --------------------+                          |
|                                        v                          |
|                              [AdminUser.prototype]                |
|                                - deleteUser()                     |
|                                - [[Prototype]] --------------+    |
|                                                              v    |
|                                                     [User.prototype]
|                                                       - login()   |
|                                                       - [[Proto]] |
|                                                              |    |
|                                                              v    |
|                                                    [Object.proto] |
|                                                              |    |
|                                                              v    |
|                                                            null   |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Property lookups traverse the [[Prototype]] chain until a matching property is found or null is reached.",
          coreKeyPoints: [
            "JavaScript objects inherit through prototype references, sharing methods without duplicating them in memory.",
            "ES6 classes provide clean syntax for constructors, super calls, and native private fields (#).",
            "Mutating prototypes at runtime slows down V8 optimizations by breaking hidden classes.",
          ],
          coreMistakes: [
            "Attaching large methods inside constructors (this.method = fn), which re-allocates a new function for every single instance.",
            "Using '__proto__' directly in production code; use Object.getPrototypeOf() and Object.create() instead.",
          ],
          prodHeading: "2. Production-Grade EventEmitter with Memory-Efficient Delegation",
          prodContent:
            "Node.js and modern frontend architectures are driven by event emitters. Defining event dispatch methods on the class prototype ensures thousands of concurrent socket connections share identical method pointers in memory.",
          codeLang: "javascript",
          codeSnippet:
`class EventEmitter {
  #events = new Map(); // Native private field: unreachable from outside

  on(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Listener must be a function");
    }
    if (!this.#events.has(eventName)) {
      this.#events.set(eventName, new Set());
    }
    this.#events.get(eventName).add(listener);
    return () => this.off(eventName, listener); // Cleanup unbind function
  }

  off(eventName, listener) {
    const listeners = this.#events.get(eventName);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.#events.delete(eventName);
      }
    }
  }

  emit(eventName, ...args) {
    const listeners = this.#events.get(eventName);
    if (!listeners) return false;
    for (const listener of [...listeners]) {
      try {
        listener(...args);
      } catch (err) {
        console.error("EventEmitter listener error:", err);
      }
    }
    return true;
  }
}

// Verification
const emitter = new EventEmitter();
const unbind = emitter.on("order:processed", (id) => console.log("Handled order:", id));
emitter.emit("order:processed", 90210);
unbind(); // Clean removal
emitter.emit("order:processed", 90211); // Silent (no listeners)`,
          codeExpectedOutput:
`Handled order: 90210`,
          codeExplanation: "Demonstrates high-performance prototype delegation, private class fields (#events), and defensive listener execution.",
          prodKeyPoints: [
            "Using Set for listener storage prevents duplicate listener registrations.",
            "Returning a cleanup function from on() simplifies unsubscribe logic in UI frameworks.",
          ],
          prodMistakes: [
            "Forgetting to iterate over a copy of listeners ([...listeners]); removing listeners during emit causes off-by-one skipping.",
          ],
          exerciseTitle: "Implement an Authenticated User Entity with Role Delegation",
          exerciseType: "coding",
          exerciseObjective: "Create User and Admin classes using ES6 inheritance with encapsulated password hash fields.",
          exerciseDescription:
            "Build a User class with username and a private #passwordHash. Provide a verifyPassword(pwd) method. Create an Admin subclass that inherits from User, adds a permissions array, and overrides a toJSON() method that safely omits private hashes.",
          exerciseInstructions: [
            "Define User with private field #passwordHash.",
            "Implement verifyPassword(input).",
            "Extend User into Admin and add hasPermission(perm) method.",
            "Ensure JSON.stringify(admin) never exposes the password hash.",
          ],
          starterCode:
`class User {
  // Implement User with private field
}

class Admin extends User {
  // Implement Admin inheritance
}
`,
          hints: [
            "Use `#passwordHash;` at the top of the User class.",
            "In Admin constructor, call `super(username, hash);`.",
          ],
          solutionExplanation:
            "Private fields (#) are hard boundaries enforced by the V8 runtime, preventing reflection or enumeration leaks.",
          checks: [
            {
              prompt: "What is the primary memory advantage of defining methods on a class prototype rather than inside the constructor?",
              options: [
                "Prototype methods run in Web Workers automatically.",
                "Prototype methods exist as a single shared function in memory across all instances, rather than being re-created for each instance.",
                "Prototype methods bypass garbage collection entirely.",
                "Prototype methods can only be invoked asynchronously.",
              ],
              correctIdx: 1,
              explanation: "Methods on the prototype are allocated once in memory. All instances delegate to this shared object, saving massive RAM.",
            },
            {
              prompt: "How are private class fields (e.g. #apiKey) enforced in modern JavaScript?",
              options: [
                "Through a naming convention that developers agree to respect.",
                "By the V8 JavaScript engine itself at compile and runtime; attempting to access outside the class throws a SyntaxError.",
                "By automatically converting the property into a symbol.",
                "By freezing the object using Object.freeze().",
              ],
              correctIdx: 1,
              explanation: "Native private fields (#) are hard private variables enforced directly by the JavaScript runtime engine.",
            },
          ],
          recap: "JavaScript uses prototype delegation for inheritance. ES6 classes provide clean syntax with native private fields (#) and memory-efficient shared methods.",
          realWorldApps: [
            "Frontend state stores (Redux, Zustand, Vuex) managing shared state models with minimal memory footprint.",
            "Database ORMs (Prisma, TypeORM) modeling relational tables as delegated model instances.",
          ],
        },
        {
          title: "ES Modules, Tree Shaking & High-Performance Architecture",
          summary: "Master ECMAScript Modules (ESM) vs CommonJS, static analysis, bundler tree shaking, and memory leak prevention in long-lived web apps.",
          estimatedMinutes: 50,
          objectives: [
            "Explain static module analysis and how ES Module structure enables bundlers (Vite, Webpack) to perform dead-code elimination (Tree Shaking)",
            "Identify and eliminate common JavaScript memory leaks (orphaned listeners, detached DOM nodes, uncleaned intervals)",
          ],
          prerequisites: ["Prototypes and asynchronous JavaScript"],
          coreHeading: "1. ES Modules (ESM) vs CommonJS & Tree Shaking Mechanics",
          coreContent:
            "JavaScript has evolved from ad-hoc script tags and CommonJS (`require()`) to standardized ECMAScript Modules (ESM: `import`/`export`).\n\nFundamental Differences:\n- CommonJS (CJS): Dynamic and synchronous. `require()` can be called conditionally inside if-statements at runtime. Because dependencies are resolved dynamically during execution, bundlers cannot determine which exports are actually used before running the code.\n- ES Modules (ESM): Static and asynchronous. `import` statements must reside at top-level. The dependency graph is parsed and resolved BEFORE code execution.\n\nTree Shaking:\nBecause ESM imports and exports are completely static, bundlers (Vite, Rollup, Webpack, esbuild) can analyze the module Abstract Syntax Tree and determine with 100% mathematical certainty which functions are never referenced. Unused code ('dead branches') is pruned from the production bundle, slashing network download size.\n\nMemory Leak Prevention in Modern Web Applications:\nJavaScript features automatic garbage collection (Mark-and-Sweep). However, memory leaks occur when objects are unintentionally kept reachable from the root window/global scope:\n1. Lingering Event Listeners: Attaching listeners to `window` or `document` without removing them when components unmount.\n2. Detached DOM Nodes: Retaining references in JavaScript to DOM elements that have been removed from the visible document tree.\n3. Uncleared Timers: `setInterval` running indefinitely, referencing closure variables that can never be garbage collected.",
          diagramCode:
`+-------------------------------------------------------------------+
| ESM STATIC TREE SHAKING VS DYNAMIC COMMONJS BUNDLING             |
|                                                                   |
|  COMMONJS (require):                                              |
|  Dynamic require("./utils") -> Bundler must include ENTIRE file!  |
|                                                                   |
|  ES MODULES (import { usedFn } from "./utils"):                   |
|  Module Graph (Static):                                           |
|  [utils.js]                                                       |
|    |-- export function usedFn()       ===> Included in Bundle     |
|    |-- export function unusedHeavy()  ===> [PRUNED / TREE-SHAKEN] |
|                                                                   |
|  Production bundle size reduced by eliminating unused functions!  |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Static ESM syntax allows build tools to discard unused exports during bundling.",
          coreKeyPoints: [
            "ES Modules are static: imports and exports are evaluated at build time before code executes.",
            "Tree shaking removes unused exports, drastically reducing bundle size and browser parse time.",
            "Always unregister event listeners, abort controllers, and timers when tearing down components.",
          ],
          coreMistakes: [
            "Exporting single giant default objects ('export default { fn1, fn2 }'), which defeats tree shaking.",
            "Leaving setInterval() running in single-page apps without clearing it on page navigation.",
          ],
          prodHeading: "2. Production Memory Leak Prevention with WeakRef & AbortSignal",
          prodContent:
            "In modern Single Page Applications (Next.js, React), forgetting to clean up global event listeners is the leading cause of browser tab memory bloat. Using `AbortSignal` allows multiple listeners to be wiped simultaneously with a single abort call.",
          codeLang: "javascript",
          codeSnippet:
`class ComponentLifecycleManager {
  #abortController = new AbortController();

  mount() {
    const { signal } = this.#abortController;

    // Passing signal to addEventListener automatically cleans up when aborted!
    console.log("Component mounted: attaching listeners with signal...");
    
    // Simulated window listener with automatic cleanup binding
    const simulatedListener = () => console.log("Window resized");
    
    // When abort is triggered, listener is removed automatically by the browser engine
    signal.addEventListener("abort", () => {
      console.log("Signal aborted: Event listeners detached from memory.");
    });
  }

  unmount() {
    // Single call tears down all associated listeners and async fetches
    this.#abortController.abort();
    console.log("Component unmounted cleanly.");
  }
}

// Verification
const comp = new ComponentLifecycleManager();
comp.mount();
comp.unmount();`,
          codeExpectedOutput:
`Component mounted: attaching listeners with signal...
Signal aborted: Event listeners detached from memory.
Component unmounted cleanly.`,
          codeExplanation: "Demonstrates modern leak-free lifecycle cleanup using AbortSignal to detach event listeners deterministically.",
          prodKeyPoints: [
            "Modern addEventListener accepts an { signal } option, removing the listener automatically when aborted.",
            "WeakMap and WeakRef allow objects to be referenced without preventing garbage collection.",
          ],
          prodMistakes: [
            "Using arrow functions in addEventListener and trying to remove them with removeEventListener without saving the function reference.",
          ],
          exerciseTitle: "Audit and Fix a Leaky Timer Component",
          exerciseType: "coding",
          exerciseObjective: "Refactor a stateful tracker to implement clean unmount logic and prevent memory leaks.",
          exerciseDescription:
            "A dashboard metric widget starts a setInterval heartbeat to fetch telemetry every second. When users switch views, the interval continues running in the background, consuming CPU and retaining stale state. Refactor the widget to provide a start() and dispose() lifecycle that guarantees full resource cleanup.",
          exerciseInstructions: [
            "Implement start() and dispose() methods.",
            "Clear any running interval ID inside dispose().",
            "Nullify internal callback references so closures can be collected.",
            "Ensure calling dispose() multiple times is safe and idempotent.",
          ],
          starterCode:
`class TelemetryWidget {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.timerId = null;
  }

  start() {
    // BUG: no guard against multiple start() calls
    this.timerId = setInterval(() => {
      console.log("Heartbeat:", this.endpoint);
    }, 1000);
  }

  // Missing dispose() cleanup
}
`,
          hints: [
            "In `dispose()`, execute `clearInterval(this.timerId); this.timerId = null;`.",
            "In `start()`, guard with `if (this.timerId) return;`.",
          ],
          solutionExplanation:
            "Idempotent cleanup methods ensure background timers are killed and memory references are freed.",
          checks: [
            {
              prompt: "Why can bundlers tree-shake ES Modules (ESM) but cannot reliably tree-shake CommonJS (require)?",
              options: [
                "Because CommonJS files are encrypted.",
                "Because ESM imports and exports are static and can be analyzed at compile time, whereas CommonJS calls can be dynamic at runtime.",
                "Because ESM requires TypeScript.",
                "Because CommonJS is only supported in Linux environments.",
              ],
              correctIdx: 1,
              explanation: "ESM structure is completely static (top-level only, fixed string specifiers). This allows static AST analysis to identify unused code before runtime.",
            },
            {
              prompt: "What is a detached DOM node in JavaScript?",
              options: [
                "A DOM element that has been removed from the visible HTML document but is still referenced by a JavaScript variable in memory.",
                "A node created inside an iframe.",
                "A custom HTML tag with a shadow root.",
                "An element with 'display: none' styling.",
              ],
              correctIdx: 0,
              explanation: "Detached DOM nodes occur when elements are removed from the DOM tree, but JavaScript variables keep referencing them, preventing garbage collection.",
            },
          ],
          recap: "Static ES Modules enable tree shaking to minimize bundle sizes. High-performance web apps actively manage memory by cleaning up event listeners, timers, and detached DOM references.",
          realWorldApps: [
            "High-traffic Next.js and React frontend applications maintaining minimal bundle sizes through granular ESM tree shaking.",
            "Long-lived Electron and single-page applications preventing browser tab memory bloat through deterministic unmount disposal.",
          ],
        },
      ],
    },
  ],
};
