import { NextResponse } from "next/server";

import { authDriver, revealMockCode } from "@/lib/auth/driver";
import { toE164, validatePhone } from "@/lib/auth/phone";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import type { AuthMode } from "@/lib/auth/types";

/** Sends a six-digit code to a phone number. */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { phone, mode } = (await request.json()) as { phone: string; mode: AuthMode };

  // Re-validate server-side: the client check is a courtesy, not a guarantee,
  // and an SMS to a malformed number is spent money with no error to show.
  const problem = validatePhone(phone ?? "");
  if (problem) {
    return NextResponse.json({ fieldErrors: { phone: [problem] } }, { status: 400 });
  }

  try {
    const result = await authDriver.requestOtp({
      phone: toE164(phone),
      mode: mode === "signup" ? "signup" : "signin",
    });

    // Belt and braces: the mock is the only thing that sets `dev_code`, but a
    // code that reaches the browser is a code an attacker can read, so it is
    // stripped anywhere it isn't explicitly wanted.
    const { dev_code, ...safe } = result;
    return NextResponse.json(revealMockCode ? { ...safe, dev_code } : safe);
  } catch (error) {
    return errorResponse(error);
  }
}
