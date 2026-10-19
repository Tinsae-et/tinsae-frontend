import { proxyToDjango } from "@/lib/auth/django-proxy";
import { notificationListParams } from "@/lib/notifications";

export async function GET(request: Request) {
  const search = notificationListParams(new URL(request.url).searchParams);
  return proxyToDjango(request, "notifications/", { search });
}
