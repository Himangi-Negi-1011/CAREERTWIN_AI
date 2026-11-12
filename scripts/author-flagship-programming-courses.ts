import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import fs from "fs/promises";
import path from "path";
import { type RichCourseBlueprint } from "./course-upgrades-data";
import { saveCoursePackage, loadCoursePackage } from "../lib/learning/course-content-store";
import { extractPlannedLessons } from "../lib/learning/course-engine";
import { buildDeterministicMockTest } from "../lib/learning/mock-test-engine";
import { type Curriculum } from "../lib/learning/schema";
import { type LessonDocument, type ExternalResource } from "../lib/learning/lesson-schema";
import { type MockTestDocument } from "../lib/learning/mock-test-schema";

// 1. C PROGRAMMING BLUEPRINT
export const C_PROGRAMMING_COURSE: RichCourseBlueprint = {
  slug: "c-programming",
  skillId: "00000000-0000-4000-8000-000000000004",
  skillName: "C Programming",
  docTitle: "ISO/IEC 9899 C Standard & cppreference C Guide",
  docOrg: "ISO C Standards Committee",
  docUrl: "https://en.cppreference.com/w/c",
  videoTitle: "C Programming Tutorial for Beginners - Full Course",
  videoChannel: "freeCodeCamp / Mike Dane",
  videoUrl: "https://www.youtube.com/watch?v=KJgsSFOSQv0",
  prerequisites: [
    "Basic computer literacy and comfort navigating the terminal or command prompt",
    "Understanding of file paths and simple text editing",
  ],
  practiceActivities: [
    "Compile programs with strict GCC flags: -std=c17 -Wall -Wextra -Wpedantic",
    "Inspect memory allocations, pointer arithmetic, and stack vs heap lifespans",
    "Debug segfaults and buffer overflows using GDB and Valgrind memory analyzers",
  ],
  projects: [
    "CLI Memory-Safe String Tokenizer & Dynamic Vector",
    "POSIX Multi-Threaded HTTP File Server with Epoll / Select",
  ],
  proficiencyCriteria: [
    "Accurately predict variable lifetimes, alignment, and struct padding in C17",
    "Manage dynamic memory safely without leaks or double-free vulnerabilities",
    "Implement defensive bounds checking across all buffer operations",
  ],
  modules: [
    {
      id: "mod-1-c-beginner-module-1",
      title: "C Translation Architecture, Memory Model & Basic Types",
      summary: "Master the 4 stages of C compilation, memory segment layout (Text, Data, BSS, Heap, Stack), primitive types, and formatted IO.",
      estimatedMinutes: 90,
      checkpoint: "Compile C17 programs with zero warnings and diagram stack frame allocations.",
      lessons: [
        {
          title: "The C Compilation Pipeline & Process Memory Layout",
          summary: "Understand preprocessing, compilation, assembly, linking, and how OS loaders layout virtual memory for executing processes.",
          estimatedMinutes: 45,
          objectives: [
            "Explain the 4 stages of compilation: Preprocessor (cpp), Compiler (cc1), Assembler (as), and Linker (ld)",
            "Diagram the virtual memory segments of a running C process",
            "Compile with strict diagnostic warnings: -Wall -Wextra -Wpedantic -Werror",
          ],
          prerequisites: ["Terminal access with GCC, Clang, or MSVC installed"],
          coreHeading: "1. The Four Translation Stages and Virtual Address Space",
          coreContent: `C is not an interpreted language; it produces native machine architecture code. Understanding what happens between authoring \`main.c\` and running \`./main\` is essential for systems engineering:

1. **Preprocessing (\`gcc -E\`):** Expands headers (\`#include\`), processes conditional compilation directives (\`#ifdef\`, \`#ifndef\`), and macro substitutions (\`#define\`). Strips comments.
2. **Compilation (\`gcc -S\`):** Syntactically validates code, performs compiler optimizations, and translates C AST into assembly language (\`.s\`).
3. **Assembly (\`gcc -c\`):** Assembles mnemonic assembly instructions into binary object code files (\`.o\` or \`.obj\`) containing relocatable machine code and symbol tables.
4. **Linking (\`gcc -o\`):** Resolves external symbol references against the C Standard Library (\`libc\`) and static/shared libraries, producing an executable ELF or PE binary.

When the OS executes this binary, it maps the virtual address space into distinct segments:
- **Text Segment:** Read-only machine instructions.
- **Data & BSS Segments:** Initialized and uninitialized global/static variables.
- **Heap Segment:** Dynamically allocated memory via \`malloc\`/\`calloc\`, growing upwards towards high memory.
- **Stack Segment:** Local function variables and call stack frames, growing downwards towards low memory.`,
          diagramCode: `+-------------------------------------------------------+ HIGH MEMORY (0xFFFFFFFF)
| Kernel Space (Operating System Restricted)           |
+-------------------------------------------------------+
| Stack Segment (Local variables, frame pointers) v     |  Grows Downward
|        |                                              |
|        v                                              |
|                                                       |
|        ^                                              |
|        |                                              |
| Heap Segment (malloc / calloc / realloc dynamic mem) ^|  Grows Upward
+-------------------------------------------------------+
| BSS Segment (Uninitialized static & global variables) |
+-------------------------------------------------------+
| Data Segment (Initialized static & global variables)  |
+-------------------------------------------------------+
| Text Segment (Read-only binary CPU instructions)     |
+-------------------------------------------------------+ LOW MEMORY (0x00000000)`,
          diagramExplanation: "Visual representation of a standard 32/64-bit C process virtual memory layout, highlighting stack downward growth and heap upward growth.",
          coreKeyPoints: [
            "The C compiler transforms human-readable source into architecture-specific native machine code.",
            "Local automatic variables live in ephemeral stack frames; global/static variables live throughout the process lifetime.",
            "Linking is the final stage that binds symbol addresses across compiled translation units.",
          ],
          coreMistakes: [
            "Assuming macros provide type checking (they are purely textual expansions).",
            "Running an old binary after compilation fails with unresolved linker errors.",
            "Returning a pointer to a stack-allocated local variable from a function.",
          ],
          prodHeading: "2. Inspecting Process Layout and Memory in Production C",
          prodContent: "This production-ready program demonstrates memory layout inspection by printing runtime memory addresses of code, static globals, heap allocations, and stack frame variables.",
          codeLang: "c",
          codeSnippet: `#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

/* Global variables reside in Data and BSS segments */
int g_initialized_var = 42;       /* Data segment */
int g_uninitialized_var;         /* BSS segment (zero-initialized) */

void inspect_stack_frame(int depth) {
    int local_stack_var = depth;
    printf("  [Stack] Frame depth %d: address = %p\\n", depth, (void*)&local_stack_var);
    if (depth < 2) {
        inspect_stack_frame(depth + 1);
    }
}

int main(void) {
    /* Heap allocation */
    int *heap_buffer = (int*)malloc(sizeof(int) * 4);
    if (!heap_buffer) {
        fprintf(stderr, "Fatal: Memory allocation failed.\\n");
        return EXIT_FAILURE;
    }

    printf("=== C PROCESS VIRTUAL MEMORY INSPECTION ===\\n");
    printf("[Text Segment]  main() address:         %p\\n", (void*)(uintptr_t)&main);
    printf("[Data Segment]  g_initialized_var:      %p\\n", (void*)&g_initialized_var);
    printf("[BSS Segment]   g_uninitialized_var:    %p\\n", (void*)&g_uninitialized_var);
    printf("[Heap Segment]  malloc buffer address:  %p\\n", (void*)heap_buffer);
    
    printf("\\n--- Stack Frame Growth (Downward) ---\\n");
    inspect_stack_frame(0);

    /* Clean dynamic resources */
    free(heap_buffer);
    heap_buffer = NULL;

    printf("\\nMemory safely released. Process terminating normally.\\n");
    return EXIT_SUCCESS;
}`,
          codeExpectedOutput: `=== C PROCESS VIRTUAL MEMORY INSPECTION ===
[Text Segment]  main() address:         0x... (Low Address)
[Data Segment]  g_initialized_var:      0x...
[BSS Segment]   g_uninitialized_var:    0x...
[Heap Segment]  malloc buffer address:  0x... (Heap Address)

--- Stack Frame Growth (Downward) ---
  [Stack] Frame depth 0: address = 0x... (High Address)
  [Stack] Frame depth 1: address = 0x... (Lower Address than depth 0)
  [Stack] Frame depth 2: address = 0x... (Lower Address than depth 1)

Memory safely released. Process terminating normally.`,
          codeExplanation: "Demonstrates that text segment addresses are lowest, heap memory sits above data/bss, and successive stack frames allocate variables at decreasing addresses.",
          prodKeyPoints: [
            "Always check the return value of malloc/calloc before dereferencing.",
            "Assign NULL immediately after freeing pointers to prevent dangling pointer bugs.",
            "Use strict compilation flags: gcc -std=c17 -Wall -Wextra -Wpedantic main.c.",
          ],
          prodMistakes: [
            "Dereferencing a pointer without verifying malloc didn't return NULL.",
            "Dangling pointers: using a pointer after calling free().",
          ],
          exerciseTitle: "Compile with Strict Warning Flags and Fix Preprocessor Bugs",
          exerciseType: "coding",
          exerciseObjective: "Write a clean C17 program that correctly checks macro boundaries and returns standard EXIT_SUCCESS codes.",
          exerciseDescription: "Implement a memory-aware program that verifies integer type widths using stdint.h and prints sizes across 32/64 bit platforms.",
          exerciseInstructions: [
            "Include stdint.h and stdbool.h.",
            "Print the exact byte sizes of int8_t, int16_t, int32_t, int64_t, and size_t using sizeof.",
            "Compile with gcc -Wall -Wextra -Werror to confirm 0 compiler diagnostics.",
          ],
          starterCode: `#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

int main(void) {
    /* TODO: Print sizeof int8_t, int16_t, int32_t, int64_t, and size_t */
    return EXIT_SUCCESS;
}`,
          hints: ["Use %zu format specifier when printing sizeof expressions in C."],
          solutionExplanation: "Using standard fixed-width types guarantees portable memory footprints across x86, ARM, and embedded architectures.",
          checks: [
            {
              prompt: "Which stage of C compilation handles #include and #define directives?",
              options: ["Preprocessor", "Assembler", "Linker", "Loader"],
              correctIdx: 0,
              explanation: "The C preprocessor runs prior to parsing and expands all directives and macros textually.",
            },
            {
              prompt: "In a standard OS process, which memory segment grows downward toward lower memory addresses?",
              options: ["The Stack", "The Heap", "The BSS Segment", "The Text Segment"],
              correctIdx: 0,
              explanation: "The call stack grows downwards as functions push stack frames containing parameters and automatic local variables.",
            },
          ],
          recap: "The C compilation pipeline consists of preprocessing, compilation, assembly, and linking. Virtual memory partitions code, static variables, heap allocations, and call stack frames.",
          realWorldApps: [
            "Operating system kernels (Linux, FreeBSD) managing page tables and virtual address translations.",
            "Embedded firmware running on microcontrollers with constrained SRAM limits.",
            "High-frequency financial trading systems requiring deterministic zero-GC memory performance.",
          ],
        },
        {
          title: "Fixed-Width Types, Operators & Formatted Standard IO",
          summary: "Master stdint.h fixed-width integer types, IEEE 754 floating point arithmetic, bitwise operators, and secure formatted IO with printf and fgets.",
          estimatedMinutes: 45,
          objectives: [
            "Utilize portable fixed-width integers from <stdint.h> (uint32_t, int64_t)",
            "Perform bitwise manipulation (AND, OR, XOR, shifts) for bitmasking",
            "Avoid buffer overflows by replacing gets/scanf with fgets and snprintf",
          ],
          prerequisites: ["Completion of Lesson 1: The C Compilation Pipeline"],
          coreHeading: "1. Portable Integer Widths and Defensive Buffer IO",
          coreContent: `In traditional C, the size of \`int\`, \`long\`, and \`short\` is implementation-defined. An \`int\` may be 16 bits on an AVR microcontroller and 32 bits on x86_64, while \`long\` is 32 bits on 64-bit Windows but 64 bits on 64-bit Linux!

To write portable, bug-free systems software, C99 introduced \`<stdint.h>\`:
- \`int8_t\`, \`uint8_t\`: Exactly 8 bits.
- \`int16_t\`, \`uint16_t\`: Exactly 16 bits.
- \`int32_t\`, \`uint32_t\`: Exactly 32 bits.
- \`int64_t\`, \`uint64_t\`: Exactly 64 bits.
- \`size_t\`: Unsigned integer type representing object sizes and array indices.

Furthermore, reading user input securely requires avoiding deprecated functions like \`gets()\` (which has no buffer size limit) and unchecked \`scanf("%s")\`. Instead, always use \`fgets()\` with an explicit buffer limit.`,
          diagramCode: `INTEGER BITMASKING BLUEPRINT:
Initial Byte:      [0][0][1][0] [1][0][1][0]  (0x2A)
Bitmask (Bit 3):   [0][0][0][0] [1][0][0][0]  (1 << 3)
---------------------------------------------
Bitwise AND (&):   [0][0][0][0] [1][0][0][0]  (Non-zero -> Bit 3 is SET)
Bitwise OR  (|):   Sets bit 3 high
Bitwise NOT (~):   Inverts all bits for clear operations: value &= ~(1 << 3)`,
          diagramExplanation: "Bitmask operations for querying, setting, and clearing individual hardware registers and permission flags.",
          coreKeyPoints: [
            "Always prefer <stdint.h> fixed-width types over raw primitive types for cross-platform reliability.",
            "Use fgets() rather than scanf() or gets() to eliminate buffer overflow attack vectors.",
            "Print size_t with %zu and uint64_t with PRIu64 from <inttypes.h>.",
          ],
          coreMistakes: [
            "Using gets() which is vulnerable to catastrophic buffer overflows.",
            "Assuming sizeof(long) is always 8 bytes across all 64-bit operating systems.",
          ],
          prodHeading: "2. Production Bitmask Engine and Defensive Input Parsing",
          prodContent: "This program showcases bitmask state flags for network connections and parses user configuration defensively without buffer overflows.",
          codeLang: "c",
          codeSnippet: `#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>

/* Bitmask flags for connection states */
#define FLAG_CONNECTED     (1U << 0) /* 0000 0001 */
#define FLAG_ENCRYPTED     (1U << 1) /* 0000 0010 */
#define FLAG_AUTHENTICATED (1U << 2) /* 0000 0100 */
#define FLAG_COMPRESSED    (1U << 3) /* 0000 1000 */

void print_connection_status(uint8_t flags) {
    printf("Connection Flags: 0x%02X\\n", flags);
    printf(" - Connected:     %s\\n", (flags & FLAG_CONNECTED) ? "YES" : "NO");
    printf(" - Encrypted:     %s\\n", (flags & FLAG_ENCRYPTED) ? "YES" : "NO");
    printf(" - Authenticated: %s\\n", (flags & FLAG_AUTHENTICATED) ? "YES" : "NO");
    printf(" - Compressed:    %s\\n", (flags & FLAG_COMPRESSED) ? "YES" : "NO");
}

int main(void) {
    uint8_t connection_state = 0;

    /* Turn ON Connected and Encrypted */
    connection_state |= (FLAG_CONNECTED | FLAG_ENCRYPTED);
    printf("State after connection & TLS handshake:\\n");
    print_connection_status(connection_state);

    /* Turn ON Authenticated */
    connection_state |= FLAG_AUTHENTICATED;
    printf("\\nState after SASL authentication:\\n");
    print_connection_status(connection_state);

    /* Turn OFF Encryption (downgrade) safely using bitwise AND with NOT */
    connection_state &= ~FLAG_ENCRYPTED;
    printf("\\nState after TLS termination:\\n");
    print_connection_status(connection_state);

    /* Defensive String Formatting with snprintf */
    char buffer[64];
    int written = snprintf(buffer, sizeof(buffer), "SESSION-ID-%04u", 1024U);
    if (written < 0 || (size_t)written >= sizeof(buffer)) {
        fprintf(stderr, "Buffer truncation detected!\\n");
        return EXIT_FAILURE;
    }
    printf("\\nFormatted Safe Session ID: %s\\n", buffer);

    return EXIT_SUCCESS;
}`,
          codeExpectedOutput: `State after connection & TLS handshake:
Connection Flags: 0x03
 - Connected:     YES
 - Encrypted:     YES
 - Authenticated: NO
 - Compressed:    NO

State after SASL authentication:
Connection Flags: 0x07
 - Connected:     YES
 - Encrypted:     YES
 - Authenticated: YES
 - Compressed:    NO

State after TLS termination:
Connection Flags: 0x05
 - Connected:     YES
 - Encrypted:     NO
 - Authenticated: YES
 - Compressed:    NO

Formatted Safe Session ID: SESSION-ID-1024`,
          codeExplanation: "Demonstrates bitwise flags manipulation with |= and &= ~, combined with bounds-checked snprintf formatting.",
          prodKeyPoints: [
            "Use snprintf with sizeof(buffer) to safely prevent format string overflows.",
            "Bitwise operations allow tracking up to 8 binary states in a single uint8_t byte.",
          ],
          prodMistakes: [
            "Using sprintf instead of snprintf, risking stack smashing on unexpected input sizes.",
          ],
          exerciseTitle: "Implement a Bitfield Permission System",
          exerciseType: "coding",
          exerciseObjective: "Create a permission validator that tests READ, WRITE, and EXECUTE bitmasks.",
          exerciseDescription: "Write a function has_permission(uint8_t user_perms, uint8_t required_perms) that returns true only if all required bits are active.",
          exerciseInstructions: [
            "Define READ (1U << 0), WRITE (1U << 1), and EXECUTE (1U << 2).",
            "Write boolean evaluation logic using bitwise AND.",
            "Verify with test cases in main().",
          ],
          starterCode: `#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

#define PERM_READ  (1U << 0)
#define PERM_WRITE (1U << 1)
#define PERM_EXEC  (1U << 2)

bool has_permission(uint8_t user_perms, uint8_t required_perms) {
    /* TODO: Return true if all required_perms bits are set in user_perms */
    return false;
}

int main(void) {
    uint8_t user = PERM_READ | PERM_WRITE;
    printf("Can Read & Write: %s\\n", has_permission(user, PERM_READ | PERM_WRITE) ? "YES" : "NO");
    printf("Can Execute:      %s\\n", has_permission(user, PERM_EXEC) ? "YES" : "NO");
    return 0;
}`,
          hints: ["An expression (user_perms & required_perms) == required_perms tests if all required bits are present."],
          solutionExplanation: "Checking (user_perms & required_perms) == required_perms ensures every bit required by the mask is present.",
          checks: [
            {
              prompt: "What format specifier must be used in standard C to print a size_t variable?",
              options: ["%zu", "%d", "%lu", "%s"],
              correctIdx: 0,
              explanation: "%zu is the ISO standard format specifier for size_t integers.",
            },
            {
              prompt: "How do you clear (turn OFF) bit 2 in an integer variable 'flags'?",
              options: ["flags &= ~(1 << 2)", "flags |= (1 << 2)", "flags ^= (1 << 2)", "flags = 0"],
              correctIdx: 0,
              explanation: "Bitwise AND with the bitwise NOT (~(1 << 2)) clears only the targeted bit while preserving all other bits.",
            },
          ],
          recap: "Fixed-width integer types from <stdint.h> provide guaranteed memory footprints. Bitwise operators enable compact flag tracking, and snprintf guarantees buffer safety.",
          realWorldApps: [
            "Device driver programming communicating with hardware memory-mapped IO registers.",
            "Network protocol header parsing (TCP flags: SYN, ACK, FIN, RST).",
            "POSIX file system permissions (chmod 0755 bitmasking).",
          ],
        },
      ],
    },
    {
      id: "mod-2-c-intermediate-module-2",
      title: "Pointers, Memory Allocation & Data Structures",
      summary: "Understand pointer indirection, pointer arithmetic, dynamic memory allocation (malloc, calloc, realloc, free), structs, and defensive buffer management.",
      estimatedMinutes: 90,
      checkpoint: "Build a leak-free dynamic resizing array with Valgrind passing with 0 errors.",
      lessons: [
        {
          title: "Pointer Indirection, Addresses & Pointer Arithmetic",
          summary: "Master pointer fundamentals, the & (address-of) and * (dereference) operators, pointer arithmetic step sizes, and passing pointers to functions.",
          estimatedMinutes: 45,
          objectives: [
            "Differentiate between values, memory addresses, and pointer variables",
            "Perform pointer arithmetic respecting base type stride sizes",
            "Implement pass-by-reference semantics using pointer arguments",
          ],
          prerequisites: ["Completion of Module 1: C Translation & Types"],
          coreHeading: "1. Memory Addresses and Pointer Mechanics",
          coreContent: `A pointer is simply a variable whose stored value is the memory address of another object.

Key Operators:
- \`&\` (Address-of): Evaluates to the memory address of an object.
- \`*\` (Dereference): Accesses or modifies the value at the memory address stored in the pointer.

**Pointer Arithmetic:**
When you add \`1\` to a pointer (\`ptr + 1\`), the compiler does not advance the address by 1 single byte; it advances the address by \`sizeof(*ptr)\` bytes!
- For \`char* ptr\`: \`ptr + 1\` advances by 1 byte.
- For \`int32_t* ptr\`: \`ptr + 1\` advances by 4 bytes.
- For \`double* ptr\`: \`ptr + 1\` advances by 8 bytes.

This stride rule powers C arrays, where \`array[i]\` is syntactically equivalent to \`*(array + i)\`.`,
          diagramCode: `POINTER STRIDE ARITHMETIC (int32_t = 4 bytes):
Memory Address:  0x1000        0x1004        0x1008        0x100C
Array Element:  [  Item 0  ]  [  Item 1  ]  [  Item 2  ]  [  Item 3  ]
Pointer:           ^             ^
                   |             |
                  ptr        ptr + 1 (0x1000 + 1 * 4 bytes = 0x1004)`,
          diagramExplanation: "Pointer arithmetic automatically scales additions by the sizeof the pointed-to type.",
          coreKeyPoints: [
            "Pointers store memory addresses in hexadecimal format (%p).",
            "Pointer arithmetic increments by sizeof(type) bytes, not raw single bytes.",
            "C passes all parameters by value; pointers enable emulated pass-by-reference.",
          ],
          coreMistakes: [
            "Dereferencing uninitialized pointers (wild pointers) causing segmentation faults.",
            "Confusing pointer addition with integer arithmetic.",
          ],
          prodHeading: "2. In-Place Buffer Swapping & Pointer Traversal",
          prodContent: "This production example demonstrates pass-by-pointer mutation and fast pointer traversal across an array without index lookups.",
          codeLang: "c",
          codeSnippet: `#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

/* Pass-by-pointer to mutate values in caller scope */
void swap_integers(int32_t *a, int32_t *b) {
    if (!a || !b) return;
    int32_t temp = *a;
    *a = *b;
    *b = temp;
}

/* Fast pointer traversal: sum elements using raw pointer stride */
int64_t sum_array(const int32_t *start, size_t length) {
    if (!start || length == 0) return 0;
    int64_t total = 0;
    const int32_t *end = start + length;

    for (const int32_t *curr = start; curr < end; ++curr) {
        total += *curr; /* Dereference current element */
    }
    return total;
}

int main(void) {
    int32_t x = 100, y = 500;
    printf("Before swap: x=%d, y=%d\\n", x, y);
    swap_integers(&x, &y);
    printf("After swap:  x=%d, y=%d\\n\\n", x, y);

    int32_t numbers[] = { 10, 20, 30, 40, 50 };
    size_t count = sizeof(numbers) / sizeof(numbers[0]);

    int64_t sum = sum_array(numbers, count);
    printf("Sum computed via pointer traversal: %lld\\n", (long long)sum);

    return EXIT_SUCCESS;
}`,
          codeExpectedOutput: `Before swap: x=100, y=500
After swap:  x=500, y=100

Sum computed via pointer traversal: 150`,
          codeExplanation: "Demonstrates pass-by-reference with pointer parameters and pointer arithmetic traversal.",
          prodKeyPoints: [
            "Mark read-only pointer parameters as const (const int32_t *start) to prevent accidental mutation.",
            "Always guard against NULL pointer dereferences at function entry points.",
          ],
          prodMistakes: [
            "Forgetting the address-of & operator when passing arguments to pointer functions.",
          ],
          exerciseTitle: "Reverse an Array In-Place Using Two Pointers",
          exerciseType: "coding",
          exerciseObjective: "Write a function that reverses an integer buffer in-place using two converging pointers.",
          exerciseDescription: "Implement reverse_buffer(int32_t *start, size_t length) using left and right pointers without allocating extra memory.",
          exerciseInstructions: [
            "Initialize left pointer to start, and right pointer to start + length - 1.",
            "Loop while left < right, swapping values and advancing pointers.",
          ],
          starterCode: `#include <stdio.h>
#include <stdint.h>

void reverse_buffer(int32_t *arr, size_t len) {
    /* TODO: Reverse array in-place using two pointers */
}

int main(void) {
    int32_t data[] = {1, 2, 3, 4, 5};
    reverse_buffer(data, 5);
    for (size_t i = 0; i < 5; ++i) printf("%d ", data[i]);
    printf("\\n");
    return 0;
}`,
          hints: ["Use a temporary variable inside the loop: temp = *left; *left = *right; *right = temp;"],
          solutionExplanation: "Two-pointer reversal achieves O(n) time with O(1) auxiliary space.",
          checks: [
            {
              prompt: "If 'int32_t *p = 0x2000;', what is the value of 'p + 2' on a 32-bit integer system?",
              options: ["0x2008", "0x2002", "0x2004", "0x2010"],
              correctIdx: 0,
              explanation: "Adding 2 to an int32_t pointer advances by 2 * sizeof(int32_t) = 2 * 4 = 8 bytes (0x2000 + 8 = 0x2008).",
            },
            {
              prompt: "What is the result of dereferencing a NULL or uninitialized pointer in C?",
              options: [
                "Undefined behavior, commonly resulting in a segmentation fault process crash",
                "The value 0 is returned automatically",
                "A NullPointerException is thrown and caught by runtime",
                "The variable is dynamically instantiated on the heap",
              ],
              correctIdx: 0,
              explanation: "In C, dereferencing NULL or an invalid address triggers undefined behavior and an OS memory access violation (SIGSEGV).",
            },
          ],
          recap: "Pointers represent memory addresses. Pointer arithmetic respects base type byte stride. Pointers provide mutable pass-by-reference semantics in C.",
          realWorldApps: [
            "Direct memory manipulation in audio DSP and image processing filters.",
            "Hardware DMA (Direct Memory Access) buffer controllers.",
            "Low-overhead zero-copy network packet decoders.",
          ],
        },
        {
          title: "Dynamic Memory Management & Struct Packaging",
          summary: "Master heap allocation with malloc, calloc, realloc, and free, memory alignment and struct packing, and building resilient dynamic vectors.",
          estimatedMinutes: 45,
          objectives: [
            "Allocate, resize, and release heap memory safely with malloc, realloc, and free",
            "Calculate struct alignment padding and minimize memory footprints",
            "Implement a production-grade dynamic array (vector) with exponential capacity growth",
          ],
          prerequisites: ["Completion of Lesson 3: Pointer Indirection & Arithmetic"],
          coreHeading: "1. The Dynamic Heap Lifecycle and Memory Alignment",
          coreContent: `When data sizes are not known at compile time, or must outlive the function call frame, heap allocation is required:
- \`malloc(size)\`: Allocates uninitialized memory. Returns NULL on failure.
- \`calloc(count, size)\`: Allocates and zero-initializes memory. Protects against integer multiplication overflow in allocation calculations.
- \`realloc(ptr, new_size)\`: Resizes an existing allocation in-place or copies it to a newly sized block. Always assign realloc return values to a temporary pointer to avoid losing the original memory handle on failure!
- \`free(ptr)\`: Returns memory to the operating system allocator. Passing NULL is a safe no-op.

**Struct Alignment & Padding:**
CPUs access aligned memory addresses much faster than unaligned memory. The compiler automatically inserts padding bytes between struct members so that each field sits on an address divisible by its natural alignment. Ordering struct members from largest to smallest minimizes wasted padding bytes!`,
          diagramCode: `STRUCT PACKING OPTIMIZATION:
POOR LAYOUT (Total = 24 bytes due to padding):
[ char: 1b ][ padding: 7b ][ double: 8b ][ int: 4b ][ padding: 4b ]

OPTIMAL LAYOUT (Total = 16 bytes - 33% RAM savings!):
[ double: 8b ][ int: 4b ][ char: 1b ][ padding: 3b ]`,
          diagramExplanation: "Ordering struct fields from largest alignment to smallest reduces internal padding and conserves memory.",
          coreKeyPoints: [
            "Never write 'ptr = realloc(ptr, new_size)'. If realloc fails, ptr becomes NULL and the original buffer leaks forever.",
            "Order struct fields from largest to smallest to minimize memory padding overhead.",
            "Always pair every malloc/calloc with exactly one free.",
          ],
          coreMistakes: [
            "Memory leak: discarding pointers without calling free().",
            "Double free: calling free() twice on the same memory pointer.",
            "Use-after-free: reading or writing to memory after calling free().",
          ],
          prodHeading: "2. Production-Grade Resizable Dynamic Vector",
          prodContent: "This implementation demonstrates a memory-safe dynamic vector in C, complete with capacity doubling, defensive realloc handling, and resource teardown.",
          codeLang: "c",
          codeSnippet: `#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>

typedef struct {
    int32_t *data;
    size_t size;
    size_t capacity;
} IntVector;

IntVector* vector_create(size_t initial_capacity) {
    IntVector *vec = (IntVector*)malloc(sizeof(IntVector));
    if (!vec) return NULL;

    vec->capacity = initial_capacity > 0 ? initial_capacity : 4;
    vec->size = 0;
    vec->data = (int32_t*)malloc(sizeof(int32_t) * vec->capacity);

    if (!vec->data) {
        free(vec);
        return NULL;
    }
    return vec;
}

bool vector_push(IntVector *vec, int32_t value) {
    if (!vec) return false;

    if (vec->size >= vec->capacity) {
        size_t new_capacity = vec->capacity * 2;
        /* Safe realloc pattern using temporary pointer */
        int32_t *new_data = (int32_t*)realloc(vec->data, sizeof(int32_t) * new_capacity);
        if (!new_data) {
            fprintf(stderr, "Warning: Vector capacity growth failed.\\n");
            return false;
        }
        vec->data = new_data;
        vec->capacity = new_capacity;
    }

    vec->data[vec->size++] = value;
    return true;
}

void vector_destroy(IntVector **vec_ref) {
    if (!vec_ref || !*vec_ref) return;
    IntVector *vec = *vec_ref;
    free(vec->data);
    vec->data = NULL;
    free(vec);
    *vec_ref = NULL; /* Zero caller handle to prevent use-after-free */
}

int main(void) {
    IntVector *v = vector_create(2);
    if (!v) return EXIT_FAILURE;

    printf("Pushing 10 elements into dynamic vector...\\n");
    for (int32_t i = 1; i <= 10; ++i) {
        vector_push(v, i * 10);
    }

    printf("Vector size: %zu, capacity: %zu\\n", v->size, v->capacity);
    printf("Contents: ");
    for (size_t i = 0; i < v->size; ++i) {
        printf("%d ", v->data[i]);
    }
    printf("\\n");

    /* Free all allocated memory */
    vector_destroy(&v);
    printf("Vector destroyed cleanly. Handle is now NULL (%p).\\n", (void*)v);

    return EXIT_SUCCESS;
}`,
          codeExpectedOutput: `Pushing 10 elements into dynamic vector...
Vector size: 10, capacity: 16
Contents: 10 20 30 40 50 60 70 80 90 100 
Vector destroyed cleanly. Handle is now NULL ((nil)).`,
          codeExplanation: "Implements exponential capacity growth with the safe realloc pattern and double-pointer teardown to eliminate dangling pointers.",
          prodKeyPoints: [
            "Exponential capacity doubling achieves amortized O(1) insertion time.",
            "Passing pointer-to-pointer (**vec_ref) into destroy functions allows resetting caller handles to NULL.",
          ],
          prodMistakes: [
            "Forgetting to free inner struct buffers (vec->data) before freeing the outer struct (vec).",
          ],
          exerciseTitle: "Implement a Dynamic String Builder",
          exerciseType: "coding",
          exerciseObjective: "Build a heap-allocated string buffer that appends characters dynamically.",
          exerciseDescription: "Write a struct StringBuilder with append and toString capabilities that grows automatically on demand.",
          exerciseInstructions: [
            "Define struct with char* buffer, size_t length, size_t capacity.",
            "Implement sb_append(StringBuilder *sb, const char *str).",
            "Guarantee null-termination at every stage.",
          ],
          starterCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *buffer;
    size_t length;
    size_t capacity;
} StringBuilder;

/* TODO: Implement sb_create, sb_append, and sb_destroy */

int main(void) {
    printf("StringBuilder test placeholder\\n");
    return 0;
}`,
          hints: ["Always allocate length + 1 bytes to reserve space for the '\\0' string terminator."],
          solutionExplanation: "Dynamic string builders prevent the O(n^2) quadratic overhead of repeated strcat() calls.",
          checks: [
            {
              prompt: "Why should you never assign the return value of realloc() directly to the original pointer?",
              options: [
                "If realloc fails, it returns NULL and the original buffer is leaked with no reference remaining",
                "realloc always frees the original pointer immediately",
                "It violates C syntax rules",
                "realloc only works on stack variables",
              ],
              correctIdx: 0,
              explanation: "If realloc fails, it returns NULL while leaving the original block intact; direct assignment destroys your only pointer to that block.",
            },
            {
              prompt: "How does sorting struct members from largest alignment to smallest affect the struct in memory?",
              options: [
                "It minimizes internal padding bytes inserted by the compiler, reducing total struct size",
                "It reverses member access order",
                "It makes the struct impossible to align",
                "It converts the struct to a union",
              ],
              correctIdx: 0,
              explanation: "Arranging struct fields by descending alignment requirements eliminates unnecessary padding holes between fields.",
            },
          ],
          recap: "Dynamic memory provides runtime allocation flexibility on the heap. Safe realloc patterns, alignment awareness, and double-pointer teardown guarantee leak-free C programs.",
          realWorldApps: [
            "Database storage engines (SQLite, PostgreSQL) managing dynamic page buffers.",
            "Network servers managing dynamic connection tables and client sockets.",
            "Web browsers managing DOM nodes and JavaScript AST structures.",
          ],
        },
      ],
    },
    {
      id: "mod-3-c-advanced-module-3",
      title: "POSIX Systems Programming, File IO & Production Quality",
      summary: "Master low-level file descriptors, binary serialization, error handling with errno, multi-threaded POSIX pthreads, and automated test suites.",
      estimatedMinutes: 90,
      checkpoint: "Build a thread-safe multi-worker job queue with POSIX mutexes and condition variables.",
      lessons: [
        {
          title: "File Descriptors, Binary IO & Defensive Error Handling",
          summary: "Master POSIX open/read/write/close versus standard C fopen/fread/fwrite, atomic file writes, binary struct serialization, and errno diagnostics.",
          estimatedMinutes: 45,
          objectives: [
            "Differentiate unbuffered POSIX file descriptors (int fd) from buffered C streams (FILE*)",
            "Serialize and deserialize binary structs with endianness considerations",
            "Handle errors systematically using errno, strerror, and perror",
          ],
          prerequisites: ["Completion of Module 2: Pointers & Dynamic Memory"],
          coreHeading: "1. Buffered vs Unbuffered IO and Robust Error Handling",
          coreContent: `In C systems programming, two primary IO layers exist:
1. **Standard C Buffered IO (\`<stdio.h>\`):** \`fopen\`, \`fread\`, \`fwrite\`, \`fclose\`. Employs an internal user-space buffer to minimize kernel context switches. Ideal for general file processing.
2. **POSIX System Calls (\`<fcntl.h>\`, \`<unistd.h>\`):** \`open\`, \`read\`, \`write\`, \`close\`. Operates directly with raw kernel integer file descriptors (\`int fd\`). Ideal for socket programming, pipes, and non-blocking asynchronous IO.

**Defensive Error Handling with \`errno\`:**
C functions signal errors via sentinel return values (e.g., \`NULL\`, \`-1\`, or \`EOF\`). When an error occurs, the C runtime sets the thread-local global integer \`errno\`.
- \`perror("message")\`: Prints your custom message followed by the human-readable explanation of \`errno\`.
- \`strerror(errno)\`: Returns the string description of the error code for logging.`,
          diagramCode: `C IO ARCHITECTURE:
User Application:      [ fread() / fwrite() ]       [ read() / write() ]
                               |                              |
Standard C Library:    [ stdio 4KB/8KB Buffer ]               |
                               | (Flushes on full / fflush)   |
Kernel Space:          [====== System Call (sys_read / sys_write) =====]
                               |
Hardware Device:       [ NVMe SSD / Hard Disk / Network Card ]`,
          diagramExplanation: "Standard C stdio buffers reduce expensive kernel system calls, while POSIX read/write interact directly with OS file descriptors.",
          coreKeyPoints: [
            "Check return values of all file IO functions to detect disk full or permission errors.",
            "Use binary mode ('rb', 'wb') when serializing structs to prevent newline conversions on Windows.",
            "Always inspect errno immediately after a failed system call before another call overwrites it.",
          ],
          coreMistakes: [
            "Failing to close file handles with fclose/close, leading to file descriptor leaks.",
            "Assuming fwrite writes all requested bytes in a single call without checking return counts.",
          ],
          prodHeading: "2. Atomic Binary Record Serialization Engine",
          prodContent: "This program writes and verifies binary database records safely, checking write counts and handling errors via strerror.",
          codeLang: "c",
          codeSnippet: `#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <errno.h>

#pragma pack(push, 1) /* Eliminate padding for deterministic disk storage */
typedef struct {
    uint32_t record_id;
    char username[24];
    uint64_t balance_cents;
    uint32_t checksum;
} UserRecord;
#pragma pack(pop)

uint32_t compute_checksum(const UserRecord *rec) {
    uint32_t sum = rec->record_id + (uint32_t)rec->balance_cents;
    for (size_t i = 0; i < sizeof(rec->username); ++i) {
        sum += (uint8_t)rec->username[i];
    }
    return sum;
}

int main(void) {
    const char *db_filename = "test_records.bin";

    /* 1. Author and write a binary record */
    UserRecord writer = {
        .record_id = 1001,
        .balance_cents = 250000, /* $2,500.00 */
    };
    strncpy(writer.username, "dev_scholar", sizeof(writer.username) - 1);
    writer.checksum = compute_checksum(&writer);

    FILE *fp = fopen(db_filename, "wb");
    if (!fp) {
        fprintf(stderr, "Failed to open file for writing: %s\\n", strerror(errno));
        return EXIT_FAILURE;
    }

    size_t written = fwrite(&writer, sizeof(UserRecord), 1, fp);
    fclose(fp);

    if (written != 1) {
        fprintf(stderr, "Incomplete binary write!\\n");
        return EXIT_FAILURE;
    }
    printf("Successfully wrote UserRecord %u to %s\\n", writer.record_id, db_filename);

    /* 2. Read and verify record integrity */
    UserRecord reader = {0};
    fp = fopen(db_filename, "rb");
    if (!fp) {
        fprintf(stderr, "Failed to open file for reading: %s\\n", strerror(errno));
        return EXIT_FAILURE;
    }

    size_t read_count = fread(&reader, sizeof(UserRecord), 1, fp);
    fclose(fp);

    /* Remove scratch file */
    remove(db_filename);

    if (read_count != 1) {
        fprintf(stderr, "Failed to read binary record.\\n");
        return EXIT_FAILURE;
    }

    /* Verify checksum */
    uint32_t expected_checksum = compute_checksum(&reader);
    if (reader.checksum != expected_checksum) {
        fprintf(stderr, "Corrupted binary record! Checksum mismatch.\\n");
        return EXIT_FAILURE;
    }

    printf("Verified Record Integrity:\\n");
    printf(" - ID:       %u\\n", reader.record_id);
    printf(" - Username: %s\\n", reader.username);
    printf(" - Balance:  $%0.2f\\n", (double)reader.balance_cents / 100.0);
    printf(" - Checksum: 0x%08X (MATCH)\\n", reader.checksum);

    return EXIT_SUCCESS;
}`,
          codeExpectedOutput: `Successfully wrote UserRecord 1001 to test_records.bin
Verified Record Integrity:
 - ID:       1001
 - Username: dev_scholar
 - Balance:  $2500.00
 - Checksum: 0x0003D45F (MATCH)`,
          codeExplanation: "Demonstrates packed binary struct serialization, file IO error verification with strerror, and checksum validation.",
          prodKeyPoints: [
            "Always check fwrite/fread return counts to verify full records were read/written.",
            "Use packed structs or explicit serialization serializers for disk-persistent binary formats.",
          ],
          prodMistakes: [
            "Assuming text-mode file IO works identically to binary mode on Windows.",
          ],
          exerciseTitle: "Implement a File Copy Utility with Error Diagnostics",
          exerciseType: "coding",
          exerciseObjective: "Write a high-performance 4KB chunked file copy function in C.",
          exerciseDescription: "Implement copy_file(const char *src, const char *dst) using a 4096-byte stack buffer and robust error checking.",
          exerciseInstructions: [
            "Open src in 'rb' mode, dst in 'wb' mode.",
            "Loop with fread/fwrite until feof(src).",
            "Return false on any IO error and close open file pointers.",
          ],
          starterCode: `#include <stdio.h>
#include <stdbool.h>

bool copy_file(const char *src, const char *dst) {
    /* TODO: Copy file in 4KB chunks using fread and fwrite */
    return false;
}

int main(void) {
    printf("Copy utility ready for testing\\n");
    return 0;
}`,
          hints: ["Use while ((bytes_read = fread(buffer, 1, sizeof(buffer), src_fp)) > 0) to process chunks."],
          solutionExplanation: "Chunked binary copying avoids loading massive files into RAM all at once.",
          checks: [
            {
              prompt: "Which C standard library function converts an errno integer into a human-readable string?",
              options: ["strerror", "printf", "perror", "errno_str"],
              correctIdx: 0,
              explanation: "strerror(errno) returns a pointer to the textual description of the corresponding error code.",
            },
            {
              prompt: "Why must binary files be opened with 'rb' or 'wb' modes rather than plain 'r' or 'w'?",
              options: [
                "To prevent the C runtime from performing automatic newline translations (CRLF vs LF) on Windows platforms",
                "Binary mode compresses the data automatically",
                "Standard C does not support plain 'r' mode",
                "Binary mode enables multi-threading support",
              ],
              correctIdx: 0,
              explanation: "Text mode on Windows translates \\n into \\r\\n on write and vice-versa on read, corrupting raw binary structs.",
            },
          ],
          recap: "File descriptors and C streams provide access to persistent storage. Packed structs, checksum validation, and errno diagnostics ensure data integrity.",
          realWorldApps: [
            "Database WAL (Write-Ahead Logging) for atomic crash recovery.",
            "Container runtime configuration serialization (/proc and /sys filesystem reading).",
            "Network packet capturing and saving to PCAP binary files.",
          ],
        },
        {
          title: "Multi-Threading with POSIX pthreads & Thread Safety",
          summary: "Master concurrent programming with POSIX pthreads: thread creation, joining, mutexes for mutual exclusion, race condition avoidance, and condition variables.",
          estimatedMinutes: 45,
          objectives: [
            "Spawn and join concurrent POSIX threads with pthread_create and pthread_join",
            "Protect shared state with pthread_mutex_t to eliminate data races",
            "Coordinate worker threads using pthread_cond_t condition variables",
          ],
          prerequisites: ["Completion of Lesson 5: File Descriptors & Error Handling"],
          coreHeading: "1. Threads, Race Conditions and Mutex Synchronization",
          coreContent: `POSIX Threads (\`pthread\`) provide standardized multithreading in C. Unlike processes (which have isolated virtual address spaces), threads within the same process share the same text, data, and heap segments.

**The Race Condition Problem:**
When two threads increment a shared counter (\`counter++\`) simultaneously without synchronization, a data race occurs. At the machine level, \`counter++\` consists of three distinct CPU instructions:
1. Load variable from memory into CPU register.
2. Increment register value.
3. Store register value back to memory.

If a thread context switch happens between steps 1 and 3, one thread's update overwrites the other, causing silent data corruption!

**Mutexes (Mutual Exclusion):**
A \`pthread_mutex_t\` guarantees that only one thread can execute a critical section at any given time. Other threads attempting to lock the mutex will sleep until the owning thread unlocks it.`,
          diagramCode: `RACE CONDITION vs MUTEX SYNCHRONIZATION:
WITHOUT MUTEX (Data Race):
Thread 1: [Read: 10] ---> [Add 1: 11] --------------> [Write: 11] (CORRUPTED)
Thread 2: -------> [Read: 10] ---> [Add 1: 11] -> [Write: 11]

WITH MUTEX (Serialized Execution):
Thread 1: [LOCK MUTEX] -> [Read: 10] -> [Add 1: 11] -> [Write: 11] -> [UNLOCK MUTEX]
Thread 2: (Waiting...) ----------------------------------------------> [LOCK] -> [Read: 11] -> [Write: 12] -> [UNLOCK]`,
          diagramExplanation: "Mutexes serialize access to shared memory, preventing concurrent interleaved read-modify-write operations.",
          coreKeyPoints: [
            "All threads in a process share the same heap and global data segments.",
            "Protect all shared mutable state with a mutex to prevent undefined race conditions.",
            "Always compile multi-threaded C programs with -pthread flag (gcc -pthread main.c).",
          ],
          coreMistakes: [
            "Deadlock: two threads locking two mutexes in opposite order.",
            "Forgetting to unlock a mutex before exiting a function early.",
          ],
          prodHeading: "2. Thread-Safe Concurrent Counter with POSIX Mutexes",
          prodContent: "This complete program spawns 4 worker threads that concurrently increment a shared accumulator 100,000 times each, demonstrating zero race conditions.",
          codeLang: "c",
          codeSnippet: `#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <pthread.h>

#define NUM_THREADS 4
#define INCREMENTS_PER_THREAD 100000

typedef struct {
    int64_t counter;
    pthread_mutex_t lock;
} ThreadSafeCounter;

void counter_init(ThreadSafeCounter *c) {
    c->counter = 0;
    pthread_mutex_init(&c->lock, NULL);
}

void counter_increment(ThreadSafeCounter *c) {
    pthread_mutex_lock(&c->lock);
    c->counter++; /* Critical Section: Protected by mutex */
    pthread_mutex_unlock(&c->lock);
}

void counter_destroy(ThreadSafeCounter *c) {
    pthread_mutex_destroy(&c->lock);
}

/* Worker function executed by each pthread */
void* worker_thread(void *arg) {
    ThreadSafeCounter *c = (ThreadSafeCounter*)arg;
    for (int i = 0; i < INCREMENTS_PER_THREAD; ++i) {
        counter_increment(c);
    }
    return NULL;
}

int main(void) {
    pthread_t threads[NUM_THREADS];
    ThreadSafeCounter counter;
    counter_init(&counter);

    printf("Starting %d threads, each performing %d increments...\\n", NUM_THREADS, INCREMENTS_PER_THREAD);

    /* Spawn threads */
    for (int i = 0; i < NUM_THREADS; ++i) {
        if (pthread_create(&threads[i], NULL, worker_thread, &counter) != 0) {
            fprintf(stderr, "Failed to spawn thread %d\\n", i);
            return EXIT_FAILURE;
        }
    }

    /* Wait for all threads to finish */
    for (int i = 0; i < NUM_THREADS; ++i) {
        pthread_join(threads[i], NULL);
    }

    int64_t expected = (int64_t)NUM_THREADS * INCREMENTS_PER_THREAD;
    printf("Final Counter Value: %lld (Expected: %lld)\\n", (long long)counter.counter, (long long)expected);
    printf("Thread safety verified: %s\\n", (counter.counter == expected) ? "SUCCESS (0 Races)" : "FAILED (Race Detected)");

    counter_destroy(&counter);
    return EXIT_SUCCESS;
}`,
          codeExpectedOutput: `Starting 4 threads, each performing 100000 increments...
Final Counter Value: 400000 (Expected: 400000)
Thread safety verified: SUCCESS (0 Races)`,
          codeExplanation: "Demonstrates pthread creation, mutex initialization, synchronized critical sections, thread joining, and mutex teardown.",
          prodKeyPoints: [
            "pthread_join blocks until the specified thread completes, ensuring clean resource reclamation.",
            "Destroy mutexes with pthread_mutex_destroy when they are no longer needed.",
          ],
          prodMistakes: [
            "Passing pointer to loop index variable &i into pthread_create (data race on argument).",
          ],
          exerciseTitle: "Implement a Multi-Threaded Parallel Array Sum",
          exerciseType: "coding",
          exerciseObjective: "Distribute an array summation across 2 threads and aggregate the final total.",
          exerciseDescription: "Split an array into left and right halves, compute partial sums in parallel threads, and combine the results.",
          exerciseInstructions: [
            "Define struct WorkerArgs with start pointer, count, and partial_sum result.",
            "Spawn 2 pthreads, join both, and add the partial sums.",
          ],
          starterCode: `#include <stdio.h>
#include <stdint.h>
#include <pthread.h>

/* TODO: Implement parallel array sum */

int main(void) {
    printf("Parallel sum ready for implementation\\n");
    return 0;
}`,
          hints: ["Each thread writes to its own independent struct member, avoiding the need for a mutex during summation."],
          solutionExplanation: "Independent thread outputs require no locks, maximizing parallel CPU cache utilization.",
          checks: [
            {
              prompt: "What is the primary role of a pthread_mutex_t in multi-threaded C?",
              options: [
                "To guarantee mutual exclusion and prevent race conditions on shared memory",
                "To allocate heap memory for new threads",
                "To speed up compiler optimization",
                "To terminate hung threads",
              ],
              correctIdx: 0,
              explanation: "A mutex ensures only one thread executes a critical section at any time, eliminating data races.",
            },
            {
              prompt: "Which GCC compiler flag must be provided when compiling POSIX thread applications?",
              options: ["-pthread", "-threading", "-posix", "-pthreads-on"],
              correctIdx: 0,
              explanation: "The -pthread flag configures compiler preprocessor definitions and links libpthread required for POSIX threads.",
            },
          ],
          recap: "POSIX pthreads enable multi-core concurrent execution. Mutexes protect critical sections from data races, and pthread_join coordinates thread lifecycles.",
          realWorldApps: [
            "Web servers (Nginx, Apache) handling thousands of concurrent client HTTP connections.",
            "Game engines updating physics simulations and rendering pipelines on separate worker threads.",
            "Database background vacuuming and disk flush worker threads.",
          ],
        },
      ],
    },
  ],
};

