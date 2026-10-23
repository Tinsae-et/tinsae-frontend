import { proxyToDjango } from "@/lib/auth/django-proxy";
import { inquiryListParams } from "@/lib/inquiries";

/**
 * Lists conversations (inquiries) for the authenticated buyer.
 * Proxies to Django's GET /api/v1/inquiries/buyer/.
 */
export async function GET(request: Request) {
  const search = inquiryListParams(new URL(request.url).searchParams);
  return proxyToDjango(request, "inquiries/buyer/", {
    search,
    revalidateCatalog: false,
  });
}
