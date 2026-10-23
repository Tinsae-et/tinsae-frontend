import { NextResponse } from "next/server";

import { proxyToDjango, withVettedBody } from "@/lib/auth/django-proxy";
import { rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { cleanMessageBody, isIdOrSlug, MESSAGE_MAX_LENGTH } from "@/lib/inquiries";

/**
 * Starts a conversation: the signed-in buyer's first message to a shop.
 *
 * Forwards to Django's POST /api/v1/inquiries/buyer/. The body is checked here
 * as well as in the form (CLAUDE.md, "Input & rendering") and only the known
 * fields go on; a filled honeypot is refused without calling Django. The
 * Origin check runs first, so a cross-site request is refused before its body
 * is read.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Malformed request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ detail: "Malformed request body." }, { status: 400 });
  }

  if (body.honeypot) {
    return NextResponse.json({ detail: "Invalid request." }, { status: 400 });
  }

  const message = cleanMessageBody(body.body);
  if (!message) {
    return NextResponse.json(
      {
        detail: `Please enter a message to send to the shop (up to ${MESSAGE_MAX_LENGTH} characters).`,
      },
      { status: 400 },
    );
  }

  const { shop, product } = body;
  if (!isIdOrSlug(shop) || (product != null && !isIdOrSlug(product))) {
    return NextResponse.json({ detail: "Invalid request." }, { status: 400 });
  }

  const clean = { shop, ...(product != null ? { product } : {}), body: message };

  return proxyToDjango(withVettedBody(request, clean), "inquiries/buyer/", {
    revalidateCatalog: false,
    forwardClient: true,
  });
}
