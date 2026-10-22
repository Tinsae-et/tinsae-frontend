import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCategories, getCategorySchema, getProduct, getShop } from "@/lib/api/public";
import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import { formatSpecSections, type SpecRow, type SpecSections } from "@/lib/specs/display";
import { parseSizeGb } from "@/lib/specs/schema";
import { SITE_URL } from "@/lib/config";
import { JsonLd } from "@/components/json-ld";
import {
  formatETB,
  freshness,
  normalizeImageUrl,
  priceUnit,
  stockBadge,
  type FreshnessTone,
} from "@/lib/format";
import { CONDITION_OPTIONS } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { Product, Shop } from "@/lib/types";
import { kindForSlug } from "@/components/tinsae/prod-placeholder";
import { ProductGallery } from "@/components/products/product-gallery";
import { SimilarProductsInfinite } from "@/components/products/similar-products-infinite";
import { extractBrand, getInitialSuggestions } from "@/lib/suggestions";
import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { ProductCardSkeleton } from "@/components/products/product-card";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { TrackedContactAction } from "@/components/shops/tracked-contact-action";

type Props = { params: Promise<{ slug: string }> };

// The product detail page (design_handoff_listing). Server-rendered — this is
// the primary SEO surface. The gallery is the only interactive client bit.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product || product.slug !== slug) {
    return { title: "Listing not found — Tinsae" };
  }
  const description = truncate(
    product.description ??
      `${product.title} at ${product.shop_name}, confirmed in stock via Tinsae.`,
    160,
  );
  const url = `/products/${product.slug}`;
  const image = product.images[0]?.url;
  return {
    title: `${product.title} — Tinsae`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description,
      url,
      type: "website",
      ...(image ? { images: [{ url: image, alt: product.title }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: product.title, description },
  };
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** schema.org Product + Offer, so search results can show price and seller. */
function productJsonLd(product: Product): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    // Absolute: unlike Open Graph (resolved via metadataBase), JSON-LD URLs
    // are used as-is, and Django serves media paths relative to this site.
    ...(product.images.length
      ? { image: product.images.map((i) => new URL(i.url, SITE_URL).toString()) }
      : {}),
    ...(product.category ? { category: product.category.name } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "ETB",
      url: `${SITE_URL}/products/${product.slug}`,
      // Only a recent stock confirmation justifies claiming availability.
      ...(product.confirmation_status === "fresh"
        ? { availability: "https://schema.org/InStock" }
        : {}),
      seller: { "@type": "Organization", name: product.shop_name },
    },
  };
}

/**
 * Split "iPhone 15 Pro 256GB" into name + muted capacity tail when the title
 * ends with the listing's storage. Storage is stored in GB (1024 = 1 TB) while
 * titles are free text ("256GB", "1 TB"), so the match is loose.
 */
