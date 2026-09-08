import { NextResponse } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { toE164 } from "@/lib/auth/phone";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { setSessionCookies } from "@/lib/auth/session";
import type { AuthMode, Role } from "@/lib/auth/types";

/**
 * Exchanges the six digits for a session.
 *
 * Tokens land in httpOnly cookies here and are never returned to the browser;
 * the form gets back only the user, so it knows where to send them next.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  try {
    const { phone, code, mode, role, full_name, shop_name, city } = (await request.json()) as {
      phone: string;
      code: string;
      mode: AuthMode;
      role?: Role;
      full_name?: string;
      shop_name?: string;
      city?: string;
    };

    if (!/^\d{6}$/.test(code ?? "")) {
      return NextResponse.json({ detail: "Enter all six digits." }, { status: 400 });
    }

    const { access, refresh, user } = await authDriver.verifyOtp({
      phone: toE164(phone),
      code,
      mode: mode === "signup" ? "signup" : "signin",
      role,
      full_name,
      shop_name,
      city,
    });
    const res = NextResponse.json({ user });
    setSessionCookies(res, { access, refresh });
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
