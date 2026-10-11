import React from "react";
import { Icon, type IconName } from "@/components/tinsae/icon";
import type { Shop } from "@/lib/types";

function Fact({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-white p-4">
      <div className="bg-tn-paper text-tn-ink2 flex size-9 shrink-0 items-center justify-center rounded-xl">
        <Icon name={icon} size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-tn-mute text-[11px] font-bold tracking-wider uppercase">
          {label}
        </div>
        <div className="text-tn-ink mt-1 text-sm font-bold break-words">{children}</div>
      </div>
    </div>
  );
}

export function AboutTab({ shop, listingsCount }: { shop: Shop; listingsCount: number }) {
  const description = shop.description?.trim();
  const memberSince = shop.created_at
    ? new Date(shop.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;
  const telegram = shop.phone?.startsWith("@") ? shop.phone : null;
  const phone = shop.phone && !telegram ? shop.phone : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-tn-ink text-[26px] font-extrabold tracking-[-0.025em]">
          About {shop.name}
        </h2>
        <p className="text-tn-mute mt-1 text-[13px]">
          Who&apos;s behind the listings, and how to reach them.
        </p>
      </div>

      <div className="border-tn-hair rounded-2xl border bg-white p-6">
        <p className="text-tn-mute text-[11px] font-bold tracking-wider uppercase">The shop</p>
        {description ? (
          <p className="text-tn-ink2 mt-3 text-[15px] leading-relaxed whitespace-pre-line">
            {description}
          </p>
        ) : (
          <p className="text-tn-mute mt-3 text-sm leading-relaxed">
            {shop.name} hasn&apos;t written a description yet. Their live listings and
            verification status are shown on this page.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {shop.is_verified ? (
            <span className="bg-tn-green-soft text-tn-green inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <Icon name="shield" size={13} />
              Tinsae verified
            </span>
          ) : (
            <span className="border-tn-hair bg-tn-paper text-tn-mute inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
              <span className="size-1.5 rounded-full bg-[#9A9A99]" />
              Not yet verified
            </span>
          )}
          <span className="border-tn-hair text-tn-ink2 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-bold">
            <Icon name="check" size={13} />
            In-person pickup
          </span>
        </div>
      </div>

      <div className="border-tn-hair bg-tn-hair2 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
        <Fact icon="pin" label="Location">
          {shop.city || "Ethiopia"}
        </Fact>
        <Fact icon="clock" label="On Tinsae since">
          {memberSince ?? "—"}
        </Fact>
        <Fact icon="box" label="Active listings">
          <span className="font-tn-mono">{listingsCount.toLocaleString()}</span>
        </Fact>
        <Fact icon={telegram ? "tg" : "phone"} label="Contact">
          {telegram ? (
            <a
              href={`https://t.me/${telegram.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tn-red hover:underline"
            >
              {telegram}
            </a>
          ) : phone ? (
            <a href={`tel:${phone}`} className="text-tn-red font-tn-mono hover:underline">
              {phone}
            </a>
          ) : (
            <span className="text-tn-mute font-semibold">Not listed</span>
          )}
        </Fact>
      </div>

      {!shop.is_verified && (
        <div className="flex items-start gap-3 border-tn-warn/30 bg-tn-warn/5 rounded-2xl border p-4">
          <Icon name="shield" size={16} className="text-tn-warn mt-0.5 shrink-0" />
          <p className="text-tn-ink2 text-[13px] leading-relaxed">
            Tinsae hasn&apos;t verified this shop&apos;s business documents yet. Meet at the
            shop&apos;s premises and inspect items before paying.
          </p>
        </div>
      )}
    </div>
  );
}

export default AboutTab;
