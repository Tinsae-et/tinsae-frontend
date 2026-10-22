import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Returns the unread messages count across all inquiries for the authenticated buyer.
 * Proxies to Django's GET /api/v1/inquiries/buyer/unreads/.
 */
export async function GET(request: Request) {
  return proxyToDjango(request, "inquiries/buyer/unreads/", {
    revalidateCatalog: false,
  });
}

