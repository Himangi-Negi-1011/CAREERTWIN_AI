import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockExamsHubView, MOCK_EXAMS } from "@/app/components/dashboard/mock-exams-hub";

describe("MockExamsHubView", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders mock exams catalogue and supports launching timed exam", () => {
    render(<MockExamsHubView ownerKey="test-user" />);

    expect(screen.getByTestId("mock-exams-hub-view")).toBeInTheDocument();
    expect(screen.getByText(/Timed Mock Exams & Certification Checkpoints/i)).toBeInTheDocument();
    expect(screen.getByText(/Python Foundations & Execution Mechanics/i)).toBeInTheDocument();

    const startButtons = screen.getAllByRole("button", { name: /Take Timed Exam/i });
    fireEvent.click(startButtons[0]);

    // Should switch to exam mode with timer and questions
    expect(screen.getByRole("button", { name: /Submit Exam/i })).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
  });

  it("completes exam, grades answers, and shows topic diagnostic breakdown", () => {
    render(<MockExamsHubView ownerKey="test-user" />);

    const startButtons = screen.getAllByRole("button", { name: /Take Timed Exam/i });
    fireEvent.click(startButtons[0]);

    // Answer questions
    const firstOption = screen.getByText(/Compiles source code into bytecode/i);
    fireEvent.click(firstOption);

    // Submit exam
    fireEvent.click(screen.getByRole("button", { name: /Submit Exam/i }));

    expect(screen.getByText(/Topic Diagnostic Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Detailed Question Review & Explanations/i)).toBeInTheDocument();

    const attempts = window.localStorage.getItem("careertwin-mock-exam-attempts:test-user");
    expect(attempts).toBeDefined();
  });
});
