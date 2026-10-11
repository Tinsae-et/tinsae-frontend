"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { UPCOMING_CATEGORIES, type NavCategory } from "@/lib/nav-categories";
import { useCompare } from "@/hooks/use-compare";
import { useModal } from "@/hooks/use-modal";
import { hasShop } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { LogOut, Loader2 } from "lucide-react";
import { formatCount, formatETB } from "@/lib/format";
import type { ShopMetrics } from "@/lib/types";

function getInitials(name?: string): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center">
      {/* Orange mark + wordmark on the page background (no tile). */}
      <Image
        src="/tinsae-logo.svg"
        alt="Tinsae"
        width={184}
        height={53}
        unoptimized
        className="h-8 w-auto"
        priority
      />
    </Link>
  );
}

type SuggestionProduct = {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  condition?: string;
  shopName: string;
  shopSlug: string;
  shopVerified: boolean;
  categoryName: string | null;
  categorySlug: string | null;
  imageUrl: string | null;
};

type SuggestionCategory = {
  name: string;
  slug: string;
  icon: IconName;
  subtitle: string;
};

type SearchResults = {
  products: SuggestionProduct[];
  categories: SuggestionCategory[];
  totalProducts: number;
};

// The search field is the product's primary action. Submitting navigates to
// /products?q=...; pressing "/" anywhere focuses it; Escape blurs it.
// Features instant autocomplete with top matching categories and verified products.
function SearchField({
  autoFocus,
  onSubmitted,
  className,
  inputRef,
}: {
  autoFocus?: boolean;
  onSubmitted?: () => void;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (abortController.current) abortController.current.abort();
      abortController.current = new AbortController();
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: abortController.current.signal },
        );
        if (res.ok) {
          const data: SearchResults = await res.json();
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          setResults(null);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [q]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalCategories = results?.categories.length ?? 0;
  const totalProducts = results?.products.length ?? 0;
  const totalItems = totalCategories + totalProducts + (results ? 1 : 0);

  const handleSelect = (idx: number) => {
    if (!results) return;
    if (idx >= 0 && idx < totalCategories) {
      const cat = results.categories[idx];
      router.push(
        `/products?q=${encodeURIComponent(q.trim())}&category=${encodeURIComponent(cat.slug)}`,
      );
      setIsOpen(false);
      onSubmitted?.();
    } else if (
      idx >= totalCategories &&
      idx < totalCategories + totalProducts
    ) {
      const prod = results.products[idx - totalCategories];
      router.push(`/products/${prod.slug}`);
      setIsOpen(false);
      onSubmitted?.();
    } else {
      router.push(
        q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products",
      );
      setIsOpen(false);
      onSubmitted?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !results) {
      if (e.key === "ArrowDown" && q.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0) {
      handleSelect(selectedIndex);
    } else {
      router.push(
        q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products",
      );
      setIsOpen(false);
      onSubmitted?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative min-w-0 flex-1", className)}
    >
      <form onSubmit={handleSubmit} role="search" className="w-full">
        <div
          className={cn(
            "border-tn-hair flex h-11 items-center gap-2.5 rounded-full border-[1.5px] bg-white pl-4 pr-1.5 transition-[border-color,box-shadow] duration-150",
            (focused || isOpen) && "border-tn-red shadow-[0_0_0_4px_#FFF1EB]",
          )}
        >
          <Icon name="search" size={17} className="text-tn-mute shrink-0" />
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            value={q}
            onChange={(e) => {
              const val = e.target.value;
              setQ(val);
              if (val.trim().length < 2) {
                setIsOpen(false);
                setResults(null);
                setLoading(false);
              }
            }}
            onFocus={() => {
              setFocused(true);
              if (results && q.trim().length >= 2) setIsOpen(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search verified shops & products in Bole"
            aria-label="Search products"
            className="text-tn-ink placeholder:text-tn-mute min-w-0 flex-1 bg-transparent text-[14.5px] font-medium outline-none"
          />
          {loading ? (
            <span className="inline-flex size-[34px] shrink-0 items-center justify-center text-tn-red">
              <Loader2 className="size-4 animate-spin" />
            </span>
          ) : (
            <button
              type="submit"
              aria-label="Search"
              className="bg-tn-red hover:bg-tn-red-dark inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-white transition-colors cursor-pointer"
            >
              <Icon name="search" size={17} />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (results || loading) && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-[20px] bg-white border border-tn-hair shadow-[0_16px_48px_rgba(11,11,11,0.16)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-tn-hair max-h-[72vh] overflow-y-auto"
        >
          {loading && !results && (
            <div className="flex items-center justify-center gap-2.5 py-7 text-[13.5px] text-tn-mute">
              <Loader2 className="size-4 animate-spin text-tn-red" />
              <span>Searching verified products & shops...</span>
            </div>
          )}

          {/* Categories Matches */}
          {results && results.categories.length > 0 && (
            <div className="p-2">
              <p className="px-3 pt-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-tn-mute">
                Matching Categories
              </p>
              {results.categories.map((cat, i) => {
                const isSelected = selectedIndex === i;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(i);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors cursor-pointer",
                      isSelected ? "bg-[#F5F4F0]" : "hover:bg-[#FAF9F6]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-8 rounded-lg bg-tn-sand flex items-center justify-center text-tn-ink2 shrink-0">
                        <Icon name={cat.icon} size={16} />
                      </span>
                      <div>
                        <div className="text-[13.5px] font-semibold text-tn-ink">
                          Search &ldquo;{q}&rdquo; in{" "}
                          <span className="text-tn-red">{cat.name}</span>
                        </div>
                        <div className="text-[11.5px] text-tn-mute">
                          {cat.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-tn-mute text-xs font-semibold">
                      Category →
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Results */}
          {results && results.products.length > 0 && (
            <div className="p-2">
              <p className="px-3 pt-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-tn-mute">
                Products
              </p>
              {results.products.map((prod, i) => {
                const globalIdx = totalCategories + i;
                const isSelected = selectedIndex === globalIdx;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(globalIdx);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer",
                      isSelected ? "bg-[#F5F4F0]" : "hover:bg-[#FAF9F6]",
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative size-11 shrink-0 rounded-lg overflow-hidden bg-[#F6F5F2] border border-tn-hair flex items-center justify-center">
                      {prod.imageUrl ? (
                        <Image
                          src={prod.imageUrl}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <Icon name="box" size={18} className="text-tn-mute" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-semibold text-tn-ink truncate">
                        {prod.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11.5px] text-tn-ink2">
                        <span className="truncate max-w-[130px] sm:max-w-[180px]">
                          {prod.shopName}
                        </span>
                        {prod.shopVerified && <VerifiedBadge size={12} />}
                        {prod.condition && (
                          <>
                            <span className="text-tn-hair">•</span>
                            <span className="capitalize">{prod.condition}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="font-tn-mono text-[13px] font-bold text-tn-ink shrink-0">
                      {formatETB(prod.price)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {results &&
            results.products.length === 0 &&
            results.categories.length === 0 &&
            !loading && (
              <div className="py-7 px-4 text-center">
                <p className="text-sm font-medium text-tn-ink2">
                  No matching products found for &ldquo;{q.trim()}&rdquo;
                </p>
                <p className="text-xs text-tn-mute mt-1">
                  Press Enter to search all products in catalog
                </p>
              </div>
            )}

          {/* Footer View All Action */}
          {results && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(totalItems - 1);
              }}
              className={cn(
                "w-full px-4 py-3 bg-[#FAF9F6] flex items-center justify-between text-[13px] font-bold text-tn-red transition-colors cursor-pointer",
                selectedIndex === totalItems - 1
                  ? "bg-[#F3EFE6]"
                  : "hover:bg-[#F4F2EC]",
              )}
            >
              <span>
                View all{" "}
                {results.totalProducts > 0 ? `${results.totalProducts} ` : ""}
                results for &ldquo;{q.trim()}&rdquo;
              </span>
              <Icon name="arrow" size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Gap between bar items (`gap-5`), in px, for the fit calculation. */
const BAR_GAP = 20;

/**
 * The category bar under the header, "priority+" style: as many categories as
 * fit the width, in order, and the rest under a "More" dropdown. It measures a
 * hidden copy of every label, so it adapts to the screen and to however many
 * categories the backend sends, instead of clipping the last one.
 */
function CategoryBar({ categories }: { categories: NavCategory[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // Every item until measured: the server cannot know the width.
  const [visibleCount, setVisibleCount] = useState(categories.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const fit = () => {
      const nodes = Array.from(measure.children) as HTMLElement[];
      const more = nodes.pop();
      const widths = nodes.map((n) => n.offsetWidth);
      const moreWidth = more?.offsetWidth ?? 0;
      const available = container.clientWidth;
      const total = (n: number) =>
        widths.slice(0, n).reduce((a, b) => a + b, 0) + BAR_GAP * Math.max(0, n - 1);
      if (total(widths.length) <= available) {
        setVisibleCount(widths.length);
        return;
      }
      let n = widths.length - 1;
      while (n > 0 && total(n) + BAR_GAP + moreWidth > available) n--;
      setVisibleCount(n);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [categories]);

  const shown = categories.slice(0, visibleCount);
  const hidden = categories.slice(visibleCount);
  return (
    <div ref={containerRef} className="relative flex min-w-0 flex-1 items-center gap-5 overflow-hidden py-1">
      {shown.map((c) => (
        <CategoryBarLink key={c.slug} category={c} />
      ))}
      {hidden.length > 0 && <CategoryBarMore categories={hidden} />}
      {/* Invisible copy of every label (and "More") for measuring. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 flex gap-5 whitespace-nowrap"
      >
        {categories.map((c) => (
          <span key={c.slug} className="inline-flex items-center gap-1">
            {c.label}
            {c.children?.length ? <Icon name="chevd" size={12} /> : null}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          More
          <Icon name="chevd" size={12} />
        </span>
      </div>
    </div>
  );
}

/** "More": the categories that did not fit the bar, each with its subcategories. */
function CategoryBarMore({ categories }: { categories: NavCategory[] }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ right: number; top: number } | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setPosition({ right: window.innerWidth - rect.right, top: rect.bottom });
  };
  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPosition(null), 150);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onClick={() => (position ? setPosition(null) : show())}
        aria-haspopup="menu"
        aria-expanded={position !== null}
        className={cn(
          "hover:text-tn-red inline-flex shrink-0 items-center gap-1 whitespace-nowrap bg-transparent text-tn-mute transition-colors hover:font-bold",
          position && "text-tn-red",
        )}
      >
        More
        <Icon name="chevd" size={12} />
      </button>
      {position &&
        createPortal(
          <div
            role="menu"
            onMouseEnter={show}
            onMouseLeave={hide}
            style={{ position: "fixed", right: position.right, top: position.top + 6 }}
            className="z-[60] max-h-[70vh] w-[260px] overflow-y-auto rounded-[14px] border border-tn-hair bg-white p-2 shadow-[0_18px_44px_rgba(11,11,11,0.14)]"
          >
            {categories.map((c, i) => (
              <div key={c.slug} className={cn(i > 0 && "mt-1 border-t border-tn-hair2 pt-1")}>
                <Link
                  role="menuitem"
                  href={`/products?category=${c.slug}`}
                  onClick={() => setPosition(null)}
                  className="text-tn-ink hover:bg-tn-paper hover:text-tn-red flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-extrabold transition-colors"
                >
                  <Icon name={c.icon} size={15} className="text-tn-mute" />
                  {c.label}
                </Link>
                {c.children?.map((child) => (
                  <Link
                    key={child.slug}
                    role="menuitem"
                    href={`/products?category=${child.slug}`}
                    onClick={() => setPosition(null)}
                    className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-red flex items-center rounded-lg py-1.5 pr-3 pl-[42px] text-[12.5px] font-semibold transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * One category in the bar under the header. A parent ("Vehicles & Auto")
 * opens its subcategories on hover or focus.
 *
 * The dropdown is portalled to <body> with fixed coordinates: the bar scrolls
 * horizontally, and an overflow container clips anything positioned inside it.
 */
function CategoryBarLink({ category }: { category: NavCategory }) {
  const children = category.children ?? [];
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setPosition({ left: rect.left, top: rect.bottom });
  };
  // A short grace period lets the pointer cross the gap into the dropdown.
  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPosition(null), 150);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Fixed coordinates go stale when the page or the bar scrolls: close instead.
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);

  const hasChildren = children.length > 0;
  return (
    <>
      <Link
        ref={anchorRef}
        href={`/products?category=${category.slug}`}
        onMouseEnter={hasChildren ? show : undefined}
        onMouseLeave={hasChildren ? hide : undefined}
        onFocus={hasChildren ? show : undefined}
        aria-haspopup={hasChildren ? "menu" : undefined}
        aria-expanded={hasChildren ? position !== null : undefined}
        className={cn(
          "hover:text-tn-red inline-flex items-center gap-1 whitespace-nowrap transition-colors text-tn-mute hover:font-bold",
          position && "text-tn-red",
        )}
      >
        {category.label}
        {hasChildren && <Icon name="chevd" size={12} />}
      </Link>
      {position &&
        createPortal(
          <div
            role="menu"
            onMouseEnter={show}
            onMouseLeave={hide}
            style={{ position: "fixed", left: position.left, top: position.top + 6 }}
            className="z-[60] min-w-[230px] rounded-[14px] border border-tn-hair bg-white p-2 shadow-[0_18px_44px_rgba(11,11,11,0.14)]"
          >
            {children.map((child) => (
              <Link
                key={child.slug}
                role="menuitem"
                href={`/products?category=${child.slug}`}
                onClick={() => setPosition(null)}
                className="text-tn-ink hover:bg-tn-paper hover:text-tn-red flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold transition-colors"
              >
                <Icon name={child.icon} size={15} className="text-tn-mute" />
                {child.label}
              </Link>
            ))}
            <div className="my-1.5 border-t border-tn-hair2" />
            <Link
              role="menuitem"
              href={`/products?category=${category.slug}`}
              onClick={() => setPosition(null)}
              className="text-tn-ink hover:text-tn-red flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-extrabold transition-colors"
            >
              All {category.label}
              <Icon name="arrow" size={13} />
            </Link>
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * The desktop "Browse" mega-menu: category tiles on the left, upcoming
 * verticals and marketplace shortcuts on the right.
 *
 * A parent category ("Vehicles & Auto") is a tile like the others, marked
 * with a chevron. Hovering it opens its subcategories in a panel right under
 * it; leaving both closes the panel after a short grace period, so the
 * pointer can travel from tile to panel.
 */
function BrowseMenu({
  categories,
  categoryCounts,
}: {
  categories: NavCategory[];
  categoryCounts?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [fetchedCounts, setFetchedCounts] = useState<
    Record<string, number> | undefined
  >(undefined);
  const hasAttemptedRef = useRef(false);
  const counts =
    categoryCounts && Object.keys(categoryCounts).length > 0
      ? categoryCounts
      : fetchedCounts;
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByHoverRef = useRef(false);
  // The group tile ("Vehicles & Auto") expanded into its floating card. It
  // opens after a short rest (hover intent), so sweeping across the grid
  // never flashes a card, and closes shortly after the pointer leaves.
  const [expanded, setExpanded] = useState<string | null>(null);
  const openRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openRef.current) clearTimeout(openRef.current);
    if (collapseRef.current) clearTimeout(collapseRef.current);
    openRef.current = collapseRef.current = null;
  };
  const expandSoon = (slug: string) => {
    clearTimers();
    if (expanded !== slug) openRef.current = setTimeout(() => setExpanded(slug), 120);
  };
  const expandNow = (slug: string | null) => {
    clearTimers();
    setExpanded(slug);
  };
  const collapseSoon = () => {
    clearTimers();
    collapseRef.current = setTimeout(() => setExpanded(null), 150);
  };

  // Client-side fallback to fetch live counts if not provided via SSR
  useEffect(() => {
    if (
      (categoryCounts && Object.keys(categoryCounts).length > 0) ||
      hasAttemptedRef.current
    )
      return;
    hasAttemptedRef.current = true;
    let alive = true;
    fetch("/api/public-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data?.category_product_count) {
          setFetchedCounts(data.category_product_count);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [categoryCounts]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Hover opens the menu on pointer devices; remember that so the click that
    // usually follows (on the way to a link) doesn't immediately toggle it shut.
    if (!open) openedByHoverRef.current = true;
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      setExpanded(null);
    }, 200);
  };

  const handleClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Consume the hover-open: the first click keeps the menu open, a second
    // click toggles it closed. Touch/keyboard, which never hover, just toggle.
    if (openedByHoverRef.current) {
      openedByHoverRef.current = false;
      return;
    }
    setOpen((prev) => !prev);
  };

  // Close browse menu on outside click or Escape key
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (collapseRef.current) clearTimeout(collapseRef.current);
      if (openRef.current) clearTimeout(openRef.current);
    };
  }, []);

  const countLabel = (slug: string, fallback = "Browse all") => {
    const count = counts?.[slug];
    return count != null && count > 0
      ? `${formatCount(count)} ${count === 1 ? "listing" : "listings"}`
      : fallback;
  };

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative hidden lg:block"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[10px] border-none px-3.5 text-[14.5px] font-bold transition-colors cursor-pointer",
          open
            ? "bg-tn-paper text-tn-ink"
            : "bg-transparent text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink",
        )}
      >
        Browse
        <Icon
          name="chevd"
          size={15}
          className={cn(
            "text-tn-mute transition-transform duration-150",
            open && "rotate-180 text-tn-ink",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 pt-2 animate-[tnRise_0.15s_ease_both]">
          {/* Invisible hit bridge to prevent cursor gap drop */}
          <div className="absolute -top-3 inset-x-0 h-3" />
          <div
            role="menu"
            // No overflow clipping: an expanded group card may float past the
            // menu's edge. The rounded corners live on the edge sections instead.
            className="w-[760px] rounded-[20px] border border-tn-hair bg-white shadow-[0_26px_64px_rgba(11,11,11,0.18)]"
          >
            <div className="grid grid-cols-12">
              {/* Left 8 columns: All Live Categories */}
              <div className="col-span-8 p-5">
                <div className="mb-3 flex items-center justify-between px-1">
                  <Link
                    href="/categories"
                    onClick={() => setOpen(false)}
                    className="text-tn-mute hover:text-tn-ink flex items-center gap-1 text-[10.5px] font-extrabold tracking-[0.09em] uppercase transition-colors"
                  >
                    <span>All Categories</span>
                    <Icon name="arrow" size={11} />
                  </Link>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-tn-green">
                    <span className="size-1.5 rounded-full bg-tn-green animate-pulse" />
                    Verified Addis Inventory
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((c) => {
                    const hasChildren = !!c.children?.length;
                    const isExpanded = expanded === c.slug;
                    return (
                      <div
                        key={c.slug}
                        className="relative"
                        onMouseEnter={() => (hasChildren ? expandSoon(c.slug) : expandNow(null))}
                        onMouseLeave={hasChildren ? collapseSoon : undefined}
                      >
                        <Link
                          href={`/products?category=${c.slug}`}
                          onClick={() => setOpen(false)}
                          onFocus={() => expandNow(hasChildren ? c.slug : null)}
                          aria-haspopup={hasChildren ? "menu" : undefined}
                          aria-expanded={hasChildren ? isExpanded : undefined}
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-tn-paper"
                        >
                          <span className="bg-tn-paper text-tn-ink group-hover:bg-white group-hover:shadow-sm inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] transition-all">
                            <Icon name={c.icon} size={20} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-tn-ink group-hover:text-tn-red block text-[13.5px] font-extrabold tracking-tight transition-colors">
                              {c.label}
                            </span>
                            <span className="text-tn-mute block truncate text-[11px]">
                              {c.subtitle}
                            </span>
                            <span className="font-tn-mono text-tn-ink2/75 mt-0.5 block text-[11px] font-medium">
                              {countLabel(c.slug)}
                            </span>
                          </span>
                          {hasChildren && (
                            <Icon name="chevd" size={14} className="text-tn-mute mt-3 shrink-0" />
                          )}
                        </Link>

                        {/* The tile grown in place into a floating card: anchored
                            where the tile sits, on top of its neighbours, so
                            nothing in the menu moves. */}
                        {hasChildren && isExpanded && (
                          <div
                            role="menu"
                            aria-label={c.label}
                            className="absolute -top-1.5 -left-1.5 z-20 w-[calc(100%+12px)] min-w-[272px] rounded-[16px] border border-tn-hair bg-white p-1.5 shadow-[0_22px_54px_rgba(11,11,11,0.18)] animate-[tnRise_0.12s_ease_both]"
                          >
                            <Link
                              href={`/products?category=${c.slug}`}
                              onClick={() => setOpen(false)}
                              className="group flex items-start gap-3 rounded-xl bg-tn-paper p-2.5"
                            >
                              <span className="text-tn-red inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-white shadow-sm">
                                <Icon name={c.icon} size={20} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="text-tn-red block text-[13.5px] font-extrabold tracking-tight">
                                  {c.label}
                                </span>
                                <span className="font-tn-mono text-tn-ink2/75 mt-0.5 block text-[11px] font-medium">
                                  {countLabel(c.slug)}
                                </span>
                              </span>
                              <Icon name="chevd" size={14} className="text-tn-red mt-3 shrink-0 rotate-180" />
                            </Link>
                            <div className="mt-1">
                              {c.children!.map((child) => {
                                const childCount = counts?.[child.slug];
                                return (
                                  <Link
                                    key={child.slug}
                                    role="menuitem"
                                    href={`/products?category=${child.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="group/sub hover:bg-tn-paper flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
                                  >
                                    <Icon name={child.icon} size={15} className="text-tn-mute group-hover/sub:text-tn-red" />
                                    <span className="text-tn-ink2 group-hover/sub:text-tn-red flex-1 truncate text-[13px] font-bold transition-colors">
                                      {child.label}
                                    </span>
                                    {childCount ? (
                                      <span className="font-tn-mono text-tn-mute text-[11px]">
                                        {formatCount(childCount)}
                                      </span>
                                    ) : null}
                                  </Link>
                                );
                              })}
                            </div>
                            {/* Property: renters and buyers go straight to their side. */}
                            {c.saleOrRent && (
                              <div className="mt-1 grid grid-cols-2 gap-1.5 px-1">
                                {[
                                  ["rent", "For rent"],
                                  ["sale", "For sale"],
                                ].map(([value, label]) => (
                                  <Link
                                    key={value}
                                    role="menuitem"
                                    href={`/products?category=${c.slug}&spec_listing_type=${value}`}
                                    onClick={() => setOpen(false)}
                                    className="border-tn-hair text-tn-ink hover:border-tn-ink rounded-full border py-1.5 text-center text-[12px] font-bold transition-colors"
                                  >
                                    {label}
                                  </Link>
                                ))}
                              </div>
                            )}
                            <Link
                              role="menuitem"
                              href={`/products?category=${c.slug}`}
                              onClick={() => setOpen(false)}
                              className="border-tn-hair2 text-tn-ink hover:text-tn-red mt-1 flex items-center gap-1.5 border-t px-2.5 pt-2.5 pb-1.5 text-[12px] font-extrabold transition-colors"
                            >
                              Shop all {c.label}
                              <Icon name="arrow" size={12} />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 4 columns: Upcoming Verticals & Marketplace Shortcuts */}
              <div className="col-span-4 rounded-tr-[20px] border-l border-tn-hair2 bg-[#FAF8F5]/80 p-5 flex flex-col justify-between">
                <div>
                  <p className="text-tn-mute text-[10.5px] font-extrabold tracking-[0.09em] uppercase mb-2.5 px-1">
                    Coming to Tinsae
                  </p>
                  <div className="space-y-1">
                    {UPCOMING_CATEGORIES.map((c) => (
                      <div
                        key={c.slug}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-tn-ink2"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Icon
                            name={c.icon}
                            size={15}
                            className="text-tn-mute"
                          />
                          {c.label}
                        </span>
                        <span className="rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                          {c.badge || "Soon"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="my-3 border-t border-tn-hair2" />

                  <p className="text-tn-mute text-[10.5px] font-extrabold tracking-[0.09em] uppercase mb-2 px-1">
                    Marketplace Hub
                  </p>
                  <div className="space-y-1">
                    <Link
                      href="/shops"
                      onClick={() => setOpen(false)}
                      className="hover:bg-white flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-bold text-tn-ink transition-colors hover:shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          name="building"
                          size={15}
                          className="text-tn-green"
                        />
                        Verified shops
                      </span>
                      <Icon name="arrow" size={13} className="text-tn-mute" />
                    </Link>
                    <Link
                      href="/map"
                      onClick={() => setOpen(false)}
                      className="hover:bg-white flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-bold text-tn-ink transition-colors hover:shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name="pin" size={15} className="text-tn-red" />
                        Shop Map
                      </span>
                      <Icon name="arrow" size={13} className="text-tn-mute" />
                    </Link>
                    <Link
                      href="/compare"
                      onClick={() => setOpen(false)}
                      className="hover:bg-white flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-bold text-tn-ink transition-colors hover:shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          name="sliders"
                          size={15}
                          className="text-tn-ink"
                        />
                        Compare Specs
                      </span>
                      <Icon name="arrow" size={13} className="text-tn-mute" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom banner: View All Products */}
            <div className="rounded-b-[20px] border-t border-tn-hair2 bg-tn-paper/70 px-5 py-3 flex items-center justify-between">
              <span className="text-[12px] text-tn-mute font-medium">
                Browse verified listings across Addis Ababa
              </span>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="hover:text-tn-red text-tn-ink inline-flex items-center gap-1.5 text-xs font-extrabold transition-colors"
              >
                <span>View all listings & filters</span>
                <Icon name="arrow" size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  user,
  stats,
  categories,
}: {
  user?: AuthUser | null;
  stats?: ShopMetrics | null;
  categories: NavCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isProductPage =
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname.startsWith("/products?");

  const { count } = useCompare();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const isOwner = Boolean(user && hasShop(user));
  const shop = isOwner && user ? user.shops[0] : null;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setAccountMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/" focuses the nav search; Escape blurs it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement !== searchRef.current &&
        !/input|textarea/i.test(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close account menu on outside click or escape.
  useEffect(() => {
    if (!accountMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountMenuOpen]);

  // Scroll lock, Escape, focus trap and focus restore for the mobile drawer.
  const drawerRef = useModal<HTMLDivElement>(drawerOpen, () =>
    setDrawerOpen(false),
  );

  return (
    <header
      className={cn(
        "sticky top-0 transition-[background,border-color,box-shadow] duration-200",
        drawerOpen ? "z-[10000]" : "z-30",
        "lg:backdrop-blur-md",
        scrolled
          ? "border-tn-hair border-b bg-white/95 shadow-[0_6px_24px_rgba(11,11,11,0.05)]"
          : "border-b border-transparent bg-white/80",
      )}
    >
      {/* Desktop bar */}
      <div className="mx-auto hidden h-[72px] max-w-[1480px] items-center gap-5 px-6 sm:px-8 lg:px-12 xl:px-16 lg:flex">
        <Logo />
        <BrowseMenu
          categories={categories}
          categoryCounts={stats?.category_product_count}
        />
        <SearchField
          className="hidden max-w-[760px] flex-1 lg:block"
          inputRef={searchRef}
        />

        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          {/* Compare is ALWAYS available */}
          <Link
            href="/compare"
            aria-label="Compare products"
            className="text-tn-ink2 hover:text-tn-ink relative inline-flex items-center gap-1.5 px-2 py-2 text-[14.5px] font-bold transition-colors"
          >
            <Icon name="sliders" size={17} />
            <span>Compare</span>
            {count > 0 && (
              <span className="bg-tn-red text-white flex size-5 items-center justify-center rounded-full text-[10.5px] font-extrabold">
                {count}
              </span>
            )}
          </Link>

          {!user ? (
            /* Guest State */
            <>
              <Link
                href="/signin"
                className="text-tn-ink2 hover:text-tn-ink px-1.5 py-2.5 text-[14.5px] font-bold transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-tn-ink text-white inline-flex h-10 items-center gap-2 rounded-full px-[18px] text-[13.5px] font-bold whitespace-nowrap shadow-[0_8px_22px_rgba(11,11,11,0.18)] transition-all duration-150 hover:-translate-y-px"
              >
                <Icon name="tg" size={15.5} />
                List your shop
              </Link>
            </>
          ) : (
            /* Signed In State */
            <>
              {isOwner ? (
                <Link
                  href="/shop/dashboard/overview"
                  className="bg-tn-red text-white inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13.5px] font-bold whitespace-nowrap shadow-[0_8px_22px_rgba(204,48,0,0.24)] hover:bg-tn-red-dark transition-all duration-150"
                >
                  <Icon name="pulse" size={15} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/shop/onboarding"
                  className="bg-tn-ink text-white inline-flex h-10 items-center gap-2 rounded-full px-[18px] text-[13.5px] font-bold whitespace-nowrap shadow-[0_8px_22px_rgba(11,11,11,0.18)] transition-all duration-150 hover:-translate-y-px"
                >
                  <Icon name="tg" size={15.5} />
                  List your shop
                </Link>
              )}

              {/* Notification Bell */}
              <button
                type="button"
                aria-label="Notifications"
                className="border-tn-hair text-tn-ink2 hover:text-tn-ink hover:border-tn-ink relative flex size-10 items-center justify-center rounded-full border bg-white transition-colors cursor-pointer"
              >
                <Icon name="bell" size={18} />
                <span className="bg-tn-red absolute top-2.5 right-2.5 size-2 rounded-full border border-white" />
              </button>

              {/* Profile Avatar & Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                  className="border-tn-hair hover:border-tn-ink flex items-center gap-1.5 rounded-full border bg-white p-1 pl-1.5 pr-2 transition-colors cursor-pointer"
                >
                  <div
                    className={cn(
                      "text-white flex size-8 shrink-0 items-center justify-center text-xs font-extrabold",
                      isOwner
                        ? "bg-tn-ink rounded-[8px]"
                        : "bg-[#2A6FDB] rounded-full",
                    )}
                  >
                    {getInitials(isOwner ? shop?.name : user.username)}
                  </div>
                  <Icon name="chevd" size={12} className="text-tn-mute" />
                </button>

                {accountMenuOpen && (
                  <div className="border-tn-hair animate-[tnRise_0.15s_ease_both] absolute top-full right-0 z-50 mt-2 w-[266px] rounded-2xl border bg-white p-2 shadow-xl">
                    <div className="border-tn-hair2 border-b px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-tn-ink truncate text-[13.5px] font-extrabold">
                          {isOwner
                            ? shop?.name || "My Shop"
                            : user.username || "My Account"}
                        </span>
                        {isOwner && <VerifiedBadge size={11} />}
                      </div>
                      <p className="font-tn-mono text-tn-mute mt-0.5 text-[11px]">
                        {isOwner
                          ? shop?.city || "Bole · Atlas"
                          : "Buyer account"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-0.5 py-1">
                      {isOwner ? (
                        <>
                          <Link
                            href="/shop/dashboard/overview"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon
                              name="home"
                              size={16}
                              className="text-tn-mute"
                            />
                            <span>Shop dashboard</span>
                          </Link>
                          <Link
                            href="/shop/dashboard/listings"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon
                              name="box"
                              size={16}
                              className="text-tn-mute"
                            />
                            <span>My listings</span>
                          </Link>
                          <Link
                            href="/shop/dashboard/shop-setting"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon
                              name="user"
                              size={16}
                              className="text-tn-mute"
                            />
                            <span>Shop profile</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/compare"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon
                              name="sliders"
                              size={16}
                              className="text-tn-mute"
                            />
                            <span>Compare products</span>
                          </Link>
                          <Link
                            href="/shop/onboarding"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon
                              name="tg"
                              size={16}
                              className="text-tn-mute"
                            />
                            <span>List your shop</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-tn-hair2 border-t pt-1">
                      <Link
                        href="/account/settings"
                        onClick={() => setAccountMenuOpen(false)}
                        className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                      >
                        <Icon name="user" size={16} className="text-tn-mute" />
                        <span>Account settings</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="text-tn-red hover:bg-tn-red-soft flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13.5px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <LogOut className="size-4 shrink-0 text-tn-red" />
                        <span>{loggingOut ? "Signing out…" : "Sign out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Channel Strip - ONLY shown on products catalog & product detail */}
      {isProductPage && (
        <div className="border-t border-tn-hair/70 hidden lg:block bg-white/60 backdrop-blur-sm">
          <div className="mx-auto flex h-10 max-w-[1480px] items-center gap-6 px-6 sm:px-8 lg:px-12 xl:px-16 text-[13px] font-semibold text-tn-ink2">
            <Link
              href="/categories"
              className="hover:text-tn-red flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Icon name="spec" size={14} className="text-tn-mute" />
              <span>All Categories</span>
            </Link>
            <div className="h-3.5 w-px bg-tn-hair shrink-0" />
            <CategoryBar categories={categories} />
            <div className="ml-auto flex items-center gap-4 text-xs font-bold shrink-0">
              <Link
                href="/shops"
                className="text-tn-ink hover:text-tn-red flex items-center gap-1.5 transition-colors"
              >
                <Icon name="building" size={13} className="text-tn-green" />
                <span>Verified shops</span>
              </Link>
              <span className="text-tn-hair">•</span>
              <Link
                href="/map"
                className="text-tn-mute hover:text-tn-ink flex items-center gap-1 transition-colors"
              >
                <Icon name="pin" size={13} />
                <span>Shop Map</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bar */}
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-6 sm:px-8 lg:hidden">
        <Logo />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="border-tn-hair text-tn-ink inline-flex size-[42px] items-center justify-center rounded-[11px] border bg-white"
        >
          <Icon name="menu" size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 isolate z-[10001] lg:hidden">
            <div
              className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="animate-[tnRise_0.5s_ease_both] absolute inset-y-0 right-0 z-[2] flex w-[min(360px,86vw)] flex-col bg-white shadow-[-20px_0_60px_rgba(11,11,11,0.2)]"
            >
              <div className="border-tn-hair flex h-16 items-center justify-between border-b px-5">
                {/* <Logo /> */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="border-tn-hair text-tn-ink inline-flex size-[38px] items-center justify-center rounded-[10px] border bg-white"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <SearchField
                  autoFocus
                  onSubmitted={() => setDrawerOpen(false)}
                />
                <p className="text-tn-mute mt-6 mb-2 text-[10.5px] font-extrabold tracking-[0.09em] uppercase">
                  Categories
                </p>
                {categories.map((c) => {
                  const count = stats?.category_product_count?.[c.slug];
                  return (
                    <div key={c.slug} className="border-tn-hair2 border-b">
                      <Link
                        href={`/products?category=${c.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="text-tn-ink flex items-center gap-3 py-3"
                      >
                        <span className="bg-tn-paper inline-flex size-9 shrink-0 items-center justify-center rounded-[10px]">
                          <Icon name={c.icon} size={18} className="text-tn-ink" />
                        </span>
                        <span className="flex-1 text-[15px] font-bold">
                          {c.label}
                        </span>
                        {count != null && (
                          <span className="font-tn-mono text-tn-mute text-xs">
                            {formatCount(count)}
                          </span>
                        )}
                      </Link>
                      {/* Subcategories, indented under their parent. */}
                      {c.children?.map((child) => {
                        const childCount = stats?.category_product_count?.[child.slug];
                        return (
                          <Link
                            key={child.slug}
                            href={`/products?category=${child.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="text-tn-ink2 flex items-center py-2 pl-12 text-[14px] font-semibold"
                          >
                            <span className="flex-1">{child.label}</span>
                            {childCount != null && (
                              <span className="font-tn-mono text-tn-mute text-xs">
                                {formatCount(childCount)}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
                <p className="text-tn-mute mt-6 mb-2 text-[10.5px] font-extrabold tracking-[0.09em] uppercase">
                  Coming Soon
                </p>
                {UPCOMING_CATEGORIES.map((c) => (
                  <div
                    key={c.slug}
                    className="border-tn-hair2 text-tn-ink2 flex items-center justify-between border-b py-2.5 text-[14px]"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <Icon name={c.icon} size={16} className="text-tn-mute" />
                      {c.label}
                    </span>
                    <span className="rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                      {c.badge || "Soon"}
                    </span>
                  </div>
                ))}
                <p className="text-tn-mute mt-6 mb-2 text-[10.5px] font-extrabold tracking-[0.09em] uppercase">
                  More
                </p>
                {[
                  { label: "All categories", href: "/categories" },
                  { label: "Compare products", href: "/compare" },
                  { label: "How it works", href: "/how-it-works" },
                  {
                    label: "Verified shops",
                    href: "/shops",
                  },
                  { label: "Browse listings", href: "/products" },
                  { label: "For shop owners", href: "/signup" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className="border-tn-hair2 text-tn-ink2 block border-b py-3 text-[15px] font-semibold"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="border-tn-hair flex flex-col gap-2.5 border-t px-5 py-4">
                <Link
                  href="/products"
                  onClick={() => setDrawerOpen(false)}
                  className="bg-tn-red text-white inline-flex h-12 items-center justify-center gap-2 rounded-full text-[14.5px] font-bold shadow-[0_8px_22px_rgba(204,48,0,0.26)]"
                >
                  Browse listings
                  <Icon name="arrow" size={16} />
                </Link>
                <div className="flex gap-2.5">
                  {!user ? (
                    <>
                      <Link
                        href="/signin"
                        onClick={() => setDrawerOpen(false)}
                        className="border-tn-hair text-tn-ink inline-flex h-[46px] flex-1 items-center justify-center rounded-full border-[1.5px] bg-white text-[14.5px] font-bold"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setDrawerOpen(false)}
                        className="bg-tn-ink text-white inline-flex h-[46px] flex-1 items-center justify-center rounded-full text-[14.5px] font-bold"
                      >
                        List your shop
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col w-full gap-2">
                      <Link
                        href="/account/settings"
                        onClick={() => setDrawerOpen(false)}
                        className="border-tn-hair text-tn-ink inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full border-[1.5px] bg-white text-[14.5px] font-bold"
                      >
                        <Icon name="user" size={16} className="text-tn-mute" />
                        <span>Account settings</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="border-tn-hair text-tn-red hover:bg-tn-red-soft inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full border-[1.5px] bg-white text-[14.5px] font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>{loggingOut ? "Signing out…" : "Sign out"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
