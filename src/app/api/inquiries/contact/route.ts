import { NextResponse } from "next/server";

import { proxyToDjango, withVettedBody } from "@/lib/auth/django-proxy";
import { rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { isIdOrSlug } from "@/lib/inquiries";

const CHANNELS = new Set(["phone", "telegram", "in_app"]);

/**
 * Forwards tracked contact intent requests to Django.
 *
 * Captures buyer intent (deep-linking to Telegram or revealing/calling a phone
 * number) for conversion analytics while enforcing anti-scraping protections:
 * - Phone numbers require an authenticated user account (enforced backend-side).
 * - Honeypot and automated user-agent blocks filter scraping bots, which is why
 *   the browser's address and user agent are forwarded.
 * - Signed-out visitors may log Telegram intents, so this goes out anonymously
 *   when there is no session.
 *
 * The body is checked here first and only the known fields are forwarded; the
 * Origin check runs before that, so a cross-site request is refused before its
 * body is read.
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

  const { channel, shop, product, honeypot } = body;
  if (
    typeof channel !== "string" ||
    !CHANNELS.has(channel) ||
    !isIdOrSlug(shop) ||
    (product != null && !isIdOrSlug(product))
  ) {
    return NextResponse.json({ detail: "Invalid request." }, { status: 400 });
  }

  const clean = {
    channel,
    shop,
    ...(product != null ? { product } : {}),
    honeypot: typeof honeypot === "string" ? honeypot : "",
  };

  return proxyToDjango(withVettedBody(request, clean), "inquiries/contact/", {
    revalidateCatalog: false,
    anonymous: true,
    forwardClient: true,
  });
}
