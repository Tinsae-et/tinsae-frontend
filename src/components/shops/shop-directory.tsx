import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { getShops, type ShopArea } from "@/lib/api/public";
import { getCurrentUser } from "@/lib/auth/session";
import {
  DIRECTORY_PAGE_SIZE,
  DIRECTORY_SORTS,
  directoryHref,
  pageCount,
  pageWindow,
  type DirectoryQuery,
  type DirectorySort,
} from "@/lib/shop-directory";
import { cn } from "@/lib/utils";
import { ShopCard, ShopCardSkeleton } from "./shop-card";
import { SegToggle } from "./seg-toggle";

// The public Verified Shops directory (/shops), built from design_handoff_shop_directory.
// Server-rendered throughout: the area and sort chips and the pager are links,
// so each view is its own indexable URL and needs no client JavaScript.

const GUTTER = "mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12 xl:px-16";

export function DirectoryHeader({ query }: { query: DirectoryQuery }) {
  const qs = directoryHref(query).split("?")[1] ?? "";
  return (
    <section className="border-tn-hair2 border-b bg-[radial-gradient(120%_120%_at_90%_-20%,#FFF1EB_0%,rgba(255,255,255,0)_50%)]">
      <div className={cn(GUTTER, "flex flex-wrap items-end justify-between gap-5 pt-9 pb-7")}>
        <div>
          <div className="border-tn-hair text-tn-ink2 mb-3.5 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[12.5px] font-bold shadow-[0_2px_8px_rgba(11,11,11,0.03)]">
            <Icon name="shield" size={14} className="text-tn-green" />
            Every shop verified by Tinsae
          </div>
          <h1 className="text-tn-ink text-[34px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[40px]">
            Verified shops
          </h1>
          <p className="text-tn-mute mt-2.5 max-w-[560px] text-base leading-relaxed font-medium">
            Each one passed a manual check by the Tinsae team. Browse by area, then visit the
            one you trust.
          </p>
        </div>
        <div className="shrink-0 pb-1">
          <SegToggle active="List" searchParams={qs} />
        </div>
      </div>
    </section>
  );
}

