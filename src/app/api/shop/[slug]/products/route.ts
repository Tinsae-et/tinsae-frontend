import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string }> };

/** Query params the merchant catalogue accepts (shops/views.py). */
const ALLOWED = ["q", "category", "ordering", "status", "fresh", "page", "page_size"];

/**
 * The dashboard's window onto its own catalogue.
 *
 * Query params are copied through an allowlist rather than forwarded
 * wholesale — this route runs as the signed-in user, and an unfiltered
 * pass-through would let a crafted query reach filters the dashboard never
 * meant to expose.
 */
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;

  const incoming = new URL(request.url).searchParams;
  const search = new URLSearchParams();
  for (const key of ALLOWED) {
    const value = incoming.get(key);
    if (value) search.set(key, value);
  }

  return proxyToDjango(request, djangoPath("shops", slug, "products"), { search });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug, "products"));
}
