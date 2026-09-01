"use client";

import { Icon } from "@/components/tinsae/icon";
import { formatETB, freshness } from "@/lib/format";
import { ShopProduct } from "@/lib/types";
import { ProdPlaceholder, kindForSlug } from "@/components/tinsae/prod-placeholder";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Link from "next/link";

export function ListingRow({
  product,
  selected,
  toggleOne,
}: {
  product: ShopProduct;
  selected: number[];
  toggleOne: (id: number) => void;
}) {
  const isSelected = selected.includes(product.id);
  const fresh = freshness(product.last_confirmed_at, product.confirmation_status);

  const dotColor =
    fresh.tone === "fresh"
      ? "bg-tn-green shadow-[0_0_0_3px_#1F8A5B22]"
      : fresh.tone === "stale"
      ? "bg-tn-mute"
      : "bg-tn-warn";

  return (
    <tr
      className={cn(
        "border-b border-tn-hair2 last:border-b-0 transition-colors",
        isSelected ? "bg-tn-red-soft" : "hover:bg-tn-paper/50"
      )}
    >
      {/* Checkbox */}
      <td className="py-[13px] pl-5 pr-2 w-12">
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          aria-label={`Select ${product.name}`}
          onClick={() => toggleOne(product.id)}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors cursor-pointer",
            isSelected ? "border-tn-red bg-tn-red text-white" : "border-tn-hair bg-white"
          )}
        >
          {isSelected && <Icon name="check" size={12} strokeWidth={3} />}
        </button>
      </td>

      {/* Product */}
      <td className="px-3 py-[13px]">
        <div className="flex items-center gap-3">
          <div className="size-[42px] rounded-[10px] bg-tn-paper flex items-center justify-center shrink-0 overflow-hidden">
            <ProdPlaceholder kind={kindForSlug(product.category)} />
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-tn-ink truncate">
              {product.name}
            </div>
            <div className="text-[11.5px] text-tn-mute truncate">
              {product.description ? `${product.description} · ` : ""}
              {product.condition || "New"}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-sm font-semibold text-tn-ink">
        {formatETB(product.price)}
      </td>

      {/* Stock · status */}
      <td className="whitespace-nowrap px-3 py-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-tn-mono text-[13px] font-semibold text-tn-mute">—</span>
          {product.is_available ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-green-soft text-tn-green">
              Live
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-tn-paper text-tn-mute">
              Sold
            </span>
          )}
        </div>
      </td>

      {/* Confirmed */}
      <td className="whitespace-nowrap px-3 py-[13px]">
        {product.is_available ? (
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", dotColor)} />
            <span className="font-tn-mono text-xs text-tn-mute">{fresh.age}</span>
          </div>
        ) : (
          <span className="font-tn-mono text-xs text-tn-mute">—</span>
        )}
      </td>

      {/* Views */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-[12.5px] text-tn-mute">
        —
      </td>

      {/* Inq */}
      <td className="whitespace-nowrap px-3 py-[13px] text-right font-tn-mono text-[12.5px] text-tn-mute">
        —
      </td>

      {/* Actions */}
      <td className="py-[13px] pl-2 pr-5 text-right">
        <div className="flex items-center justify-end gap-2">
          {product.is_available && fresh.tone !== "fresh" ? (
            <Pill kind="solid" size="sm" icon="check">
              Confirm
            </Pill>
          ) : (
            <button
              type="button"
              aria-label="Listing confirmed"
              className="size-8 rounded-full border border-tn-hair flex items-center justify-center text-tn-green bg-white cursor-pointer hover:border-tn-green"
            >
              <Icon name="check" size={15} />
            </button>
          )}

          <Link
            href={`/shop/dashboard/listings/edit?id=${product.id}`}
            aria-label={`Edit ${product.name}`}
            className="size-8 rounded-full border border-tn-hair flex items-center justify-center text-tn-mute hover:text-tn-ink hover:border-tn-ink transition-colors bg-white cursor-pointer"
          >
            <Pencil className="size-3.5" />
          </Link>
        </div>
      </td>
    </tr>
  );
}