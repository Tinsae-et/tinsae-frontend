import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SERVER_API_URL } from "@/lib/config";
import { authedFetch } from "@/lib/auth/authed-fetch";
import { rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { setAccessCookie, setRefreshCookie } from "@/lib/auth/session";

/**
 * Sends a message from an authenticated buyer to a shop.
 *
 * Forwards to Django's /api/v1/inquiries/buyer/ using the buyer's session.
 * Protects against CSRF via rejectCrossOrigin, filters bot submissions via
 * honeypot check, and ensures clean token rotation.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  let body: {
    shop?: string | number;
    product?: string | number;
    body?: string;
    honeypot?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Malformed request body." },
      { status: 400 },
    );
  }

  if (body.honeypot) {
    return NextResponse.json(
      { detail: "Invalid request." },
      { status: 400 },
    );
  }

  if (!body.body || !body.body.trim()) {
    return NextResponse.json(
      { detail: "Please enter a message to send to the shop." },
      { status: 400 },
    );
  }

  const reqHeaders = await headers();
  const forwardedFor =
    reqHeaders.get("x-forwarded-for") ?? reqHeaders.get("x-real-ip");
  const userAgent = reqHeaders.get("user-agent");

  const forwardHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (forwardedFor) forwardHeaders["X-Forwarded-For"] = forwardedFor;
  if (userAgent) forwardHeaders["User-Agent"] = userAgent;

  const target = `${SERVER_API_URL}/api/v1/inquiries/buyer/`;

  const authed = await authedFetch(target, {
    method: "POST",
    headers: forwardHeaders,
    body: JSON.stringify({
      shop: body.shop,
      product: body.product,
      body: body.body.trim(),
    }),
  });

  if (!authed.ok) {
    return NextResponse.json(
      { detail: "Please sign in to send messages to shops." },
      { status: 401 },
    );
  }

  const upstream = authed.response;
  const text = await upstream.text();
  const isJson = (upstream.headers.get("content-type") ?? "").includes("json");

  const res =
    text && !isJson
      ? NextResponse.json(
          { detail: "Tinsae is having trouble right now. Try again shortly." },
          { status: upstream.ok ? 502 : upstream.status },
        )
      : new NextResponse(text || null, {
          status: upstream.status,
          headers: text ? { "content-type": "application/json" } : undefined,
        });

  if (authed.rotated) {
    setAccessCookie(res, authed.rotated.access);
    if (authed.rotated.refresh) setRefreshCookie(res, authed.rotated.refresh);
  }

  return res;
}

