import { proxyToDjango } from "@/lib/auth/django-proxy";

export async function POST(request: Request) {
  return proxyToDjango(request, "notifications/read-all/", { revalidateCatalog: false });
}
