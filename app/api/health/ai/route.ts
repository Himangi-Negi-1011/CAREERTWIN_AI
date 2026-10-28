import { NextResponse } from "next/server";
import { AIConfigurationError, AIProviderError, getAIProviderStatus, verifyAIConnectivity } from "@/lib/ai/provider";

export async function GET(request: Request) {
  const status = getAIProviderStatus();
  if (!status.configured) return NextResponse.json({ initialized: false, provider: status.provider, model: null, verification: "not_configured" }, { status: 503 });
  const verify = new URL(request.url).searchParams.get("verify") === "true";
  if (!verify) return NextResponse.json({ initialized: true, provider: status.provider, model: status.model, verification: "configuration_validated" });
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10_000);
  try { await verifyAIConnectivity(controller.signal); return NextResponse.json({ initialized: true, provider: status.provider, model: status.model, verification: "connectivity_verified" }); }
  catch (error) {
    const timeout = error instanceof DOMException && error.name === "AbortError";
    const configured = !(error instanceof AIConfigurationError);
    return NextResponse.json({ initialized: configured, provider: status.provider, model: status.model, verification: timeout ? "connectivity_timeout" : error instanceof AIProviderError ? "connectivity_failed" : "not_configured" }, { status: timeout ? 504 : 503 });
  } finally { clearTimeout(timer); }
}
