import { NextResponse } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { setSessionCookies } from "@/lib/auth/session";
import type { LoginInput } from "@/lib/auth/types";

/**
 * The password fallback for sign-in.
 *
 * Tokens land in httpOnly cookies here and never reach the browser; the form
 * gets back only the user, so it knows where to send them.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  try {
    const input = (await request.json()) as LoginInput;
    const { access, refresh, user } = await authDriver.login({
      identifier: input.identifier?.trim() ?? "",
      password: input.password ?? "",
    });
    const res = NextResponse.json({ user });
    setSessionCookies(res, { access, refresh });
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
