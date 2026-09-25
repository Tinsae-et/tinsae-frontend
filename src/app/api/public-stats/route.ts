import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/api/public";

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch public stats" },
      { status: 500 },
    );
  }
}
