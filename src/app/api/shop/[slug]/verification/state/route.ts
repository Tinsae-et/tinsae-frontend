import { NextResponse } from "next/server";
import { authedFetch } from "@/lib/auth/authed-fetch";
import { setAccessCookie, setRefreshCookie } from "@/lib/auth/session";

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const target = `${API_URL}/api/v1/shops/${encodeURIComponent(slug)}/verification/state/`;

  const result = await authedFetch(target);

  if (!result.ok) {
    return NextResponse.json(
      { detail: "Your session has ended. Sign in again." },
      { status: result.reason === "no-session" ? 401 : 419 },
    );
  }

  const body = await result.response.text();
  const res = new NextResponse(body, {
    status: result.response.status,
    headers: { "content-type": "application/json" },
  });

  if (result.rotated) {
    setAccessCookie(res, result.rotated.access);
    if (result.rotated.refresh) {
      setRefreshCookie(res, result.rotated.refresh);
    }
  }

  return res;
}
