import { NextResponse } from "next/server";

import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";
import { isInquiryId } from "@/lib/inquiries";

/**
 * Retrieves an inquiry thread for the merchant and automatically clears shop_unread.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isInquiryId(id)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  return proxyToDjango(request, djangoPath("inquiries", "shop", id), {
    revalidateCatalog: false,
  });
}
