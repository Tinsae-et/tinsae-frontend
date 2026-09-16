"use client"

import { Icon } from "@/components/tinsae/icon";
import { kindForSlug, ProdPlaceholder } from "@/components/tinsae/prod-placeholder";
import { ShopProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChecklistItem {
    id: string;
    label: string;
    done: boolean | string;
}


export function ProductPreview() {

    return (
        <div className="pt-15">
            <span className="text-xs font-bold text-black">BUYER WILL SEE</span>
            <article className="border-tn-hair flex flex-col overflow-hidden rounded-[18px] border bg-white">
                <div className="bg-tn-paper relative aspect-square flex items-center justify-center">

                    <ProdPlaceholder kind={kindForSlug("phone")} />

                    <span
                        className="absolute top-3 left-3 inline-flex h-[26px] items-center gap-1 rounded-full bg-white/95 px-2.5 text-[11.5px] font-semibold"
                    >
                        <Icon name="check" size={12} />
                        In stock
                    </span>

                    <button
                        className="bg-white/95 text-tn-ink2 absolute top-3 right-3 z-1 inline-flex size-8 items-center justify-center rounded-[10px] shadow-[0_2px_8px_rgba(11,11,11,0.06)] transition-colors"
                    >
                        <Icon name="heart" size={15} />
                    </button>
                </div>

                <div className="px-[18px] pt-4 pb-[18px]">
                    <p className="text-tn-mute truncate text-[10.5px] font-bold tracking-[0.06em] uppercase">
                        phone
                    </p>
                    <h3 className="text-tn-ink mt-1 truncate text-[15.5px] leading-tight font-extrabold tracking-[-0.02em]">
                        Your product name
                    </h3>
                    <span className="text-sm text-gray-400">Add a model /variant</span>
                    <p className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-tn-mute text-[10.5px] font-semibold tracking-[0.04em] uppercase">
                            From
                        </span>
                        <span className="font-tn-mono text-tn-red text-base font-semibold tracking-[-0.02em]">
                            ETB 0
                        </span>
                    </p>

                    <div className="border-tn-hair2 text-tn-ink2 mt-3 flex justify-between items-center gap-1.5 border-t pt-3 text-[11.5px]">
                        <span className="font-tn-mono text-tn-mute flex min-w-0 items-center gap-1.5 text-[10.5px] sm:text-xs">
                            <span className={cn("size-1.5 shrink-0 rounded-full", "bg-tn-green")} />
                            <span className="truncate">1 shops</span>
                        </span>
                        <span className="font-tn-mono text-tn-mute flex min-w-0 items-center gap-1.5 text-[10.5px] sm:text-xs">
                            <span className={cn("size-1.5 shrink-0 rounded-full", "bg-tn-green")} />
                            <span className="truncate">1h ago</span>
                        </span>
                    </div>
                </div>
            </article>
        </div>
    )
}

export function DailyStockCheckIn() {
    const [dailyCheckIn, setDailyCheckIn] = useState(true);
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-blue-400">
                    <Icon name="tg" />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-semibold text-neutral-900">
                        Daily stock check-in
                    </div>
                    <div className="text-xs text-neutral-400">
                        Include in the 9:00 am bot ping
                    </div>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={dailyCheckIn}
                    onClick={() => setDailyCheckIn((v) => !v)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${dailyCheckIn ? "bg-emerald-600" : "bg-neutral-200"
                        }`}
                >
                    <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dailyCheckIn ? "translate-x-5" : "translate-x-0.5"
                            }`}
                    />
                </button>
            </div>

            <div className="mt-3 rounded-xl bg-neutral-50 px-3.5 py-3 text-xs text-neutral-500">
                Buyers see a &quot;confirmed today&quot; badge while you keep it fresh.
            </div>
        </div>
    )
}

export function BeforePublication({watch, coverPhoto, extraPhotos}:{watch: (val: string)=>boolean, coverPhoto: ShopProductImage | null, extraPhotos: (ShopProductImage | null)[]}) {

    const photo = Boolean(coverPhoto || extraPhotos.find(p=>p !== null))
    const CHECKLIST: ChecklistItem[] = [
        { id: "name", label: "Product name", done: watch("name") },
        { id: "photo", label: "At least one photo", done: photo},
        { id: "price", label: "Price set", done: watch("price") },
        { id: "condition", label: "Condition", done: watch("condition") },
    ];
    const allDone = CHECKLIST.every((item) => item.done);

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-900">
                Before you publish
            </h3>

            <ul className="mt-3 space-y-3">
                {CHECKLIST.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                        <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${item.done ? "bg-emerald-600" : "bg-neutral-100"
                                }`}
                        >
                            {item.done && (
                                <Icon name="check" className="h-3 w-3 text-white" strokeWidth={3} />
                            )}
                        </span>
                        <span
                            className={`text-sm ${item.done ? "font-medium text-neutral-900" : "text-neutral-400"
                                }`}
                        >
                            {item.label}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                type="submit"
                disabled={!allDone}
                form="product-form"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 py-2.5 text-sm font-medium text-neutral-400 disabled:cursor-not-allowed enabled:text-neutral-800 enabled:hover:bg-neutral-50"
            >
                <Icon name="check" className="h-4 w-4" />
                Publish listing
            </button>
        </div>
    )
}