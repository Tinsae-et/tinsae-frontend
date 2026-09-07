import { NextResponse } from "next/server";

import { authDriver } from "@/lib/auth/driver";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { setSessionCookies } from "@/lib/auth/session";
import type { RegisterInput } from "@/lib/auth/types";

/**
 * Creates a merchant account and signs them straight in.
 *
 * Same contract as the login handler: the tokens land in httpOnly cookies here
 * and never reach the browser, and the response carries only the user, which is
 * all the form needs to decide where to send them.
 *
 * The backend does the account and the shop in one transaction, so there is no
 * partial state to clean up if it rejects — a 400 here means nothing was
 * created and the form can simply render the field errors.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  try {
    const input = (await request.json()) as RegisterInput;
    const { access, refresh, user } = await authDriver.register({
      username: input.username?.trim() ?? "",
      password: input.password ?? "",
      phone: input.phone?.trim() ?? "",
      role: input.role,
      ...(input.full_name?.trim() ? { full_name: input.full_name.trim() } : {}),
      ...(input.shop_name?.trim() ? { shop_name: input.shop_name.trim() } : {}),
      ...(input.city?.trim() ? { city: input.city.trim() } : {}),
      // Absent rather than empty: the serializer allows blank, but sending ""
      // for an optional unique column is how two accounts collide on nothing.
      ...(input.email?.trim() ? { email: input.email.trim() } : {}),
    });
    const res = NextResponse.json({ user });
    setSessionCookies(res, { access, refresh });
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
