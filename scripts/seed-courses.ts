// Mock server-only so standalone worker script runs in Node.js
import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import { listAllCourseSlugs, loadCoursePackage } from "../lib/learning/course-content-store";
import {
  saveCurriculum,
  saveLesson,
  saveMockTest,
  checkDatabaseHealth,
  syncAllLocalToSupabase,
} from "../lib/learning/repository";

async function main() {
  console.log("===============================================================================");
  console.log("💾 CAREERTWIN SUPABASE & DATABASE SEEDING ENGINE");
  console.log("===============================================================================");
  console.log("Reading course packages from content/courses/ and seeding into database...\n");

  const dbHealth = await checkDatabaseHealth();
  console.log(`Database Status: ${dbHealth.connected ? "Connected" : "Disconnected"} (Degraded mode: ${dbHealth.degradedMode ? "YES - Supabase tables pending" : "NO - Synced"})`);
  if (dbHealth.degradedMode) {
    console.log(`Missing tables: ${dbHealth.tablesMissing.join(", ")}`);
    console.log(`Courses will be verified and prepared locally with atomic sync retry ready.`);
  }
  console.log("-------------------------------------------------------------------------------\n");

  const slugs = await listAllCourseSlugs();
  let seededCurricula = 0;
  let seededLessons = 0;
  let seededAssessments = 0;

  for (const slug of slugs) {
    const pkg = await loadCoursePackage(slug);
    if (!pkg) continue;

    process.stdout.write(`Seeding ${pkg.skillName}... `);

    // 1. Seed Curriculum
    const skillId = pkg.curriculum.skillId || `curr-${slug}-beginner`;
    await saveCurriculum(pkg.curriculum, skillId);
    seededCurricula++;

    // 2. Seed Lessons
    for (const lesson of pkg.lessons) {
      await saveLesson(skillId, lesson);
      seededLessons++;
    }

    // 3. Seed Phase Assessments & Mock Tests
    for (const test of [...pkg.phaseAssessments, ...pkg.mockTests]) {
      await saveMockTest(test);
      seededAssessments++;
    }

    process.stdout.write(`✅ (${pkg.lessons.length} lessons, ${pkg.phaseAssessments.length + pkg.mockTests.length} tests)\n`);
  }

  // 4. Trigger bulk sync attempt to Supabase
  console.log("\nAttempting full idempotent sync to Supabase tables...");
  const syncResult = await syncAllLocalToSupabase();

  console.log("\n===============================================================================");
  console.log("📊 SEEDING & PERSISTENCE SUMMARY");
  console.log("===============================================================================");
  console.log(`Total Courses Processed:      ${seededCurricula}`);
  console.log(`Total Lessons Processed:      ${seededLessons}`);
  console.log(`Total Tests & Quizzes:        ${seededAssessments}`);
  console.log(`Supabase Sync Status:         ${syncResult.degradedMode ? "⚠️ DEGRADED MODE (Saved to local durable store)" : "✅ SYNCED TO SUPABASE"}`);
  if (syncResult.degradedMode) {
    console.log(`Database Sync Notice:         Tables missing in Supabase schema cache: ${syncResult.tablesMissing.join(", ")}`);
    console.log(`                              All files are safely persisted in content/courses/ and .data/learning/`);
    console.log(`                              To complete remote table sync, create tables in Supabase SQL editor`);
    console.log(`                              and re-run 'npm run courses:seed'.`);
  } else {
    console.log(`Remote Records Upserted:      Curricula: ${syncResult.curriculaSynced}, Lessons: ${syncResult.lessonsSynced}, Tests: ${syncResult.mockTestsSynced}`);
  }
  console.log("===============================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error during course seeding:", err);
  process.exit(1);
});

