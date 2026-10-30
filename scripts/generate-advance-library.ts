// Mock server-only so standalone worker script runs in Node.js
import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import { precomputeAdvanceLearningLibrary } from "../lib/learning/advance-generator";
import { seededSkills } from "../lib/learning/catalog";

// CLI Arguments parser
function parseArgs() {
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const isResume = args.includes("--resume");
  const isValidateOnly = args.includes("--validate-only");
  const isRetryFailed = args.includes("--retry-failed");
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

  return { isAll, isResume, isValidateOnly, isRetryFailed, isForce, singleSkill, limit };
}

async function main() {
  const { isResume, isValidateOnly, isRetryFailed, isForce, singleSkill, limit } = parseArgs();

  console.log("===============================================================================");
  console.log("🚀 CAREERTWIN ADVANCE LEARNING LIBRARY PRECOMPUTATION & SEEDING");
  console.log("===============================================================================");
  console.log(`Discovered ${seededSkills.length} canonical catalog entries across all 14 domains.`);
  console.log(`Execution Mode:`);
  console.log(`  - Resume previously complete courses:  ${isResume ? "YES" : "NO"}`);
  console.log(`  - Validate Only:                       ${isValidateOnly ? "YES" : "NO"}`);
  console.log(`  - Force Regenerate:                    ${isForce ? "YES" : "NO"}`);
  console.log(`  - Retry Failed Only:                   ${isRetryFailed ? "YES" : "NO"}`);
  if (singleSkill) {
    console.log(`  - Target Single Skill:                 ${singleSkill}`);
  }
  if (limit) {
    console.log(`  - Max Skills Limit:                    ${limit}`);
  }
  console.log("-------------------------------------------------------------------------------\n");

  const startTime = Date.now();

  const report = await precomputeAdvanceLearningLibrary({
    skillsList: singleSkill ? [singleSkill] : undefined,
    resume: isResume,
    validateOnly: isValidateOnly,
    forceRegenerate: isForce,
    retryFailed: isRetryFailed,
    maxSkills: limit,
    onProgress: (skill, cur, total, message) => {
      const extra = message ? ` -> ${message}` : "";
      console.log(`[${cur}/${total}] ${skill}${extra}`);
    },
  });

  const durationSec = Math.round((Date.now() - startTime) / 1000);

  console.log("\n===============================================================================");
  console.log("✅ ADVANCE GENERATION & SEEDING FINISHED");
  console.log("===============================================================================");
  console.log(`Total skills evaluated:             ${report.skills.length}`);
  console.log(`Ready courses:                      ${report.completedCoursesCount}`);
  console.log(`Incomplete courses:                 ${report.incompleteCoursesCount}`);
  console.log(`Total Curricula in repository:      ${report.totalCurricula}`);
  console.log(`Total Lessons in repository:        ${report.totalLessons}`);
  console.log(`Total Mock Tests in repository:     ${report.totalMockTests}`);
  console.log(`Time elapsed:                       ${durationSec}s`);
  console.log("===============================================================================");

  if (report.incompleteCoursesCount > 0) {
    console.warn("\n⚠️  Skills with validation warnings or missing items:");
    for (const s of report.skills.filter((sk) => !sk.isComplete).slice(0, 15)) {
      console.warn(` - ${s.skillName}: ${s.validationErrors.join("; ")}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error during course seeding:", err);
  process.exit(1);
});
