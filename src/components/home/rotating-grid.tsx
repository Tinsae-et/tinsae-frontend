"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Cards per page at each breakpoint; matches the grid's column count. */
export type PageSize = { base: number; sm: number; lg: number };

/** How far a page travels as it slides out or in. */
const SLIDE_PX = 56;
const OUT_MS = 240;
const IN_MS = 420;

function usePageSize(size: PageSize): number {
  // The server renders the desktop page; the client corrects it after mount.
  const [current, setCurrent] = useState(size.lg);
  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => setCurrent(lg.matches ? size.lg : sm.matches ? size.sm : size.base);
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, [size.base, size.sm, size.lg]);
  return current;
}

/**
 * A grid that shows one page of cards and slides to the next every
 * `intervalMs`.
 *
 * Everything runs on the browser's animation engine and moves only transform
 * and opacity, so React renders once per page, not per frame. The countdown is
 * the active dot's own animation: pausing it pauses the carousel, and its end
 * turns the page.
 *
 * It holds still while hovered, focused, off screen or in a background tab, has
 * a pause button (WCAG 2.2.2), and never moves on its own for
 * prefers-reduced-motion — the page dots still work there.
 */
export function RotatingGrid({
  items,
  pageSize,
  className,
  label,
  intervalMs = 3000,
}: {
  items: React.ReactNode[];
  pageSize: PageSize;
  /** The grid's own classes: columns and gaps. */
  className: string;
  label: string;
  intervalMs?: number;
}) {
  const size = usePageSize(pageSize);
  const pages = Math.ceil(items.length / size);
  const rotates = pages > 1;

  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const countdown = useRef<Animation | null>(null);
  const incoming = useRef<1 | -1 | 0>(0);
  const sliding = useRef(false);
  const advance = useRef(() => {});

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(query.matches);
    const updateTab = () => setTabVisible(document.visibilityState === "visible");
    updateMotion();
    query.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateTab);
    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    if (root.current) visible.observe(root.current);
    return () => {
      query.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateTab);
      visible.disconnect();
    };
  }, []);

  // A resize can leave the current page past the end.
  const safePage = rotates ? page % pages : 0;

  function goTo(next: number, direction: 1 | -1) {
    const el = grid.current;
    if (!el || sliding.current) return;
    if (reducedMotion) {
      setPage(next);
      return;
    }
    sliding.current = true;
    const out = el.animate(
      [
        { transform: "translateX(0)", opacity: 1 },
        { transform: `translateX(${-direction * SLIDE_PX}px)`, opacity: 0 },
      ],
      { duration: OUT_MS, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
    );
    out.finished.then(
      () => {
        incoming.current = direction;
        setPage(next);
      },
      () => {
        sliding.current = false;
      },
    );
  }

  // The timer callbacks read the latest page through this, not a stale closure.
  useEffect(() => {
    advance.current = () => goTo((safePage + 1) % pages, 1);
  });

  // The new page is in the DOM before paint: slide it in from the far side.
  useLayoutEffect(() => {
    const el = grid.current;
    const direction = incoming.current;
    if (!el || !direction) return;
    incoming.current = 0;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [
        { transform: `translateX(${direction * SLIDE_PX}px)`, opacity: 0 },
        { transform: "translateX(0)", opacity: 1 },
      ],
      { duration: IN_MS, easing: "cubic-bezier(.2,.8,.2,1)" },
    ).finished.finally(() => {
      sliding.current = false;
    });
  }, [safePage]);

  // One countdown per page, drawn by the active dot's fill.
  useEffect(() => {
    if (!rotates || reducedMotion || !bar.current) return;
    const anim = bar.current.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: intervalMs,
      fill: "forwards",
    });
    anim.pause();
    anim.onfinish = () => advance.current();
    countdown.current = anim;
    return () => {
      anim.cancel();
      countdown.current = null;
    };
  }, [safePage, rotates, reducedMotion, intervalMs]);

  const running =
    rotates && !reducedMotion && !paused && !hovered && !focused && onScreen && tabVisible;

  useEffect(() => {
    const anim = countdown.current;
    if (!anim) return;
    if (running) anim.play();
    else anim.pause();
  }, [running, safePage]);

  // The last page wraps round to the start so the grid is always full.
  const visible = rotates
    ? Array.from({ length: size }, (_, k) => items[(safePage * size + k) % items.length])
    : items;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div ref={grid} className={className} aria-live={running ? "off" : "polite"}>
        {visible.map((item, k) => (
          <div key={`${safePage}-${k}`} className="grid [&>*]:h-full">
            {item}
          </div>
        ))}
      </div>

      {rotates && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pages }, (_, i) => {
              const active = i === safePage;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !active && goTo(i, i > safePage ? 1 : -1)}
                  aria-label={`Show page ${i + 1} of ${pages}`}
                  aria-current={active || undefined}
                  className={cn(
                    "bg-tn-hair relative h-2 overflow-hidden rounded-full transition-[width] duration-300",
                    active ? "w-9" : "hover:bg-tn-mute/40 w-2",
                  )}
                >
                  {active && (
                    <span
                      ref={bar}
                      className={cn(
                        "bg-tn-red absolute inset-0 origin-left rounded-full",
                        !reducedMotion && "scale-x-0",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? `Play ${label}` : `Pause ${label}`}
              className="border-tn-hair text-tn-ink hover:border-tn-ink inline-flex size-8 items-center justify-center rounded-full border bg-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                {paused ? <path d="M7 4.5v15l12.5-7.5z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
