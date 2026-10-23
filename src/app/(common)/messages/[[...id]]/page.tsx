import type { Metadata } from "next";

import { MessagesView } from "@/components/inquiries/messages-view";
import { hasShop } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/session";
import { isInquiryId } from "@/lib/inquiries";

export const metadata: Metadata = {
  title: "Messages — Tinsae",
  robots: { index: false },
};

type Props = {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The signed-in user's conversations with shops.
 *
 * Reachable as /messages, /messages/:id, and /messages?inquiry=:id (where
 * notification links land, via next.config redirects). `?role=shop` opens the
 * side for conversations the user's shop received. The proxy already sends a
 * visitor without a session to /signin; requireSession is the check that holds
 * if the proxy's matcher ever changes.
 */
export default async function MessagesPage({ params, searchParams }: Props) {
  const [{ id: segments }, query] = await Promise.all([params, searchParams]);

  const fromPath = segments?.[0];
  const fromQuery = typeof query.inquiry === "string" ? query.inquiry : undefined;
  const raw = fromPath ?? fromQuery;
  const id = isInquiryId(raw) ? Number(raw) : null;

  const { user } = await requireSession(id ? `/messages/${id}` : "/messages");
  const canSell = hasShop(user);
  const role = query.role === "shop" && canSell ? "shop" : "buyer";

  return <MessagesView initialRole={role} initialId={id} canSell={canSell} />;
}
