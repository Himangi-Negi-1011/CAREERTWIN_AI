import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  Show: ({ when, children }: { when: string; children: ReactNode }) => when === "signed-out" ? children : null,
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUpButton: ({ children }: { children: ReactNode }) => children,
  UserButton: () => <span data-testid="user-button" />,
}));

import { Header } from "@/app/components/header";

describe("Header", () => {
  it("exposes primary navigation and signed-out authentication actions", () => {
    render(<Header />);
    expect(screen.getAllByRole("button", { name: /log in/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /get started/i })[0]).toHaveAttribute("href", "/sign-up?redirect_url=/onboarding");
    expect(screen.getAllByRole("link", { name: /how it works/i })[0]).toHaveAttribute("href", "#how-it-works");
  });

  it("opens and closes mobile navigation accessibly", () => {
    render(<Header />);
    const trigger = screen.getByRole("button", { name: /open navigation/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: /mobile public navigation/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close navigation/i }));
    expect(screen.queryByRole("navigation", { name: /mobile public navigation/i })).not.toBeInTheDocument();
  });
});
