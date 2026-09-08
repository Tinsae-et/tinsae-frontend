"use client"
import React, { useState } from 'react'
import CategoryChips from './category-chips'
import { Icon } from '../tinsae/icon'
import { ShopProductQuery } from '@/lib/api';
import { ProductCard, ProductCardSkeleton } from '../products/product-card';
import { usePublicShopProducts } from '@/hooks/use-products';
import { useParams } from 'next/navigation';


function ListingSection() {
    const params = useParams<{slug: string}>();
    const [query, setQuery] = useState<ShopProductQuery>({});
    const { products, loading } = usePublicShopProducts(query, params.slug);
    return (
        <div>
            {/* Section header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-extrabold text-neutral-900">
                        All listings <span className="text-neutral-400">{products.length}</span>
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        138 confirmed today · 4 aging
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <select>
                            <option>Sort: Newest</option>
                            <option>Sort: Oldest</option>
                            <option>Sort: A - Z</option>
                            <option>Sort: Z - A</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <Icon name="sliders" className="h-4 w-4 text-neutral-400" />
                        <select>
                            <option>Filter</option>
                            <option>Filter: Phones</option>
                            <option>Filter: Laptops</option>
                            <option>Filter: Audio</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Category chips */}
            <CategoryChips />

            {/* Listing cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))
                ) :
                    products.length === 0 ? null
                        : (
                            products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))
                        )}
            </div>
        </div>

    )
}

export default ListingSection