import { NextResponse } from "next/server";

import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  // Django's ids are integers; anything else never reaches it.
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }

  return proxyToDjango(request, djangoPath("notifications", id, "read"), {
    revalidateCatalog: false,
  });
}
