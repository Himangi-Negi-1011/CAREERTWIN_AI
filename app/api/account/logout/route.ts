import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear common session and authentication cookies
    const sessionCookieNames = [
      "__session",
      "__client_uat",
      "ct_session",
      "ct_demo_user",
      "clerk_session",
    ];

    for (const name of sessionCookieNames) {
      cookieStore.set({
        name,
        value: "",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Session terminated successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGOUT_FAILED",
          message: err instanceof Error ? err.message : "Failed to logout.",
        },
      },
      { status: 500 }
    );
  }
}