function splitCapacity(
  title: string,
  specs: Record<string, unknown>,
): [string, string] {
  // Storage is a number of GB; older listings stored "256gb".
  const gb =
    typeof specs.storage === "number"
      ? specs.storage
      : typeof specs.storage === "string"
        ? parseSizeGb(specs.storage)
        : null;
  if (!gb) return [title, ""];
  const [num, unit] = gb >= 1024 ? [gb / 1024, "tb"] : [gb, "gb"];
  const digits = String(num).replace(".", "\\.");
  const tail = title.match(new RegExp(`\\s*${digits}\\s*${unit}$`, "i"));
  if (!tail || tail.index === undefined || tail.index === 0) return [title, ""];
  return [title.slice(0, tail.index).trim(), tail[0].trim()];
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

/** A labelled grid of spec tiles; renders nothing without rows. */
function SpecBlock({ title, rows }: { title: string; rows: SpecRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-[22px]">
      <h2 className="mb-3 text-[14px] font-extrabold tracking-[-0.01em] text-tn-ink">{title}</h2>
      <div className="grid grid-cols-2 gap-[12px_16px] sm:grid-cols-3">
        {rows.map((spec) => (
          <div key={spec.key} className="rounded-xl bg-tn-paper px-3.5 py-3">
            <div className="text-tn-mute text-[10.5px] font-bold tracking-[0.05em] uppercase">
              {spec.label}
            </div>
            <div className="text-tn-ink mt-1 text-sm font-bold">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopComparison({
  product,
  shop,
  currentUser,
  now,
  specs,
  hasCondition,
  isOwner = false,
}: {
  product: Product;
  shop?: Shop | null;
  currentUser?: AuthUser | null;
  now: number;
  specs: SpecSections;
  /** False for property: the row says "For sale" / "For rent" instead. */
  hasCondition: boolean;
  isOwner?: boolean;
}) {
  const isAuthenticated = Boolean(currentUser);
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
  // The shop's logo when it has one, else its initials on the shop colour.
  const shopLogo = normalizeImageUrl(product.shop_logo);
  const shopAvatar = shopLogo ? (
    <Image src={shopLogo} alt="" fill unoptimized sizes="42px" className="object-cover" />
  ) : (
    initials(product.shop_name)
  );

  return (
    <div>
      {/* ── two-column hero ─────────────────────────────── */}
      <div className="grid items-start gap-[44px] lg:grid-cols-[1fr_1.12fr]">
        <ProductGallery
          images={product.images.map((i) => i.url)}
          kind={kindForSlug(product.category?.slug)}
          categorySlug={product.category?.slug}
          tone={tone}
          label={stockBadge(f, product.specs)}
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
            {product.category?.name ?? "Listing"}
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
                {priceUnit(product.specs) && (
                  <span className="text-tn-mute ml-2 font-sans text-base font-semibold tracking-normal">
                    {priceUnit(product.specs)}
                  </span>
                )}
              </p>
              <p className="text-tn-ink2 mt-2 text-[13.5px]">
                across{" "}
                <b>{product.shop_verified ? "1 verified shop" : "1 shop"}</b>
              </p>
            </div>
            <ProductDetailActions
              slug={product.slug}
              title={product.title}
              shop={shop}
              product={product}
              isAuthenticated={isAuthenticated}
              isOwner={isOwner}
            />
          </div>

          {/* freshness */}
          <div className="mt-[18px]">
            <FreshnessBar hours={hours} responded={responded} tone={tone} />
          </div>

          {/* Every spec in one grid: key attributes, then facts about this
              unit, then the rest of the sheet. One list, one style. */}
          <SpecBlock
            title="Key specifications"
            rows={[...specs.key, ...specs.item, ...specs.more]}
          />
        </div>
      </div>

      {/* ── shop comparison ─────────────────────────────── */}
      <section className="pt-14">
        <div className="mb-[18px]">
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
        </div>

        {/* Marketplace card language; the brand-red marker moves to a ring
            around the shop's initials tile. */}
        <div className="border-tn-hair rounded-[18px] border bg-white px-[18px] py-4 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[#E0DDD4] hover:shadow-[0_18px_44px_rgba(11,11,11,0.09)]">
          <div className="grid grid-cols-[2.4fr_1.2fr_1.3fr_1.3fr] items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {product.shop_slug ? (
                <Link
                  href={`/shops/${product.shop_slug}`}
                  aria-label={`View ${product.shop_name}`}
                  className="ring-tn-red/40 ring-offset-white relative flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] text-sm font-bold text-white ring-2 ring-offset-2 transition-transform hover:scale-105"
                  style={{ background: shopColor(product.shop_name) }}
                >
                  {shopAvatar}
                </Link>
              ) : (
                <span
                  className="ring-tn-red/40 ring-offset-white relative flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] text-sm font-bold text-white ring-2 ring-offset-2"
                  style={{ background: shopColor(product.shop_name) }}
                >
                  {shopAvatar}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {product.shop_slug ? (
                    <Link
                      href={`/shops/${product.shop_slug}`}
                      className="text-tn-ink hover:text-tn-red truncate text-[14.5px] font-extrabold tracking-[-0.01em] transition-colors"
                    >
                      {product.shop_name}
                    </Link>
                  ) : (
                    <span className="text-tn-ink truncate text-[14.5px] font-extrabold tracking-[-0.01em]">
                      {product.shop_name}
                    </span>
                  )}
                  {product.shop_verified && <VerifiedBadge size={12} />}
                </div>
              </div>
            </div>

            <span className="text-tn-ink2 text-[13px] font-semibold">
              {hasCondition
                ? (CONDITION_OPTIONS.find((o) => o.value === product.condition)?.label ?? "New")
                : product.specs?.listing_type === "rent"
                  ? "For rent"
                  : "For sale"}
            </span>
            <span className="text-tn-ink2 flex items-center gap-1.5 text-[13px] font-semibold">
              <Icon name="shield" size={13} className="text-tn-mute" />
              {f.age}
            </span>

            <div className="flex items-center justify-between gap-3">
              <span className="font-tn-mono text-tn-red text-[19px] font-semibold tracking-[-0.02em] whitespace-nowrap">
                {formatETB(product.price)}
                {priceUnit(product.specs) && (
                  <span className="text-tn-mute block text-right font-sans text-xs font-semibold tracking-normal">
                    {priceUnit(product.specs)}
                  </span>
                )}
              </span>
              {isOwner ? (
                <Pill
                  kind="outline"
                  size="sm"
                  href={`/shop/dashboard/listings/edit?slug=${product.slug}`}
                  className="h-9 px-4 text-xs font-bold"
                >
                  Edit listing
                </Pill>
              ) : shop ? (
                <TrackedContactAction
                  shop={shop}
                  product={{
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                  }}
                  isAuthenticated={isAuthenticated}
                  size="sm"
                  label="Contact"
                />
              ) : (
                <Pill
                  kind="solid"
                  size="sm"
                  icon="tg"
                  href={
                    product.shop_slug
                      ? `/shops/${product.shop_slug}`
                      : undefined
                  }
                >
                  Contact
                </Pill>
              )}
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
            {product.shop_verified ? (
              <>
                This shop is <b className="text-tn-ink">verified by Tinsae</b>.
              </>
            ) : (
              <>
                This shop is <b className="text-tn-ink">not yet verified</b> by
                Tinsae.
              </>
            )}{" "}
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

  // Labels, order and units come from the category's schema; without one the
  // specs still render with their stored keys and values.
  const [schema, categoriesData, currentUser, shop] = await Promise.all([
    product.category?.slug
      ? getCategorySchema(product.category.slug).catch(() => null)
      : Promise.resolve(null),
    getCategories().catch(() => null),
    getCurrentUser(),
    product.shop_slug
      ? getShop(product.shop_slug).catch(() => null)
      : Promise.resolve(null),
  ]);
  const isOwner = Boolean(
    currentUser?.shops?.some(
      (s) =>
        s.slug === product.shop_slug ||
        (shop && (s.slug === shop.slug || s.id === String(shop.id))),
    ),
  );
  const specSections = formatSpecSections(schema, product.specs);

  // A subcategory's group ("Vehicles & Auto" for Cars) for the breadcrumb; the
  // product carries only the parent's id, the category list (cached) its name.
  const parentId = product.category?.parent ?? null;
  const parentCategory = parentId
    ? (categoriesData?.results.find((c) => c.id === parentId) ?? null)
    : null;

  // Server component: freshness is relative to request time, rendered once.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  // Breadcrumb: brand is its own level, so the last crumb drops the brand the
  // serializer prepends to the title ("Apple iPhone 16 Pro Max" -> "iPhone 16
  // Pro Max"). Only split when the brand actually prefixes the title, so a
  // stray spec value can't duplicate it.
  const rawBrand = extractBrand(product);
  const brand =
    rawBrand && product.title.toLowerCase().startsWith(`${rawBrand.toLowerCase()} `)
      ? rawBrand
      : null;
  const productName = brand ? product.title.slice(brand.length).trim() : product.title;

  // The brand crumb browses the same listing filtered to this brand, scoped to
  // the product's category when it has one.
  const brandHref = (() => {
    const params = new URLSearchParams({ brand: brand ?? "" });
    if (product.category?.slug) params.set("category", product.category.slug);
    return `/products?${params.toString()}`;
  })();

  return (
    <main className="text-tn-ink mx-auto max-w-[1480px] px-6 pt-6 sm:px-8 lg:px-12 xl:px-16">
      <JsonLd data={productJsonLd(product)} />
      {/* breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-[7px] text-[12.5px] font-semibold"
      >
        <Link href="/" className="text-tn-mute hover:text-tn-ink">
          Home
        </Link>
        {parentCategory && (
          <>
            <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
            <Link
              href={`/products?category=${parentCategory.slug}`}
              className="text-tn-mute hover:text-tn-ink"
            >
              {parentCategory.name}
            </Link>
          </>
        )}
        <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
        <Link
          href={
            product.category?.slug
              ? `/products?category=${product.category.slug}`
              : "/products"
          }
          className="text-tn-mute hover:text-tn-ink"
        >
          {product.category?.name ?? "Browse"}
        </Link>
        {brand && (
          <>
            <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
            <Link href={brandHref} className="text-tn-mute hover:text-tn-ink">
              {brand}
            </Link>
          </>
        )}
        <Icon name="chevron" size={11} className="text-[#B7B5AD]" />
        <span className="text-tn-ink">{productName}</span>
      </nav>

      {isOwner && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tn-hair bg-tn-paper px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5 text-[13.5px] font-medium text-tn-ink2">
            <span className="size-2 rounded-full bg-tn-green" />
            <span>You are previewing your own listing as visitors see it.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/shop/dashboard/listings/edit?slug=${product.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-tn-ink px-3.5 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-px"
            >
              <Pencil className="size-3.5" />
              Edit listing
            </Link>
            <Link
              href="/shop/dashboard/listings"
              className="inline-flex items-center gap-1.5 rounded-full border border-tn-hair bg-white px-3.5 py-1.5 text-xs font-bold text-tn-ink transition-transform hover:-translate-y-px"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}

      <div className="pt-5">
        <ShopComparison
          product={product}
          shop={shop}
          currentUser={currentUser}
          now={now}
          specs={specSections}
          hasCondition={schema?.hasCondition !== false}
          isOwner={isOwner}
        />
      </div>

      {/* Similar & infinite scrolling suggestion feed. Streamed: the tiered
          lookups take up to four Django round trips, and the listing itself
          should not wait for any of them. */}
      <Suspense fallback={<SimilarSkeleton />}>
        <SimilarSection key={product.slug} product={product} />
      </Suspense>
    </main>
  );
}

/** Tiered recommendations (brand affinity, price proximity, category peers). */
async function SimilarSection({ product }: { product: Product }) {
  const initialSuggestions = await getInitialSuggestions(product, 8);
  return <SimilarProductsInfinite product={product} initialProducts={initialSuggestions} />;
}

function SimilarSkeleton() {
  return (
    <section className="mt-14 border-t border-tn-hair pt-10" aria-busy="true" aria-label="Loading similar listings">
      <div className="bg-tn-hair2 h-8 w-64 max-w-full animate-pulse rounded" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
