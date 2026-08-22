import { NextResponse } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { setSessionCookies } from "@/lib/auth/session";
import type { AuthMode, Role } from "@/lib/auth/types";

/**
 * Exchanges a Telegram Login Widget payload for a session.
 *
 * The payload is forwarded whole and unedited: the backend has to verify its
 * `hash` against the bot token, and that check fails if any field is dropped or
 * reordered. Nothing here may trust the payload before that verification.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { payload, mode, role } = (await request.json()) as {
    payload: Record<string, string>;
    mode: AuthMode;
    role?: Role;
  };

  try {
    const { access, refresh, user } = await authDriver.telegram(
      payload ?? {},
      mode === "signup" ? "signup" : "signin",
      role,
    );
    const res = NextResponse.json({ user });
    setSessionCookies(res, { access, refresh });
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
