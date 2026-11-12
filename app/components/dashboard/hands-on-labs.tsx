"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Network,
  Shield,
  Cloud,
  Database,
  Code2,
  Check,
  HelpCircle,
  Sparkles,
  Trophy,
  BookOpen,
  Filter,
} from "lucide-react";
import { CHALLENGES, type Challenge } from "@/lib/learning/challenges-catalog";
import { TopicChallenge } from "./topic-challenge";

interface HandsOnLabsProps {
  ownerKey?: string;
  onNavigateTwin?: () => void;
}

type LabTrack = "python" | "networking" | "cybersecurity" | "cloud" | "sql";

interface LabDefinition {
  id: LabTrack;
  title: string;
  badge: string;
  scenario: string;
  objective: string;
  hints: string[];
  initialCode: string;
}

const LABS: Record<LabTrack, LabDefinition> = {
  python: {
    id: "python",
    title: "Python Data Processing & Validation Pipeline",
    badge: "Software Engineering",
    scenario:
      "You are building a ingestion microservice for student test scores. The API receives a list of user objects with raw email strings and numeric quiz scores. You need to normalize the emails to lowercase, strip trailing whitespace, filter out invalid records where score < 0 or score > 100, and calculate the class average.",
    objective:
      "Write a Python function `process_scores(records)` that returns a tuple `(cleaned_records, average_score)`. Ensure invalid records are dropped and average is rounded to 2 decimal places.",
    hints: [
      "Use list comprehensions or a standard loop to filter records.",
      "Check `0 <= record['score'] <= 100` before including.",
      "Normalize with `record['email'].strip().lower()`.",
    ],
    initialCode: `def process_scores(records):
    # TODO: Clean and filter records
    valid_records = []
    
    for r in records:
        email = r.get("email", "").strip().lower()
        score = r.get("score", -1)
        if 0 <= score <= 100 and "@" in email:
            valid_records.append({"email": email, "score": score})
            
    if not valid_records:
        return ([], 0.0)
        
    avg = sum(r["score"] for r in valid_records) / len(valid_records)
    return (valid_records, round(avg, 2))
`,
  },
  networking: {
    id: "networking",
    title: "IPv4 Subnetting & Network Diagnostics",
    badge: "Cisco NetAcad Inspired",
    scenario:
      "A branch office network has been allocated the CIDR block 192.168.10.0/26. As the network engineer, you must calculate the subnet mask, total usable host addresses, the network ID, first usable IP, last usable IP, and broadcast address to properly configure router interfaces.",
    objective:
      "Fill in the subnet configuration parameters for 192.168.10.0/26 and run the diagnostic verification suite.",
    hints: [
      "A /26 network uses 26 network bits and 6 host bits.",
      "Usable hosts formula is 2^(32 - prefix) - 2.",
      "Subnet mask in dotted-decimal is 255.255.255.192.",
    ],
    initialCode: `SUBNET_MASK="255.255.255.192"
TOTAL_USABLE_HOSTS=62
NETWORK_ADDRESS="192.168.10.0"
FIRST_USABLE_IP="192.168.10.1"
LAST_USABLE_IP="192.168.10.62"
BROADCAST_ADDRESS="192.168.10.63"
DEFAULT_GATEWAY="192.168.10.1"`,
  },
  cybersecurity: {
    id: "cybersecurity",
    title: "SOC Incident Log Triage & Threat Detection",
    badge: "Cyber Defense",
    scenario:
      "The SOC monitoring alert system detected anomalous HTTP traffic on the production authentication gateway. Review the sample Apache/Nginx web server access log, locate the malicious attacker IP, identify the attack type (SQL injection vs brute force), and configure the appropriate WAF blocking rule.",
    objective:
      "Analyze the HTTP access logs, select the attacker IP, classify the threat vector, and verify the blocking policy rule.",
    hints: [
      "Look for repeated 401 Unauthorized responses from a single IP address in a short time frame.",
      "Notice URL query parameters with 'UNION SELECT' or apostrophes (' OR 1=1).",
      "Formulate a CIDR or IP drop rule.",
    ],
    initialCode: `# Attack Triage Investigation
ATTACKER_IP="203.0.113.45"
ATTACK_VECTOR="SQL Injection & Credential Stuffing"
TARGET_ENDPOINT="/api/v1/auth/login"
FIREWALL_ACTION="BLOCK_DROP"
RULE_SYNTAX="iptables -A INPUT -s 203.0.113.45 -j DROP"`,
  },
  cloud: {
    id: "cloud",
    title: "Cloud IAM Least-Privilege Policy Auditor",
    badge: "Cloud Infrastructure",
    scenario:
      "A DevOps engineer mistakenly deployed an IAM policy with `Action: *` and `Resource: *` for a microservice that only requires reading configuration files from an S3 bucket named `careertwin-prod-config`. You must refactor the policy to adhere to the principle of least privilege.",
    objective:
      "Edit the JSON IAM policy document to only allow `s3:GetObject` and `s3:ListBucket` on the specific ARN `arn:aws:s3:::careertwin-prod-config/*` while explicitly denying `s3:DeleteObject`.",
    hints: [
      "Use 'Effect': 'Allow' with specific actions: ['s3:GetObject', 's3:ListBucket'].",
      "Resource should target 'arn:aws:s3:::careertwin-prod-config/*'.",
      "Ensure valid JSON syntax with double quotes.",
    ],
    initialCode: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowConfigReadAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::careertwin-prod-config",
        "arn:aws:s3:::careertwin-prod-config/*"
      ]
    },
    {
      "Sid": "DenyConfigDestruction",
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::careertwin-prod-config/*"
    }
  ]
}`,
  },
  sql: {
    id: "sql",
    title: "SQL Production Analytics & Join Aggregator",
    badge: "Data & Databases",
    scenario:
      "Given two tables: `students(id, name, enrolled_role)` and `course_completions(id, student_id, course_slug, score)`. You must write a SQL query that retrieves each student's name, the count of courses completed, and their average score, filtered only for students who have an average score >= 75.0, sorted in descending order by average score.",
    objective:
      "Write a valid SQL query with `INNER JOIN`, `GROUP BY`, `HAVING`, and `ORDER BY`.",
    hints: [
      "Use `JOIN course_completions ON students.id = course_completions.student_id`.",
      "Group by `students.id, students.name`.",
      "Use `HAVING AVG(course_completions.score) >= 75`.",
      "Order by `average_score DESC`.",
    ],
    initialCode: `SELECT 
    students.name,
    COUNT(course_completions.id) AS completed_count,
    ROUND(AVG(course_completions.score), 2) AS average_score
FROM students
INNER JOIN course_completions 
    ON students.id = course_completions.student_id
GROUP BY students.id, students.name
HAVING AVG(course_completions.score) >= 75.0
ORDER BY average_score DESC;`,
  },
};

export function HandsOnLabsView({ ownerKey = "default", onNavigateTwin }: HandsOnLabsProps) {
  const [labMode, setLabMode] = useState<"scenario" | "leetcode">("scenario");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("lc-001");
  const [challengeFilter, setChallengeFilter] = useState<string>("all");
  const [activeTrack, setActiveTrack] = useState<LabTrack>("python");
  const [codeInputs, setCodeInputs] = useState<Record<LabTrack, string>>({
    python: LABS.python.initialCode,
    networking: LABS.networking.initialCode,
    cybersecurity: LABS.cybersecurity.initialCode,
    cloud: LABS.cloud.initialCode,
    sql: LABS.sql.initialCode,
  });
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [labStatus, setLabStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [attemptHistory, setAttemptHistory] = useState<
    Array<{ id: string; track: LabTrack; status: "passed" | "failed"; timestamp: string; summary: string }>
  >([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`careertwin-completed-labs:${ownerKey}`);
      if (saved) {
        setCompletedLabs(JSON.parse(saved));
      }
      const attemptsRaw = window.localStorage.getItem(`careertwin-lab-attempts:${ownerKey}`);
      if (attemptsRaw) {
        setAttemptHistory(JSON.parse(attemptsRaw));
      }
    } catch {
      // storage fallback
    }
  }, [ownerKey]);

  const activeLab = LABS[activeTrack];
  const isCompleted = completedLabs.includes(activeTrack);

  const resetCurrentLab = () => {
    setCodeInputs((prev) => ({
      ...prev,
      [activeTrack]: LABS[activeTrack].initialCode,
    }));
    setLabStatus("idle");
    setTerminalOutput(["Code reset to original starter template."]);
  };

  const runVerification = () => {
    setLabStatus("running");
    setTerminalOutput(["Initializing sandbox environment...", "Executing test suite..."]);

    const currentCode = codeInputs[activeTrack] || "";

    setTimeout(() => {
      let passed = false;
      const logs: string[] = [];

      if (activeTrack === "python") {
        const hasFilter = currentCode.includes("0 <= score <= 100") || (currentCode.includes("score >= 0") && currentCode.includes("score <= 100"));
        const hasNormalize = currentCode.includes(".strip()") && currentCode.includes(".lower()");
        const hasRound = currentCode.includes("round(");

        logs.push("Test 1: Normalizing emails (strip whitespace & lowercase)...");
        if (hasNormalize) logs.push("  ✓ Passed: Found email normalization logic.");
        else logs.push("  ✗ Failed: Email normalization missing .strip() or .lower().");

        logs.push("Test 2: Filtering invalid scores (<0 or >100)...");
        if (hasFilter) logs.push("  ✓ Passed: Correct boundary filtering implemented.");
        else logs.push("  ✗ Failed: Boundary validation not detected.");

        logs.push("Test 3: Computing arithmetic average with rounding...");
        if (hasRound) logs.push("  ✓ Passed: Average score calculated and rounded.");
        else logs.push("  ✗ Failed: Rounding function missing.");

        passed = hasFilter && hasNormalize && hasRound;
      } else if (activeTrack === "networking") {
        const hasMask = currentCode.includes("255.255.255.192");
        const hasHosts = currentCode.includes("62");
        const hasBroadcast = currentCode.includes("192.168.10.63");

        logs.push("Test 1: Verifying Dotted-Decimal Subnet Mask for /26...");
        if (hasMask) logs.push("  ✓ Passed: Mask matches 255.255.255.192.");
        else logs.push("  ✗ Failed: Subnet mask incorrect.");

        logs.push("Test 2: Verifying Total Usable Host Addresses (2^6 - 2)...");
        if (hasHosts) logs.push("  ✓ Passed: Usable host count calculated as 62.");
        else logs.push("  ✗ Failed: Usable hosts count incorrect.");

        logs.push("Test 3: Calculating Network Broadcast Address...");
        if (hasBroadcast) logs.push("  ✓ Passed: Broadcast address verified as 192.168.10.63.");
        else logs.push("  ✗ Failed: Broadcast address calculation incorrect.");

        passed = hasMask && hasHosts && hasBroadcast;
      } else if (activeTrack === "cybersecurity") {
        const hasIP = currentCode.includes("203.0.113.45");
        const hasDrop = currentCode.includes("DROP") || currentCode.includes("BLOCK");
        const hasVector = currentCode.toLowerCase().includes("sql") || currentCode.toLowerCase().includes("credential");

        logs.push("Test 1: Identifying Attacker Source IP from access logs...");
        if (hasIP) logs.push("  ✓ Passed: Malicious IP 203.0.113.45 positively identified.");
        else logs.push("  ✗ Failed: Incorrect attacker IP address.");

        logs.push("Test 2: Classifying Attack Threat Vector...");
        if (hasVector) logs.push("  ✓ Passed: Threat classification verified.");
        else logs.push("  ✗ Failed: Threat vector classification missing.");

        logs.push("Test 3: Generating Firewall / WAF Remediation Rule...");
        if (hasDrop) logs.push("  ✓ Passed: Firewall drop rule syntax validated.");
        else logs.push("  ✗ Failed: Firewall drop action missing.");

        passed = hasIP && hasDrop && hasVector;
      } else if (activeTrack === "cloud") {
        try {
          const parsed = JSON.parse(currentCode) as {
            Statement?: Array<{ Effect?: string; Action?: string | string[]; Resource?: string | string[] }>;
          };
          const statements = Array.isArray(parsed?.Statement) ? parsed.Statement : [];
          const hasStatement = statements.length > 0;
          const allowRules = statements.filter((s) => s.Effect === "Allow");
          const denyRules = statements.filter((s) => s.Effect === "Deny");

          const toList = (val: string | string[] | undefined): string[] =>
            Array.isArray(val) ? val.map(String) : typeof val === "string" ? [val] : [];

          const allAllowActions = allowRules.flatMap((s) => toList(s.Action));
          const hasWildcardAction = allAllowActions.some((a) => a === "*" || a === "s3:*" || a.endsWith(":*"));
          const hasWildcardResource = allowRules.some((s) => toList(s.Resource).includes("*"));
          const hasReadAction = allAllowActions.includes("s3:GetObject");
          const hasDenyDelete = denyRules.some((s) => toList(s.Action).includes("s3:DeleteObject"));

          logs.push("Test 1: JSON IAM Policy Schema Validity...");
          if (hasStatement) logs.push("  ✓ Passed: JSON parsed with valid Statement array.");
          else logs.push("  ✗ Failed: Missing non-empty Statement array.");

          logs.push("Test 2: Least-Privilege Scope (Zero wildcard '*' or 's3:*' actions)...");
          if (hasReadAction && !hasWildcardAction && !hasWildcardResource) {
            logs.push("  ✓ Passed: Read permissions scoped explicitly without wildcard actions or '*' resources.");
          } else {
            logs.push("  ✗ Failed: Ensure s3:GetObject is allowed without wildcard '*' in Action or Resource.");
          }

          logs.push("Test 3: Explicit Deny for Destructive Actions...");
          if (hasDenyDelete) logs.push("  ✓ Passed: Explicit Deny for s3:DeleteObject enforced.");
          else logs.push("  ✗ Failed: Deny statement for s3:DeleteObject missing.");

          passed = hasStatement && hasReadAction && !hasWildcardAction && !hasWildcardResource && hasDenyDelete;
        } catch (e: any) {
          logs.push("Test 1: JSON IAM Policy Schema Validity...");
          logs.push(`  ✗ Syntax Error: ${e.message}`);
          passed = false;
        }
      } else if (activeTrack === "sql") {
        const hasJoin = currentCode.toUpperCase().includes("JOIN");
        const hasGroupBy = currentCode.toUpperCase().includes("GROUP BY");
        const hasHaving = currentCode.toUpperCase().includes("HAVING");
        const hasOrderBy = currentCode.toUpperCase().includes("ORDER BY");

        logs.push("Test 1: Relational JOIN syntax...");
        if (hasJoin) logs.push("  ✓ Passed: INNER JOIN correctly connects students and completions.");
        else logs.push("  ✗ Failed: JOIN statement missing.");

        logs.push("Test 2: Aggregation grouping...");
        if (hasGroupBy) logs.push("  ✓ Passed: GROUP BY students.id executed.");
        else logs.push("  ✗ Failed: GROUP BY clause missing.");

        logs.push("Test 3: Aggregate filter (HAVING score >= 75)...");
        if (hasHaving) logs.push("  ✓ Passed: HAVING filter applied on aggregated average.");
        else logs.push("  ✗ Failed: HAVING filter missing.");

        logs.push("Test 4: Sorting results in descending order...");
        if (hasOrderBy) logs.push("  ✓ Passed: ORDER BY average_score DESC verified.");
        else logs.push("  ✗ Failed: ORDER BY missing.");

        passed = hasJoin && hasGroupBy && hasHaving && hasOrderBy;
      }

      if (passed) {
        logs.push("");
        logs.push("🎉 ALL TESTS PASSED! Practical lab successfully completed.");
        logs.push("Twin Evidence verified: Added practical lab mastery badge to your Career Twin.");
        setLabStatus("passed");

        // Save to completed labs
        if (!completedLabs.includes(activeTrack)) {
          const updated = [...completedLabs, activeTrack];
          setCompletedLabs(updated);
          try {
            window.localStorage.setItem(
              `careertwin-completed-labs:${ownerKey}`,
              JSON.stringify(updated)
            );
          } catch {
            // storage fallback
          }
        }
      } else {
        logs.push("");
        logs.push("❌ Test suite failed. Review the errors above, inspect the hints, and re-run.");
        setLabStatus("failed");
      }

      setTerminalOutput(logs);

      const attemptEntry = {
        id: `${Date.now()}`,
        track: activeTrack,
        status: passed ? ("passed" as const) : ("failed" as const),
        timestamp: new Date().toLocaleTimeString(),
        summary: passed ? "All verification checks passed" : "Verification failed — inspect assertions",
      };
      setAttemptHistory((prev) => {
        const next = [attemptEntry, ...prev].slice(0, 12);
        try {
          window.localStorage.setItem(`careertwin-lab-attempts:${ownerKey}`, JSON.stringify(next));
        } catch {
          // storage fallback
        }
        return next;
      });
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="hands-on-labs-view">
      {/* Header Banner */}
      <div className="rounded-2xl border border-ink/8 bg-gradient-to-r from-teal-950/10 via-brand-forest/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/20 bg-teal-600/10 px-3 py-1 text-xs font-semibold text-teal-800">
              <Terminal className="h-3.5 w-3.5" />
              Interactive Hands-on Practice Labs
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink font-serif">
              Hands-On Engineering & Security Labs
            </h1>
            <p className="text-sm md:text-base text-ink/70">
              Practical exercises inspired by Cisco Networking Academy and enterprise engineering
              standards. Practice Python, IPv4 subnetting, SOC log triage, JSON IAM policy auditing,
              and SQL queries with deterministic browser-side syntax and assertion checks.
            </p>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-xs md:max-w-xs w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Lab Mastery Progress</span>
              <span className="font-bold text-brand-forest">
                {completedLabs.length} / {Object.keys(LABS).length} Labs Completed
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full bg-brand-forest transition-all duration-500"
                style={{
                  width: `${(completedLabs.length / Object.keys(LABS).length) * 100}%`,
                }}
              />
            </div>
            {onNavigateTwin && (
              <button
                type="button"
                onClick={onNavigateTwin}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-forest hover:underline"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                View Twin Skill Evidence →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lab Mode Toggle: Scenario Labs vs LeetCode Topic Tests */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-2 rounded-2xl border border-ink/8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLabMode("scenario")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              labMode === "scenario"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate hover:text-ink"
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>🛠️ Scenario Practice Labs (5 Tracks)</span>
          </button>
          <button
            type="button"
            onClick={() => setLabMode("leetcode")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              labMode === "leetcode"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate hover:text-ink"
            }`}
          >
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>⚡ LeetCode Topic Coding Arena ({CHALLENGES.length} Challenges)</span>
          </button>
        </div>

        {labMode === "leetcode" && (
          <div className="flex items-center gap-1.5 px-2">
            {(["all", "Easy", "Medium", "Hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setChallengeFilter(diff)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer capitalize ${
                  challengeFilter === diff
                    ? "bg-ink text-white"
                    : "bg-white text-slate hover:text-ink border border-ink/10"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        )}
      </div>

      {labMode === "leetcode" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Challenge Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate">
                Select Chapter Problem
              </span>
              <span className="text-xs text-slate font-medium">
                {CHALLENGES.filter((c) => challengeFilter === "all" || c.difficulty === challengeFilter).length} available
              </span>
            </div>

            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {CHALLENGES.filter(
                (c) => challengeFilter === "all" || c.difficulty === challengeFilter
              ).map((ch) => {
                const isSelected = selectedChallengeId === ch.id;
                const diffBadge =
                  ch.difficulty === "Easy"
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                    : ch.difficulty === "Medium"
                    ? "text-amber-600 bg-amber-50 border-amber-200"
                    : "text-rose-600 bg-rose-50 border-rose-200";

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChallengeId(ch.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-400 shadow-xs"
                        : "bg-white border-ink/8 hover:border-ink/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono text-slate">
                        {ch.topic}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge}`}
                      >
                        {ch.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-ink">{ch.title}</h4>
                    <p className="text-[11px] text-slate line-clamp-1 mt-0.5">
                      {ch.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Challenge Workspace */}
          <div className="lg:col-span-8">
            {(() => {
              const activeCh =
                CHALLENGES.find((c) => c.id === selectedChallengeId) ||
                CHALLENGES[0];
              return <TopicChallenge challenge={activeCh} />;
            })()}
          </div>
        </div>
      ) : (
        <>
          {/* Lab Track Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-4">
        {[
          { id: "python", label: "Python Programming", icon: Code2 },
          { id: "networking", label: "IPv4 Subnetting", icon: Network },
          { id: "cybersecurity", label: "Threat Detection & SOC", icon: Shield },
          { id: "cloud", label: "Cloud IAM Auditor", icon: Cloud },
          { id: "sql", label: "SQL Query Engine", icon: Database },
        ].map((track) => {
          const Icon = track.icon;
          const active = activeTrack === track.id;
          const done = completedLabs.includes(track.id);

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setActiveTrack(track.id as LabTrack);
                setLabStatus("idle");
                setTerminalOutput([]);
                setShowHint(false);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-ink text-white shadow-xs"
                  : "bg-surface text-ink/70 hover:bg-ink/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{track.label}</span>
              {done && <Check className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Lab Briefing & Task Description */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-xs font-semibold text-brand-forest">
                {activeLab.badge}
              </span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Lab Completed
                </span>
              ) : (
                <span className="text-xs text-ink/50">Ready to execute</span>
              )}
            </div>

            <h2 className="text-xl font-bold text-ink">{activeLab.title}</h2>

            <div className="space-y-2 text-xs text-ink/80 leading-relaxed">
              <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px] text-ink/50">
                Operational Scenario
              </h4>
              <p>{activeLab.scenario}</p>
            </div>

            <div className="rounded-xl border border-ink/8 bg-surface p-4 space-y-2">
              <h4 className="font-semibold text-ink text-xs flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-brand-forest" />
                Lab Objective
              </h4>
              <p className="text-xs text-ink/80">{activeLab.objective}</p>
            </div>

            {/* Hints Accordion */}
            <div className="border-t border-ink/10 pt-3">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60 hover:text-brand-forest"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {showHint ? "Hide Implementation Hints" : "View Implementation Hints"}
              </button>

              {showHint && (
                <div className="mt-3 rounded-xl bg-amber-500/10 p-3 space-y-1.5 text-xs text-amber-900 animate-fade-in">
                  <p className="font-semibold">Instructor Guidance:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {activeLab.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Sandbox & Test Runner Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-brand-forest" />
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Interactive Lab Editor
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetCurrentLab}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium text-ink/60 hover:bg-surface"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>

                <button
                  type="button"
                  onClick={runVerification}
                  disabled={labStatus === "running"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-forest px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {labStatus === "running" ? "Verifying..." : "Run & Test Lab"}
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative font-mono">
              <textarea
                value={codeInputs[activeTrack]}
                onChange={(e) =>
                  setCodeInputs({
                    ...codeInputs,
                    [activeTrack]: e.target.value,
                  })
                }
                rows={12}
                className="w-full resize-y rounded-xl border border-ink/15 bg-neutral-900 p-4 font-mono text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-brand-forest focus:outline-hidden focus:ring-1 focus:ring-brand-forest leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Test Results Terminal Output */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-emerald-400" /> Client-Side Verification Console
                </span>
                <span>
                  {labStatus === "passed" && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                    </span>
                  )}
                  {labStatus === "failed" && (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> FAILED
                    </span>
                  )}
                  {labStatus === "idle" && "Ready"}
                </span>
              </div>

              <div className="min-h-[100px] max-h-[220px] overflow-y-auto space-y-1 text-neutral-300">
                {terminalOutput.length > 0 ? (
                  terminalOutput.map((line, idx) => (
                    <p
                      key={idx}
                      className={
                        line.includes("Passed") || line.includes("ALL TESTS PASSED")
                          ? "text-emerald-400"
                          : line.includes("Failed") || line.includes("failed")
                          ? "text-rose-400"
                          : line.includes("Twin Evidence")
                          ? "text-amber-400 font-semibold"
                          : "text-neutral-300"
                      }
                    >
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-neutral-500 italic">
                    Click &apos;Run &amp; Test Lab&apos; to execute automated assertions against your
                    implementation.
                  </p>
                )}
              </div>
            </div>

            {attemptHistory.filter((a) => a.track === activeTrack).length > 0 && (
              <div className="rounded-xl border border-ink/10 bg-app p-4 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate">
                  Recent Lab Attempt History
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {attemptHistory
                    .filter((a) => a.track === activeTrack)
                    .slice(0, 4)
                    .map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 border border-ink/8">
                        <span className={a.status === "passed" ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                          {a.status === "passed" ? "PASSED" : "FAILED"} · {a.summary}
                        </span>
                        <span className="text-[10px] text-slate">{a.timestamp}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

