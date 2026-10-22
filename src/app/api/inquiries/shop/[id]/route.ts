import { proxyToDjango } from "@/lib/auth/django-proxy";

/**
 * Retrieves an inquiry thread for the merchant and automatically clears shop_unread.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToDjango(request, `inquiries/shop/${id}/`, {
    revalidateCatalog: false,
  });
}

