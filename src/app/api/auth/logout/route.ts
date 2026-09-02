import { NextResponse } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { revokeRefreshToken } from "@/lib/auth/logout";
import { rejectCrossOrigin } from "@/lib/auth/route-helpers";

import { clearSessionCookies, readSession } from "@/lib/auth/session";

/**
 * Ends the session on both sides.
 *
 * Dropping the cookies alone left the refresh token usable for its full
 * lifetime — fourteen days — by anyone who had captured it. The backend does
 * run simplejwt's token_blacklist (config/settings/base.py) and exposes
 * POST /auth/logout/, so there is something to call. See lib/auth/logout for
 * why the access cookie is optional here.
 *
 * The cookies are cleared whatever the backend says. A logout that reports
 * failure and leaves the user apparently signed in is the worse outcome: they
 * will assume it worked, and on a shared phone that assumption is the whole
 * risk. A blacklist call that fails is logged and retried by nobody — the
 * tokens still expire on their own.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { access, refresh } = await readSession();

  if (refresh) {
    try {
      await revokeRefreshToken(authDriver, refresh, access);
    } catch (error) {
      console.error("[auth] logout could not blacklist the refresh token", error);
    }
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res);
  return res;
}
