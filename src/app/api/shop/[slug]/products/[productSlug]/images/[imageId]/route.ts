import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string; productSlug: string; imageId: string }> };

async function forward(request: Request, { params }: Params) {
  const { slug, productSlug, imageId } = await params;
  return proxyToDjango(
    request,
    djangoPath("shops", slug, "products", productSlug, "images", imageId),
  );
}

export { forward as PATCH, forward as DELETE };
