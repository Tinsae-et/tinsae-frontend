"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

// Price (ETB) group from the design: a 16-bar histogram with a dual-thumb range
// slider synced to two editable inputs. Wired to min_price / max_price.
// The histogram distribution is demo (the backend has no facets endpoint yet).

const HIST = [12, 18, 28, 42, 58, 82, 68, 52, 38, 30, 22, 18, 14, 11, 8, 5];
const MIN = 0;
const MAX = 250000;
const STEP = 1000;
const DEFAULT_LO = 50000;
const DEFAULT_HI = 200000;

function pct(value: number) {
  return ((value - MIN) / (MAX - MIN)) * 100;
}
function valueAt(p: number) {
  return Math.round(((p / 100) * (MAX - MIN) + MIN) / STEP) * STEP;
}

export function PriceSlider({
  min,
  max,
  onChange,
}: {
  min?: number;
  max?: number;
  onChange: (patch: { minPrice?: number; maxPrice?: number }) => void;
}) {
  const [lo, setLo] = useState(min ?? DEFAULT_LO);
  const [hi, setHi] = useState(max ?? DEFAULT_HI);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"lo" | "hi" | null>(null);

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

  const debouncedLo = useDebouncedValue(lo, 300);
  const debouncedHi = useDebouncedValue(hi, 300);

  useEffect(() => {
    if (debouncedLo !== min) onChange({ minPrice: debouncedLo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLo]);
  useEffect(() => {
    if (debouncedHi !== max) onChange({ maxPrice: debouncedHi });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedHi]);

  function setPair(nextLo: number, nextHi: number) {
    setLo(Math.min(nextLo, nextHi - STEP));
    setHi(Math.max(nextHi, nextLo + STEP));
  }

  function handleDrag(e: PointerEvent) {
    const track = trackRef.current;
    if (!track || !dragRef.current) return;
    const rect = track.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const v = valueAt(p);
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

  const loPct = pct(lo);
  const hiPct = pct(hi);
  const loIdx = Math.floor((loPct / 100) * HIST.length);
  const hiIdx = Math.ceil((hiPct / 100) * HIST.length);

  const sliderProps = (which: "lo" | "hi", value: number) => ({
    role: "slider" as const,
    "aria-label": which === "lo" ? "Minimum price" : "Maximum price",
    "aria-valuemin": MIN,
    "aria-valuemax": MAX,
    "aria-valuenow": value,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? STEP : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -STEP : e.key === "Home" ? MIN - value : e.key === "End" ? MAX - value : 0;
      if (!d) return;
      e.preventDefault();
      if (which === "lo") setPair(value + d, hi);
      else setPair(lo, value + d);
    },
  });

  return (
    <div>
      <div ref={trackRef} className="relative h-10 touch-none select-none">
        <div className="absolute inset-x-0 bottom-4 flex items-end gap-0.5">
          {HIST.map((h, i) => (
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
        <SliderInput
          label="Min"
          value={lo}
          onCommit={(v) => setPair(v ?? DEFAULT_LO, hi)}
        />
        <SliderInput
          label="Max"
          value={hi}
          onCommit={(v) => setPair(lo, v ?? DEFAULT_HI)}
        />
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
