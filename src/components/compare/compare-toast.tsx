"use client";

import { useEffect } from "react";
import { useCompare } from "@/hooks/use-compare";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export function CompareToast() {
  const { toast, hideToast } = useCompare();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const bgStyles = {
    info: "bg-tn-ink text-white",
    success: "bg-[#157049] text-white",
    warning: "bg-[#8a5512] text-white",
    error: "bg-tn-red text-white",
  }[toast.type ?? "info"];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 px-4 transition-all duration-200"
    >
      <div
        className={cn(
          "flex max-w-[90vw] items-center gap-3 rounded-full px-5 py-3 shadow-[0_12px_32px_rgba(11,11,11,0.22)] sm:max-w-md",
          bgStyles,
        )}
      >
        {toast.type === "success" && <Icon name="check" size={16} className="shrink-0" />}
        {toast.type === "warning" && <Icon name="bolt" size={16} className="shrink-0" />}
        {toast.type === "error" && <Icon name="close" size={16} className="shrink-0" />}
        {toast.type === "info" && <Icon name="bell" size={16} className="shrink-0" />}

        <span className="text-sm font-semibold">{toast.message}</span>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss notification"
          className="hover:bg-white/20 ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          <Icon name="close" size={13} />
        </button>
      </div>
    </div>
  );
}
