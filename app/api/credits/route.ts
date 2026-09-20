import { NextResponse } from "next/server";

import { HttpError, getAuthenticatedUser, getUserCredits } from "@/lib/credits";

export async function GET() {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const creditsLeft = await getUserCredits(supabase, user.id);

    return NextResponse.json({ creditsLeft });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Credits API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading credits." },
      { status: 500 },
    );
  }
}
