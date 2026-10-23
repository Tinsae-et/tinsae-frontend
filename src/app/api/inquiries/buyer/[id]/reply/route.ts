import { NextResponse } from "next/server";

import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";
import { isInquiryId } from "@/lib/inquiries";

/**
 * Sends a buyer reply in an existing inquiry thread.
 * Proxies to Django's POST /api/v1/inquiries/buyer/[id]/reply/.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isInquiryId(id)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  return proxyToDjango(request, djangoPath("inquiries", "buyer", id, "reply"), {
    revalidateCatalog: false,
  });
}
