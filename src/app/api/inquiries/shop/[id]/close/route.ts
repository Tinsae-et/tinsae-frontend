import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Closes/resolves an inquiry thread by the merchant.
 * Proxies to Django's POST /api/v1/inquiries/shop/[id]/close/.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToDjango(request, `inquiries/shop/${id}/close/`, {
    revalidateCatalog: false,
  });
}

