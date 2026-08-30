import { Icon } from "@/components/tinsae/icon";
import { formatETB, freshness, FreshnessTone, resolveFreshness } from "@/lib/format";
import { ShopProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";


const TONE_DOT: Record<FreshnessTone, string> = {
    fresh: "bg-tn-green",
    aging: "bg-tn-warn",
    stale: "bg-tn-stale",
    unknown: "bg-tn-stale",
};

function StatusBadge({ status }: { status: boolean }) {
    return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {
                status ? "Live" : "Not Live"
            }
        </span>
    );
}



export function ListingRow({ product, selected, toggleOne }: { product: ShopProduct, selected: number[], toggleOne: (id: number) => void }) {
    const fresh = resolveFreshness(freshness(product.last_confirmed_at), product.confirmation_status);
    const tone = fresh.tone
    return (
        <tr
            key={product.id}
            className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
        >
            <td className="py-4 pl-5 pr-2">
                <input
                    type="checkbox"
                    checked={selected.includes(product.id)}
                    onChange={() => { toggleOne(product.id) }}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
            </td>

            <td className="px-2 py-4">
                <div className="flex products-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-900" />
                    <div>
                        <div className="font-semibold text-neutral-900">
                            {product.name}
                        </div>
                        <div className="text-xs text-neutral-400">{product.description}</div>
                    </div>
                </div>
            </td>

            <td className="px-2 py-4 text-right font-semibold text-neutral-900">
                {formatETB(product.price)}
            </td>

            <td className="px-2 py-4">
                <div className="flex products-center gap-3">
                    <span className="text-neutral-700">{4}</span>
                    <StatusBadge status={product.is_available} />
                </div>
            </td>

            <td className="px-2 py-4">
                <p className="font-tn-mono text-tn-mute mt-1 flex items-center justify-end gap-1.5 text-[11.5px]">
                    <span className={cn("size-1.5 rounded-full", TONE_DOT[tone])} />
                    {fresh.confirmed.slice(10)}
                </p>
            </td>

            <td className="px-2 py-4 text-right text-neutral-700">
                {3}
            </td>

            <td className="px-2 py-4 text-right font-medium text-orange-600">
                {product.id ?? <span className="text-neutral-300">—</span>}
            </td>

            <td className="py-4 pl-2 pr-5">
                <div className="flex products-center justify-end gap-2">
                    {product.confirmation_status === "stale" ? (
                        <button className="flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-xs font-medium text-white hover:bg-orange-700">
                            <Icon name="check" className="h-3.5 w-3.5" />
                            Confirm
                        </button>
                    ) : (
                        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-emerald-600 hover:bg-neutral-50">
                            <Icon name="check" className="h-4 w-4" />
                        </button>
                    )}
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    )
}