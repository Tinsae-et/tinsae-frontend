import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Retrieves a single inquiry thread for the authenticated buyer.
 * Automatically marks buyer_unread = 0 on Django backend.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToDjango(request, `inquiries/buyer/${id}/`, {
    revalidateCatalog: false,
  });
}

