import { NextResponse } from "next/server";
import { authDriver } from "@/lib/auth/driver";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { hasShop } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { access } = await readSession();
  if (!access) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  // The page in front of this checks the same thing, but the endpoint is
  // reachable on its own, so it has to check it itself: nobody gets a second
  // shop. There is deliberately no "are you allowed a shop at all" gate above
  // this — the only signal that could answer it was `user.role`, which the
  // backend never sends, so the gate rejected every account that did not
  // already have a shop. Being authenticated is the permission (see ./roles).
  let user;
  try {
    user = await authDriver.me(access);
  } catch (error) {
    return errorResponse(error);
  }
  if (hasShop(user)) {
    return NextResponse.json({ detail: "This account already has a shop." }, { status: 409 });
  }

  const input = (await request.json()) as {
    name: string;
    city: string;
    phone: string;
    description?: string;
    telegram_chat_id?: string;
  };

  if (!input.name?.trim()) {
    return NextResponse.json({ fieldErrors: { name: ["Enter a shop name."] } }, { status: 400 });
  }

  try {
    const shop = await authDriver.createShop(access, {
      name: input.name.trim(),
      city: input.city?.trim() || "Bole, Addis Ababa",
      phone: input.phone?.trim() || "",
      description: input.description ?? "",
      telegram_chat_id: input.telegram_chat_id ?? "",
    });
    return NextResponse.json({ ok: true, shop });
  } catch (error) {
    return errorResponse(error);
  }
}
