"use client";

import { useEffect, useState } from "react";

const WORDS = ["Phones", "Laptops", "Audio", "Cameras", "Tablets", "Accessories"];

// Design: a dark chip whose word cycles every 1900ms with a translateY swap.
// The word key remounts a span so the tnSwap animation replays on each change.
export function RotatingEyebrow() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % WORDS.length), 1900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-tn-hair bg-white py-[7px] pr-2 pl-3.5 text-[13.5px] font-semibold text-tn-ink2 shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
      <span className="bg-tn-green size-[7px] rounded-full shadow-[0_0_0_4px_#E8F5EE]" />
      Verified marketplace for
      <span className="bg-tn-ink inline-flex h-[26px] min-w-[96px] items-center justify-center overflow-hidden rounded-full px-2.5 font-bold text-white">
        <span key={i} className="tn-word inline-block">
          {WORDS[i]}
        </span>
      </span>
    </div>
  );
}