export function DirectoryControls({ query, areas }: { query: DirectoryQuery; areas: ShopArea[] }) {
  const chips: { label: string; area?: string }[] = [
    { label: "All areas" },
    ...areas.map((a) => ({ label: a.city, area: a.city })),
  ];
  // An area typed into the URL that no verified shop is in still gets a chip,
  // so the page shows what it's filtering by.
  if (query.area && !areas.some((a) => a.city.toLowerCase() === query.area!.toLowerCase())) {
    chips.push({ label: query.area, area: query.area });
  }

  return (
    <section className="border-tn-hair2 sticky top-0 z-20 border-b bg-white/95 backdrop-blur-md">
      <div className={cn(GUTTER, "flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center")}>
        <nav aria-label="Filter by area" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 lg:flex-wrap">
          {chips.map(({ label, area }) => {
            const active = (query.area ?? "").toLowerCase() === (area ?? "").toLowerCase();
            return (
              <Link
                key={label}
                href={directoryHref(query, { area })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-tn-ink text-white"
                    : "border-tn-hair text-tn-ink2 hover:border-tn-ink hover:text-tn-ink border bg-white",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 overflow-x-auto lg:ml-auto">
          <span className="text-tn-mute text-[13px] font-semibold">Sort</span>
          {(Object.keys(DIRECTORY_SORTS) as DirectorySort[]).map((sort) => {
            const active = query.sort === sort;
            return (
              <Link
                key={sort}
                href={directoryHref(query, { sort })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[13px] font-bold whitespace-nowrap transition-colors",
                  active
                    ? "border-[#FBD9C7] bg-tn-red-soft text-[#A82500]"
                    : "border-tn-hair text-tn-ink2 hover:border-tn-ink bg-white",
                )}
              >
                {DIRECTORY_SORTS[sort].label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** The results for one query. Rendered under a Suspense boundary keyed on the query. */
export async function DirectoryResults({ query }: { query: DirectoryQuery }) {
  let data;
  let currentUser;
  try {
    [data, currentUser] = await Promise.all([
      getShops({
        verifiedOnly: true,
        city: query.area,
        ordering: DIRECTORY_SORTS[query.sort].ordering,
        page: query.page,
        pageSize: DIRECTORY_PAGE_SIZE,
      }),
      getCurrentUser(),
    ]);
  } catch {
    // Past the last page the API answers 404; anything else is an outage.
    // Neither is "no shops", so neither shows the empty state.
    return (
      <Notice
        icon="close"
        title={query.page > 1 ? "That page doesn't exist" : "We couldn't load shops right now"}
        body={
          query.page > 1
            ? "There aren't that many verified shops yet."
            : "Please try again in a moment."
        }
        action={
          <Pill kind="outline" size="md" href={directoryHref(query, { page: 1 })}>
            {query.page > 1 ? "Back to page 1" : "Try again"}
          </Pill>
        }
      />
    );
  }

  if (data.count === 0) {
    return query.area ? (
      <Notice
        icon="pin"
        title={`No verified shops in ${query.area} yet`}
        body="Try another area, or browse every verified shop."
        action={
          <Pill kind="outline" size="md" href={directoryHref(query, { area: undefined })}>
            See all areas
          </Pill>
        }
      />
    ) : (
      <Notice
        icon="shield"
        title="No verified shops yet"
        body="Shops appear here once the Tinsae team has checked them in person. Run one? Get verified and be among the first."
        action={
          <Pill kind="solid" size="md" iconAfter="arrow" href="/signup">
            List your shop
          </Pill>
        }
      />
    );
  }

  const pages = pageCount(data.count);
  return (
    <>
      <p className="text-tn-mute mb-4 text-[13px] font-semibold" aria-live="polite">
        {data.count.toLocaleString()} verified {data.count === 1 ? "shop" : "shops"}
        {query.area ? ` in ${query.area}` : ""}
        {pages > 1 ? ` · page ${query.page} of ${pages}` : ""}
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.results.map((shop) => (
          <ShopCard key={shop.id} shop={shop} isAuthenticated={Boolean(currentUser)} />
        ))}
      </div>
      {pages > 1 && <Pager query={query} pages={pages} />}
    </>
  );
}

export function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading shops">
      <div className="bg-tn-hair2 mb-4 h-4 w-40 animate-pulse rounded" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ShopCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function Pager({ query, pages }: { query: DirectoryQuery; pages: number }) {
  const step = (page: number, label: string, icon: "back" | "arrow") =>
    page >= 1 && page <= pages ? (
      <Link
        href={directoryHref(query, { page })}
        rel={icon === "back" ? "prev" : "next"}
        className="border-tn-hair text-tn-ink hover:border-tn-ink inline-flex h-10 items-center gap-1.5 rounded-full border bg-white px-4 text-[13px] font-bold"
      >
        {icon === "back" && <Icon name="back" size={14} />}
        {label}
        {icon === "arrow" && <Icon name="arrow" size={14} />}
      </Link>
    ) : (
      <span className="border-tn-hair2 text-tn-mute inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-bold opacity-50">
        {label}
      </span>
    );

  return (
    <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {step(query.page - 1, "Previous", "back")}
      <div className="flex items-center gap-1">
        {pageWindow(query.page, pages).map((page, i) =>
          page === null ? (
            <span key={`gap-${i}`} className="text-tn-mute px-1.5">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={directoryHref(query, { page })}
              aria-current={page === query.page ? "page" : undefined}
              className={cn(
                "font-tn-mono inline-flex size-10 items-center justify-center rounded-full text-[13px] font-semibold",
                page === query.page ? "bg-tn-ink text-white" : "text-tn-ink2 hover:bg-tn-paper",
              )}
            >
              {page}
            </Link>
          ),
        )}
      </div>
      {step(query.page + 1, "Next", "arrow")}
    </nav>
  );
}

function Notice({
  icon,
  title,
  body,
  action,
}: {
  icon: "pin" | "shield" | "close";
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="border-tn-hair bg-tn-paper mx-auto my-12 max-w-lg rounded-3xl border p-10 text-center">
      <div className="bg-tn-red-soft text-tn-red mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
        <Icon name={icon} size={26} />
      </div>
      <h2 className="text-tn-ink text-xl font-extrabold tracking-tight">{title}</h2>
      <p className="text-tn-mute mt-2 text-sm leading-relaxed">{body}</p>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}

export function ListYourShopBand() {
  return (
    <section className="mx-auto mt-14 max-w-[1240px] px-6 lg:mt-16 lg:px-7">
      <div className="bg-tn-ink flex flex-wrap items-center justify-between gap-6 rounded-[22px] p-9 text-white shadow-[0_24px_60px_rgba(11,11,11,0.22)] sm:p-11">
        <div className="max-w-[480px]">
          <h2 className="text-[26px] font-extrabold tracking-[-0.03em] sm:text-[28px]">Run a shop?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/70">
            Get verified, confirm your stock on Telegram each morning, and appear right here in
            front of ready-to-buy customers.
          </p>
        </div>
        <Pill kind="light" size="lg" iconAfter="arrow" href="/signup">
          List your shop
        </Pill>
      </div>
    </section>
  );
}

export { GUTTER as DIRECTORY_GUTTER };
