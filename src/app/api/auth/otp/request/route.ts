import { NextResponse } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { toE164, validatePhone } from "@/lib/auth/phone";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import type { AuthMode } from "@/lib/auth/types";

/** Sends a six-digit code to a phone number or email. */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { phone, email, mode } = (await request.json()) as {
    phone?: string;
    email?: string;
    mode: AuthMode;
  };

  const destination = email || phone;
  if (!destination) {
    return NextResponse.json(
      { fieldErrors: { email: ["An email address is required."] } },
      { status: 400 },
    );
  }

  if (phone) {
    const problem = validatePhone(phone);
    if (problem) {
      return NextResponse.json({ fieldErrors: { phone: [problem] } }, { status: 400 });
    }
  }

  try {
    const result = await authDriver.requestOtp({
      phone: phone ? toE164(phone) : (email as string),
      mode: mode === "signup" ? "signup" : "signin",
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
