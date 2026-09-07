import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getSimilarProducts } from "@/lib/api";
import { formatETB, freshness, type FreshnessTone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { kindForSlug } from "@/components/tinsae/prod-placeholder";
import { ProductGallery } from "@/components/products/product-gallery";
import { SimilarProductsInfinite } from "@/components/products/similar-products-infinite";
import { getInitialSuggestions } from "@/lib/suggestions";
import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// The product detail page (design_handoff_listing). Server-rendered — this is
// the primary SEO surface. The gallery is the only interactive client bit.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product || product.slug !== slug) {
    return { title: "Listing not found — Tinsae" };
  }
  return {
    title: `${product.title} — Tinsae`,
    description:
      product.description ??
      `${product.title} at ${product.shop_name}, confirmed in stock via Tinsae.`,
  };
}

/** Per-category spec labels; anything unknown passes through title-cased. */
const SPEC_LABELS: Record<string, string> = {
  storage: "Storage",
  display: "Display",
  chip: "Chip",
  camera: "Camera",
  battery: "Battery",
  n5g: "5G",
  year: "Year",
  weigth: "Weight",
  weight: "Weight",
  sim: "SIM",
  ram: "RAM",
  capacity: "Capacity",
  power: "Power",
  type: "Type",
  length: "Length",
  material: "Material",
  port: "Port",
  driver: "Driver",
  bluetooth: "Bluetooth",
  water_resistance: "Water resistance",
};

