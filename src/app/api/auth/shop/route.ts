import { NextResponse } from "next/server";
import { authDriver } from "@/lib/auth/driver";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { readSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { access } = await readSession();
  if (!access) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  // The page in front of this checks the same two things, but the endpoint is
  // reachable on its own, so it has to check them itself: a buyer must not be
  // able to create a shop, and an owner must not be able to create a second.
  let user;
  try {
    user = await authDriver.me(access);
  } catch (error) {
    return errorResponse(error);
  }
  if (user.role !== "owner") {
    return NextResponse.json({ detail: "Only shop owners can register a shop." }, { status: 403 });
  }
  if (user.shops?.length) {
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
