// Mock server-only so standalone worker script runs in Node.js
import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import { precomputeSkillCourse, precomputeAdvanceLearningLibrary } from "../lib/learning/advance-generator";
import { seededSkills } from "../lib/learning/catalog";

const PILOT_SKILLS = [
  "Python",
  "SQL",
  "Cybersecurity",
  "Cloud Computing",
  "Power BI",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const isPilot = args.includes("--pilot");
  const isAll = args.includes("--all");
  const isResume = args.includes("--resume");
  const isForce = args.includes("--force") || args.includes("--force-regenerate");

  let singleSkill: string | undefined;
  const skillIdx = args.indexOf("--skill");
  if (skillIdx !== -1 && args[skillIdx + 1]) {
    singleSkill = args[skillIdx + 1];
  }

  let limit: number | undefined;
  const limitIdx = args.indexOf("--limit") !== -1 ? args.indexOf("--limit") : args.indexOf("--max-skills");
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    const val = parseInt(args[limitIdx + 1], 10);
    if (!isNaN(val)) limit = val;
  }

  return { isPilot, isAll, isResume, isForce, singleSkill, limit };
}

async function main() {
  const { isPilot, isResume, isForce, singleSkill, limit } = parseArgs();

  console.log("===============================================================================");
  console.log("📚 CAREERTWIN COURSE GENERATION ENGINE");
  console.log("===============================================================================");

  let targetSkills: string[];
  if (singleSkill) {
    targetSkills = [singleSkill];
    console.log(`Targeting single skill: ${singleSkill}`);
  } else if (isPilot) {
    targetSkills = PILOT_SKILLS;
    console.log(`Targeting 5 representative pilot courses: ${PILOT_SKILLS.join(", ")}`);
  } else {
    targetSkills = Array.from(new Set(seededSkills.map((s) => s.canonicalName)));
    console.log(`Targeting all ${targetSkills.length} canonical catalog courses.`);
  }

  if (limit && limit > 0) {
    targetSkills = targetSkills.slice(0, limit);
    console.log(`Applied limit: first ${limit} skills`);
  }

  console.log(`Execution Mode: Resume=${isResume ? "YES" : "NO"}, Force=${isForce ? "YES" : "NO"}`);
  console.log("-------------------------------------------------------------------------------\n");

  const startTime = Date.now();
  let completed = 0;
  let failed = 0;

  for (let i = 0; i < targetSkills.length; i++) {
    const skill = targetSkills[i];
    process.stdout.write(`[${i + 1}/${targetSkills.length}] Generating course materials for: ${skill}... `);
    try {
      const status = await precomputeSkillCourse(skill, "beginner", {
        forceRegenerate: isForce,
        onProgress: () => {},
      });
      if (status.isComplete) {
        completed++;
        process.stdout.write(`✅ COMPLETE (Lessons: ${status.savedLessonsCount}, Tests: ${status.mockTestsCount + status.phaseAssessmentsCount})\n`);
      } else {
        failed++;
        process.stdout.write(`⚠️  INCOMPLETE: ${status.validationErrors.join("; ")}\n`);
      }
    } catch (err) {
      failed++;
      process.stdout.write(`❌ FAILED: ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);

  console.log("\n===============================================================================");
  console.log("🏁 GENERATION RUN SUMMARY");
  console.log("===============================================================================");
  console.log(`Total skills processed:     ${targetSkills.length}`);
  console.log(`Courses successfully ready: ${completed}`);
  console.log(`Courses incomplete/failed:  ${failed}`);
  console.log(`Time elapsed:               ${durationSec}s`);
  console.log(`Files saved to:             content/courses/<skill>/`);
  console.log("===============================================================================\n");

  if (failed > 0 && targetSkills.length === 1) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error during course generation:", err);
  process.exit(1);
});

