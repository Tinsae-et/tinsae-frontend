import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Sends a buyer reply in an existing inquiry thread.
 * Proxies to Django's POST /api/v1/inquiries/buyer/[id]/reply/.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToDjango(request, `inquiries/buyer/${id}/reply/`, {
    revalidateCatalog: false,
  });
}