function titleCase(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function specLabel(key: string): string {
  return SPEC_LABELS[key] ?? titleCase(key);
}

// Canonical order for the Key specifications grid, from the design README:
// Storage, Display, Chip, Camera, Battery, 5G, Year, Weight, SIM. RAM rides
// along with the phone set; unknown keys fall through after the known ones.
const SPEC_ORDER = [
  "storage",
  "display",
  "chip",
  "camera",
  "battery",
  "ram",
  "n5g",
  "year",
  "weight",
  "sim",
];

/** Sort spec entries: known keys first in design order, then the rest. */
function orderSpecs(specs: [string, unknown][]): [string, unknown][] {
  const rank = (key: string) => {
    const i = SPEC_ORDER.indexOf(key);
    return i === -1 ? SPEC_ORDER.length : i;
  };
  return [...specs].sort((a, b) => rank(a[0]) - rank(b[0]));
}

/** Split "iPhone 15 Pro 256GB" into name + muted capacity tail when present. */
function splitCapacity(
  title: string,
  specs: Record<string, unknown>,
): [string, string] {
  const cap = specs.storage;
  if (typeof cap === "string" && cap && title.endsWith(cap)) {
    return [title.slice(0, title.length - cap.length).trim(), cap];
  }
  return [title, ""];
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// Deterministic tile colour from the shop name (design: 42px initials tile).
function shopColor(name: string): string {
  const palette = [
    "#7A2E2E",
    "#0F2A4D",
    "#3B5742",
    "#2D4A5E",
    "#5A4A2E",
    "#4A2E5E",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return palette[Math.abs(h) % palette.length];
}

// Track colours mirror the tn-green / tn-stale tokens.
const TONE_HEX: Record<FreshnessTone, string> = {
  fresh: "#1F8A5B",
  stale: "#9A9A95",
  unconfirmed: "#9A9A95",
};

/**
 * The width of the chart below, in days, matching its own tick labels.
 *
 * This is an axis, not a threshold: it decides where the dot sits, never what
 * the listing is called. The label comes from `confirmation_status` via
 * `freshness()`, and nothing here can promote or demote it.
 *
 * Chosen to sit near PRODUCT_STALENESS_DAYS so the dot runs out at roughly the
 * point the backend stops calling a listing fresh — "roughly" because that
 * setting is `env.int("PRODUCT_STALENESS_DAYS", 30)`, so a deployment can move
 * it and this will not follow. The cost of drifting is a dot in a slightly
 * wrong position, which is why this is a local constant instead of a value
 * worth plumbing through the API.
 */
const AXIS_DAYS = 30;

function FreshnessBar({
  hours,
  responded,
  tone,
}: {
  hours: number | null;
  responded: boolean;
  tone: FreshnessTone;
}) {
  // One dot per shop, on a track spanning the full confirmation window, so the
  // point where the dot runs out is roughly the point the badge turns "Stale".
  const pct =
    hours === null ? null : Math.min(100, (hours / (AXIS_DAYS * 24)) * 100);
  // Coloured by the resolved tone, not by the raw clock: a listing the shop has
  // reported sold out must not sit green on the track just because it is recent.
  const dotColor = TONE_HEX[tone];

  return (
    <div className="rounded-[18px] border border-tn-hair bg-white px-[22px] py-[18px]">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="clock" size={16} className="text-tn-ink2" />
          <span className="text-[13.5px] font-extrabold text-tn-ink">
            Stock freshness · last 30 days
          </span>
        </div>
        <span className="text-tn-mute text-xs">
          {responded ? "1 of 1 responded" : "no response yet"}
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-[linear-gradient(90deg,#E8F5EE_0%,#FBF0E2_60%,#F4ECE6_100%)]">
        {pct !== null && (
          <span
            className="absolute top-[-3px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-[2.5px] border-white shadow-[0_1px_3px_rgba(11,11,11,0.18)]"
            style={{ left: `${pct}%`, background: dotColor }}
          />
        )}
      </div>

      <div className="font-tn-mono text-tn-mute mt-2.5 flex justify-between text-[10.5px]">
        <span>now</span>
        <span>7d</span>
        <span>14d</span>
        <span>21d</span>
        <span>30d</span>
      </div>
    </div>
  );
}

// The hero pill states. Stale and never-confirmed stay neutral — the ticket
// asks for stale to be flagged honestly, not alarmingly, so no red anywhere.
const HERO_BADGE: Record<FreshnessTone, string> = {
  fresh: "bg-tn-green-soft text-[#157049]",
  stale: "bg-tn-paper text-tn-ink2",
  unconfirmed: "bg-tn-paper text-tn-mute",
};

function ShopComparison({ product, now }: { product: Product; now: number }) {
  const f = freshness(
    product.last_confirmed_at,
    product.confirmation_status,
    now,
  );
  const hours = product.last_confirmed_at
    ? Math.max(0, (now - new Date(product.last_confirmed_at).getTime()) / 36e5)
    : null;
  const responded = product.last_confirmed_at !== null;
  const tone = f.tone;

  const specs = orderSpecs(
    Object.entries(product.specs).filter(([, v]) => v !== null && v !== ""),
  );

  return (
    <div>
      {/* ── two-column hero ─────────────────────────────── */}
      <div className="grid items-start gap-[44px] lg:grid-cols-[1fr_1.12fr]">
        <ProductGallery
          images={product.images.map((i) => i.url)}
          kind={kindForSlug(product.category?.slug)}
          tone={tone}
          label={f.badge}
        />

        <div className="min-w-0">
          <div className="mb-3.5 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold",
                HERO_BADGE[tone],
              )}
            >
              {tone === "fresh" && <Icon name="check" size={13} />}
              {f.confirmed}
            </span>
            {product.shop_verified && (
              <span className="bg-tn-paper text-tn-ink2 inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold">
                <Icon name="shield" size={13} />
                Verified shop
              </span>
            )}
          </div>

          <p className="text-tn-mute text-xs font-bold tracking-[0.06em] uppercase">
            {product.category?.name ?? "Electronics"}
          </p>
          <h1 className="text-tn-ink mt-1.5 text-[42px] leading-[1.04] font-extrabold tracking-[-0.035em]">
            {(() => {
              const [name, capacity] = splitCapacity(
                product.title,
                product.specs,
              );
              return (
                <>
                  {name}
                  {capacity && (
                    <span className="text-tn-mute font-semibold">
                      {capacity}
                    </span>
                  )}
                </>
              );
            })()}
          </h1>
          {product.description && (
            <p className="text-tn-ink2 mt-2 text-[15px] font-semibold">
              {product.description}
            </p>
          )}

          {/* price panel */}
          <div className="mt-[22px] flex flex-wrap items-end justify-between gap-4 rounded-[18px] border border-tn-hair bg-tn-paper px-6 py-[22px]">
            <div>
              <p className="text-tn-red-dark mb-1.5 text-[11px] font-bold tracking-[0.06em] uppercase">
                Lowest price
              </p>
              <p className="font-tn-mono text-tn-red text-[40px] leading-none font-semibold tracking-[-0.03em]">
                {formatETB(product.price)}
              </p>
              <p className="text-tn-ink2 mt-2 text-[13.5px]">
                across{" "}
                <b>{product.shop_verified ? "1 verified shop" : "1 shop"}</b>
              </p>
            </div>
            <ProductDetailActions slug={product.slug} title={product.title} />
          </div>

          {/* freshness */}
          <div className="mt-[18px]">
            <FreshnessBar hours={hours} responded={responded} tone={tone} />
          </div>

          {/* key specifications */}
          {specs.length > 0 && (
            <div className="mt-[22px]">
              <h2 className="mb-3 text-[14px] font-extrabold tracking-[-0.01em] text-tn-ink">
                Key specifications
              </h2>
              <div className="grid grid-cols-2 gap-[12px_16px] sm:grid-cols-3">
                {specs.map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-tn-paper px-3.5 py-3">
                    <div className="text-tn-mute text-[10.5px] font-bold tracking-[0.05em] uppercase">
                      {specLabel(key)}
                    </div>
                    <div className="text-tn-ink mt-1 text-sm font-bold">
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── shop comparison ─────────────────────────────── */}
      <section className="pt-14">
        <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-tn-ink text-[32px] font-extrabold tracking-[-0.03em]">
              Available at{" "}
              {product.shop_verified ? "a verified shop" : "1 shop"}
            </h2>
            <p className="text-tn-mute mt-1.5 text-[14.5px]">
              {responded
                ? `Stock confirmed ${f.age.toLowerCase()}`
                : "This shop has not confirmed stock yet"}
            </p>
          </div>
          <div className="flex gap-2">
            <Pill kind="outline" size="sm" iconAfter="chevd">
              Sort: Price
            </Pill>
            <Pill kind="outline" size="sm" icon="filter">
              Filter
            </Pill>
          </div>
        </div>

        <div className="rounded-2xl border border-tn-red bg-tn-red-soft px-[18px] py-4">
          <div className="grid grid-cols-[2.4fr_1.2fr_1.3fr_1.3fr] items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] text-sm font-bold text-white"
                style={{ background: shopColor(product.shop_name) }}
              >
                {initials(product.shop_name)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-tn-ink truncate text-[14.5px] font-extrabold tracking-[-0.01em]">
                    {product.shop_name}
                  </span>
                  {product.shop_verified && <VerifiedBadge size={12} />}
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="pin" size={11} className="text-tn-mute" />
                  <span className="text-tn-mute text-[11.5px]">
                    Bole · Addis Ababa
                  </span>
                </div>
              </div>
            </div>

            <span className="text-tn-ink2 text-[13px] font-semibold">New</span>
            <span className="text-tn-ink2 flex items-center gap-1.5 text-[13px] font-semibold">
              <Icon name="shield" size={13} className="text-tn-mute" />
              {f.age}
            </span>

            <div className="flex items-center justify-between gap-3">
              <span className="font-tn-mono text-tn-red text-[19px] font-semibold tracking-[-0.02em]">
                {formatETB(product.price)}
              </span>
              <Pill kind="solid" size="sm" icon="tg">
                Contact
              </Pill>
            </div>
          </div>
        </div>

        <div className="text-tn-ink2 mt-4 flex items-start gap-2.5 rounded-2xl bg-tn-paper px-[18px] py-4 text-[13.5px] leading-[1.55]">
          <Icon
            name="shield"
            size={16}
            className="mt-0.5 shrink-0 text-tn-green"
          />
          <p>
            All shops are <b className="text-tn-ink">verified by Tinsae</b>.
            Stock is reconfirmed by the shop via Telegram — check the
            confirmation date above. Tinsae does not handle payment; visit the
            shop to inspect and complete your purchase.
          </p>
        </div>
      </section>
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }
  if (product.slug !== slug) notFound();

  // Upgraded suggestion engine: tiered recommendations (brand affinity, price proximity, category peers)
  const initialSuggestions = await getInitialSuggestions(product, 8);

  // Server component: freshness is relative to request time, rendered once.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <main className="text-tn-ink mx-auto max-w-[1240px] px-6 pt-6 lg:px-7">
      {/* breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-[7px] text-[12.5px] font-semibold"
      >
        <Link href="/" className="text-tn-mute hover:text-tn-ink">
          Home
        </Link>
        <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
        <Link href="/products" className="text-tn-mute hover:text-tn-ink">
          {product.category?.name ?? "Browse"}
        </Link>
        <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
        <span className="text-tn-ink">{product.title}</span>
      </nav>

      <div className="pt-5">
        <ShopComparison product={product} now={now} />
      </div>

      {/* Similar & infinite scrolling suggestion feed */}
      <SimilarProductsInfinite key={product.slug} product={product} initialProducts={initialSuggestions} />
    </main>
  );
}
