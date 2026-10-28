import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DevelopmentHub } from "@/app/components/dashboard/development-hub";

const baseProps = { role: "Policy Analyst", ownerKey: "user-domain-1", onOpen: () => undefined } as const;

describe("DevelopmentHub", () => {
  beforeEach(() => window.localStorage.clear());

  it("creates and completes a role-aware learning plan", async () => {
    render(<DevelopmentHub {...baseProps} view="roadmap" />);
    fireEvent.click(await screen.findByRole("button", { name: /add starter plan/i }));
    expect(screen.getByText(/map the core expectations for policy analyst/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Mark complete" })[0]);
    expect(window.localStorage.getItem("careertwin-development-v1:user-domain-1")).toContain('"done":true');
  });

  it("records a project with an explicit outcome and status", async () => {
    render(<DevelopmentHub {...baseProps} view="projects" />);
    fireEvent.change(await screen.findByLabelText(/project title/i), { target: { value: "Community needs brief" } });
    fireEvent.change(screen.getByLabelText(/outcome and evidence/i), { target: { value: "Summarise public feedback and document the method." } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(screen.getByRole("heading", { name: "Community needs brief" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "complete" } });
    expect(window.localStorage.getItem("careertwin-development-v1:user-domain-1")).toContain('"status":"complete"');
  });

  it("saves an interview reflection without inventing an AI score", async () => {
    render(<DevelopmentHub {...baseProps} view="interviews" />);
    await screen.findByRole("heading", { name: /walk me through your background/i });
    fireEvent.change(screen.getByLabelText(/answer transcript or notes/i), { target: { value: "I connected a policy research project to the role." } });
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.change(screen.getByLabelText(/reflection note/i), { target: { value: "Use a clearer result at the end." } });
    fireEvent.click(screen.getByRole("button", { name: /save practice/i }));

    expect(screen.getByText(/practice saved as a browser draft/i)).toBeInTheDocument();
    expect(window.localStorage.getItem("careertwin-development-v1:user-domain-1")).toContain("Use a clearer result");
    expect(window.localStorage.getItem("careertwin-development-v1:user-domain-1")).toContain("policy research project");
    expect(await screen.findByText(/AI feedback is unavailable until a server-side provider is configured/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request AI feedback/i })).toBeDisabled();
  });

  it("keeps voice recording honest when browser microphone APIs are unavailable", async () => {
    render(<DevelopmentHub {...baseProps} view="interviews" />);
    await screen.findByRole("heading", { name: /walk me through your background/i });
    fireEvent.click(screen.getByRole("button", { name: /start recording/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/not supported in this browser/i);
    expect(screen.getByText(/automatic transcription and AI evaluation are not enabled/i)).toBeInTheDocument();
  });

  it("switches between real interview question sets and difficulty levels", async () => {
    render(<DevelopmentHub {...baseProps} view="interviews" />);
    await screen.findByRole("heading", { name: /walk me through your background/i });
    fireEvent.change(screen.getByLabelText(/interview type/i), { target: { value: "technical" } });
    fireEvent.change(screen.getByLabelText(/^difficulty$/i), { target: { value: "advanced" } });

    expect(screen.getByRole("heading", { name: /approach an unfamiliar technical problem/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^difficulty$/i)).toHaveValue("advanced");
  });

  it("explains safe use and local data handling in the interface", async () => {
    render(<DevelopmentHub {...baseProps} view="guide" />);
    expect(await screen.findByRole("heading", { name: /practical workflow for any career domain/i })).toBeInTheDocument();
    expect(screen.getByText(/stored in this browser and scoped/i)).toBeInTheDocument();
    expect(screen.getByText(/does not verify credentials/i)).toBeInTheDocument();
  });
});
