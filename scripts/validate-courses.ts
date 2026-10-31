// Mock server-only so standalone worker script runs in Node.js
import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import { listAllCourseSlugs, loadCoursePackage } from "../lib/learning/course-content-store";
import { validateCourseCompleteness } from "../lib/learning/advance-generator";
import { validateLessonContentQuality } from "../lib/learning/lesson-service";

async function main() {
  console.log("===============================================================================");
  console.log("🔍 CAREERTWIN PROJECT COURSE CONTENT VALIDATION");
  console.log("===============================================================================");
  console.log("Validating all version-controlled course packages in content/courses/...\n");

  const slugs = await listAllCourseSlugs();
  if (slugs.length === 0) {
    console.warn("⚠️  No course packages found in content/courses/. Run 'npm run courses:generate' first.");
    process.exit(1);
  }

  let validCount = 0;
  let invalidCount = 0;
  const errorDetails: Array<{ slug: string; errors: string[] }> = [];

  for (const slug of slugs) {
    const pkg = await loadCoursePackage(slug);
    if (!pkg) {
      invalidCount++;
      errorDetails.push({ slug, errors: ["Failed to load course package from disk"] });
      continue;
    }

    const errors: string[] = [];

    // 1. Course completeness
    const allTests = [...pkg.phaseAssessments, ...pkg.mockTests];
    const completeness = validateCourseCompleteness(pkg.curriculum, pkg.lessons, allTests);
    if (!completeness.valid) {
      errors.push(...completeness.errors);
    }

    // 2. Individual lesson quality & subject specificity
    for (const lesson of pkg.lessons) {
      const q = validateLessonContentQuality(lesson);
      if (!q.valid) {
        errors.push(`Lesson ${lesson.lessonId}: ${q.issues.join(", ")}`);
      }
    }

    // 3. Module phase assessment check
    for (const mod of pkg.curriculum.modules) {
      const hasAssessment = pkg.phaseAssessments.some(
        (a) => a.moduleId === mod.id || a.id.includes(mod.id)
      );
      if (!hasAssessment) {
        errors.push(`Missing phase assessment for module ${mod.title}`);
      }
    }

    // 4. Mock test duplicate check
    for (const test of pkg.mockTests) {
      const set = new Set<string>();
      for (const q of test.questions) {
        if (set.has(q.prompt)) {
          errors.push(`Mock test ${test.id} contains duplicate prompt: '${q.prompt.slice(0, 30)}...'`);
          break;
        }
        set.add(q.prompt);
      }
    }

    if (errors.length === 0) {
      validCount++;
      console.log(`✅ [VALID] ${pkg.skillName.padEnd(25)} (${pkg.lessons.length} lessons, ${pkg.phaseAssessments.length} phase tests, ${pkg.mockTests.length} mock tests)`);
    } else {
      invalidCount++;
      console.log(`❌ [INVALID] ${pkg.skillName.padEnd(25)} (${errors.length} issues)`);
      errorDetails.push({ slug, errors });
    }
  }

  console.log("\n===============================================================================");
  console.log("📊 VALIDATION SUMMARY");
  console.log("===============================================================================");
  console.log(`Total packages evaluated:  ${slugs.length}`);
  console.log(`Valid production courses:  ${validCount}`);
  console.log(`Invalid / broken courses:  ${invalidCount}`);
  console.log("===============================================================================");

  if (invalidCount > 0) {
    console.log("\n⚠️  DETAILED ISSUES:");
    for (const item of errorDetails) {
      console.log(`\n• ${item.slug}:`);
      for (const err of item.errors) {
        console.log(`   - ${err}`);
      }
    }
    process.exit(1);
  } else {
    console.log("\n🎉 All course packages in content/courses/ passed 100% schema and quality validation!\n");
  }
}

main().catch((err) => {
  console.error("Fatal error during course validation:", err);
  process.exit(1);
});

