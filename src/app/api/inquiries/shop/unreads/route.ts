import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Returns total unread inquiry count for the merchant across all shops they own.
 * Proxies to Django's GET /api/v1/inquiries/shop/unreads/.
 */
export async function GET(request: Request) {
  return proxyToDjango(request, "inquiries/shop/unreads/", {
    revalidateCatalog: false,
  });
}

