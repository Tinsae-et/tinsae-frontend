"use client"

import { SectionHead } from "../home/section-head";
import { Product } from "@/lib/types";
import { ProductCard } from "../products/product-card";
import { getProducts } from "@/lib/api";
import { useState } from "react";
interface UpcomingCategory {
  name: string;
  items: string;
  status: string;
  icon: React.ReactNode;
}


export function PlaceholderArt({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-neutral-100 ${className}`}
    >
      <div className="absolute h-16 w-16 rotate-6 rounded-2xl bg-neutral-200" />
      <div className="absolute h-10 w-10 -rotate-12 rounded-xl bg-neutral-300/70" />
    </div>
  );
}




export function UpcomingCategoryCard({ category }: { category: UpcomingCategory }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex justify-between items-top">
        <span className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 text-neutral-600">
          {category.icon}
        </span>
        <span className="text-gray-500 text-xs font-mono">Q3 2026</span>
      </div>
      <p className="text-sm font-bold text-black">{category.name}</p>
      <p className="text-xs text-neutral-400">{category.items}</p>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full text-xs bg-orange-700" />
        {category.status}
      </p>
    </div>
  );
}
export function Trendinglisting() {
    const [products, setProducts] = useState<Product[]>([])
    getProducts().then(res=>setProducts(res.results.slice(0,5))).catch(error=>console.log(error));
  return (
    <section className="mx-auto mt-16 max-w-310 px-6 lg:mt-mt-22">
      <SectionHead
        eyebrow="Trending"
        title="Popular listing"
        href="/products"
        link="Browse all"
      />

      {products.length === 0 ? (
        <div className="border-tn-hair rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-tn-ink text-base font-extrabold">No confirmed listings yet</p>
          <p className="text-tn-mute mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            Listings appear here once shops confirm their stock over Telegram.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}