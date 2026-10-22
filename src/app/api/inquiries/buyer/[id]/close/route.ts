import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Closes an inquiry thread for the authenticated buyer.
 * Proxies to Django's POST /api/v1/inquiries/buyer/[id]/close/.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToDjango(request, `inquiries/buyer/${id}/close/`, {
    revalidateCatalog: false,
  });
}

