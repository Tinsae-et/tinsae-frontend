import { djangoPath, proxyToDjango } from "@/lib/auth/django-proxy";

type Params = { params: Promise<{ slug: string }> };

/**
 * Updates the signed-in merchant's shop profile (JSON or multipart).
 *
 * The shop-profile forms used to receive the access token as a prop and PATCH
 * Django directly, which serialised the JWT into the RSC payload and failed
 * once it expired. Going through here keeps the token in its httpOnly cookie.
 */
export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  return proxyToDjango(request, djangoPath("shops", slug));
}
