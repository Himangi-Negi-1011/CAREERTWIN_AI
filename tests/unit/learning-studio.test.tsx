import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LearningStudio } from "@/app/components/dashboard/learning-studio";

afterEach(() => vi.unstubAllGlobals());

describe("Learning Studio", () => {
  it("searches the real catalog and does not claim draft content is approved", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("/api/learning/skills")) return new Response(JSON.stringify({ data: { skills: [{ id: "skill-1", canonicalName: "Python", domain: "Software Development", description: "Python", difficulty: "foundation", reviewStatus: "draft" }], registration: null } }), { status: 200 });
      return new Response(JSON.stringify({ data: { state: "awaiting-review", curriculum: { skillName: "Python", learnerLevel: "foundation", prerequisites: [], objectives: [{ id: "python-basics", statement: "Explain Python basics" }], modules: [{ id: "foundations", title: "Foundations", summary: "Learn and apply the foundations safely.", estimatedMinutes: 90, lessonTitles: ["Values"], checkpoint: "Complete a reviewed exercise." }], projects: ["Build a small program"], proficiencyCriteria: ["Explain the basics", "Complete reviewed practical evidence"], generationMode: "ai-draft", reviewStatus: "draft" } } }), { status: 202 });
    }));
    render(<LearningStudio role="Software Developer"/>);
    fireEvent.change(screen.getByLabelText(/skill or learning goal/i), { target: { value: "Python" } });
    const option = await screen.findByRole("button", { name: /Python.*Software Development.*draft/i }, { timeout: 5000 });
    fireEvent.click(option);
    fireEvent.click(screen.getByRole("button", { name: /prepare path/i }));
    expect(await screen.findByRole("heading", { name: /Python · foundation/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/not yet labelled approved learning content/i)).toBeInTheDocument();
    expect(screen.getByText("Review required")).toBeInTheDocument();
  });

  it("reports missing providers honestly instead of returning fake lessons", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => String(input).includes("/api/learning/skills")
      ? new Response(JSON.stringify({ data: { skills: [{ id: "skill-1", canonicalName: "Python", domain: "Software Development", description: "Python", difficulty: "foundation", reviewStatus: "draft" }] } }), { status: 200 })
      : new Response(JSON.stringify({ error: { message: "Curriculum generation is unavailable until a supported server-side AI provider is configured." } }), { status: 503 })));
    render(<LearningStudio role=""/>);
    fireEvent.change(screen.getByLabelText(/skill or learning goal/i), { target: { value: "Python" } });
    fireEvent.click(await screen.findByRole("button", { name: /Python.*Software Development.*draft/i }, { timeout: 5000 }));
    fireEvent.click(screen.getByRole("button", { name: /prepare path/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/provider is configured/i));
    expect(screen.queryByText(/learning objectives/i)).not.toBeInTheDocument();
  });
});
