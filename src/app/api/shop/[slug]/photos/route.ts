import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string }> };

async function forward(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "photos"));
}

export { forward as GET, forward as POST };
