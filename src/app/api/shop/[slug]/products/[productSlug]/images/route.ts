import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string; productSlug: string }> };

async function forward(request: Request, { params }: Params) {
  const { slug, productSlug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "products", productSlug, "images"));
}

export { forward as GET, forward as POST };
