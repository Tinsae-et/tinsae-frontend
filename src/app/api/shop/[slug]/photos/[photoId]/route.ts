import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string; photoId: string }> };

async function forward(request: Request, { params }: Params) {
  const { slug, photoId } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "photos", photoId));
}

export { forward as DELETE };
