import { Icon, IconName } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { kindForSlug, ProdPlaceholder } from "@/components/tinsae/prod-placeholder";
import { formatETB } from "@/lib/format";
import { getInitials } from "@/lib/shops-data";
import { Inquiry } from "@/lib/types";
import { Globe, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type Status = "new" | "in chat" | "visit" | "won" | "lost";

export const STATUS_ORDER: Status[] = ["new", "in chat", "visit", "won", "lost"];

export const getTimeSince = (item: string): string => {
  const _then = new Date(item);
  const now = new Date();
  const difference = now.getTime() - _then.getTime();
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor(difference / 3_600_000);
  const minutes = Math.floor(difference / 60_000);
  if (days >= 30) {
    return "long time ago"
  } else if (days > 0) {
    return days === 1 ? `${days} day ago` : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? `${minutes} minute ago` : `${minutes} minutes ago`;
  }
  return "just now";
};


export function StatCard({
  label,
  value,
  caption,
  icon,
  tint,
}: {
  label: string;
  value: number;
  caption: string;
  icon: IconName;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${tint}`}
        >
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-3xl font-extrabold text-neutral-900">
        {value}
      </div>
      <div className="mt-1 text-xs text-neutral-400">{caption}</div>
    </div>
  );
}

export function LeadCard({
  inquiry,
}: {
  inquiry: Inquiry;
}) {


  const product = inquiry.product
  const primaryImage = product?.images.find((i) => i.is_primary)
  const lastMessage = inquiry.messages.sort((a, b) => b.id - a.id)[0]

  return (
    <div
      className="group relative flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
    >
      {/* Avatar + channel */}
      <div className="flex shrink-0 flex-col items-center gap-2 justify-between">
        {
          inquiry.buyer.avatar ?
            <Image
              src={inquiry.buyer.avatar}
              alt={inquiry.buyer.username}
              width={10}
              height={10}
              unoptimized
              className="object-cover rounded-full h-10 w-10 bg-gray-200"
            /> :
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "#25501d" }}
            >
              {inquiry.buyer.full_name && getInitials(inquiry.buyer.full_name)}
            </div>
        }
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full`}
        >
          {
            lastMessage.sent_via === "web" ? <Globe className="h-3.5 w-3.5 text-red-300" /> :
              <Icon name="tg" className="h-3.5 w-3.5 text-blue-500" />
          }
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            {inquiry.shop_unread > 0 && (
              <span
                aria-label="Unread"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-600"
              />
            )}
            <span className="truncate text-sm font-bold text-neutral-900">
              {inquiry.buyer.full_name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${inquiry.status === "open" ? "text-green-800 bg-green-100" : "bg-gray-100"}`}
            >
              {inquiry.status}
            </span>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-neutral-400">
            {getTimeSince(inquiry.last_message_at)}
          </span>
        </div>

        <p
          className={`mt-1 text-sm ${inquiry.shop_unread > 0 ? "font-medium text-neutral-800" : "text-neutral-600"
            }`}
        >
          {lastMessage.body}
        </p>

        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
          {
            product ?
              <Link
                href={`/products/${product.slug}`}
              >
                <div className="inline-flex max-w-full items-center gap-2.5 rounded-lg bg-neutral-100 px-2 py-1.5">
                  <div className="h-10 flex items-center">
                    {
                      product.images.length > 0 ?
                        <Image src={primaryImage?.url || product.images[0].url} alt={product.title} width={100} height={100} className="h-10 w-10 rounded" />
                        :
                        <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
                    }
                  </div>
                  <span className="min-w-0 text-xs font-semibold leading-tight text-neutral-800">
                    {product.title}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] leading-tight text-neutral-400">
                    ETB <span className="text-neutral-500">{formatETB(product.price)}</span>
                  </span>
                </div>
              </Link>
              :
              <div />
          }

          {/* Quick actions: always visible on touch, on hover for desktop */}
          <div className="flex items-center flex-row-reverse gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
            <button
              type="button"
              aria-label="Row actions"
              className="size-8 rounded-full border border-tn-hair flex items-center justify-center text-tn-mute hover:border-tn-ink hover:text-tn-ink transition-colors bg-white cursor-pointer"
            >
              <MoreHorizontal className="size-4" />
            </button>
            <Pill
              className="flex items-center gap-1.5 rounded-full h-7 bg-orange-600 px-3 py-0 text-xs font-semibold text-white hover:bg-orange-700"
            >
              <Icon name="tg" className="h-3 w-3" />
              Reply
            </Pill>
          </div>
        </div>
      </div>
    </div>
  );
}


export function Stats({ inquiries }: { inquiries: Inquiry[] }) {
  const awaitingFirstReply = inquiries.filter((i) => !i.messages.find((m) => m.sender_role === "shop")).length
  const inChat = inquiries.filter((i) => i.status.toLowerCase() === "open").length

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="New leads"
        value={awaitingFirstReply}
        caption="awaiting first reply"
        icon="bolt"
        tint="bg-orange-50 text-orange-600"
      />
      <StatCard
        label="In chat"
        value={inChat}
        caption="conversations active"
        icon="msg"
        tint="bg-sky-50 text-sky-500"
      />
      <StatCard
        label="Visits booked"
        value={5}
        caption="coming to the shop"
        icon="pin"
        tint="bg-amber-50 text-amber-600"
      />
      <StatCard
        label="Won · 7 days"
        value={5}
        caption={`${formatETB(3000)} in sales`}
        icon="check"
        tint="bg-emerald-50 text-emerald-600"
      />
    </div>
  )
}

