import { proxyToDjango } from "@/lib/auth/django-proxy";

export async function GET(request: Request) {
  return proxyToDjango(request, "notifications/unread-count/");
}
