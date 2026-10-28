import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Pip } from "@/app/components/pip";

describe("Pip career guide", () => {
  beforeEach(() => window.localStorage.clear());

  it("recommends choosing a target when no career context exists", async () => {
    render(<Pip />);
    fireEvent.click(screen.getByRole("button", { name: /open pip/i }));
    expect(await screen.findByText(/choose one target role/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /choose a target role/i })).toHaveAttribute("href", "/onboarding");
  });

  it("uses the canonical Career Twin recommendation when secure context is available", async () => {
    const twin = {
      targetRole: "Data Analyst",
      recommendedNextAction: { title: "Practise SQL joins", detail: "Complete the saved SQL joins task before reassessing.", destination: "/dashboard?view=roadmap" },
    } as never;
    const twinSource = {
      evidence: { "Data Analyst": { records: { SQL: { status: "learning", evidence: "Built a reporting query." } }, customSkills: [] } },
    } as never;

    render(<Pip twin={twin} twinSource={twinSource} />);
    fireEvent.click(screen.getByRole("button", { name: /open pip/i }));
    expect(await screen.findByText(/complete the saved sql joins task/i)).toBeInTheDocument();
    expect(screen.getByText(/uses your secure career twin/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /practise sql joins/i })).toHaveAttribute("href", "/dashboard?view=roadmap");
  });

  it("uses saved evidence without inventing an AI score", async () => {
    window.localStorage.setItem("careertwin-role-draft", "Frontend Developer");
    window.localStorage.setItem("careertwin-skill-evidence-v1", JSON.stringify({
      "Frontend Developer": { records: { "Semantic HTML": { status: "demonstrated", evidence: "Built an accessible portfolio." } }, customSkills: [] },
    }));

    render(<Pip />);
    fireEvent.click(screen.getByRole("button", { name: /open pip/i }));
    await waitFor(() => expect(screen.getByText(/1 evidence note recorded/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /is this an ai score/i }));
    expect(screen.getByText(/generative ai advice is not enabled/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue evidence review/i })).toHaveAttribute("href", "/dashboard?view=skills");
  });
});
