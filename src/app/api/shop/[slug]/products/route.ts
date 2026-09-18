import { NextResponse } from "next/server";

import { authedFetch } from "@/lib/auth/authed-fetch";
import { setAccessCookie, setRefreshCookie } from "@/lib/auth/session";

const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Query params the merchant catalogue accepts (shops/views.py). */
const ALLOWED = ["q", "category", "ordering", "status", "fresh", "page", "page_size"];

/**
 * The dashboard's window onto its own catalogue.
 *
 * Exists so the browser never holds a JWT: it calls this same-origin route with
 * nothing but a cookie it cannot read, and the Authorization header is attached
 * here. Query params are copied through an allowlist rather than forwarded
 * wholesale — this route runs as the signed-in user, and an unfiltered
 * pass-through would let a crafted query reach filters the dashboard never
 * meant to expose.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const incoming = new URL(request.url).searchParams;
  const forwarded = new URLSearchParams();
  for (const key of ALLOWED) {
    const value = incoming.get(key);
    if (value) forwarded.set(key, value);
  }

  const qs = forwarded.toString();
  const target = `${API_URL}/api/v1/shops/${encodeURIComponent(slug)}/products/${qs ? `?${qs}` : ""}`;

  const result = await authedFetch(target);

  if (!result.ok) {
    // Both cases are "sign in again", but they are different events and the
    // status says which: nothing to work with, versus a refresh the backend
    // refused. The proxy turns the next navigation into a redirect either way.
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

  // A refresh on this path rotates both tokens and blacklists the old refresh.
  // Not writing them back would leave the browser holding a revoked token and
  // end the session at its next call.
  if (result.rotated) {
    setAccessCookie(res, result.rotated.access);
    if (result.rotated.refresh) setRefreshCookie(res, result.rotated.refresh);
  }

  return res;
}
