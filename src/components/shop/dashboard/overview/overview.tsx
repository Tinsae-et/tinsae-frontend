"use client"

import { Icon } from "@/components/tinsae/icon"
import { DailyStockCheckIn, RecentActivities } from "./activities";
import { Check, MoreHorizontal, ArrowRight, Pencil, Trash } from "lucide-react";
import { ShopProduct } from "@/lib/types";
import { useShopProducts } from "@/hooks/use-products";
import { useState } from "react";
import { formatETB, freshness, resolveFreshness } from "@/lib/format";

type Status = "Visible" | "Aging" | "Stale";

type Numbs = {
    title: string;
    percent: string;
    number: number;
    more: string;
}

const NUMBERS: Numbs[] = [
    { title: "Active listings", percent: "+4%", number: 124, more: "138 confirmed today" },
    { title: "Views today", percent: "+19%", number: 1243, more: "vs 890 yesterday" },
    { title: "Inquiries today", percent: "+4%", number: 34, more: "7 awaiting reply" },
    { title: "Response rate", percent: "+2%", number: 98, more: "last 30 days top 5%" },
]

function StatusPill({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Visible: "bg-emerald-50 text-emerald-700",
        Aging: "bg-amber-50 text-amber-700",
        Stale: "bg-neutral-100 text-neutral-500",
    };
    const label = status === "Stale" ? "Stale · hidden" : status;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
        >
            {label}
        </span>
    );
}

