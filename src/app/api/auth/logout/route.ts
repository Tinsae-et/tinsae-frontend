import { NextResponse } from "next/server";

import { rejectCrossOrigin } from "@/lib/auth/route-helpers";

import { clearSessionCookies } from "@/lib/auth/session";

/** Drops both cookies. See clearSessionCookies for what this cannot do. */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res);
  return res;
}
