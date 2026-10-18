import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { ProdPlaceholder } from "@/components/tinsae/prod-placeholder";
import { formatETB } from "@/lib/format";
import { resolvePrimaryProductImage } from "@/lib/product-images";
import { timeAgo, type NotificationEvent, type NotificationType } from "@/lib/notifications";
import { cn } from "@/lib/utils";

// Event types from the design handoff: icon, accent, and the icon tile's soft fill.
export const TYPE_META: Record<
  NotificationType,
  { label: string; icon: IconName; accent: string; tile: string }
> = {
  drop: { label: "Price drop", icon: "tag", accent: "text-tn-green", tile: "bg-tn-green-soft" },
  back: { label: "Back in stock", icon: "box", accent: "text-tn-red", tile: "bg-tn-red-soft" },
  search: { label: "Saved search", icon: "search", accent: "text-tn-ink", tile: "bg-tn-paper" },
  reply: { label: "Shop replied", icon: "tg", accent: "text-tn-telegram", tile: "bg-[#E7F4FB]" },
  sold: { label: "Selling fast", icon: "bolt", accent: "text-tn-warn", tile: "bg-[#FBF1E4]" },
  verify: { label: "Shop verified", icon: "shield", accent: "text-tn-green", tile: "bg-tn-green-soft" },
};

/**
 * One feed item. The whole card is the link: the CTA's hit area is stretched
 * over the card, so clicking anywhere marks it read and opens the target.
 * Unread items sit on white with a border and a red dot; read ones sink into
 * the page.
 */
export function NotificationCard({
  event,
  onOpen,
}: {
  event: NotificationEvent;
  onOpen: (id: string) => void;
}) {
  const meta = TYPE_META[event.type];
  const image = resolvePrimaryProductImage(event.thumb?.imageUrl);

  return (
    <li
      className={cn(
        "relative flex gap-[15px] rounded-[15px] border px-4 py-[17px] transition-colors sm:px-5",
        event.unread
          ? "border-tn-hair bg-white hover:border-[#E0DDD4]"
          : "border-transparent hover:bg-tn-paper",
      )}
    >
      {event.unread && (
        <span className="bg-tn-red absolute top-[21px] left-1.5 size-[7px] rounded-full">
          <span className="sr-only">Unread</span>
        </span>
      )}

      <span
        className={cn(
          "mt-px inline-flex size-[42px] shrink-0 items-center justify-center rounded-xl",
          meta.tile,
          meta.accent,
        )}
      >
        <Icon name={meta.icon} size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-[9px]">
          <span className={cn("text-[10px] font-bold tracking-[0.05em] uppercase", meta.accent)}>
            {meta.label}
          </span>
          <time
            dateTime={event.createdAt}
            className="text-tn-mute font-tn-mono text-[11px] whitespace-nowrap"
          >
            {timeAgo(event.createdAt)}
          </time>
        </div>
        <h3 className="text-tn-ink mt-[5px] text-[15.5px] leading-[1.3] font-extrabold tracking-[-0.015em]">
          {event.title}
        </h3>
        <p className="text-tn-ink2 mt-1 max-w-[560px] text-[13.5px] leading-normal">{event.body}</p>

        {event.chips && event.chips.length > 0 && (
          <div className="mt-[11px] flex flex-wrap gap-[7px]">
            {event.chips.map((chip) => (
              <span
                key={chip}
                className="bg-tn-paper border-tn-hair text-tn-ink2 inline-flex h-[26px] items-center rounded-full border px-2.5 text-[11.5px] font-semibold"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mt-[13px] flex flex-wrap items-center gap-x-3.5 gap-y-2">
          <Link
            href={event.cta.href}
            onClick={() => onOpen(event.id)}
            className="bg-tn-ink inline-flex h-10 items-center gap-2 rounded-full px-[18px] text-[13.5px] font-bold tracking-[-0.01em] whitespace-nowrap text-white shadow-[0_8px_22px_rgba(11,11,11,0.18)] transition-[transform,background] duration-150 after:absolute after:inset-0 after:rounded-[15px] hover:-translate-y-px hover:bg-black"
          >
            {event.type === "reply" && <Icon name="tg" size={17} />}
            {event.cta.label}
            <Icon name="chevron" size={15} />
          </Link>

          {event.price != null && (
            <span className="inline-flex items-baseline gap-[5px]">
              <span className="text-tn-red font-tn-mono text-[15px] font-semibold tracking-[-0.02em]">
                {formatETB(event.price)}
              </span>
              {event.wasPrice != null && (
                <span className="text-tn-mute font-tn-mono text-xs line-through">
                  {formatETB(event.wasPrice)}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {event.thumb && (
        <div
          aria-hidden
          className="bg-tn-paper border-tn-hair pointer-events-none relative hidden h-16 w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] border sm:flex"
        >
          {image ? (
            <Image src={image} alt="" fill sizes="54px" className="object-cover" />
          ) : (
            <ProdPlaceholder kind={event.thumb.kind ?? "other"} />
          )}
        </div>
      )}
    </li>
  );
}
