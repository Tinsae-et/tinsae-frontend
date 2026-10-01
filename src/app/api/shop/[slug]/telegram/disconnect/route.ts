import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "telegram", "disconnect"));
}
