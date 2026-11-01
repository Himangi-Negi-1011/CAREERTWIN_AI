import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BeginnerGuide } from "@/app/components/dashboard/beginner-guide";

describe("BeginnerGuide", () => {
  it("renders the student onboarding guide with the 7 core questions", () => {
    render(
      <BeginnerGuide
        userRole="Cybersecurity Analyst"
        onNavigatePaths={vi.fn()}
        onNavigateCatalogue={vi.fn()}
        onNavigateLabs={vi.fn()}
        onNavigateExams={vi.fn()}
      />
    );

    expect(screen.getByText(/New Student Orientation/i)).toBeInTheDocument();
    expect(screen.getByText(/1. What am I learning\?/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Why am I learning it\?/i)).toBeInTheDocument();
    expect(screen.getByText(/3. What should I study first\?/i)).toBeInTheDocument();
    expect(screen.getByText(/4. What do I need to complete\?/i)).toBeInTheDocument();
    expect(screen.getByText(/5. How will I be tested\?/i)).toBeInTheDocument();
    expect(screen.getByText(/6. What does my result mean\?/i)).toBeInTheDocument();
    expect(screen.getByText(/7. What should I learn next\?/i)).toBeInTheDocument();
  });

  it("can expand and collapse questions to view detailed guidance and triggers callbacks", () => {
    const onNavigatePaths = vi.fn();
    const onNavigateLabs = vi.fn();

    render(
      <BeginnerGuide
        userRole="Full-Stack Developer"
        onNavigatePaths={onNavigatePaths}
        onNavigateCatalogue={vi.fn()}
        onNavigateLabs={onNavigateLabs}
        onNavigateExams={vi.fn()}
      />
    );

    // Click on question 3: "What should I study first?"
    const q3Button = screen.getByRole("button", { name: /3\. What should I study first\?/i });
    fireEvent.click(q3Button);

    // Check that the action button inside question 3 appears and triggers navigation
    const openPathBtn = screen.getByRole("button", { name: /View Recommended Path/i });
    expect(openPathBtn).toBeInTheDocument();
    fireEvent.click(openPathBtn);
    expect(onNavigatePaths).toHaveBeenCalledTimes(1);

    // Click on question 4: "What do I need to complete?"
    const q4Button = screen.getByRole("button", { name: /4\. What do I need to complete\?/i });
    fireEvent.click(q4Button);

    const tryLabBtn = screen.getByRole("button", { name: /Open Hands-on Labs/i });
    expect(tryLabBtn).toBeInTheDocument();
    fireEvent.click(tryLabBtn);
    expect(onNavigateLabs).toHaveBeenCalledTimes(1);
  });
});
