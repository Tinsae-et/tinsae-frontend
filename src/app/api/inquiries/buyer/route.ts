import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Lists conversations (inquiries) for the authenticated buyer.
 * Proxies to Django's GET /api/v1/inquiries/buyer/.
 */
export async function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  return proxyToDjango(request, "inquiries/buyer/", {
    search,
    revalidateCatalog: false,
  });
}

