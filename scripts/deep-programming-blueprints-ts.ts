import { RichCourseBlueprint } from "./course-upgrades-data";

export const TYPESCRIPT_COURSE: RichCourseBlueprint = {
  slug: "typescript",
  skillId: "00000000-0000-4000-8000-000000000004",
  skillName: "TypeScript",
  docTitle: "Official TypeScript Handbook & Language Specification",
  docOrg: "Microsoft TypeScript Team",
  docUrl: "https://www.typescriptlang.org/docs/",
  videoTitle: "TypeScript Full Course: Beginner to Advanced Architecture",
  videoChannel: "freeCodeCamp / Total TypeScript",
  videoUrl: "https://www.youtube.com/watch?v=gieEQFIfgYc",
  prerequisites: [
    "Proficiency in modern JavaScript (ES6+ syntax, functions, objects, promises)",
    "Familiarity with Node.js and package managers (npm or pnpm)",
  ],
  practiceActivities: [
    "Configure a strict production tsconfig.json enforcing noUncheckedIndexedAccess and exactOptionalPropertyTypes",
    "Model complex domain state machines using discriminated unions and exhaustive never checking",
    "Author reusable generic higher-order functions with keyof and Record mapped types",
    "Implement nominal branded types and runtime boundary schema validation with Zod",
  ],
  projects: [
    "Enterprise Type-Safe REST & GraphQL Gateway with Automated Type-Level Testing",
  ],
  proficiencyCriteria: [
    "Explain type erasure and differentiate structural typing (duck typing) from nominal type systems (Java/C#)",
    "Execute type narrowing using type predicates (is), discriminated unions, and exhaustive switch checks",
    "Design generic abstractions constrained by extends and infer keywords without using 'any'",
    "Bridge runtime validation and compile-time typing using branded types and Zod schemas",
  ],
  modules: [
    {
      id: "mod-1-typescript-beginner-module-1",
      title: "Module 1: Structural Typing, Inference & Discriminated Unions",
      summary: "Understand the TypeScript compiler pipeline, type erasure, structural duck typing, type inference, narrowing, and discriminated unions.",
      estimatedMinutes: 120,
      checkpoint: "Design discriminated union state machines with exhaustive compile-time never checking.",
      lessons: [
        {
          title: "TypeScript Architecture, Type Erasure & Structural Typing",
          summary: "Learn how the TypeScript compiler (tsc) validates code, strips types via type erasure, and enforces structural (shape-based) subtyping.",
          estimatedMinutes: 50,
          objectives: [
            "Explain the TypeScript compilation pipeline and the concept of zero-runtime cost Type Erasure",
            "Differentiate structural subtyping from nominal typing and explain excess property check behaviors",
          ],
          prerequisites: ["Modern JavaScript objects and functions"],
          coreHeading: "1. TypeScript Architecture & Structural Type Compatibility",
          coreContent:
            "TypeScript is a typed superset of JavaScript that compiles to clean JavaScript. Its primary design goal is static type safety at compile time without introducing runtime overhead.\n\nKey Architectural Concepts:\n1. The TypeScript Compiler (`tsc`):\n- Parser: Generates an AST with type annotations.\n- Binder: Links symbols across scopes.\n- Type Checker: Validates type compatibility, inference, and constraints.\n- Emitter: Outputs clean JavaScript while completely erasing all interfaces, type aliases, and type annotations ('Type Erasure'). At runtime in Node or browsers, TYPES DO NOT EXIST.\n\n2. Structural Typing (Shape-Based Compatibility):\nUnlike nominal languages (Java, C#) where two classes with identical fields are incompatible unless they share an explicit inheritance hierarchy, TypeScript uses Structural Typing (duck typing: 'if it walks like a duck and quacks like a duck, it is a duck').\n\nIf type `A` has all the properties required by type `B`, `A` is assignable to `B` regardless of where or how it was declared.\n\n3. Excess Property Checking:\nThere is one key exception to pure structural assignability: Object Literals. When assigning an object literal directly to a typed variable or function parameter, TypeScript applies strict excess property checking to catch typos:\n`const p: Point2D = { x: 10, y: 20, z: 30 };` // Error: 'z' does not exist in type 'Point2D'!\nHowever, assigning via an intermediate variable (`const raw = {x: 10, y: 20, z: 30}; const p: Point2D = raw;`) succeeds because structural subtyping applies.",
          diagramCode:
`+-------------------------------------------------------------------+
| TYPESCRIPT COMPILATION PIPELINE & TYPE ERASURE                    |
|                                                                   |
|  Source [.ts] ---> AST ---> Type Checker (Static Safety)          |
|                                  |                                |
|                                  v                                |
|                             Emitter                               |
|                                  | (All types stripped away!)     |
|                                  v                                |
|  JavaScript [.js] (Zero runtime type overhead in browser / Node)  |
|                                                                   |
|  STRUCTURAL TYPING:                                               |
|  type Point = { x: number; y: number }                            |
|  const obj = { x: 1, y: 2, label: "origin" }                     |
|  // VALID: obj has at least 'x' and 'y', satisfying Point shape!  |
+-------------------------------------------------------------------+`,
          diagramExplanation: "TypeScript checks types at compile time and erases them completely, enforcing shapes rather than explicit class names.",
          coreKeyPoints: [
            "TypeScript types exist purely at compile time; they are completely erased from runtime JavaScript.",
            "Compatibility is determined by property shapes (structural typing), not class names (nominal typing).",
            "Excess property checks strictly flag unknown properties on direct object literals to catch typos.",
          ],
          coreMistakes: [
            "Writing runtime checks like 'if (x instanceof MyInterface)', which crashes because interfaces do not exist in JavaScript.",
            "Using 'any' to bypass compiler errors, disabling type checking and masking silent bugs.",
          ],
          prodHeading: "2. Leveraging Structural Compatibility in API Adapters",
          prodContent:
            "In enterprise microservices, domain services should define minimal required interfaces. Because TypeScript is structural, external library objects or database rows that satisfy the required shape can be passed directly without writing boilerplate wrapper classes.",
          codeLang: "typescript",
          codeSnippet:
`// 1. Defining minimal domain interface
interface LoggableUser {
  id: string;
  email: string;
}

// Service accepts any object that contains at least id and email
function auditUserAction(user: LoggableUser, action: string): string {
  return \`Audit: User \${user.email} (ID: \${user.id}) performed \${action}\`;
}

// 2. A complex database entity from an ORM (Prisma/TypeORM)
const dbUser = {
  id: "usr_9921",
  email: "lead@careertwin.ai",
  hashedPassword: "argon2id$...secret",
  roles: ["admin", "developer"],
  createdAt: new Date(),
};

// VALID via structural typing: dbUser has id and email!
console.log(auditUserAction(dbUser, "DEPLOY_PRODUCTION"));

// 3. Excess Property Check on direct literal catches typos:
// auditUserAction({ id: "1", email: "a@b.com", emialTypo: "bad" }, "LOGIN"); // TS Error!`,
          codeExpectedOutput:
`Audit: User lead@careertwin.ai (ID: usr_9921) performed DEPLOY_PRODUCTION`,
          codeExplanation: "Demonstrates that rich database models satisfy lean interface contracts structurally without manual transformation.",
          prodKeyPoints: [
            "Accept minimal interfaces in functions to maximize flexibility across consumers.",
            "Structural typing reduces glue code between database layers and API handlers.",
          ],
          prodMistakes: [
            "Believing TypeScript types validate external HTTP API request bodies at runtime; external data must be validated with schemas.",
          ],
          exerciseTitle: "Refactor a Redundant Adapter using Structural Subtyping",
          exerciseType: "coding",
          exerciseObjective: "Eliminate unnecessary mapping classes by relying on TypeScript's native structural compatibility.",
          exerciseDescription:
            "A legacy codebase created separate wrapper classes to convert incoming customer records into notification recipients. Refactor the code to define a single clean interface Recipient { name: string; email: string; } and verify that diverse source objects pass directly into sendNotification without manual mapping.",
          exerciseInstructions: [
            "Define interface Recipient.",
            "Implement sendNotification(recipient: Recipient, message: string): string.",
            "Verify that both Customer and Employee objects are accepted directly.",
          ],
          starterCode:
`interface Recipient {
  name: string;
  email: string;
}

// Implement notification dispatcher
function sendNotification(recipient: Recipient, message: string): string {
  // Return formatted message
}
`,
          hints: [
            "Return `Notification to ${recipient.name} <${recipient.email}>: ${message}`.",
          ],
          solutionExplanation:
            "Structural subtyping allows any object with matching fields to satisfy the contract without explicit inheritance.",
          checks: [
            {
              prompt: "What happens to TypeScript type annotations (interfaces, types, generics) after compilation?",
              options: [
                "They are converted into hidden V8 metadata classes.",
                "They are completely removed (erased), leaving clean standard JavaScript.",
                "They are serialized into JSON schema files.",
                "They are compiled into WebAssembly validation hooks.",
              ],
              correctIdx: 1,
              explanation: "Type erasure ensures that TypeScript adds zero runtime overhead; all type constructs are stripped out by the compiler.",
            },
            {
              prompt: "Why does 'const p: { x: number } = { x: 10, y: 20 };' trigger a TypeScript compiler error?",
              options: [
                "Because TypeScript does not allow numbers higher than 15.",
                "Because direct object literals undergo excess property checking to detect accidental typos and invalid keys.",
                "Because variables must be declared with 'let'.",
                "Because TypeScript requires semicolons.",
              ],
              correctIdx: 1,
              explanation: "Excess property checks flag unknown keys on object literals to prevent developer typos and unintended parameter pollution.",
            },
          ],
          recap: "TypeScript provides compile-time safety via structural typing and type erasure. Compatible shapes pass directly into interfaces, while direct literals enforce excess property checks.",
          realWorldApps: [
            "Next.js full-stack applications sharing data interfaces between server-side API routes and client-side React components.",
            "Microservice SDKs defining lean consumer interfaces satisfied by varied database entity representations.",
          ],
        },
        {
          title: "Type Inference, Narrowing & Discriminated Unions",
          summary: "Master type inference, control-flow analysis, type guards (typeof, instanceof, in), custom type predicates, and discriminated unions.",
          estimatedMinutes: 50,
          objectives: [
            "Perform safe type narrowing using built-in guards and user-defined type predicates (param is Type)",
            "Model complex domain state machines using discriminated unions with exhaustive compile-time checking using never",
          ],
          prerequisites: ["TypeScript structural typing basics"],
          coreHeading: "1. Control Flow Analysis & Discriminated Union Architecture",
          coreContent:
            "TypeScript features a sophisticated Control Flow Analysis engine that tracks types dynamically as execution progresses through conditional branches.\n\nType Narrowing Mechanisms:\n1. `typeof` guards: Narrows primitives (`typeof x === 'string'`).\n2. `instanceof` guards: Narrows class instances (`err instanceof DatabaseError`).\n3. `in` operator: Narrows objects by property existence (`'token' in payload`).\n4. User-Defined Type Predicates: Functions returning `value is SpecificType` to perform custom validation.\n\nDiscriminated Unions (Tagged Unions):\nThe cornerstone of robust domain modeling. A discriminated union consists of multiple interface types that share a single common literal property (the 'discriminant' tag, such as `status` or `kind`).\n\n```typescript\ntype AsyncState<T> =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: Error };\n```\n\nWhen checking `if (state.status === 'success')`, TypeScript automatically narrows `state` to the exact variant containing `.data`. If you test every case in a switch statement, the default branch can assign the remaining state to `never`:\n`const _exhaustiveCheck: never = state;`\nIf you ever add a new variant (e.g. `{ status: 'cancelled' }`) to the union in the future, the compiler will refuse to build until you handle it in the switch statement!",
          diagramCode:
`+-------------------------------------------------------------------+
| DISCRIMINATED UNION EXHAUSTIVE CONTROL FLOW                       |
|                                                                   |
|  type ApiResponse =                                               |
|    | { status: "success"; data: User }   (Tag: "success")         |
|    | { status: "error"; message: string } (Tag: "error")          |
|                                                                   |
|  switch (response.status) {                                       |
|    case "success":                                                |
|      // TypeScript knows response has .data (Safe!)               |
|      return response.data;                                        |
|    case "error":                                                  |
|      // TypeScript knows response has .message (Safe!)            |
|      return response.message;                                     |
|    default:                                                       |
|      // Compile-time assertion: catches unhandled union cases!     |
|      const _exhaustive: never = response;                         |
|  }                                                                |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Checking the shared tag narrows the type. The 'never' check guarantees 100% exhaustive case handling.",
          coreKeyPoints: [
            "Control flow analysis narrows union types automatically within if/switch branches.",
            "Discriminated unions use a common literal tag to distinguish between variants safely.",
            "Assigning unhandled cases to 'never' in default branches creates a compile-time exhaustiveness check.",
          ],
          coreMistakes: [
            "Using optional properties on a single bloated object ({ data?, error? }) instead of clean discriminated unions.",
            "Using 'as' type assertions to silence the compiler instead of allowing proper type narrowing to prove safety.",
          ],
          prodHeading: "2. Production Payment State Machine with Exhaustive Check",
          prodContent:
            "Payment processors (Stripe/PayPal) send polymorphic webhook states. Modeling webhooks as a discriminated union guarantees that developers never read missing transaction IDs on failed charges.",
          codeLang: "typescript",
          codeSnippet:
`// Discriminated union modeling payment lifecycle
type PaymentEvent =
  | { type: "PAYMENT_INITIATED"; transactionId: string; amount: number }
  | { type: "PAYMENT_SUCCESS"; transactionId: string; amount: number; receiptUrl: string }
  | { type: "PAYMENT_FAILED"; transactionId: string; failureReason: string; retryable: boolean };

function handlePaymentWebhook(event: PaymentEvent): string {
  switch (event.type) {
    case "PAYMENT_INITIATED":
      return \`Hold created for tx: \${event.transactionId} (\$\${event.amount})\`;
      
    case "PAYMENT_SUCCESS":
      // Safe: TypeScript guarantees receiptUrl exists here!
      return \`Receipt ready: \${event.receiptUrl}\`;
      
    case "PAYMENT_FAILED":
      // Safe: TypeScript guarantees failureReason exists here!
      return \`Declined: \${event.failureReason} (Retryable: \${event.retryable})\`;
      
    default: {
      // Exhaustiveness check: if PaymentEvent adds a new variant, this line triggers a compiler error!
      const _exhaustiveCheck: never = event;
      throw new Error(\`Unhandled event variant: \${JSON.stringify(_exhaustiveCheck)}\`);
    }
  }
}

// Verification
console.log(handlePaymentWebhook({
  type: "PAYMENT_SUCCESS",
  transactionId: "tx_1042",
  amount: 250,
  receiptUrl: "https://pay.careertwin.ai/rcpt/991"
}));`,
          codeExpectedOutput:
`Receipt ready: https://pay.careertwin.ai/rcpt/991`,
          codeExplanation: "Demonstrates complete type narrowing by tag, accessing variant-specific properties safely with an exhaustive never check.",
          prodKeyPoints: [
            "Discriminated unions make illegal states unrepresentable (e.g. success cannot exist without receiptUrl).",
            "The exhaustive 'never' check provides instant notification during refactoring when a new variant is introduced.",
          ],
          prodMistakes: [
            "Omitting the default never check, allowing unhandled union cases to pass silently until runtime crashes.",
          ],
          exerciseTitle: "Build an Exhaustive Order Workflow Engine",
          exerciseType: "coding",
          exerciseObjective: "Model order states using a discriminated union and implement an exhaustive transition handler.",
          exerciseDescription:
            "Define an OrderStatus discriminated union: PENDING (orderId), SHIPPED (orderId, trackingNumber), DELIVERED (orderId, deliveredAt), and CANCELLED (orderId, reason). Implement formatOrderStatus(status: OrderStatus): string with an exhaustive never check.",
          exerciseInstructions: [
            "Define OrderStatus union with literal 'status' discriminator.",
            "Write formatOrderStatus using a switch statement.",
            "Implement exhaustive default check assigning to never.",
          ],
          starterCode:
`// Define OrderStatus discriminated union
type OrderStatus =
  | { status: "PENDING"; orderId: string }
  // Add SHIPPED, DELIVERED, and CANCELLED variants

function formatOrderStatus(order: OrderStatus): string {
  // Implement exhaustive switch
}
`,
          hints: [
            "In default case: `const _check: never = order; return _check;`.",
          ],
          solutionExplanation:
            "Discriminated unions ensure that each order phase only exposes fields valid for that exact status.",
          checks: [
            {
              prompt: "What is the purpose of assigning an unhandled branch to a variable of type 'never' in a switch statement?",
              options: [
                "It pauses execution until an asynchronous Promise resolves.",
                "It provides a compile-time check ensuring that all possible variants of a union type have been handled exhaustively.",
                "It instructs the V8 garbage collector to free the variable immediately.",
                "It allows TypeScript to compile to WebAssembly.",
              ],
              correctIdx: 1,
              explanation: "If any union variant is omitted from the switch statement, it falls through to the default branch where assigning it to 'never' causes a compiler error.",
            },
            {
              prompt: "What is a User-Defined Type Predicate in TypeScript?",
              options: [
                "A function that returns a boolean and has a return type signature in the form 'param is Type'.",
                "A regex pattern that validates email strings.",
                "A decorator that checks database permissions.",
                "A tsconfig setting that enables strict null checks.",
              ],
              correctIdx: 0,
              explanation: "Type predicates (e.g., 'pet is Dog') inform the compiler's control flow analysis that if the function returns true, the parameter can be safely narrowed to the specified type.",
            },
          ],
          recap: "Type narrowing evaluates conditional branches. Discriminated unions with shared literal tags make invalid states impossible and guarantee exhaustive case handling via 'never'.",
          realWorldApps: [
            "Redux and NgRx state management reducers handling action payloads with 100% type safety.",
            "Cloud messaging brokers parsing polymorphic JSON payloads from AWS SQS and Kafka.",
          ],
        },
      ],
    },
    {
      id: "mod-2-typescript-beginner-module-2",
      title: "Module 2: Generic Engineering & Type Transformation",
      summary: "Understand type parameters, generic constraints (extends), mapped types, the keyof operator, and core utility types (Partial, Pick, Omit, Record).",
      estimatedMinutes: 120,
      checkpoint: "Build reusable type-safe repositories using generics and mapped utility transformations.",
      lessons: [
        {
          title: "Generics, Constraints & Polymorphic Function Signatures",
          summary: "Learn generic functions, classes, and interfaces; enforce type constraints with extends; and implement polymorphic type parameters.",
          estimatedMinutes: 50,
          objectives: [
            "Author reusable generic data structures (caches, queues, repositories) that preserve element types",
            "Constrain generic parameters using the extends keyword to ensure required properties exist",
          ],
          prerequisites: ["TypeScript interfaces and union types"],
          coreHeading: "1. Generic Type Parameters & Generic Constraints",
          coreContent:
            "Generics allow functions, interfaces, and classes to be parameterized by types, enabling maximum code reuse while maintaining 100% type safety without resorting to `any`.\n\nWithout Generics:\n`function identity(arg: any): any` loses all type information (passing a string returns `any`, losing string autocomplete and safety).\n\nWith Generics:\n`function identity<T>(arg: T): T` captures the exact type passed by the caller and returns it identically.\n\nGeneric Constraints (`extends`):\nOften, generic code requires the type parameter to satisfy certain minimum criteria (e.g. having an `.id` property). Using `T extends Constraint` restricts accepted types:\n\n```typescript\ninterface Identifiable {\n  id: string;\n}\n\nfunction findById<T extends Identifiable>(items: T[], targetId: string): T | undefined {\n  return items.find(item => item.id === targetId);\n}\n```\nHere, `T` can be any object (User, Order, Product), but the compiler guarantees that `item.id` is safe to read.\n\nThe `keyof` Operator:\n`keyof T` produces a union of all property names of type `T`:\n`type UserKeys = keyof { id: string; name: string }` -> `'id' | 'name'`.\n\nCombining `keyof` with generics enables type-safe property lookups:\n`function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]`\nThis guarantees that typos in property names trigger instant compiler errors!",
          diagramCode:
`+-------------------------------------------------------------------+
| GENERIC CONSTRAINTS & TYPE-SAFE PROPERTY LOOKUP                   |
|                                                                   |
|  function getProp<T, K extends keyof T>(obj: T, key: K): T[K]     |
|                                                                   |
|  const user = { id: "U1", age: 30 };                              |
|                                                                   |
|  getProp(user, "age")  ===> Returns number (Safe & autocompleted!)|
|  getProp(user, "typo") ===> COMPILER ERROR: "typo" is not in      |
|                             keyof { id: string; age: number }     |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Generic constraints restrict type parameters, while keyof ensures keys exist on the target object.",
          coreKeyPoints: [
            "Generics capture and propagate types dynamically without losing type information.",
            "Use 'T extends Shape' to constrain generics to types containing required properties.",
            "Combine 'K extends keyof T' and indexed access 'T[K]' for 100% type-safe property getters.",
          ],
          coreMistakes: [
            "Over-complicating signatures with unnecessary generics when a plain interface parameter suffices.",
            "Using 'any' inside generic implementations, breaking type propagation to callers.",
          ],
          prodHeading: "2. Production-Grade In-Memory Generic Repository",
          prodContent:
            "Enterprise data access layers frequently implement the Repository Pattern. Authoring a generic repository class allows teams to share CRUD logic across dozens of database entities while guaranteeing type-safe returns.",
          codeLang: "typescript",
          codeSnippet:
`interface BaseEntity {
  id: string;
  createdAt: Date;
}

class InMemoryRepository<T extends BaseEntity> {
  private items = new Map<string, T>();

  save(entity: T): T {
    this.items.set(entity.id, entity);
    return entity;
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findByProperty<K extends keyof T>(key: K, value: T[K]): T[] {
    const results: T[] = [];
    for (const item of this.items.values()) {
      if (item[key] === value) {
        results.push(item);
      }
    }
    return results;
  }
}

// Verification with Domain Entity
interface Customer extends BaseEntity {
  email: string;
  tier: "gold" | "standard";
}

const customerRepo = new InMemoryRepository<Customer>();
customerRepo.save({
  id: "cust_101",
  email: "sarah@careertwin.ai",
  tier: "gold",
  createdAt: new Date()
});

// Type-safe lookup: key 'tier' accepts only 'gold' | 'standard'!
const goldUsers = customerRepo.findByProperty("tier", "gold");
console.log("Found customer:", goldUsers[0]?.email);`,
          codeExpectedOutput:
`Found customer: sarah@careertwin.ai`,
          codeExplanation: "Demonstrates a generic entity repository with constraints on BaseEntity and type-safe property filtering via keyof T and T[K].",
          prodKeyPoints: [
            "T extends BaseEntity guarantees that any stored object contains .id and .createdAt.",
            "findByProperty prevents querying on invalid property names or mismatched value types at compile time.",
          ],
          prodMistakes: [
            "Allowing generic types to fall back to 'any' by omitting explicit constraints.",
          ],
          exerciseTitle: "Build a Generic Result<T, E> Monad Container",
          exerciseType: "coding",
          exerciseObjective: "Implement a generic Result container to represent successes and errors without throwing exceptions.",
          exerciseDescription:
            "Create a Result<T, E> discriminated union: `{ ok: true; value: T }` and `{ ok: false; error: E }`. Implement helper factory functions ok(val: T) and err(error: E), plus a map<T, U, E>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> utility.",
          exerciseInstructions: [
            "Define Result<T, E> type.",
            "Write ok<T>(value: T) and err<E>(error: E) constructor helpers.",
            "Implement map generic transform function.",
          ],
          starterCode:
`// Define generic Result type and helpers
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Implement map
`,
          hints: [
            "`function map<T, U, E>(res: Result<T, E>, fn: (val: T) => U): Result<U, E> { if (res.ok) return ok(fn(res.value)); return res; }`.",
          ],
          solutionExplanation:
            "Generic Result monads replace dangerous try/catch exceptions with explicit, compiler-enforced error handling.",
          checks: [
            {
              prompt: "What does the expression 'K extends keyof T' signify in a TypeScript generic function signature?",
              options: [
                "That K is a numeric index array.",
                "That K must be a valid property name (key) belonging to type T.",
                "That K inherits all methods from class T.",
                "That K converts type T into a string.",
              ],
              correctIdx: 1,
              explanation: "'keyof T' generates the union of keys of T; 'K extends keyof T' constrains K to strictly those valid key names.",
            },
            {
              prompt: "Why is 'function wrap<T>(item: T): T' superior to 'function wrap(item: any): any'?",
              options: [
                "Generics compile directly into C++ structs.",
                "Generics preserve the specific input type, retaining autocomplete and type validation for the caller.",
                "Generics make the function run asynchronously.",
                "Generics encrypt the input parameter in memory.",
              ],
              correctIdx: 1,
              explanation: "'any' silences the compiler and discards type tracking, whereas generics capture and propagate the exact type forward.",
            },
          ],
          recap: "Generics provide reusable, type-safe abstractions. Constrain generics with 'extends' and combine with 'keyof' for complete property safety.",
          realWorldApps: [
            "Prisma ORM generating strictly typed client query methods based on database schema models.",
            "TanStack Query (React Query) capturing API response types dynamically in query hooks.",
          ],
        },
        {
          title: "Mapped Types, Keyof & Essential Utility Types",
          summary: "Master mapped types ([K in keyof T]), index access types, and built-in utility types: Partial, Required, Readonly, Pick, Omit, Record.",
          estimatedMinutes: 50,
          objectives: [
            "Deconstruct and implement built-in utility types (Partial, Pick, Omit, Record) using mapped type syntax",
            "Construct custom mapped types that enforce immutability or transform property types systematically",
          ],
          prerequisites: ["Generics and keyof fundamentals"],
          coreHeading: "1. Mapped Types Syntax & Built-in Utility Architecture",
          coreContent:
            "Mapped types allow you to create new types based on existing types by iterating over their properties—similar to `Array.prototype.map()`, but for type definitions.\n\nMapped Type Syntax:\n`type Mapped<T> = { [K in keyof T]: TransformedType };`\n\nHow Built-in Utility Types are Implemented Under the Hood:\n1. `Partial<T>`: Makes all properties optional (`?` modifier):\n`type Partial<T> = { [K in keyof T]?: T[K] };`\n2. `Required<T>`: Removes optionality (`-?` modifier):\n`type Required<T> = { [K in keyof T]-?: T[K] };`\n3. `Readonly<T>`: Freezes all properties (`readonly` modifier):\n`type Readonly<T> = { readonly [K in keyof T]: T[K] };`\n4. `Record<K, T>`: Creates a dictionary mapping keys `K` to value type `T`:\n`type Record<K extends keyof any, T> = { [P in K]: T };`\n5. `Pick<T, K>`: Extracts a subset of properties from `T`:\n`type Pick<T, K extends keyof T> = { [P in K]: T[P] };`\n6. `Omit<T, K>`: Constructs a type with all properties except `K`:\n`type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;`\n\nModifiers:\n- `+readonly` or `-readonly` adds or strips immutability.\n- `+?` or `-?` adds or strips optionality.",
          diagramCode:
`+-------------------------------------------------------------------+
| MAPPED TYPES & UTILITY TRANSFORMATIONS                            |
|                                                                   |
|  Original Type:                                                   |
|  interface User { id: string; email: string; age: number; }       |
|                                                                   |
|  [Partial<User>]    -> { id?: string; email?: string; age?: ... } |
|  [Readonly<User>]   -> { readonly id: str; readonly email: ... }  |
|  [Pick<User, "id">] -> { id: string }                             |
|  [Omit<User, "age">]-> { id: string; email: string }              |
|                                                                   |
|  Iterates through keys [K in keyof T] and transforms values!      |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Mapped types iterate through the keys of an existing type, applying modifiers or transforming value types.",
          coreKeyPoints: [
            "Mapped types iterate over keys using the syntax [K in keyof T].",
            "Modifiers (+/- readonly, +/- ?) add or remove property flags.",
            "Utility types (Pick, Omit, Partial, Record) are standard mapped types built into TypeScript.",
          ],
          coreMistakes: [
            "Attempting to use 'Omit' with keys that do not exist, which compiles silently unless constrained.",
            "Over-using Partial<T> for update payloads, allowing accidental clearing of mandatory identifiers.",
          ],
          prodHeading: "2. Production Entity Patch and Dictionary Utilities",
          prodContent:
            "In RESTful APIs, `PATCH /users/:id` accepts partial updates, but must NEVER allow the user to modify immutable fields like `id` or `createdAt`. Combining `Omit` and `Partial` enforces this invariant at compile time.",
          codeLang: "typescript",
          codeSnippet:
`interface UserEntity {
  id: string;
  createdAt: Date;
  displayName: string;
  avatarUrl: string;
  bio: string;
}

// Update payload: only mutable fields can be passed, and all are optional
type UserUpdatePayload = Partial<Omit<UserEntity, "id" | "createdAt">>;

function updateUser(userId: string, updates: UserUpdatePayload): string {
  // Safe update logic
  const keys = Object.keys(updates);
  return \`Updated user \${userId} fields: \${keys.join(", ")}\`;
}

// VALID: updating bio and avatar
console.log(updateUser("usr_44", { bio: "Senior Systems Engineer", avatarUrl: "https://avatar.png" }));

// COMPILER ERROR (Prevented!):
// updateUser("usr_44", { id: "hacked_id" }); // TS Error: 'id' does not exist in type UserUpdatePayload`,
          codeExpectedOutput:
`Updated user usr_44 fields: bio, avatarUrl`,
          codeExplanation: "Demonstrates combining Omit and Partial to enforce strict API security invariants at compile time.",
          prodKeyPoints: [
            "Omit<T, 'id'> strips immutable properties before Partial makes remaining fields optional.",
            "Record<string, T> is preferred over index signatures ({ [key: string]: T }) for dictionary maps.",
          ],
          prodMistakes: [
            "Using Partial<UserEntity> directly for updates, which accidentally permits updating immutable primary keys.",
          ],
          exerciseTitle: "Construct a DeepReadonly Mapped Type",
          exerciseType: "coding",
          exerciseObjective: "Write a recursive mapped type DeepReadonly<T> that freezes nested object structures.",
          exerciseDescription:
            "Standard Readonly<T> is shallow: nested objects remain mutable. Implement a recursive mapped type DeepReadonly<T> that applies readonly recursively to all nested properties and arrays.",
          exerciseInstructions: [
            "Define type DeepReadonly<T>.",
            "Use conditional check `T extends Function | boolean | number | string | symbol ? T : ...`.",
            "Recursively map `{ readonly [K in keyof T]: DeepReadonly<T[K]> }`.",
          ],
          starterCode:
`// Implement recursive DeepReadonly mapped type
type DeepReadonly<T> = {
  // Recursive implementation
};
`,
          hints: [
            "Check if `T extends object`; if so, recursively map `DeepReadonly<T[K]>`, else return `T`.",
          ],
          solutionExplanation:
            "Recursive mapped types traverse nested object trees at compile time, guaranteeing deep immutability.",
          checks: [
            {
              prompt: "What does the '-?' modifier do in a TypeScript mapped type?",
              options: [
                "It makes all properties optional.",
                "It removes optionality, making all properties strictly required.",
                "It removes null values from union types.",
                "It reverses the order of properties.",
              ],
              correctIdx: 1,
              explanation: "The '-?' modifier removes optionality from each property, converting optional fields (x?) into mandatory fields.",
            },
            {
              prompt: "Which utility type should you choose to create an object type mapping a fixed set of HTTP status codes to string descriptions?",
              options: [
                "Pick<HttpStatus, string>",
                "Record<HttpStatus, string>",
                "Partial<HttpStatus>",
                "Exclude<HttpStatus, string>",
              ],
              correctIdx: 1,
              explanation: "Record<K, T> creates an object type whose property keys are K and property values are T.",
            },
          ],
          recap: "Mapped types iterate over keys to transform structures. Built-in utility types (Partial, Required, Readonly, Pick, Omit, Record) form the backbone of modern TypeScript API modeling.",
          realWorldApps: [
            "ORM database clients generating insert, update, and query argument types from base table schemas.",
            "State management libraries creating strictly typed selectors and action dispatchers.",
          ],
        },
      ],
    },
    {
      id: "mod-3-typescript-beginner-module-3",
      title: "Module 3: Advanced Type Programming & Strict Production Systems",
      summary: "Understand conditional types, the infer keyword, template literal types, branded nominal types, strict tsconfig flags, and Zod runtime boundaries.",
      estimatedMinutes: 120,
      checkpoint: "Implement conditional type extractors, branded nominal IDs, and runtime Zod validation boundaries.",
      lessons: [
        {
          title: "Conditional Types, Infer Keyword & Template Literal Types",
          summary: "Master type-level programming: conditional types (T extends U ? X : Y), type inference with infer, and template literal type generation.",
          estimatedMinutes: 50,
          objectives: [
            "Author conditional types using ternary syntax to select types based on generic relationships",
            "Extract inner wrapped types (Promises, Arrays, Return values) using the infer keyword",
          ],
          prerequisites: ["Generics and mapped types"],
          coreHeading: "1. Type-Level Logic: Conditional Types & The Infer Keyword",
          coreContent:
            "TypeScript is Turing complete at the type level: you can perform branching logic, recursion, pattern matching, and string manipulation purely in types.\n\n1. Conditional Types:\nConditional types follow ternary syntax:\n`type IsString<T> = T extends string ? true : false;`\n\nWhen `T` is a union, conditional types distribute automatically over each member:\n`type ToArray<T> = T extends any ? T[] : never;`\n`ToArray<string | number>` -> `string[] | number[]`.\n\n2. The `infer` Keyword (Pattern Matching in Types):\nThe `infer` keyword allows you to declare a type variable to be extracted during pattern matching:\n\nExtracting Promise resolved values (`Awaited<T>`):\n```typescript\ntype UnpackPromise<T> =\n  T extends Promise<infer R> ? R : T;\n```\nIf `T` is `Promise<string>`, TypeScript matches `infer R` against `string` and returns `string`!\n\nExtracting function return types (`ReturnType<T>`):\n```typescript\ntype MyReturnType<T> =\n  T extends (...args: any[]) => infer R ? R : never;\n```\n\n3. Template Literal Types:\nIntroduced in TypeScript 4.1, template literal types allow string manipulation at the type level:\n`type Event = 'click' | 'focus';`\n`type EventHandler = \`on\${Capitalize<Event>}\`;` -> `'onClick' | 'onFocus'`.",
          diagramCode:
`+-------------------------------------------------------------------+
| CONDITIONAL TYPES & INFER PATTERN EXTRACTION                      |
|                                                                   |
|  type Unpack<T> = T extends Array<infer Item> ? Item : T;         |
|                                                                   |
|  Unpack<string[]> ===> Extracts 'string' (Array match!)           |
|  Unpack<number>   ===> Returns 'number' (No match, returns T)     |
|                                                                   |
|  TEMPLATE LITERAL TYPES:                                          |
|  type HttpMethod = "GET" | "POST";                                |
|  type Route = \`\${HttpMethod} /api/\${string}\`;                  |
|  const r: Route = "GET /api/users";  // Valid!                    |
|  const bad: Route = "DELETE /items"; // TS Error!                 |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Conditional types evaluate ternary branches. 'infer' extracts wrapped internal types.",
          coreKeyPoints: [
            "Conditional types use ternary syntax (T extends U ? X : Y) to perform type-level branching.",
            "The infer keyword extracts component types from complex structures (functions, promises, arrays).",
            "Template literal types generate validated string patterns at compile time.",
          ],
          coreMistakes: [
            "Writing deeply nested recursive conditional types without termination base cases, causing compiler limits.",
            "Forgetting that conditional types distribute over union types unless wrapped in tuples ([T]).",
          ],
          prodHeading: "2. Production Event Handler Map with Template Literal Types",
          prodContent:
            "In event-driven UI systems, generating strongly typed handler names (e.g. `onUserCreated`, `onOrderShipped`) from raw event names ensures developers never misspell callback names.",
          codeLang: "typescript",
          codeSnippet:
`type DomainEvent = "orderCreated" | "paymentReceived" | "userDeleted";

// Template literal type transforms "orderCreated" -> "onOrderCreated"
type HandlerName<T extends string> = \`on\${Capitalize<T>}\`;

// Extract function return type using infer
type UnpackApiResponse<T> = T extends (...args: any[]) => Promise<infer Data> ? Data : never;

// Real-world API function
async function fetchAccountDetails(id: string) {
  return { id, email: "alex@careertwin.ai", balance: 500 };
}

// Extracted type: { id: string; email: string; balance: number }
type AccountData = UnpackApiResponse<typeof fetchAccountDetails>;

const account: AccountData = {
  id: "acc_1",
  email: "alex@careertwin.ai",
  balance: 500
};

console.log("Extracted Account:", account.email);`,
          codeExpectedOutput:
`Extracted Account: alex@careertwin.ai`,
          codeExplanation: "Demonstrates using template literal types for naming contracts and infer to extract resolved Promise types.",
          prodKeyPoints: [
            "infer enables non-invasive type extraction from third-party libraries without needing published type exports.",
            "Template literal types enable strict pattern matching on strings like semantic versioning or route paths.",
          ],
          prodMistakes: [
            "Using infer outside the 'extends' clause of a conditional type, which is a syntax error.",
          ],
          exerciseTitle: "Construct an Action Payload Extractor using Infer",
          exerciseType: "coding",
          exerciseObjective: "Write a conditional type that extracts the payload type from an action creator function.",
          exerciseDescription:
            "Given Redux-style action creators that return `{ type: string; payload: T }`, implement ExtractPayload<T> using the infer keyword to extract T. If the function does not return an action with a payload, it should evaluate to void.",
          exerciseInstructions: [
            "Define type ExtractPayload<T>.",
            "Pattern match on `T extends (...args: any[]) => { payload: infer P } ? P : void`.",
            "Verify with sample action creators.",
          ],
          starterCode:
`// Implement ExtractPayload using infer
type ExtractPayload<T> = 
  // Add conditional infer check
  never;
`,
          hints: [
            "`T extends (...args: any[]) => { payload: infer P } ? P : void`.",
          ],
          solutionExplanation:
            "The infer keyword matches the shape of the return object and pulls out the payload type variable.",
          checks: [
            {
              prompt: "What does the 'infer' keyword do in a TypeScript conditional type?",
              options: [
                "It casts any variable to the 'any' type.",
                "It introduces a type variable within the extends clause to be deduced from the matched type.",
                "It imports an external module asynchronously.",
                "It bypasses strict null checking.",
              ],
              correctIdx: 1,
              explanation: "'infer' allows you to declare a type variable inside the condition to capture and extract an internal type dynamically.",
            },
            {
              prompt: "What type does 'type Route = `/${'users' | 'posts'}/${number}`;' allow?",
              options: [
                "Any arbitrary URL string.",
                "Only strings starting with '/users/' or '/posts/' followed by a numeric string (e.g. '/users/42').",
                "Only array objects.",
                "Only boolean values.",
              ],
              correctIdx: 1,
              explanation: "Template literal types combine string unions to form exact pattern-matched string literal types.",
            },
          ],
          recap: "Conditional types provide if-else logic at the type level. Use 'infer' to extract internal types from complex signatures, and template literals to enforce string patterns.",
          realWorldApps: [
            "TRPC and Next.js server actions inferring end-to-end API input and output types without code generation.",
            "Type-safe internationalization (i18n) libraries validating nested translation keys at compile time.",
          ],
        },
        {
          title: "Strict Compiler Flags, Branded Types & Runtime Boundary Validation",
          summary: "Master strict tsconfig flags, nominal typing via Branded Types (Flavoring), and bridging compile-time types with runtime Zod schemas.",
          estimatedMinutes: 50,
          objectives: [
            "Configure essential strict tsconfig.json compiler flags (noUncheckedIndexedAccess, exactOptionalPropertyTypes)",
            "Enforce nominal type distinctions using Branded Types to prevent swapping primitive IDs (UserId vs OrderId)",
            "Validate external API and user inputs at runtime boundaries using Zod with inferred static types",
          ],
          prerequisites: ["TypeScript generics and mapped types"],
          coreHeading: "1. Nominal Branded Types & The Runtime Boundary Problem",
          coreContent:
            "TypeScript's structural type system has one major blind spot: Primitives.\nIf `type UserId = string;` and `type OrderId = string;`, TypeScript treats them as 100% interchangeable:\n```typescript\nfunction cancelOrder(userId: UserId, orderId: OrderId) { ... }\ncancelOrder(orderId, userId); // Transposed arguments compile silently without errors!\n```\n\nBranded (Nominal) Types:\nWe can simulate nominal typing by attaching a phantom compile-time tag ('brand') to a primitive:\n```typescript\ndeclare const BrandTag: unique symbol;\ntype Brand<T, B> = T & { readonly [BrandTag]: B };\n\ntype UserId = Brand<string, 'UserId'>;\ntype OrderId = Brand<string, 'OrderId'>;\n```\nNow, a `UserId` CANNOT be assigned to an `OrderId`, preventing catastrophic argument transposition bugs.\n\nThe Runtime Boundary Problem & Zod:\nTypeScript types are erased at runtime. When external data arrives from `fetch()` or a database, `as User` is a lie: TypeScript trusts you, but if the server returns `{ error: 500 }`, your app crashes with `Cannot read property of undefined`.\n\nSolution: Schema Validation at Runtime with Zod:\nZod validates the raw JSON at runtime AND automatically infers the static TypeScript type (`z.infer<typeof Schema>`), guaranteeing 100% boundary safety.",
          diagramCode:
`+-------------------------------------------------------------------+
| RUNTIME BOUNDARY VALIDATION WITH ZOD & BRANDED TYPES              |
|                                                                   |
|  External JSON (Untrusted API / Form Input)                       |
|         |                                                         |
|         v                                                         |
|  +---------------------------------------+                        |
|  | ZOD RUNTIME SCHEMA:                   |                        |
|  | UserSchema.safeParse(json)            |                        |
|  +---------------------------------------+                        |
|      /                               \\                            |
|     v Invalid                         v Valid                     |
|  Throw 400 Bad Request           TypeScript Type Guaranteed!      |
|                                  (type User = z.infer<typeof S>)  |
|                                                                   |
|  BRANDED NOMINAL IDS:                                             |
|  UserId !== OrderId (Compiler stops accidental transposition!)    |
+-------------------------------------------------------------------+`,
          diagramExplanation: "Zod parses untrusted data at runtime and infers compile-time types. Branded types prevent primitive confusion.",
          coreKeyPoints: [
            "Branded types use unique symbols to enforce nominal typing on primitives like IDs and currencies.",
            "TypeScript cannot protect against invalid runtime data; boundary validation with Zod is mandatory.",
            "Use z.infer<typeof Schema> to keep runtime validation and TypeScript types in single-source-of-truth sync.",
          ],
          coreMistakes: [
            "Using 'as Type' assertions on external API responses without runtime schema parsing.",
            "Disabling strict flags in tsconfig.json, allowing implicit any and unchecked undefined array lookups.",
          ],
          prodHeading: "2. Production Runtime Validation with Zod and Branded IDs",
          prodContent:
            "In production banking and e-commerce applications, mixing up customer IDs and account IDs results in critical security vulnerabilities. Combining Zod with branded nominal types creates an unbreachable compile-time and runtime boundary.",
          codeLang: "typescript",
          codeSnippet:
`import { z } from "zod";

// 1. Defining Branded Nominal Types
type UserId = string & { readonly __brand: unique symbol };
type OrderId = string & { readonly __brand: unique symbol };

// Factory constructors
const asUserId = (id: string) => id as UserId;
const asOrderId = (id: string) => id as OrderId;

// 2. Defining Runtime Zod Schema
const UserRegistrationSchema = z.object({
  id: z.string().min(5).transform(asUserId),
  email: z.string().email(),
  age: z.number().int().min(18),
});

// Infer static type from schema
type ValidatedUser = z.infer<typeof UserRegistrationSchema>;

function processUser(user: ValidatedUser) {
  console.log(\`Verified User: \${user.email} (ID: \${user.id})\`);
}

// 3. Testing boundary validation
const rawJson = { id: "usr_9901", email: "sec@careertwin.ai", age: 24 };
const parseResult = UserRegistrationSchema.safeParse(rawJson);

if (parseResult.success) {
  processUser(parseResult.data);
} else {
  console.error("Validation failed:", parseResult.error.format());
}`,
          codeExpectedOutput:
`Verified User: sec@careertwin.ai (ID: usr_9901)`,
          codeExplanation: "Demonstrates runtime parsing with Zod combined with branded nominal type transforms for strict type safety.",
          prodKeyPoints: [
            "safeParse() never throws; it returns a discriminated union { success: true, data } or { success: false, error }.",
            "transform() in Zod allows stamping branded tags onto validated strings cleanly.",
          ],
          prodMistakes: [
            "Using z.parse() without try/catch, crashing server handlers when clients submit invalid payloads.",
          ],
          exerciseTitle: "Build a Validated Order Parser with Branded Types",
          exerciseType: "coding",
          exerciseObjective: "Create a Zod schema validating incoming orders and producing branded OrderId and CurrencyAmount types.",
          exerciseDescription:
            "Define branded types OrderId and UsdAmount. Write an OrderSchema using Zod that parses `{ orderId: string, amount: number, items: string[] }`. Ensure amount is positive, orderId starts with 'ord_', and return safeParse results.",
          exerciseInstructions: [
            "Define branded types for OrderId.",
            "Create OrderSchema using z.object().",
            "Use .refine() to enforce that orderId starts with 'ord_'.",
            "Export validateOrder(raw: unknown) returning a typed result.",
          ],
          starterCode:
`import { z } from "zod";

// Implement branded types and Zod schema
`,
          hints: [
            "Use `z.string().refine(s => s.startsWith('ord_'), { message: 'Must start with ord_' })`.",
          ],
          solutionExplanation:
            "Zod validates shape, types, and custom refinements at runtime while generating static TypeScript types.",
          checks: [
            {
              prompt: "Why is a Branded Type useful in TypeScript?",
              options: [
                "It compresses the output bundle size.",
                "It attaches a phantom compile-time tag to a primitive type (like string), preventing accidental assignment between different semantic identifiers like UserId and OrderId.",
                "It makes the property accessible only in React components.",
                "It disables TypeScript compiler warnings.",
              ],
              correctIdx: 1,
              explanation: "Branded types enforce nominal typing, stopping bugs where strings of different semantic meanings are accidentally passed in the wrong parameter order.",
            },
            {
              prompt: "What does the tsconfig.json compiler option 'noUncheckedIndexedAccess' accomplish?",
              options: [
                "It disables array indexing completely.",
                "It adds 'undefined' to the return type of array and object index lookups, forcing developers to check if an element exists before using it.",
                "It converts all arrays into tuples.",
                "It compiles arrays to WebAssembly memory buffers.",
              ],
              correctIdx: 1,
              explanation: "By default, arr[0] assumes the element is defined. 'noUncheckedIndexedAccess' types it as T | undefined, preventing out-of-bounds runtime crashes.",
            },
          ],
          recap: "Strict compiler flags eliminate hidden runtime crashes. Branded types enforce nominal safety on primitives, and Zod establishes runtime validation boundaries with inferred static types.",
          realWorldApps: [
            "Next.js App Router Server Actions validating form data with Zod before database mutation.",
            "High-security fintech platforms utilizing branded types to prevent accidental currency unit and account ID transposition.",
          ],
        },
      ],
    },
  ],
};
