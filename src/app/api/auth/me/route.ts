import { NextResponse } from "next/server";
import { authDriver } from "@/lib/auth/driver";
import { errorResponse, rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { readSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { access } = await readSession();
  if (!access) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  try {
    const user = await authDriver.me(access);
    return NextResponse.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const { access } = await readSession();
  if (!access) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let user;
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      user = await authDriver.updateProfile(access, formData);
    } else {
      const body = await request.json();
      user = await authDriver.updateProfile(access, body);
    }
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return errorResponse(error);
  }
}
