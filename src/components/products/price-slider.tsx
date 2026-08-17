"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// Price (ETB) group: a 16-bar histogram with a dual-thumb range slider synced
// to two editable inputs, wired to min_price / max_price. The track bounds come
// from the real catalog prices (`bounds`, computed server-side) so the range
// reflects the market instead of a fixed cap; the histogram comes from the
// current results.

const HIST_BUCKETS = 16;
/** Sane fallback when we have neither server bounds nor any products yet. */
const FALLBACK_MAX = 100000;

/** Fallback bounds from the prices actually in the current results. */
function boundsFromProducts(products: Product[]): { min: number; max: number } {
  const prices = products
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (prices.length === 0) return { min: 0, max: FALLBACK_MAX };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** 16 bars, heights scaled to the design's 5–88% range. */
function buildHistogram(products: Product[], max: number): number[] {
  const prices = products
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const buckets = Array<number>(HIST_BUCKETS).fill(0);
  for (const p of prices) {
    const idx = Math.min(HIST_BUCKETS - 1, Math.max(0, Math.floor((p / max) * HIST_BUCKETS)));
    buckets[idx]++;
  }
  const peak = Math.max(...buckets, 1);
  return buckets.map((c) => (c ? Math.max(5, Math.round((c / peak) * 82)) : 4));
}

function pct(value: number, min: number, max: number) {
  return ((value - min) / Math.max(1, max - min)) * 100;
}
function valueAt(p: number, min: number, max: number, step: number) {
  return Math.round(((p / 100) * Math.max(1, max - min) + min) / step) * step;
}
function stepFor(min: number, max: number) {
  const range = max - min;
  if (range <= 20_000) return 500;
  if (range <= 100_000) return 1_000;
  if (range <= 300_000) return 5_000;
  return 10_000;
}

export function PriceSlider({
  products,
  bounds,
  min,
  max,
  onChange,
}: {
  products: Product[];
  bounds?: { min: number; max: number };
  min?: number;
  max?: number;
  onChange: (patch: { minPrice?: number; maxPrice?: number }) => void;
}) {
  // Real bounds from the server (full catalog) when available, else whatever
  // prices we can see right now.
  const rawBounds = useMemo(
    () => bounds ?? boundsFromProducts(products),
    [bounds, products],
  );
  const step = useMemo(() => stepFor(rawBounds.min, rawBounds.max), [rawBounds]);
  // Round the track ends out to whole steps so they land on clean numbers and
  // leave a little headroom above the priciest listing.
  const track = useMemo(
    () => ({
      min: Math.floor(rawBounds.min / step) * step,
      max: Math.max(step, Math.ceil(rawBounds.max / step) * step),
    }),
    [rawBounds.min, rawBounds.max, step],
  );
  // The effective track stretches beyond the real catalog range to whatever
  // max price the user typed in, so the slider adapts instead of pinning the
  // thumb to the edge. Cleared back down when the max filter is removed.
  const [extendedMax, setExtendedMax] = useState(() =>
    max !== undefined ? Math.max(track.max, Math.ceil(max / step) * step) : track.max,
  );
  const extent = useMemo(
    () => ({ min: track.min, max: Math.max(track.max, extendedMax) }),
    [track.min, track.max, extendedMax],
  );
  const hist = useMemo(
    () => buildHistogram(products, extent.max),
    [products, extent.max],
  );

  const [lo, setLo] = useState(min ?? extent.min);
  const [hi, setHi] = useState(max ?? extent.max);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"lo" | "hi" | null>(null);
  // The URL gets a price filter only once the user actually moves the slider
  // or edits an input — before that the thumbs are visual defaults.
  const interacted = useRef(false);

  // Keep in sync when the URL changes externally (back button) — render-phase
  // adjustment so the slider never lags the URL.
  const [prevMin, setPrevMin] = useState(min);
  const [prevMax, setPrevMax] = useState(max);
  if (prevMin !== min) {
    setPrevMin(min);
    if (min !== undefined) setLo(min);
  }
  if (prevMax !== max) {
    setPrevMax(max);
    if (max !== undefined) setHi(max);
  }

  // When the track bounds change, keep the no-filter state at full range; with
  // a filter active, leave the filter values alone (a value beyond the track is
  // legal — its visual position just pins to the track edge).
  const [prevTrack, setPrevTrack] = useState(track);
  if (prevTrack.min !== track.min || prevTrack.max !== track.max) {
    setPrevTrack(track);
    if (min === undefined && max === undefined) {
      setLo(track.min);
      setHi(track.max);
    }
  }

  const debouncedLo = useDebouncedValue(lo, 300);
  const debouncedHi = useDebouncedValue(hi, 300);

  useEffect(() => {
    if (!interacted.current) return;
    if (debouncedLo !== min) onChange({ minPrice: debouncedLo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLo]);
  useEffect(() => {
    if (!interacted.current) return;
    if (debouncedHi !== max) onChange({ maxPrice: debouncedHi });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedHi]);

  function setPair(nextLo: number, nextHi: number) {
    setLo(Math.max(extent.min, Math.min(nextLo, nextHi - step)));
    setHi(Math.min(extent.max, Math.max(nextHi, nextLo + step)));
  }

  // Committing `undefined` (cleared input) removes the constraint entirely and
  // drops the track back to the real catalog range. Typed values are allowed
  // beyond the track (drag stays clamped to it), and the two bounds never
  // cross.
  function commitMin(v: number | undefined) {
    if (v === undefined) {
      onChange({ minPrice: undefined });
      return;
    }
    interacted.current = true;
    setLo(Math.max(0, Math.min(v, hi - step)));
  }
  function commitMax(v: number | undefined) {
    if (v === undefined) {
      setExtendedMax(track.max);
      onChange({ maxPrice: undefined });
      return;
    }
    interacted.current = true;
    setHi(Math.max(v, lo + step));
    setExtendedMax(Math.max(extendedMax, Math.ceil(v / step) * step));
  }

  function handleDrag(e: PointerEvent) {
    const trackEl = trackRef.current;
    if (!trackEl || !dragRef.current) return;
    interacted.current = true;
    const rect = trackEl.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const v = valueAt(p, extent.min, extent.max, step);
    if (dragRef.current === "lo") setPair(v, hi);
    else setPair(lo, v);
  }

  function startDrag(which: "lo" | "hi") {
    dragRef.current = which;
    window.addEventListener("pointermove", handleDrag);
    window.addEventListener("pointerup", endDrag);
  }
  function endDrag() {
    dragRef.current = null;
    window.removeEventListener("pointermove", handleDrag);
    window.removeEventListener("pointerup", endDrag);
  }

  // Visual position — a value beyond the extent pins to the edge.
  const loPct = Math.max(0, Math.min(100, pct(lo, extent.min, extent.max)));
  const hiPct = Math.max(0, Math.min(100, pct(hi, extent.min, extent.max)));
  const loIdx = Math.floor((loPct / 100) * hist.length);
  const hiIdx = Math.ceil((hiPct / 100) * hist.length);

  const sliderProps = (which: "lo" | "hi", value: number) => ({
    role: "slider" as const,
    "aria-label": which === "lo" ? "Minimum price" : "Maximum price",
    "aria-valuemin": extent.min,
    "aria-valuemax": extent.max,
    "aria-valuenow": Math.max(extent.min, Math.min(extent.max, value)),
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      const d =
        e.key === "ArrowRight" || e.key === "ArrowUp"
          ? step
          : e.key === "ArrowLeft" || e.key === "ArrowDown"
            ? -step
            : e.key === "Home"
              ? extent.min - value
              : e.key === "End"
                ? extent.max - value
                : 0;
      if (!d) return;
      e.preventDefault();
      interacted.current = true;
      if (which === "lo") setPair(value + d, hi);
      else setPair(lo, value + d);
    },
  });

  return (
    <div>
      <div ref={trackRef} className="relative h-10 touch-none select-none">
        <div className="absolute inset-x-0 bottom-4 flex items-end gap-0.5">
          {hist.map((h, i) => (
            <span
              key={i}
              className="w-full flex-1 rounded-[2px]"
              style={{ height: `${h}%`, background: i >= loIdx && i <= hiIdx ? "#CC3000" : "#ECEAE3" }}
            />
          ))}
        </div>
        <div className="bg-tn-hair absolute inset-x-0 bottom-[7px] h-[3px] rounded-full" />
        <div
          className="bg-tn-red absolute bottom-[7px] h-[3px] rounded-full"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <button
          type="button"
          className="bg-white absolute bottom-0 size-[15px] cursor-grab rounded-full border-[2.5px] border-tn-red shadow-[0_2px_6px_rgba(11,11,11,0.12)] active:cursor-grabbing"
          style={{ left: `${loPct}%`, transform: "translateX(-50%)" }}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag("lo");
          }}
          {...sliderProps("lo", lo)}
        />
        <button
          type="button"
          className="bg-white absolute bottom-0 size-[15px] cursor-grab rounded-full border-[2.5px] border-tn-red shadow-[0_2px_6px_rgba(11,11,11,0.12)] active:cursor-grabbing"
          style={{ left: `${hiPct}%`, transform: "translateX(-50%)" }}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag("hi");
          }}
          {...sliderProps("hi", hi)}
        />
      </div>

      <div className="flex gap-2">
        <SliderInput label="Min" value={lo} onCommit={commitMin} />
        <SliderInput label="Max" value={hi} onCommit={commitMax} />
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number | undefined) => void;
}) {
  const [text, setText] = useState(String(value));
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setText(String(value));
  }
  const debounced = useDebouncedValue(text, 350);
  useEffect(() => {
    if (debounced !== text) return;
    const cleaned = debounced.trim().replace(/,/g, "");
    const n = cleaned === "" ? undefined : Number(cleaned);
    const parsed = n !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined;
    if (parsed !== value) onCommit(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <label className={cn("flex min-w-0 flex-1 flex-col gap-1")}>
      <span className="text-tn-mute text-[11px] font-bold tracking-[0.05em] uppercase">{label}</span>
      <div className="border-tn-hair flex h-10 items-center gap-1 rounded-[10px] border bg-white px-2.5">
        <span className="font-tn-mono text-tn-mute text-xs">ETB</span>
        <input
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label={`${label} price in ETB`}
          className="font-tn-mono text-tn-ink w-full min-w-0 bg-transparent text-[12.5px] outline-none placeholder:text-tn-mute"
        />
      </div>
    </label>
  );
}
