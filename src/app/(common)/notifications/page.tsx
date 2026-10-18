import type { Metadata } from "next";

import { NotificationsView } from "@/components/notification/notifications-view";
import { requireSession } from "@/lib/auth/session";
import { isNotificationFilter } from "@/lib/notifications";

export const metadata: Metadata = {
  title: "Notifications — Tinsae",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ filter?: string | string[] }>;

export default async function NotificationsPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await requireSession("/notifications");
  const { filter } = await searchParams;

  const firstName = user.full_name?.trim().split(/\s+/)[0] || user.username;
  const digits = user.phone?.replace(/\D/g, "") ?? "";

  return (
    <NotificationsView
      firstName={firstName}
      initialFilter={isNotificationFilter(filter) ? filter : "all"}
      telegramHandle={user.telegram_chat_id ? (user.telegram_username ?? "") : null}
      maskedPhone={digits.length >= 4 ? `+251 ··· ${digits.slice(-4)}` : null}
    />
  );
}
