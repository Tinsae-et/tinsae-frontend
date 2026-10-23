import { proxyToDjango } from "@/lib/auth/django-proxy";
import { inquiryListParams } from "@/lib/inquiries";

/**
 * Lists customer inquiries received by the authenticated merchant for their shops.
 * Proxies to Django's GET /api/v1/inquiries/shop/.
 */
export async function GET(request: Request) {
  const search = inquiryListParams(new URL(request.url).searchParams);
  return proxyToDjango(request, "inquiries/shop/", {
    search,
    revalidateCatalog: false,
  });
}
