import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { type ComponentProps, type ReactNode } from "react";


type IconName = ComponentProps<typeof Icon>["name"];

type Kind =
  | "price-drop"
  | "shop-replied"
  | "saved-search"
  | "back-in-stock"
  | "selling-fast"
  | "shop-verified";

type Group = "Today" | "Yesterday" | "Earlier";
type Thumb = "phone" | "tablet" | "logo";



export interface NotificationItem {
  id: string;
  kind: Kind;
  group: Group;
  timeAgo: string;
  title: string;
  body: ReactNode;
  unread: boolean;
  cta: string;
  price?: string;
  oldPrice?: string;
  chips?: string[];
  thumb?: Thumb;
}

const KIND_META: Record<Kind, { label: string; text: string; iconBg: string; icon: IconName }> = {
  "price-drop": {
    label: "PRICE DROP",
    text: "text-green-600 text-xs font-bold",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: "tag"
  },
  "shop-replied": {
    label: "SHOP REPLIED",
    text: "text-sky-600 text-xs font-bold",
    iconBg: "bg-sky-50 text-sky-500 ",
    icon: "tg",
  },
  "saved-search": {
    label: "SAVED SEARCH",
    text: "text-neutral-500 text-xs font-bold",
    iconBg: "bg-neutral-100 text-neutral-600",
    icon: "search",
  },
  "back-in-stock": {
    label: "BACK IN STOCK",
    text: "text-orange-600 text-xs font-bold",
    iconBg: "bg-orange-50 text-orange-500",
    icon: "box",
  },
  "selling-fast": {
    label: "SELLING FAST",
    text: "text-amber-600 text-xs font-bold",
    iconBg: "bg-amber-50 text-amber-500",
    icon: "bolt",
  },
  "shop-verified": {
    label: "SHOP VERIFIED",
    text: "text-emerald-600 text-xs font-bold",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: "shield",
  },
};



export function NotificationCard({item}: { item: NotificationItem}) {
  const meta = KIND_META[item.kind];
  return (
    <li className="relative rounded-2xl border border-neutral-200 bg-white p-4 pl-4 ">
      {item.unread && (
        <span
          aria-label="Unread"
          className="absolute -left-3 top-5 h-1.5 w-1.5 rounded-full bg-red-500"
        />
      )}

      <div className="flex gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.iconBg}`}>
          <Icon name={meta.icon}/>
        </span>
        

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-medium tracking-[0.14em]">
            <span className={`${meta.text}`}>{meta.label}</span>
            <span className="ml-2 text-neutral-400">{item.timeAgo}</span>
          </p>
          <h3 className="mt-1  font-extrabold leading-snug">{item.title}</h3>
          <p className="mt-0.5 max-w-md text-xs font-semi leading-relaxed text-gray-500">{item.body}</p>

          {item.chips && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[10px] text-neutral-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <Pill className="bg-black shadow-black" size="sm" icon={item.kind === "shop-replied" ? "tg" : undefined} >
              {item.cta}
              {item.kind !== "shop-replied" && <span aria-hidden>›</span>}
            </Pill>

            {item.price && (
              <span className="flex items-baseline gap-1.5">
                <span className="font-mono text-xs font-semibold text-red-600">{item.price}</span>
                {item.oldPrice && (
                  <span className="font-mono text-[9px] text-neutral-400 line-through">
                    {item.oldPrice}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {item.thumb && <Thumbnail variant={item.thumb} />}
      </div>
    </li>
  );
}
function Thumbnail({ variant }: { variant: Thumb }) {
  return (
    <div
      aria-hidden
      className="hidden h-15 w-15 shrink-0 place-items-center rounded-xl bg-neutral-100 sm:grid"
    >
      {variant === "phone" && <span className="h-9 w-5 rounded-[5px] bg-neutral-950" />}
      {variant === "tablet" && <span className="h-9 w-6 rounded-lg bg-neutral-950" />}
      {variant === "logo" && (
        <span className="h-7 w-7 rounded-md border-[5px] border-b-0 border-neutral-950" />
      )}
    </div>
  );
}