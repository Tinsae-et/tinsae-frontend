import Image from "next/image";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { formatETB, freshness, type FreshnessTone } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// Ported from `ProductMini` in the design, adapted to the backend's data model.
// The design shows "From <price> · N shops" — a price-comparison view that
// aggregates one product model across many shops. The backend's Product belongs
// to a single shop, so we show that shop and its actual price instead.

const TONE_DOT: Record<FreshnessTone, string> = {
  fresh: "bg-tn-green",
  aging: "bg-tn-warn",
  stale: "bg-tn-stale",
  unknown: "bg-tn-stale",
};

const TONE_TEXT: Record<FreshnessTone, string> = {
  fresh: "text-[#157049]",
  aging: "text-[#8a5512]",
  stale: "text-tn-mute",
  unknown: "text-tn-mute",
};

export function ProductCard({ product }: { product: Product }) {
  const fresh = freshness(product.last_confirmed_at);
  const image = product.images.find((i) => i.is_primary) ?? product.images[0];

  return (
    <article className="border-tn-hair flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
      <div className="bg-tn-paper relative aspect-square">
        {image ? (
          <Image
            src={image.url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <ProdPlaceholder kind={kindForSlug(product.category?.slug)} />
        )}

        <span
          className={cn(
            "absolute top-3 left-3 inline-flex h-6 items-center gap-1.5 rounded-full bg-white/95 px-2.5 text-[11px] font-bold",
            TONE_TEXT[fresh.tone],
          )}
        >
          <span className={cn("size-1.5 rounded-full", TONE_DOT[fresh.tone])} />
          {fresh.badge}
        </span>
      </div>

      <div className="px-4 pt-3.5 pb-4">
        {/* The serializer folds brand into `title`, so the eyebrow shows category. */}
        <p className="text-tn-mute truncate text-[10.5px] font-bold tracking-[0.06em] uppercase">
          {product.category?.name ?? "Electronics"}
        </p>
        <h3 className="text-tn-ink mt-1 truncate text-[14.5px] leading-tight font-extrabold tracking-tight">
          {product.title}
        </h3>

        <p className="font-tn-mono text-tn-red mt-2.5 text-[15.5px] font-semibold tracking-tight">
          {formatETB(product.price)}
        </p>

        <div className="border-tn-hair2 text-tn-ink2 mt-2.5 flex items-center justify-between gap-2 border-t pt-2.5 text-[11.5px]">
          <span className="flex min-w-0 items-center gap-1.5">
            {product.shop_verified && <VerifiedBadge size={11} />}
            <span className="truncate">{product.shop_name}</span>
          </span>
          <span className="font-tn-mono text-tn-mute shrink-0">{fresh.age}</span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border-tn-hair overflow-hidden rounded-2xl border bg-white">
      <div className="bg-tn-hair2 aspect-square animate-pulse" />
      <div className="px-4 pt-3.5 pb-4">
        <div className="bg-tn-hair2 h-2.5 w-16 animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-2.5 h-3.5 w-full animate-pulse rounded" />
        <div className="bg-tn-hair2 mt-3 h-4 w-24 animate-pulse rounded" />
        <div className="border-tn-hair2 mt-2.5 flex justify-between border-t pt-2.5">
          <div className="bg-tn-hair2 h-2.5 w-20 animate-pulse rounded" />
          <div className="bg-tn-hair2 h-2.5 w-10 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