function ListingTableHeader({ selected }: { selected: number[] }) {
    return (
        <div className="flex items-center justify-between px-6 py-5 min-w-100">
            <div className="min-w-50">
                <h1 className="text-lg font-semibold text-neutral-900">
                    Your listings
                </h1>
                <p className="mt-0.5 font-mono text-xs text-neutral-400">
                    142 total · 138 visible · 3 aging · 1 stale
                </p>
            </div>

            <div className="flex items-center gap-3">
                {selected.length > 0 && (
                    <span className="text-sm text-neutral-500">
                        {selected.length} selected
                    </span>
                )}
                <button className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs whitespace-nowrap font-medium text-neutral-800 hover:bg-neutral-50">
                    <Check className="h-3.5 w-3.5" />
                    Quick confirm
                </button>
                <button className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs whitespace-nowrap font-medium text-neutral-800 hover:bg-neutral-50">
                    Manage all
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

function Action() {

    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg absolute py-2 px-4 top-0 right-0">
            <button className="flex items-center border-b gap-1 text-green-500 hover:cursor-pointer">
                <Pencil size={15} /> Edit
            </button>
            <button className="flex items-center gap-1 text-red-500 hover:cursor-pointer">
                <Trash size={15} /> Remove
            </button>
        </div>
    )
}

function TableRow({ product, isSelected, toggleOne }: { product: ShopProduct, isSelected: boolean, toggleOne: (id: number) => void }) {
    const fresh = resolveFreshness(freshness(product.last_confirmed_at), product.confirmation_status);
    const [showActions, setShowActions] = useState<boolean>(false)
    return (
        <tr
            className={`border-b border-neutral-100 last:border-0 ${isSelected ? "bg-orange-50/60" : "hover:bg-neutral-50/60"
                }`}
        >
            <td className="py-4 pl-6 pr-2">
                <button
                    onClick={() => toggleOne(product.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${isSelected
                            ? "border-orange-600 bg-orange-600"
                            : "border-neutral-300 bg-white"
                        }`}
                >
                    {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    )}
                </button>
            </td>

            <td className="px-2 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-900" />
                    <div>
                        <div className="font-semibold text-neutral-900">
                            {product.name}
                        </div>
                        <div className="text-xs text-neutral-400">{product.description}</div>
                    </div>
                </div>
            </td>

            <td className="whitespace-nowrap px-2 py-4 text-right font-mono font-semibold text-neutral-900">
                {formatETB(product.price)}
            </td>

            <td className="whitespace-nowrap px-2 py-4 text-neutral-600">
                {product.freshness}
            </td>

            <td className="whitespace-nowrap px-2 py-4">
                <div className="flex items-center gap-1.5 text-neutral-500">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${product.is_available ? "bg-emerald-500" : "bg-neutral-300"
                            }`}
                    />
                    {fresh.confirmed.slice(10)}
                </div>
            </td>

            <td className="px-2 py-4">
                <StatusPill status={"Visible"} />
            </td>

            <td className="whitespace-nowrap px-2 py-4 text-right text-neutral-700">
                {4} ·{" "}
                <span
                    className={
                        product.id > 0 ? "font-medium text-orange-600" : "text-neutral-300"
                    }
                >
                    {product.id}
                </span>
            </td>

            <td className="py-4 pl-2 pr-6">
                <div className="flex justify-end">
                    {!product.is_available ? (
                        <button className="flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-xs font-medium text-white hover:bg-orange-700">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            Confirm
                        </button>
                    ) : (
                        <div
                            onClick={() => setShowActions(!showActions)}
                            className="flex h-8 w-8 items-center justify-center relative rounded-full border border-neutral-200 text-neutral-400 hover:bg-neutral-50">
                            {
                                showActions ? <Action /> : <MoreHorizontal className="h-4 w-4" />
                            }
                        </div>
                    )}
                </div>
            </td>
        </tr>
    )
}

function ListingsTable() {
    const [selected, setSelected] = useState<number[]>([]);

    const { products } = useShopProducts({}, "shewa-electronics", "sdasd")
    const toggleOne = (id: number) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id))
            return
        }
        setSelected([...selected, id]);
    };

    return (
        <div className="border border-gray-300 rounded-2xl overflow-x-scroll">
            {/* Header */}
            <ListingTableHeader selected={selected} />

            {/* Table */}
            <table className="w-full border-collapse text-sm min-w-190">
                <thead>
                    <tr className="border-y border-neutral-100 bg-neutral-50/60 text-xs font-medium uppercase tracking-wide text-neutral-400">
                        <th className="w-12 py-3 pl-6 pr-2"></th>
                        <th className="px-2 py-3 text-left">Product</th>
                        <th className="px-2 py-3 text-right">Price</th>
                        <th className="px-2 py-3 text-left">Condition</th>
                        <th className="px-2 py-3 text-left">Confirmed</th>
                        <th className="px-2 py-3 text-left">Status</th>
                        <th className="px-2 py-3 text-right">Views · Inq</th>
                        <th className="py-3 pl-2 pr-6 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        products.map((product) => {
                            const isSelected = selected.includes(product.id);
                            return (
                                <TableRow key={product.id} product={product} isSelected={isSelected} toggleOne={toggleOne} />
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}

function NumberCard({ numb }: { numb: Numbs }) {
    return (
        <div className="border border-gray-300 p-3 bg-white flex flex-col shadow-sm rounded-2xl gap-2 relative">
            <span className="uppercase text-gray-500 font-bold text-xs">{numb.title}</span>
            <span className="text-black font-bold text-4xl">{numb.number.toLocaleString()}</span>
            <span className="text-sm text-gray-500">{numb.more}</span>
            <div className="p-5">

            </div>
            <span className="absolute text-green-500 top-3 right-3 text-xs bg-green-50 px-2 py-1 rounded-full font-bold">{numb.percent}</span>
        </div>
    )

}

function Greeting() {

    return (
        <div className="inline-block border-t border-gray-200 py-3 bg-radial-[at_50%_0%] from-white to-gray-100">
            <h1 className="text-2xl font-bold">Good Morning, Almeda 👋</h1>
        </div>
    )
}

function Numbers() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center flex-col md:flex-row gap-3">
                <div className="">
                    <Greeting />
                    <p className="text-sm">you have <span className="text-red-500 font-bold">7 unanswered inquiries</span> and <span className="text-black font-bold">4 listings </span>need re-confirmation today.</p>
                </div>

                <div className="flex gap-2">
                    <div className="py-5">
                        <button className="flex gap-2 items-center whitespace-nowrap justify-center bg-white border border-gray-300 px-3 py-2 rounded-full text-sm font-bold">
                            <Icon name="check" />
                            Confirm all stock
                        </button>
                    </div>


                    <div className="border-t border-gray-200 py-5 bg-radial-[at_50%_0%] from-white to-gray-100">
                        <button className="flex gap-2 items-center whitespace-nowrap justify-center bg-red-700 px-3 py-2 rounded-full text-sm text-white font-bold shadow-red-300 shadow-lg">
                            <Icon name="msg" />
                            Reply to inquiries
                        </button>
                    </div>

                </div>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
                {
                    NUMBERS.map(n => (
                        <NumberCard key={n.title} numb={n} />
                    ))
                }
            </div>
        </div>
    )
}


export default function Overview() {
    return (
        <div className="p-5 flex flex-col gap-5">
            <Numbers />
            <div className="grid md:grid-cols-2 gap-4">
                <DailyStockCheckIn />
                <RecentActivities />
            </div>
            <ListingsTable />
        </div>
    )
}