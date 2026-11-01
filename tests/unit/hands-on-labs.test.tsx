import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HandsOnLabsView } from "@/app/components/dashboard/hands-on-labs";

describe("HandsOnLabsView", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the 5 practical lab tracks and scenario briefing", () => {
    render(<HandsOnLabsView ownerKey="test-user" />);

    expect(screen.getByTestId("hands-on-labs-view")).toBeInTheDocument();
    expect(screen.getByText("Python Programming")).toBeInTheDocument();
    expect(screen.getByText("IPv4 Subnetting")).toBeInTheDocument();
    expect(screen.getByText("Threat Detection & SOC")).toBeInTheDocument();
    expect(screen.getByText("Cloud IAM Auditor")).toBeInTheDocument();
    expect(screen.getByText("SQL Query Engine")).toBeInTheDocument();
  });

  it("runs automated test verification on Python lab and marks verified", async () => {
    render(<HandsOnLabsView ownerKey="test-user" />);

    const runBtn = screen.getByRole("button", { name: /Run & Test Lab/i });
    fireEvent.click(runBtn);

    await waitFor(
      () => {
        expect(screen.getByText(/ALL TESTS PASSED!/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const saved = window.localStorage.getItem("careertwin-completed-labs:test-user");
    expect(saved).toContain("python");
  });

  it("switches to IPv4 Subnetting and executes diagnostic assertions", async () => {
    render(<HandsOnLabsView ownerKey="test-user" />);

    fireEvent.click(screen.getByRole("button", { name: /IPv4 Subnetting/i }));
    expect(screen.getByText(/IPv4 Subnetting & Network Diagnostics/i)).toBeInTheDocument();

    const runBtn = screen.getByRole("button", { name: /Run & Test Lab/i });
    fireEvent.click(runBtn);

    await waitFor(
      () => {
        expect(screen.getByText(/Mask matches 255.255.255.192/i)).toBeInTheDocument();
        expect(screen.getByText(/ALL TESTS PASSED!/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});

