// Mock server-only so standalone worker script runs in Node.js
import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import { precomputeAdvanceLearningLibrary } from "../lib/learning/advance-generator";
import { seededSkills } from "../lib/learning/catalog";

async function main() {
  console.log("=========================================================");
  console.log("🚀 CAREERTWIN ADVANCE LEARNING LIBRARY PRECOMPUTATION");
  console.log("=========================================================");
  console.log(`Discovered ${seededSkills.length} skills across all domains in the catalog.`);

  const startTime = Date.now();

  const report = await precomputeAdvanceLearningLibrary({
    onProgress: (skill, cur, total) => {
      console.log(`[${cur}/${total}] Processing course materials & mock tests for: ${skill}`);
    },
  });

  const durationSec = Math.round((Date.now() - startTime) / 1000);

  console.log("\n=========================================================");
  console.log("✅ ADVANCE GENERATION & SEEDING COMPLETE");
  console.log("=========================================================");
  console.log(`Total skills processed: ${report.skills.length}`);
  console.log(`Ready courses: ${report.completedCoursesCount}`);
  console.log(`Incomplete courses: ${report.incompleteCoursesCount}`);
  console.log(`Total Curricula in repository: ${report.totalCurricula}`);
  console.log(`Total Lessons in repository: ${report.totalLessons}`);
  console.log(`Total Mock Tests in repository: ${report.totalMockTests}`);
  console.log(`Time elapsed: ${durationSec}s`);
  console.log("=========================================================");

  if (report.incompleteCoursesCount > 0) {
    console.warn("Some skills had validation warnings:");
    for (const s of report.skills.filter((sk) => !sk.isComplete)) {
      console.warn(`- ${s.skillName}: ${s.validationErrors.join("; ")}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error during course seeding:", err);
  process.exit(1);
});
