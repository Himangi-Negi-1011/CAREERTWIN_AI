import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CourseCatalogueView, CATALOGUE_COURSES } from "@/app/components/dashboard/course-catalogue";

describe("CourseCatalogueView", () => {
  it("renders 14 authored courses and filters by category", () => {
    const handleSelectCourse = vi.fn();
    render(<CourseCatalogueView onSelectCourse={handleSelectCourse} />);

    expect(screen.getByTestId("course-catalogue-view")).toBeInTheDocument();
    expect(screen.getByText(/Explore 14 Authored Technical Courses/i)).toBeInTheDocument();

    // Filter by Cloud
    fireEvent.click(screen.getByRole("button", { name: "Cloud" }));
    expect(screen.getByText(/Cloud Computing Foundations/i)).toBeInTheDocument();
    expect(screen.queryByText(/Modern PHP & Web Architecture/i)).not.toBeInTheDocument();
  });

  it("opens course detail drawer and syllabus breakdown", () => {
    const handleSelectCourse = vi.fn();
    render(<CourseCatalogueView onSelectCourse={handleSelectCourse} />);

    const inspectButtons = screen.getAllByRole("button", { name: /Inspect Syllabus/i });
    fireEvent.click(inspectButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Syllabus & Structured Modules/i)).toBeInTheDocument();
  });
});

