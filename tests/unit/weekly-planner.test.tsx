import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { WeeklyPlanner } from "@/app/components/dashboard/weekly-planner";

describe("WeeklyPlanner", () => {
  beforeEach(() => localStorage.clear());

  it("schedules real unfinished roadmap tasks within the weekly plan", async () => {
    localStorage.setItem("careertwin-development-v1:user_1", JSON.stringify({ tasks: [{ id: "task_1", title: "Practise SQL joins", detail: "Complete three join exercises.", done: false, createdAt: new Date().toISOString() }], projects: [], practice: [] }));
    render(<WeeklyPlanner ownerKey="user_1" role="Data Analyst" onOpenRoadmap={() => undefined}/>);
    await screen.findByText(/plan a week you can actually finish/i);
    fireEvent.click(screen.getByRole("button", { name: /build week from roadmap/i }));
    expect(await screen.findByText("Practise SQL joins")).toBeInTheDocument();
    expect(screen.getByText(/1 roadmap task scheduled/i)).toBeInTheDocument();
    expect(localStorage.getItem("careertwin-weekly-v1:user_1")).toContain("Practise SQL joins");
  });

  it("records progress only after an explicit completion action", async () => {
    localStorage.setItem("careertwin-development-v1:user_1", JSON.stringify({ tasks: [{ id: "task_1", title: "Review accessibility", detail: "", done: false }], projects: [], practice: [] }));
    render(<WeeklyPlanner ownerKey="user_1" role="Frontend Developer" onOpenRoadmap={() => undefined}/>);
    await screen.findByText(/plan a week you can actually finish/i);
    fireEvent.click(screen.getByRole("button", { name: /build week from roadmap/i }));
    expect(screen.getByText("0/1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));
    expect(screen.getByText("1/1")).toBeInTheDocument();
  });
});
