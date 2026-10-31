// Mock server-only so standalone audit runner runs in Node.js
import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import { runLearningLibraryAudit, saveAuditReportFiles } from "../lib/learning/audit-engine";

async function main() {
  console.log("===============================================================================");
  console.log("🔍 CAREERTWIN PROJECT COURSE CONTENT AUDIT");
  console.log("===============================================================================");
  console.log("Auditing canonical courses, lessons, tests, and persistence integrity...\n");

  const startTime = Date.now();

  const report = await runLearningLibraryAudit({
    onProgress: (cur, total, skill) => {
      if (cur % 30 === 0 || cur === total || cur === 1) {
        process.stdout.write(`...Audited [${cur}/${total}] ${skill}\n`);
      }
    },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const files = await saveAuditReportFiles(report);

  console.log("\n===============================================================================");
  console.log("📊 AUDIT SUMMARY & READINESS METRICS");
  console.log("===============================================================================");
  console.log(`Timestamp:                          ${report.timestamp}`);
  console.log(`Audit Duration:                     ${durationSec}s`);
  console.log(`Unique Canonical Skills Audited:    ${report.skillsAudited}`);
  console.log(`Skills with Complete Curriculum:    ${report.skillsWithCurriculum}/${report.skillsAudited}`);
  console.log(`Skills with All Planned Lessons:    ${report.skillsWithAllPlannedLessons}/${report.skillsAudited}`);
  console.log(`Skills with Validated Lessons:      ${report.skillsWithValidatedLessons}/${report.skillsAudited}`);
  console.log(`Skills with Complete Assessments:   ${report.skillsWithAllAssessments}/${report.skillsAudited}`);
  console.log(`-------------------------------------------------------------------------------`);
  console.log(`FULLY READY SKILLS:                 ${report.fullyReadySkillsCount} / ${report.skillsAudited} (${report.overallReadinessPercentage}%)`);
  console.log(`INCOMPLETE SKILLS:                  ${report.incompleteSkillsCount} / ${report.skillsAudited}`);
  console.log(`-------------------------------------------------------------------------------`);
  console.log(`Total Curricula in Store:           ${report.totalCurricula}`);
  console.log(`Total Lessons in Store:             ${report.totalLessons}`);
  console.log(`Total Phase Assessments in Store:   ${report.totalPhaseAssessments}`);
  console.log(`Total Skill Mock Tests in Store:    ${report.totalMockTests}`);
  console.log(`Total Assessment Questions:         ${report.totalQuestions}`);
  console.log(`-------------------------------------------------------------------------------`);
  console.log(`External Learning Resources:`);
  console.log(`  - Curated (fixed audit date):     ${report.resourceBreakdown.curated}`);
  console.log(`  - Live Verified:                  ${report.resourceBreakdown.verified}`);
  console.log(`-------------------------------------------------------------------------------`);
  console.log(`Database Health & Persistence:`);
  console.log(`  - Persistence Mode:               ${report.databaseHealth.degradedMode ? "⚠️ DEGRADED (Local atomic storage active)" : "✅ SYNCED (Supabase)"}`);
  console.log(`  - Supabase Connected:             ${report.databaseHealth.connected ? "YES" : "NO"}`);
  console.log("===============================================================================");

  console.log("\n📁 DOMAIN READINESS BREAKDOWN:");
  console.log("-------------------------------------------------------------------------------");
  console.log(
    "Domain".padEnd(28) +
      "Skills".padEnd(12) +
      "Ready".padEnd(10) +
      "Curricula".padEnd(12) +
      "Lessons".padEnd(10) +
      "Assessments"
  );
  console.log("-------------------------------------------------------------------------------");
  for (const [domain, stats] of Object.entries(report.summaryByDomain)) {
    console.log(
      domain.padEnd(28) +
        `${stats.totalSkills}`.padEnd(12) +
        `${stats.readySkills}`.padEnd(10) +
        `${stats.curriculaCount}`.padEnd(12) +
        `${stats.lessonsCount}`.padEnd(10) +
        `${stats.assessmentsCount}`
    );
  }
  console.log("-------------------------------------------------------------------------------");

  console.log("\n📄 ARTIFACT REPORTS GENERATED:");
  console.log(` - JSON: ${files.jsonPath}`);
  console.log(` - CSV:  ${files.csvPath}`);
  console.log("===============================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error during course audit:", err);
  process.exit(1);
});

