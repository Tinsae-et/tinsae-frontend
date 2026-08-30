"use client"

import React, { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { ListingRow } from "./listing-row";
import { ShopProduct } from "@/lib/types";
import { ShopProductQuery } from "@/lib/api";
import { useShopProducts } from "@/hooks/use-products";


const STATUSES: string[] = [
  "live", "need attention", "draft", "sold"
]

function Status({ s, active, setActive, setQuery, query }: { s: string, active: string, setActive: (s: string) => void, setQuery: (query: ShopProductQuery) => void, query: ShopProductQuery }) {
  return (
    <button
      className={`space-x-2 py-5 px-2 cursor-pointer flex flex-nowrap whitespace-nowrap ${active == s ? "text-black font-bold border-b-2 border-black" : ""}`}
      onClick={() => { setActive(s); setQuery({ ...query, status: s }) }}
    >
      <span className="capitalize">{s}</span>
      <span>{5}</span>
    </button>
  )
}

function StatusFilter({ setQuery, query, products }: { setQuery: (query: ShopProductQuery) => void, query: ShopProductQuery, products: ShopProduct[] }) {
  const [active, setActive] = useState("all")
  return (
    <div className="bg-white w-full px-3 flex flex-nowrap items-center gap-6 font-semibold text-gray-600 mb-2 overflow-x-auto md:text-sm text-xs">
      <button
        className={`space-x-2 py-5 px-2 cursor-pointer flex flex-nowrap ${active == "all" ? "text-black font-bold border-b-2 border-black" : ""}`}
        onClick={() => { setActive("all"); setQuery({ ...query, status: undefined }) }}
      >
        <span className="capitalize">all</span>
        <span>{products.length}</span>
      </button>
      {
        STATUSES.map(s => (
          <Status key={s} s={s} active={active} setActive={setActive} setQuery={setQuery} query={query} />
        ))
      }
    </div>
  )
}

function ToolBar({ setQuery, query }: { setQuery: (query: ShopProductQuery) => void, query: ShopProductQuery }) {
  return (
    <div className="mb-4 md:flex-row flex items-center gap-3 flex-col">
      <div className="relative flex-1 w-full md:w-auto">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search listings..."
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery({ ...query, q: event.target.value })}
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        />
      </div>

      <div className="flex gap-3">
        <select
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-700"
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setQuery({ ...query, category: event.target.value })}
        >
          <option value="">All Categories</option>
          <option value="phones">Phones</option>
          <option value="laptops">Laptops</option>
          <option value="cameras">Cameras</option>

        </select>

        <select
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-700"
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setQuery({ ...query, ordering: event.target.value })}
        >
          <option value="created_at">Newest First</option>
          <option value="-created_at">Oldest First</option>
          <option value="name">A-Z</option>
          <option value="-name">Z-A</option>
        </select>
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1">
          <button className="rounded-lg bg-neutral-900 p-2 text-white">
            <List className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-50">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TableHeader({ allSelected, toggleAll }: { allSelected: boolean, toggleAll: () => void }) {
  return (
    <thead className="bg-gray-100">
      <tr className="border-b border-neutral-100 text-xs font-medium uppercase tracking-wide text-neutral-400">
        <th className="w-12 py-3 pl-5 pr-2 text-left">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-0"
          />
        </th>
        <th className="px-2 py-3 text-left">Product</th>
        <th className="px-2 py-3 text-right">Price</th>
        <th className="px-2 py-3 text-left">Stock · status</th>
        <th className="px-2 py-3 text-right">Confirmed</th>
        <th className="px-2 py-3 text-right">Views</th>
        <th className="px-2 py-3 text-right">Inq</th>
        <th className="py-3 pl-2 pr-5 text-right">Actions</th>
      </tr>
    </thead>
  )
}

export default function ListingsTable({ access, slug }: { access: string | undefined, slug: string }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState<ShopProductQuery>({})
  const { products } = useShopProducts(query, slug, access)
  const allSelected = selected.length === products.length;

  const toggleAll = () => {
    const all = products.map(p => p.id)
    setSelected(allSelected ? [] : all);
  };

  const toggleOne = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id))
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-2">
      <div className="mx-auto ">
        {/* Status FIlter*/}
        <StatusFilter setQuery={setQuery} query={query} products={products} />
        {/* Toolbar */}
        <ToolBar setQuery={setQuery} query={query} />

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 overflow-x-scroll bg-white">
          <table className="w-full border-collapse text-sm min-w-200">
            <TableHeader allSelected={allSelected} toggleAll={toggleAll} />
            <tbody>
              {products.map((item) => (
                <ListingRow key={item.id} selected={selected} product={item} toggleOne={toggleOne} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

