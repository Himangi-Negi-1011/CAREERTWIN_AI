import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Pip Chatbot Removal", () => {
  it("ensures pip.tsx component is completely deleted from the codebase", () => {
    const pipPath = path.resolve(process.cwd(), "app/components/pip.tsx");
    expect(fs.existsSync(pipPath)).toBe(false);
  });

  it("ensures workspace.tsx does not import or render Pip", () => {
    const workspaceSource = fs.readFileSync(
      path.resolve(process.cwd(), "app/components/dashboard/workspace.tsx"),
      "utf-8"
    );
    expect(workspaceSource.includes("import { Pip }")).toBe(false);
    expect(workspaceSource.includes("<Pip")).toBe(false);
  });

  it("ensures landing.tsx does not import or render Pip", () => {
    const landingSource = fs.readFileSync(
      path.resolve(process.cwd(), "app/components/landing.tsx"),
      "utf-8"
    );
    expect(landingSource.includes("import { Pip }")).toBe(false);
    expect(landingSource.includes("<Pip")).toBe(false);
  });
});
