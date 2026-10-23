import { NextResponse } from "next/server";

import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";
import { isInquiryId } from "@/lib/inquiries";

/**
 * Closes an inquiry thread for the authenticated buyer.
 * Proxies to Django's POST /api/v1/inquiries/buyer/[id]/close/.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isInquiryId(id)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  return proxyToDjango(request, djangoPath("inquiries", "buyer", id, "close"), {
    revalidateCatalog: false,
  });
}
