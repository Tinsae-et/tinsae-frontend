import { NextResponse } from "next/server";

import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";
import { isInquiryId } from "@/lib/inquiries";

/**
 * Retrieves a single inquiry thread for the authenticated buyer.
 * Automatically marks buyer_unread = 0 on Django backend.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isInquiryId(id)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  return proxyToDjango(request, djangoPath("inquiries", "buyer", id), {
    revalidateCatalog: false,
  });
}
