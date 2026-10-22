import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Sends a merchant reply to an inquiry thread.
 * Proxies to Django's POST /api/v1/inquiries/shop/[id]/reply/.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToDjango(request, `inquiries/shop/${id}/reply/`, {
    revalidateCatalog: false,
  });
}

