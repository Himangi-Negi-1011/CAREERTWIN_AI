"use client";

export type TwinSyncState = { status: "saving" | "saved" | "error"; message: string };
function announce(detail: TwinSyncState) { window.dispatchEvent(new CustomEvent<TwinSyncState>("careertwin:sync-state", { detail })); }

export async function persistTwinPatch(patch: Record<string, unknown>) {
  announce({ status: "saving", message: "Updating your secure Career Twin…" });
  try {
    const response = await fetch("/api/twin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mutationId: crypto.randomUUID(), patch }) });
    const payload = await response.json() as { error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? "Career Twin sync failed.");
    announce({ status: "saved", message: "Career Twin updated successfully." });
    return true;
  } catch (error) {
    announce({ status: "error", message: error instanceof Error ? error.message : "Career Twin sync failed. Your browser draft is still available." });
    return false;
  }
}
