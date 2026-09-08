"use client"
import { ShopProductQuery } from '@/lib/api';
import React, { useState } from 'react'

type CategoryFilter = "" | "phones" | "laptops" | "audio" | "tablets" | "accessories";

type CategoryChip = {
    id: CategoryFilter;
    label: string;
    count: number;
}


const CATEGORY_CHIPS: CategoryChip[] = [
    { id: "", label: "All", count: 142 },
    { id: "phones", label: "Phones", count: 62 },
    { id: "laptops", label: "Laptops", count: 38 },
    { id: "audio", label: "Audio", count: 22 },
    { id: "tablets", label: "Tablets", count: 12 },
    { id: "accessories", label: "Accessories", count: 8 },
];

function CategoryChips({query, setQuery, total}:{query: ShopProductQuery, setQuery: (q:ShopProductQuery)=> void, total: number}) {
    const [category, setCategory] = useState<CategoryFilter>("");
    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((chip) => {
                const active = category === chip.id;
                return (
                    <button
                        key={chip.id}
                        onClick={() =>{ setCategory(chip.id); setQuery({...query, category: chip.id})}}
                        className={`flex items-center gap-1.5 rounded-full cursor-pointer border px-4 py-2 text-sm font-medium transition-colors ${active
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                            }`}
                    >
                        {chip.label}
                        <span className={active ? "text-neutral-400" : "text-neutral-400"}>
                            {chip.id === category && total}
                        </span>
                    </button>
                );
            })}
        </div>
    )
}

export default CategoryChips