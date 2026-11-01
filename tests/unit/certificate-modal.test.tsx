import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CertificateModal } from "@/app/components/dashboard/certificate-modal";

describe("CertificateModal", () => {
  it("renders certificate with student name, course title, and verified skills", () => {
    const handleClose = vi.fn();
    render(
      <CertificateModal
        studentName="Alex Morgan"
        courseTitle="Cloud Security Engineering"
        skills={["Cloud Architecture", "IAM Least Privilege", "SOC Log Triage"]}
        onClose={handleClose}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("Cloud Security Engineering")).toBeInTheDocument();
    expect(screen.getByText("IAM Least Privilege")).toBeInTheDocument();
    expect(screen.getByText(/Cryptographically Verified Record/i)).toBeInTheDocument();
  });

  it("triggers print dialog when print button is clicked", () => {
    const handleClose = vi.fn();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      <CertificateModal
        studentName="Alex Morgan"
        courseTitle="Cloud Security Engineering"
        onClose={handleClose}
      />
    );

    const printBtn = screen.getByRole("button", { name: /Print \/ Save PDF/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});

