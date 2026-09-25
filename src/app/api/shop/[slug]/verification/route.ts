import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string }> };

/** Current verification state (GET) and a new verification request (POST). */
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "verification", "state"));
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "verification"));
}
