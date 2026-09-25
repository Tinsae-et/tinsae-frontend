"use client";

import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { CompareProductHeader } from "./compare-product-column";
import { CompareUnavailableHeader } from "./compare-unavailable-column";
import { CompareEmptySlot } from "./compare-empty-slot";
import {
  buildCompareSections,
  type CompareItem,
  type CompareSectionData,
  extractShopCount,
} from "@/lib/compare-helpers";
import { useCategorySchemas } from "@/hooks/use-category-schemas";

export function CompareTable({
  items,
  onRemoveItem,
  onOpenAddModal,
  maxItems = 4,
}: {
  items: CompareItem[];
  onRemoveItem: (slug: string) => void;
  onOpenAddModal: () => void;
  maxItems?: number;
}) {
  const { schemas } = useCategorySchemas(
    items.map((item) => (item.isAvailable ? (item.product.category?.slug ?? "") : "")),
  );
  const sections: CompareSectionData[] = buildCompareSections(items, schemas);
  const showAddSlot = items.length < maxItems;

  return (
    <div className="w-full">
      {/* Scrollable Container with rounded card styling per design */}
      <div className="border-tn-hair rounded-[24px] border bg-white shadow-[0_4px_24px_rgba(11,11,11,0.03)] overflow-x-auto">
        <div className="min-w-[760px]">
          {/* ── Top Header Row (Product Cards) ── */}
          <div className="border-tn-hair flex border-b p-6">
            {/* Label column placeholder */}
            <div className="w-[180px] shrink-0 pr-4 sm:w-[220px]">
              <span className="text-tn-mute text-[11px] font-extrabold tracking-[0.09em] uppercase">
                COMPARING
              </span>
            </div>

            {/* Product Columns */}
            <div className="flex flex-1 items-start gap-4 sm:gap-6">
              {items.map((item) => {
                const slug = item.isAvailable ? item.product.slug : item.slug;
                return (
                  <div key={slug} className="min-w-[180px] flex-1 sm:min-w-[210px]">
                    {item.isAvailable ? (
                      <CompareProductHeader
                        product={item.product}
                        schema={schemas[item.product.category?.slug ?? ""] ?? null}
                        onRemove={() => onRemoveItem(slug)}
                      />
                    ) : (
                      <CompareUnavailableHeader
                        slug={slug}
                        title={item.title}
                        onRemove={() => onRemoveItem(slug)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Add product slot if < 4 items */}
              {showAddSlot && (
                <div className="min-w-[180px] flex-1 sm:min-w-[210px]">
                  <CompareEmptySlot onAddClick={onOpenAddModal} />
                </div>
              )}
            </div>
          </div>

          {/* ── Section Rows ── */}
          {sections.map((section) => (
            <div key={section.id} className="border-tn-hair border-b last:border-b-0">
              {/* Section title band */}
              <div className="bg-tn-paper/60 border-tn-hair2 flex border-b px-6 py-2.5">
                <div className="w-[180px] shrink-0 sm:w-[220px]">
                  <span className="text-tn-mute text-[10.5px] font-extrabold tracking-[0.09em] uppercase">
                    {section.title}
                  </span>
                </div>
                <div className="flex-1" />
              </div>

              {/* Data rows in this section */}
              {section.rows.map((row) => (
                <div
                  key={row.id}
                  className="border-tn-hair2 hover:bg-tn-paper/30 flex items-center border-b px-6 py-3.5 transition-colors last:border-b-0"
                >
                  {/* Row Label */}
                  <div className="w-[180px] shrink-0 pr-4 sm:w-[220px]">
                    <span className="text-tn-ink text-[13.5px] font-bold">
                      {row.label}
                    </span>
                  </div>

                  {/* Row Product Cells */}
                  <div className="flex flex-1 items-center gap-4 sm:gap-6">
                    {row.cells.map((cell, idx) => {
                      const item = items[idx];
                      const slug = item ? (item.isAvailable ? item.product.slug : item.slug) : `cell-${idx}`;

                      return (
                        <div
                          key={slug}
                          className="min-w-[180px] flex-1 sm:min-w-[210px]"
                        >
                          {!cell ? (
                            <span className="text-tn-mute text-sm">—</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {/* Icon if present */}
                              {cell.icon === "clock" && (
                                <span className={`size-1.5 shrink-0 rounded-full ${cell.isBest ? "bg-tn-green" : "bg-tn-stale"}`} />
                              )}
                              {cell.icon === "tg" && (
                                <Icon
                                  name="tg"
                                  size={13}
                                  className={cell.isBest ? "text-tn-green" : "text-[#229ed9]"}
                                />
                              )}
                              {cell.icon === "pin" && (
                                <Icon
                                  name="pin"
                                  size={13}
                                  className={cell.isBest ? "text-tn-green" : "text-tn-mute"}
                                />
                              )}

                              {/* Telegram Live badge */}
                              {cell.badge === "live" ? (
                                <span className="bg-tn-green-soft text-[#157049] border-tn-green/30 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                                  <Icon name="check" size={11} />
                                  Live
                                </span>
                              ) : cell.badge === "check" ? (
                                <div className="bg-tn-green-soft text-[#157049] inline-flex size-5.5 items-center justify-center rounded-full">
                                  <Icon name="check" size={12} strokeWidth={2.2} />
                                </div>
                              ) : cell.badge === "dash" ? (
                                <span className="text-tn-mute text-base font-semibold">—</span>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`text-[13.5px] ${
                                        row.id === "best-price"
                                          ? cell.isBest
                                            ? "font-tn-mono text-[#157049] text-base font-bold"
                                            : "font-tn-mono text-tn-ink text-[14.5px] font-semibold"
                                          : cell.isBest
                                            ? "text-[#157049] font-bold"
                                            : "text-tn-ink font-semibold"
                                      }`}
                                    >
                                      {cell.value}
                                    </span>
                                    {cell.isBest && (
                                      <span className="text-[#157049] text-xs font-extrabold">✓</span>
                                    )}
                                  </div>
                                  {cell.subValue && (
                                    <p className="text-tn-mute mt-0.5 text-[11.5px] font-medium">
                                      {cell.subValue}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Spacer for empty slot */}
                    {showAddSlot && (
                      <div className="min-w-[180px] flex-1 sm:min-w-[210px]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* ── Section 5: Make the call (Bottom Action Footer) ── */}
          <div className="bg-tn-paper/30 border-tn-hair flex items-center border-t p-6">
            {/* Label */}
            <div className="w-[180px] shrink-0 pr-4 sm:w-[220px]">
              <span className="text-tn-ink text-[14.5px] font-extrabold tracking-tight">
                Make the call
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-1 items-center gap-4 sm:gap-6">
              {items.map((item) => {
                if (!item.isAvailable) {
                  return (
                    <div key={item.slug} className="min-w-[180px] flex-1 text-center sm:min-w-[210px]">
                      <button
                        type="button"
                        disabled
                        className="bg-tn-paper text-tn-mute h-11 w-full rounded-full text-xs font-bold"
                      >
                        Unavailable
                      </button>
                    </div>
                  );
                }

                const product = item.product;
                const shopCount = extractShopCount(product).total;

                return (
                  <div
                    key={product.slug}
                    className="flex min-w-[180px] flex-1 flex-col items-center sm:min-w-[210px]"
                  >
                    <a
                      href={`https://t.me/tinsae_ethiopia_bot`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-tn-red hover:bg-tn-red-dark text-white inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-bold shadow-[0_8px_20px_rgba(204,48,0,0.22)] transition-all hover:-translate-y-px"
                    >
                      <Icon name="tg" size={15} />
                      <span>Contact shop</span>
                    </a>

                    <Link
                      href={`/products?category=${product.category?.slug ?? "phones"}`}
                      className="text-tn-ink hover:text-tn-red mt-2.5 inline-flex items-center gap-1 text-xs font-bold transition-colors"
                    >
                      <span>See all {shopCount} shops</span>
                      <Icon name="arrow" size={11} />
                    </Link>
                  </div>
                );
              })}

              {/* Spacer for empty slot */}
              {showAddSlot && (
                <div className="min-w-[180px] flex-1 sm:min-w-[210px]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Under-table Legend note ── */}
      <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium text-tn-mute">
        <span className="size-2 rounded-full bg-tn-green shrink-0" />
        <span>Green cells mark the best value in each row across the phones you&apos;re comparing.</span>
      </div>
    </div>
  );
}
