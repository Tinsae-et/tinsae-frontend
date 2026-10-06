"use client";

import { useState } from "react";
import { Pill } from "@/components/tinsae/pill";

export function ShareButton({ shopName }: { shopName: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const shareShop = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopName} on Tinsae`,
          text: `Visit ${shopName} on Tinsae`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
    }
  };

  return (
    <Pill kind="outline" size="md" icon="arrow" onClick={shareShop}>
      {status === "copied"
        ? "Link copied"
        : status === "error"
          ? "Copy failed"
          : "Share"}
    </Pill>
  );
}
