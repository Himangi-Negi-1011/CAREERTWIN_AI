import { describe, expect, it } from "vitest";
import {
  generateVerificationId,
  issueAchievement,
  getAchievementById,
} from "@/lib/career/achievements";

describe("Career Achievements & Verification (Phase 7)", () => {
  it("issues authentic verification records with unique IDs and clear non-accreditation disclaimers", async () => {
    const id = generateVerificationId();
    expect(id).toMatch(/^CT-VERIFY-[A-Z0-9]{8}$/);

    const record = await issueAchievement({
      userId: `achieve-user-${Date.now()}`,
      studentName: "Pooja Mehta",
      title: "Verified Skill: SQL & Relational Databases",
      category: "phase_assessment",
      courseOrAssessment: "SQL Certification Exam",
      skills: ["SQL", "Relational Schema", "Aggregation", "Window Functions"],
      score: 88,
    });

    expect(record.id).toMatch(/^CT-VERIFY-[A-Z0-9]{8}$/);
    expect(record.studentName).toBe("Pooja Mehta");
    expect(record.issuingOrganization).toBe("CareerTwin AI");
    expect(record.disclaimer).toContain("CareerTwin");
    expect(record.disclaimer).toContain("does not constitute an accredited university degree");

    // Lookup on ledger
    const retrieved = await getAchievementById(record.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(record.id);
    expect(retrieved?.score).toBe(88);
  });
});

