"use client";

import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export function ProductDetailActions({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { isInCompare, toggleCompare } = useCompare();
  const inCompare = isInCompare(slug);
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(slug);

  return (
    <div className="flex flex-col gap-2.5 sm:w-[220px]">
      <Pill kind="solid" size="lg" icon="tg">
        Contact best shop
      </Pill>

      <button
        type="button"
        onClick={() => toggleCompare(slug, title)}
        aria-pressed={inCompare}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold tracking-[-0.01em] whitespace-nowrap transition-all duration-150 hover:-translate-y-px",
          inCompare
            ? "bg-tn-ink text-white shadow-[0_4px_14px_rgba(11,11,11,0.18)]"
            : "border-tn-hair text-tn-ink hover:border-tn-ink hover:text-tn-ink border-[1.5px] bg-white",
        )}
      >
        <Icon name="sliders" size={17} />
        <span>{inCompare ? "In comparison" : "Add to compare"}</span>
      </button>

      <button
        type="button"
        onClick={() => toggleSaved(slug)}
        aria-pressed={saved}
        className="w-full text-left"
      >
        <Pill
          kind={saved ? "solid" : "outline"}
          size="md"
          icon="heart"
          className={cn("w-full justify-center", saved && "bg-tn-red text-white")}
        >
          {saved ? "Saved to wishlist" : "Save to wishlist"}
        </Pill>
      </button>
    </div>
  );
}
