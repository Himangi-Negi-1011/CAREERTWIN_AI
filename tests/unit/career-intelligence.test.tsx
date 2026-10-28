import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CareerIntelligence } from "@/app/components/dashboard/career-intelligence";

describe("CareerIntelligence", () => {
  beforeEach(() => localStorage.clear());

  it("labels guidance as non-live and does not report a secure save when sync is unavailable", async () => {
    const open = vi.fn();
    render(<CareerIntelligence role="Data Analyst" ownerKey="user_1" onOpenRoadmap={open}/>);
    expect(screen.getByText(/not live labour-market statistics/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/search skill guides/i), { target: { value: "SQL" } });
    fireEvent.click(screen.getByRole("button", { name: /add to roadmap/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/browser draft because secure sync failed/i);
    expect(localStorage.getItem("careertwin-development-v1:user_1")).toContain("Learn SQL");
  });

  it("compares selected skills without invented market scores", () => {
    render(<CareerIntelligence role="Frontend Developer" ownerKey="user_1" onOpenRoadmap={() => undefined}/>);
    fireEvent.click(screen.getByRole("button", { name: /add JavaScript to comparison/i }));
    fireEvent.click(screen.getByRole("button", { name: /add React to comparison/i }));
    expect(screen.getByText("Skill comparison")).toBeInTheDocument();
    expect(screen.getByText(/does not use invented demand or salary scores/i)).toBeInTheDocument();
  });
});