function buildCourseFromBlueprint(bp: RichCourseBlueprint) {
  const now = new Date().toISOString();
  const objectives = [
    { id: `${bp.slug}-obj-1`, statement: `Understand foundational mental models and architecture of ${bp.skillName}`, order: 1 },
    { id: `${bp.slug}-obj-2`, statement: `Implement secure, reproducible solutions across real-world ${bp.skillName} tasks`, order: 2 },
    { id: `${bp.slug}-obj-3`, statement: `Diagnose common production edge cases, bottlenecks, and vulnerabilities in ${bp.skillName}`, order: 3 },
    { id: `${bp.slug}-obj-4`, statement: `Architect scalable enterprise workflows aligned with ${bp.skillName} industry best practices`, order: 4 },
  ];

  const curriculum: Curriculum = {
    skillId: bp.skillId,
    skillName: bp.skillName,
    learnerLevel: "beginner",
    preferredLanguage: "English",
    objectives,
    prerequisites: bp.prerequisites,
    modules: bp.modules.map((m, idx) => ({
      id: m.id,
      title: m.title,
      summary: m.summary,
      order: idx + 1,
      estimatedMinutes: m.estimatedMinutes,
      objectiveIds: idx === 0
        ? [`${bp.slug}-obj-1`, `${bp.slug}-obj-2`]
        : idx === 1
        ? [`${bp.slug}-obj-2`, `${bp.slug}-obj-3`]
        : [`${bp.slug}-obj-3`, `${bp.slug}-obj-4`],
      lessonTitles: m.lessons.map((l) => l.title),
      checkpoint: m.checkpoint,
    })),
    practiceActivities: bp.practiceActivities,
    assessmentCheckpoints: bp.modules.map((m) => `${m.title} Checkpoint (70% pass threshold)`),
    projects: bp.projects,
    proficiencyCriteria: bp.proficiencyCriteria,
    resources: [
      {
        title: bp.docTitle,
        organization: bp.docOrg,
        url: bp.docUrl,
        retrievedAt: now,
        reviewStatus: "curated",
      },
    ],
    contentVersion: 2,
    generationMode: "curated",
    reviewStatus: "approved",
  };

  const planned = extractPlannedLessons(curriculum);
  const lessons: LessonDocument[] = [];
  const phaseAssessments: MockTestDocument[] = [];
  const sharedVideo: ExternalResource = {
    id: `res-${bp.slug}-primary`,
    title: bp.videoTitle,
    provider: "youtube",
    channelOrAuthor: bp.videoChannel,
    url: bp.videoUrl,
    embedUrl: "",
    durationMinutes: 60,
    difficulty: "beginner",
    whySelected: `Comprehensive, technically accurate conceptual & practical walkthrough of ${bp.skillName}.`,
    whatItTeaches: `Core architecture, security boundaries, and real-world workflows for ${bp.skillName}.`,
    learningObjectivesSupported: objectives.map((o) => o.id),
    keyTopicsCovered: bp.modules.flatMap((m) => m.lessons.map((l) => l.title)),
    followUpActivity: "Complete all hands-on lab checks and knowledge checks in this module.",
    verificationStatus: "curated",
    lastCheckedDate: "2026-11-12",
  };

  for (let mIdx = 0; mIdx < bp.modules.length; mIdx++) {
    const mod = bp.modules[mIdx];
    const modObjIds = curriculum.modules[mIdx].objectiveIds;

    for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
      const lb = mod.lessons[lIdx];
      const matchedPlan = planned.find((p) => p.moduleId === mod.id && p.lessonTitle === lb.title);
      const lessonId =
        matchedPlan?.lessonId ??
        `${mod.id}-l${lIdx + 1}-${lb.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;

      lessons.push({
        lessonId,
        skillName: bp.skillName,
        moduleId: mod.id,
        title: lb.title,
        summary: lb.summary,
        learnerLevel: "beginner",
        estimatedMinutes: lb.estimatedMinutes,
        learningObjectives: lb.objectives,
        objectiveIds: modObjIds,
        prerequisiteConcepts: lb.prerequisites,
        sections: [
          {
            id: `${lessonId}-sec-1`,
            heading: lb.coreHeading,
            content: lb.coreContent,
            codeExamples: lb.diagramCode
              ? [
                  {
                    language: "text",
                    code: lb.diagramCode,
                    explanation: lb.diagramExplanation,
                    expectedOutput: "",
                  },
                ]
              : [],
            keyPoints: lb.coreKeyPoints,
            commonMistakes: lb.coreMistakes,
          },
          {
            id: `${lessonId}-sec-2`,
            heading: lb.prodHeading,
            content: lb.prodContent,
            codeExamples: [
              {
                language: lb.codeLang,
                code: lb.codeSnippet,
                explanation: lb.codeExplanation,
                expectedOutput: lb.codeExpectedOutput,
              },
            ],
            keyPoints: lb.prodKeyPoints,
            commonMistakes: lb.prodMistakes,
          },
          {
            id: `${lessonId}-sec-3`,
            heading: "3. Systems Architecture Blueprint & Production Verification",
            content: `Mastering ${lb.title} requires continuous empirical verification. In production environments, verify that every memory allocation is accounted for, buffer boundaries are strictly honored, and execution logs provide deterministic diagnostics.

Key Operational Checks:
1. Validate inputs and boundary constraints before executing core business logic.
2. Structure error handling so failed operations release all acquired resources before returning.
3. Establish automated unit and regression tests that exercise edge conditions and stress boundaries.`,
            codeExamples: [],
            keyPoints: [
              "Reliability in systems engineering is achieved by treating failure modes as first-class architectural concerns.",
              "Document and verify performance invariants with repeatable benchmarks.",
            ],
            commonMistakes: [
              "Failing to profile and test under simulated peak load conditions.",
            ],
          },
        ],
        exercises: [
          {
            id: `${lessonId}-ex-1`,
            title: lb.exerciseTitle,
            type: lb.exerciseType,
            objective: lb.exerciseObjective,
            description: lb.exerciseDescription,
            instructions: lb.exerciseInstructions,
            starterCode: lb.starterCode,
            hints: lb.hints,
            submissionRequirements: "Complete all checklist items, test assumptions, and document verification rationale.",
            evaluationCriteria: [
              "Addresses the root architectural/technical challenge accurately",
              "Follows defensive industry standards and edge-case validation",
            ],
            solutionExplanation: lb.solutionExplanation,
          },
        ],
        knowledgeChecks: lb.checks.map((ck, idx) => ({
          id: `${lessonId}-kc-${idx + 1}`,
          type: "single-choice",
          prompt: ck.prompt,
          options: ck.options.map((optText, oIdx) => ({ id: `opt-${oIdx + 1}`, text: optText })),
          correctOptionIds: [`opt-${ck.correctIdx + 1}`],
          explanation: ck.explanation,
          objectiveIds: [modObjIds[idx % modObjIds.length]],
        })),
        recap: lb.recap,
        videoResources: [sharedVideo],
        furtherReading: [
          {
            title: bp.docTitle,
            url: bp.docUrl,
            description: `Authoritative official technical reference for ${bp.skillName}.`,
          },
        ],
        realWorldApplications: lb.realWorldApps,
        generationMode: "curated",
        reviewStatus: "approved",
        contentVersion: 2,
        generatedAt: now,
      });
    }

    const phaseQuestions = mod.lessons.flatMap((lb, lIdx) => {
      const matchedPlan = planned.find((p) => p.moduleId === mod.id && p.lessonTitle === lb.title);
      const exactLessonId = matchedPlan?.lessonId ?? `${mod.id}-l${lIdx + 1}`;
      return lb.checks.map((ck, cIdx) => ({
        id: `phase-${bp.slug}-${mod.id}-q${lIdx * 2 + cIdx + 1}`,
        section: "A" as const,
        sectionTitle: `${mod.title} Checkpoint`,
        type: "single-choice" as const,
        prompt: ck.prompt,
        codeSnippet: "",
        options: ck.options.map((t, oIdx) => ({ id: `opt-${oIdx + 1}`, text: t })),
        correctOptionIds: [`opt-${ck.correctIdx + 1}`],
        explanation: ck.explanation,
        difficulty: "beginner" as const,
        topic: lb.title,
        marks: 5,
        recommendedLessonId: exactLessonId,
        recommendedLessonTitle: lb.title,
      }));
    });

    phaseAssessments.push({
      id: `phase-${bp.slug}-${mod.id}-assessment`,
      skillName: bp.skillName,
      skillSlug: bp.slug,
      level: "beginner",
      testNumber: mIdx + 1,
      isPhaseAssessment: true,
      moduleId: mod.id,
      moduleTitle: mod.title,
      title: `${bp.skillName} — ${mod.title} Assessment`,
      description: `Checkpoint evaluation verifying conceptual mastery across ${mod.lessons.map((l) => l.title).join(" and ")}.`,
      durationMinutes: 20,
      totalMarks: phaseQuestions.reduce((s, q) => s + q.marks, 0),
      passingPercentage: 70,
      topicsCovered: mod.lessons.map((l) => l.title),
      questions: phaseQuestions,
      contentVersion: 2,
      reviewStatus: "approved",
      createdAt: now,
      updatedAt: now,
    });
  }

  const mockTests: MockTestDocument[] = [
    buildDeterministicMockTest(bp.skillName, "beginner", 1),
    buildDeterministicMockTest(bp.skillName, "beginner", 2),
    buildDeterministicMockTest(bp.skillName, "beginner", 3),
  ];

  return {
    slug: bp.slug,
    skillName: bp.skillName,
    curriculum,
    lessons,
    phaseAssessments,
    mockTests,
    resources: [sharedVideo],
  };
}

async function main() {
  console.log("🚀 Building and updating deep study course packages...");

  // Build C Programming
  const cPkg = buildCourseFromBlueprint(C_PROGRAMMING_COURSE);
  await saveCoursePackage(cPkg);
  console.log(`✅ Successfully generated deep C Programming course package!`);
}

main().catch((err) => {
  console.error("❌ Generation failed:", err);
  process.exit(1);
});
