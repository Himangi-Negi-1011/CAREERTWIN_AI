import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const isClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  if (isClerkConfigured) {
    return NextResponse.json(
      { error: { code: "DEMO_DISABLED", message: "Demo login is disabled when authentication provider is configured." } },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: "ct_demo_session",
    value: "1",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}
