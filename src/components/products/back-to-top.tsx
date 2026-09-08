"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 500) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className={cn(
        "fixed right-6 bottom-6 z-30 flex items-center gap-1.5 rounded-full border border-tn-hair bg-white/95 px-3.5 py-2.5 text-xs font-extrabold text-tn-ink shadow-[0_8px_24px_rgba(11,11,11,0.12)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-tn-ink hover:bg-tn-ink hover:text-white active:scale-95",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <Icon name="chevron" size={13} className="-rotate-90" />
      <span>Top</span>
    </button>
  );
}
