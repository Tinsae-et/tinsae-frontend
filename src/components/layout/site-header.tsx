"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { NAV_CATEGORIES } from "@/lib/nav-categories";
import { useCompare } from "@/hooks/use-compare";
import { hasShop } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

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

// The search field is the product's primary action. Submitting navigates to
// /products?q=...; pressing "/" anywhere focuses it; Escape blurs it.
// Matches the shared-kit nav search (design_handoff_search): search icon,
// placeholder, red circular search button — no scope chip / kbd hint.
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(
          q.trim()
            ? `/products?q=${encodeURIComponent(q.trim())}`
            : "/products",
        );
        onSubmitted?.();
      }}
      role="search"
      className={cn("min-w-0 flex-1", className)}
    >
      <div
        className={cn(
          "border-tn-hair flex h-11 items-center gap-2.5 rounded-full border-[1.5px] bg-white pl-4 pr-1.5 transition-[border-color,box-shadow] duration-150",
          focused && "border-tn-red shadow-[0_0_0_4px_#FFF1EB]",
        )}
      >
        <Icon name="search" size={17} className="text-tn-mute shrink-0" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search verified shops & products in Bole"
          aria-label="Search products"
          className="text-tn-ink placeholder:text-tn-mute min-w-0 flex-1 bg-transparent text-[14.5px] font-medium outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="bg-tn-red hover:bg-tn-red-dark inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-white transition-colors"
        >
          <Icon name="search" size={17} />
        </button>
      </div>
    </form>
  );
}

function BrowseMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative hidden lg:block"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[10px] border-none px-3.5 text-[14.5px] font-bold transition-colors",
          open ? "bg-tn-paper" : "bg-transparent",
        )}
      >
        Browse
        <Icon name="chevd" size={15} className="text-tn-mute" />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-2">
          <div
            role="menu"
            className="w-[520px] rounded-[18px] border border-tn-hair bg-white p-4 shadow-[0_26px_64px_rgba(11,11,11,0.18)]"
          >
            <p className="text-tn-mute mb-3 ml-1.5 text-[10.5px] font-extrabold tracking-[0.09em] uppercase">
              Shop by category
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {NAV_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="hover:bg-tn-paper flex items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  <span className="bg-tn-paper inline-flex size-10 shrink-0 items-center justify-center rounded-[11px]">
                    <Icon name={c.icon} size={20} className="text-tn-ink" />
                  </span>
                  <span>
                    <span className="text-tn-ink block text-sm font-extrabold tracking-tight">
                      {c.label}
                    </span>
                    <span className="font-tn-mono text-tn-mute mt-0.5 block text-[11.5px]">
                      {c.count} listings
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-tn-hair2 mt-3 flex gap-2 border-t pt-3.5">
              {[
                { icon: "building", label: "Shops", href: "/shops" },
                { icon: "pin", label: "Map view", href: "/map" },
                { icon: "spec", label: "All categories", href: "/products" },
              ].map(({ icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="border-tn-hair text-tn-ink2 inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] border text-[13px] font-bold"
                >
                  <Icon name={icon as IconName} size={15} className="text-tn-red" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({ user }: { user?: AuthUser | null }) {
  const router = useRouter();
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

  // Don't let the page scroll behind an open drawer.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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
      <div className="mx-auto hidden h-[72px] max-w-[1280px] items-center gap-[18px] px-7 lg:flex">
        <Logo />
        <BrowseMenu />
        <SearchField
          className="hidden max-w-[560px] lg:block"
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
                            <Icon name="home" size={16} className="text-tn-mute" />
                            <span>Shop dashboard</span>
                          </Link>
                          <Link
                            href="/shop/dashboard/listings"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon name="box" size={16} className="text-tn-mute" />
                            <span>My listings</span>
                          </Link>
                          <Link
                            href="/shop/dashboard/shop-profile"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon
                              name="building"
                              size={16}
                              className="text-tn-mute"
                            />
                            <span>Shop settings</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/compare"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon name="sliders" size={16} className="text-tn-mute" />
                            <span>Compare products</span>
                          </Link>
                          <Link
                            href="/shop/onboarding"
                            onClick={() => setAccountMenuOpen(false)}
                            className="text-tn-ink2 hover:bg-tn-paper hover:text-tn-ink flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
                          >
                            <Icon name="tg" size={16} className="text-tn-mute" />
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

      {/* Mobile bar */}
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-5 lg:hidden">
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
            <div className="animate-[tnRise_0.5s_ease_both] absolute inset-y-0 right-0 z-[2] flex w-[min(360px,86vw)] flex-col bg-white shadow-[-20px_0_60px_rgba(11,11,11,0.2)]">
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
                {NAV_CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className="border-tn-hair2 text-tn-ink flex items-center gap-3 border-b py-3"
                  >
                    <span className="bg-tn-paper inline-flex size-9 shrink-0 items-center justify-center rounded-[10px]">
                      <Icon name={c.icon} size={18} className="text-tn-ink" />
                    </span>
                    <span className="flex-1 text-[15px] font-bold">
                      {c.label}
                    </span>
                    <span className="font-tn-mono text-tn-mute text-xs">
                      {c.count}
                    </span>
                  </Link>
                ))}
                <p className="text-tn-mute mt-6 mb-2 text-[10.5px] font-extrabold tracking-[0.09em] uppercase">
                  More
                </p>
                {[
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
