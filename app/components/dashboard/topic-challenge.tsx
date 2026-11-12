"use client";
import { useState } from "react";
import { Challenge } from "@/lib/learning/challenges-catalog";
import {
  Play,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function TopicChallenge({ challenge }: { challenge: Challenge }) {
  const [code, setCode] = useState(
    challenge.starterCode["python"] || challenge.starterCode["sql"] || ""
  );
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const runTests = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/challenge/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          testCases: challenge.testCases,
          language: "python",
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([
        {
          input: "Error",
          expected: "",
          actual: "Network error",
          passed: false,
        },
      ]);
    }
    setRunning(false);
  };

  const diffColor =
    challenge.difficulty === "Easy"
      ? "text-green-400 border-green-400"
      : challenge.difficulty === "Medium"
      ? "text-yellow-400 border-yellow-400"
      : "text-red-400 border-red-400";
  const allPassed = results.length > 0 && results.every((r) => r.passed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Problem panel */}
      <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5 overflow-y-auto max-h-[80vh] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-white">{challenge.title}</h2>
          <span
            className={`text-xs border rounded px-2 py-0.5 font-semibold ${diffColor}`}
          >
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {challenge.tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-white/5 text-white/60 px-2 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
          {challenge.description}
        </div>
        <div className="space-y-3">
          {challenge.examples.map((ex, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-lg p-3 text-sm font-mono"
            >
              <div className="text-white/50 text-xs mb-1">Example {i + 1}:</div>
              <div className="text-white/70">
                <span className="text-white/40">Input: </span>
                {ex.input}
              </div>
              <div className="text-white/70">
                <span className="text-white/40">Output: </span>
                {ex.output}
              </div>
              {ex.explanation && (
                <div className="text-white/50 text-xs mt-1">
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-white/40 uppercase mb-2">
            Constraints
          </div>
          <ul className="space-y-1">
            {challenge.constraints.map((c, i) => (
              <li key={i} className="text-xs text-white/60 flex gap-2">
                <span className="text-purple-400">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"
        >
          <Lightbulb size={14} />
          {showHints ? "Hide" : "Show"} Hints{" "}
          {showHints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showHints && (
          <ul className="space-y-1 ml-4">
            {challenge.hints.map((h, i) => (
              <li key={i} className="text-xs text-white/70 flex gap-2">
                <span className="text-yellow-400">💡</span>
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Editor + Results panel */}
      <div className="flex flex-col gap-3">
        <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden flex-1">
          <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
            <span className="text-xs text-white/60 font-mono">
              {challenge.starterCode["python"] ? "Python" : "SQL"}
            </span>
            <button
              onClick={runTests}
              disabled={running}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Play size={12} /> {running ? "Running..." : "Run Tests"}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-transparent text-white/90 font-mono text-sm p-4 resize-none focus:outline-none min-h-[280px]"
            spellCheck={false}
            placeholder="Write your solution here..."
          />
        </div>

        {/* Test results */}
        {results.length > 0 && (
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 space-y-2">
            <div
              className={`text-sm font-semibold ${
                allPassed ? "text-green-400" : "text-red-400"
              }`}
            >
              {allPassed
                ? "✅ All tests passed!"
                : `❌ ${results.filter((r) => !r.passed).length} test(s) failed`}
            </div>
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-xs p-2 rounded ${
                  r.passed ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                {r.passed ? (
                  <CheckCircle2
                    size={12}
                    className="text-green-400 mt-0.5 shrink-0"
                  />
                ) : (
                  <XCircle
                    size={12}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                )}
                <div>
                  <div className="font-mono text-white/60">
                    Input: {r.input}
                  </div>
                  {!r.passed && (
                    <>
                      <div className="text-green-400">
                        Expected: {r.expected}
                      </div>
                      <div className="text-red-400">Got: {r.actual}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowSolution(!showSolution)}
          className="text-xs text-white/40 hover:text-white/60 self-start px-3 py-1 border border-white/10 rounded"
        >
          {showSolution ? "Hide" : "View"} Solution
        </button>
        {showSolution && (
          <pre className="text-xs font-mono bg-white/5 p-3 rounded-xl text-white/70 overflow-x-auto">
            {challenge.solution}
          </pre>
        )}
      </div>
    </div>
  );
}
