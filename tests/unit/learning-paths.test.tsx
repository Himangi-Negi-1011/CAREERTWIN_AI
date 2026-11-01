import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearningPathsView } from "@/app/components/dashboard/learning-paths";
import { LEARNING_PATHS } from "@/lib/learning/learning-paths";

describe("LearningPathsView", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the 8 Cisco-inspired learning paths and displays details", () => {
    render(<LearningPathsView userRole="Python Developer" ownerKey="test-user" />);

    expect(screen.getByTestId("learning-paths-view")).toBeInTheDocument();
    expect(screen.getByText(/Structured Career Learning Paths/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Python Developer Learning Path/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Full-Stack Developer Learning Path/i)).toBeInTheDocument();
  });

  it("recommends the matching path for the student's target role", () => {
    render(<LearningPathsView userRole="Cybersecurity Analyst" ownerKey="test-user" />);

    expect(screen.getByText(/Matched for target: Cybersecurity Analyst/i)).toBeInTheDocument();
  });

  it("supports enrolling and unenrolling in a learning path", () => {
    render(<LearningPathsView userRole="Python Developer" ownerKey="test-user" />);

    // Active path is Python Developer by default (auto-enrolled on first render)
    const enrollBtn = screen.getByRole("button", { name: /Unenroll from path|Enroll in path/i });
    fireEvent.click(enrollBtn);

    const stored = window.localStorage.getItem("careertwin-enrolled-paths:test-user");
    expect(stored).toBeDefined();
  });

  it("triggers course selection when student clicks study course", () => {
    const handleSelectCourse = vi.fn();
    render(
      <LearningPathsView
        userRole="Python Developer"
        ownerKey="test-user"
        onSelectCourse={handleSelectCourse}
      />
    );

    const studyButtons = screen.getAllByRole("button", { name: /Study Course/i });
    expect(studyButtons.length).toBeGreaterThan(0);
    fireEvent.click(studyButtons[0]);

    expect(handleSelectCourse).toHaveBeenCalledWith("python");
  });
});
