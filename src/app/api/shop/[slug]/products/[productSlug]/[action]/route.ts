import { NextResponse } from "next/server";

import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string; productSlug: string; action: string }> };

const VALID_ACTIONS = new Set(["confirm", "mark-sold", "pause", "resume"]);

export async function POST(request: Request, { params }: Params) {
  const { slug, productSlug, action } = await params;

  if (!VALID_ACTIONS.has(action)) {
    return NextResponse.json({ detail: "Unknown action." }, { status: 404 });
  }

  return proxyToDjango(request, djangoPath("shops", slug, "products", productSlug, action));
}
