import { describe, expect, it } from "vitest";
import {
  getUserPortfolio,
  saveUserPortfolio,
  getPublicPortfolioBySlugOrId,
} from "@/lib/career/portfolio-engine";

describe("Student Portfolio Engine & Privacy (Phase 4)", () => {
  const testUserId = `portfolio-user-${Date.now()}`;

  it("defaults to private and protects private data from unauthorized public access", async () => {
    // 1. Save new portfolio (defaults to isPublic: false)
    const portfolio = await saveUserPortfolio(testUserId, {
      name: "Riya Verma",
      headline: "Full-Stack Engineer",
      bio: "Building distributed APIs and React interfaces.",
      targetRole: "Full-Stack Developer",
      links: { github: "https://github.com/riya-verma" },
      privacySettings: { isPublic: false, showEmail: false, showScores: true },
    });

    expect(portfolio.id).toBeDefined();
    expect(portfolio.privacySettings.isPublic).toBe(false);

    // 2. Attempt to fetch via public endpoint when private - must return null!
    const publicAttempt = await getPublicPortfolioBySlugOrId(portfolio.slug);
    expect(publicAttempt).toBeNull();

    // 3. Update to public and verify public visibility
    await saveUserPortfolio(testUserId, {
      privacySettings: { isPublic: true, showEmail: false, showScores: true },
    });

    const publicSuccess = await getPublicPortfolioBySlugOrId(portfolio.slug);
    expect(publicSuccess).not.toBeNull();
    expect(publicSuccess?.name).toBe("Riya Verma");
    expect(publicSuccess?.privacySettings.isPublic).toBe(true);
  });
});

