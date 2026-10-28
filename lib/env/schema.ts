import { z } from "zod";

const optionalUrl = z.string().url().optional();
const optionalSecret = z.string().min(1).optional();

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
});

export const serverEnvSchema = publicEnvSchema.extend({
  CLERK_SECRET_KEY: optionalSecret,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  AI_PROVIDER: z.enum(["gemini", "openrouter"]).optional(),
  GEMINI_API_KEY: optionalSecret,
  GEMINI_MODEL: optionalSecret,
  OPENROUTER_API_KEY: optionalSecret,
  OPENROUTER_MODEL: optionalSecret,
});

export type IntegrationName = "clerk" | "supabase" | "gemini" | "openrouter";
export type IntegrationStatus = Record<IntegrationName, "configured" | "incomplete" | "not-configured">;

function groupStatus(values: Array<string | undefined>): IntegrationStatus[IntegrationName] {
  const configured = values.filter(Boolean).length;
  if (configured === 0) return "not-configured";
  return configured === values.length ? "configured" : "incomplete";
}

export function getIntegrationStatus(input: z.input<typeof serverEnvSchema>): IntegrationStatus {
  const env = serverEnvSchema.parse(input);
  return {
    clerk: groupStatus([env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, env.CLERK_SECRET_KEY]),
    supabase: groupStatus([
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      env.SUPABASE_SERVICE_ROLE_KEY,
    ]),
    gemini: groupStatus([env.GEMINI_API_KEY, env.GEMINI_MODEL]),
    openrouter: groupStatus([env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL]),
  };
}
