import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CareerWorkspace } from "@/app/components/dashboard/workspace";
import { emptyCareerProfile } from "@/lib/profile/schema";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { id: "test-user" }, isLoaded: true }),
  UserButton: () => <button type="button">Account menu</button>,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams(window.location.search) }));

describe("CareerWorkspace", () => {
  beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, "", "/dashboard"); });
  afterEach(() => vi.unstubAllGlobals());

  it("shows an honest setup action when no career data exists", () => {
    render(<CareerWorkspace />);
    expect(screen.getByRole("heading", { name: /choose the role you want/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /choose a career/i })).toHaveAttribute("href", "/onboarding");
    expect(screen.getByText(/no score until assessed/i)).toBeInTheDocument();
  });

  it("records an evidence-backed skill review locally", async () => {
    window.localStorage.setItem("careertwin-role-draft", "Frontend Developer");
    render(<CareerWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Skill Gap Analysis" }));

    expect(await screen.findByRole("heading", { name: /document what you can show/i }, { timeout: 5000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Can demonstrate" }));
    fireEvent.change(screen.getByLabelText(/evidence or next proof point/i), { target: { value: "Built and tested a semantic portfolio page." } });
    fireEvent.click(screen.getByRole("button", { name: /save evidence/i }));

    expect(screen.getByText(/unsaved changes remain a browser draft/i)).toBeInTheDocument();
    expect(window.localStorage.getItem("careertwin-role-draft:test-user")).toBe("Frontend Developer");
    expect(window.localStorage.getItem("careertwin-role-draft")).toBeNull();
    expect(window.localStorage.getItem("careertwin-skill-evidence-v1:test-user")).toContain("Built and tested a semantic portfolio page.");
  });

  it("uses a saved local role without inventing skill results", async () => {
    window.localStorage.setItem("careertwin-role-draft", "Frontend Developer");
    render(<CareerWorkspace />);
    expect(await screen.findAllByText("Frontend Developer", {}, { timeout: 5000 })).not.toHaveLength(0);
    expect(screen.getByText("Not reviewed")).toBeInTheDocument();
  });

  it("turns saved evidence and progress into a connected next action", async () => {
    window.localStorage.setItem("careertwin-role-draft:test-user", "Frontend Developer");
    window.localStorage.setItem("careertwin-profile-wizard:test-user", JSON.stringify({ ...emptyCareerProfile, resume: { fileName: "reviewed-resume.pdf", size: 1000, status: "uploaded", storagePath: "test-user/reviewed-resume.pdf" } }));
    window.localStorage.setItem("careertwin-skill-evidence-v1:test-user", JSON.stringify({ "Frontend Developer": { records: { "Semantic HTML": { status: "demonstrated", evidence: "Built a keyboard-accessible portfolio." } }, customSkills: [] } }));
    window.localStorage.setItem("careertwin-development-v1:test-user", JSON.stringify({ tasks: [{ id: "task-1", title: "Publish the accessibility case study", detail: "", done: false, createdAt: new Date().toISOString() }], projects: [{ id: "project-1", title: "Portfolio", outcome: "", status: "building", createdAt: new Date().toISOString() }], practice: [] }));

    render(<CareerWorkspace />);

    expect(await screen.findByRole("heading", { name: "Publish the accessibility case study" }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText("1 reviewed · 1 with evidence")).toBeInTheDocument();
    expect(screen.getByText("reviewed-resume.pdf")).toBeInTheDocument();
    expect(screen.getByText("0/1 steps complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /continue this task/i }));
    expect(await screen.findByRole("heading", { name: /turn a career goal into small, verifiable steps/i }, { timeout: 5000 })).toBeInTheDocument();
  });

  it("opens a query-linked workspace destination instead of leaving the link on the dashboard", async () => {
    window.history.replaceState({}, "", "/dashboard?view=progress");
    render(<CareerWorkspace />);
    expect(await screen.findByRole("heading", { name: /plan a week you can actually finish/i }, { timeout: 5000 })).toBeInTheDocument();
  });

  it("hydrates canonical Twin data before mounting a mutable workspace module", async () => {
    window.history.replaceState({}, "", "/dashboard?view=roadmap");
    window.localStorage.setItem("careertwin-development-v1:test-user", JSON.stringify({ tasks: [{ id: "stale", title: "Stale browser task", detail: "", done: false, createdAt: "" }], projects: [], practice: [] }));
    let resolveTwin: ((value: Response) => void) | undefined;
    const twinResponse = new Promise<Response>((resolve) => { resolveTwin = resolve; });
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => String(input).includes("/api/twin") ? twinResponse : Promise.resolve(new Response(JSON.stringify({ data: null }), { status: 200 }))));

    render(<CareerWorkspace />);
    expect(await screen.findByLabelText(/loading workspace module/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByText("Stale browser task")).not.toBeInTheDocument();

    await act(async () => resolveTwin?.(new Response(JSON.stringify({ data: {
      source: { evidence: {}, development: { tasks: [{ id: "canonical", title: "Canonical saved task", detail: "", done: false, createdAt: "" }], projects: [], practice: [] }, weekly: { settings: { hours: 5, sessionMinutes: 45, days: ["Tue"] }, activities: [], attempts: [] }, assessmentEvidence: {} },
      twin: { targetRole: "Frontend Developer", recommendedNextAction: { title: "Continue roadmap", detail: "Continue the saved task.", destination: "/dashboard?view=roadmap" } },
    } }), { status: 200 })));

    expect(await screen.findByText("Canonical saved task", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByText("Stale browser task")).not.toBeInTheDocument();
  });

  it("opens tools quickly through the keyboard-friendly command palette", async () => {
    render(<CareerWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: /open quick navigation/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /search workspace/i }), { target: { value: "interview" } });
    fireEvent.click(screen.getByRole("button", { name: /AI Career Coach.*practise interviews with text/i }));

    expect(await screen.findByRole("heading", { name: /walk me through your background/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /quick navigation/i })).not.toBeInTheDocument();
  });
});
