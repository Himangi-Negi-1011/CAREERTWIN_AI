export interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  skill: string;
  topic: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  hints: string[];
  starterCode: Record<string, string>; // language -> starter code
  testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }>;
  solution: string;
  tags: string[];
}

export const CHALLENGES: Challenge[] = [
  // Python challenges
  {
    id: "py-001",
    title: "Two Sum",
    difficulty: "Easy",
    skill: "python",
    topic: "Arrays & Hash Maps",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "Only one valid answer exists",
    ],
    hints: [
      "Use a hash map to store seen numbers",
      "For each number x, check if target-x exists in the map",
    ],
    starterCode: {
      python:
        "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass",
    },
    testCases: [
      { input: "two_sum([2,7,11,15], 9)", expectedOutput: "[0, 1]" },
      { input: "two_sum([3,2,4], 6)", expectedOutput: "[1, 2]" },
      { input: "two_sum([3,3], 6)", expectedOutput: "[0, 1]" },
    ],
    solution:
      "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i",
    tags: ["array", "hash-map", "O(n)"],
  },
  {
    id: "py-002",
    title: "Reverse a String",
    difficulty: "Easy",
    skill: "python",
    topic: "Strings",
    description:
      'Write a function that reverses a string. The input is given as an array of characters `s`.\n\nYou must do this in-place with O(1) extra memory.',
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁵",
      "s[i] is a printable ASCII character",
    ],
    hints: [
      "Use two pointers (left, right)",
      "Swap characters while left < right",
    ],
    starterCode: {
      python:
        "def reverse_string(s: list[str]) -> None:\n    # Modify s in-place\n    # Do not return anything\n    pass",
    },
    testCases: [
      {
        input: 'l=["h","e","l","l","o"]; reverse_string(l); l',
        expectedOutput: "['o', 'l', 'l', 'e', 'h']",
      },
    ],
    solution:
      "def reverse_string(s):\n    l, r = 0, len(s)-1\n    while l < r:\n        s[l], s[r] = s[r], s[l]\n        l += 1; r -= 1",
    tags: ["two-pointers", "string", "in-place"],
  },
  {
    id: "py-003",
    title: "FizzBuzz",
    difficulty: "Easy",
    skill: "python",
    topic: "Math & Loops",
    description:
      "Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == 'FizzBuzz' if i is divisible by 3 and 5.\n- answer[i] == 'Fizz' if i is divisible by 3.\n- answer[i] == 'Buzz' if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.",
    examples: [
      { input: "n = 3", output: '["1","2","Fizz"]' },
      { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]' },
    ],
    constraints: ["1 ≤ n ≤ 10⁴"],
    hints: [
      "Check divisibility with the % operator",
      "Order: check 15 (or 3 and 5 together) FIRST",
    ],
    starterCode: {
      python: "def fizz_buzz(n: int) -> list[str]:\n    pass",
    },
    testCases: [
      {
        input: "fizz_buzz(3)",
        expectedOutput: "['1', '2', 'Fizz']",
      },
      {
        input: "fizz_buzz(5)",
        expectedOutput: "['1', '2', 'Fizz', '4', 'Buzz']",
      },
      {
        input: "fizz_buzz(15)",
        expectedOutput:
          "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']",
      },
    ],
    solution:
      "def fizz_buzz(n):\n    return ['FizzBuzz' if i%15==0 else 'Fizz' if i%3==0 else 'Buzz' if i%5==0 else str(i) for i in range(1,n+1)]",
    tags: ["math", "string", "simulation"],
  },
  {
    id: "py-004",
    title: "Valid Parentheses",
    difficulty: "Medium",
    skill: "python",
    topic: "Stack",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses only '()[]{}'",
    ],
    hints: [
      "Use a stack",
      "Push open brackets, pop and match when you see a closing bracket",
    ],
    starterCode: {
      python: "def is_valid(s: str) -> bool:\n    pass",
    },
    testCases: [
      { input: 'is_valid("()")', expectedOutput: "True" },
      { input: 'is_valid("()[]{}")', expectedOutput: "True" },
      { input: 'is_valid("(]")', expectedOutput: "False" },
    ],
    solution:
      "def is_valid(s):\n    st=[]; m={')':'(',']':'[','}':'{'}\n    for c in s:\n        if c in '([{': st.append(c)\n        elif not st or st[-1]!=m[c]: return False\n        else: st.pop()\n    return not st",
    tags: ["stack", "string"],
  },
  {
    id: "py-005",
    title: "Maximum Subarray",
    difficulty: "Medium",
    skill: "python",
    topic: "Dynamic Programming",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: [
      "1 ≤ nums.length ≤ 10⁵",
      "-10⁴ ≤ nums[i] ≤ 10⁴",
    ],
    hints: [
      "Use Kadane's algorithm",
      "Keep track of current sum and global max",
      "If current sum goes negative, reset it to 0",
    ],
    starterCode: {
      python: "def max_subarray(nums: list[int]) -> int:\n    pass",
    },
    testCases: [
      {
        input: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])",
        expectedOutput: "6",
      },
      { input: "max_subarray([1])", expectedOutput: "1" },
      { input: "max_subarray([5,4,-1,7,8])", expectedOutput: "23" },
    ],
    solution:
      "def max_subarray(nums):\n    cur = best = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        best = max(best, cur)\n    return best",
    tags: ["dynamic-programming", "array", "kadane"],
  },
  {
    id: "sql-001",
    title: "Select All Students",
    difficulty: "Easy",
    skill: "sql",
    topic: "SELECT Basics",
    description:
      "Write a SQL query to retrieve all columns from the `students` table.",
    examples: [
      {
        input: "students table with columns: id, name, grade, email",
        output: "All rows and columns",
      },
    ],
    constraints: ["Use SELECT statement", "Return all columns"],
    hints: ["Use * to select all columns"],
    starterCode: { sql: "-- Write your SQL query here\nSELECT " },
    testCases: [
      {
        input: "SELECT * FROM students",
        expectedOutput: "All rows returned",
      },
    ],
    solution: "SELECT * FROM students;",
    tags: ["select", "basic"],
  },
  {
    id: "sql-002",
    title: "Filter by Condition",
    difficulty: "Easy",
    skill: "sql",
    topic: "WHERE Clause",
    description:
      "Write a SQL query to find all students with a grade greater than 85 from the `students` table.",
    examples: [
      {
        input: "students(id, name, grade, email)",
        output: "Rows where grade > 85",
      },
    ],
    constraints: ["Use WHERE clause", "Filter grade > 85"],
    hints: ["WHERE grade > 85"],
    starterCode: {
      sql: "-- Write your SQL query here\nSELECT * FROM students\nWHERE ",
    },
    testCases: [
      {
        input: "SELECT * FROM students WHERE grade > 85",
        expectedOutput: "Filtered rows",
      },
    ],
    solution: "SELECT * FROM students WHERE grade > 85;",
    tags: ["select", "where", "filter"],
  },
];

export function getChallengesBySkill(skill: string): Challenge[] {
  return CHALLENGES.filter((c) => c.skill === skill);
}

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
