import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedbackDialog } from "@/app/components/dashboard/feedback-dialog";

describe("FeedbackDialog", () => {
  it("renders the feedback modal dialog accessibly", () => {
    const onClose = vi.fn();
    render(<FeedbackDialog onClose={onClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Student Learning Feedback/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Close feedback dialog/i })).toBeInTheDocument();
  });

  it("submits valid student feedback successfully to the API", async () => {
    const onClose = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    render(
      <FeedbackDialog
        currentContext={{ page: "/dashboard", courseSlug: "python-fundamentals" }}
        onClose={onClose}
      />
    );

    const textarea = screen.getByPlaceholderText(/Describe what was unclear/i);
    fireEvent.change(textarea, { target: { value: "The explanation of decorators was great!" } });

    const submitBtn = screen.getByRole("button", { name: /Submit Feedback/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Thank You for Your Feedback!/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/feedback",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("decorators"),
      })
    );
  });
});
