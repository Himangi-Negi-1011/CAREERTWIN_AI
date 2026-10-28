import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { searchSkills, validateNewSkillName } from "@/lib/learning/catalog";

const querySchema = z.object({ q: z.string().max(120).default(""), limit: z.coerce.number().int().min(1).max(50).default(20) });

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to search the learning catalog." } }, { status: 401 });
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "", limit: url.searchParams.get("limit") ?? 20 });
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_SKILL_SEARCH", message: "The skill search is invalid." } }, { status: 400 });
  const skills = searchSkills(parsed.data.q, parsed.data.limit);
  let registration: null | { canonicalName: string; normalizedName: string; slug: string; available: boolean; reason: string } = null;
  if (parsed.data.q.trim() && skills.length === 0) {
    try {
      const candidate = validateNewSkillName(parsed.data.q);
      registration = { canonicalName: candidate.canonicalName, normalizedName: candidate.normalizedName, slug: candidate.slug, available: true, reason: "This skill is not seeded. It can be registered for reviewed, on-demand curriculum generation." };
    } catch (error) {
      registration = { canonicalName: parsed.data.q.trim(), normalizedName: "", slug: "", available: false, reason: error instanceof Error ? error.message : "This skill name is invalid." };
    }
  }
  return NextResponse.json({ data: { skills, registration, catalogMode: "seeded-and-extensible" } });
}
