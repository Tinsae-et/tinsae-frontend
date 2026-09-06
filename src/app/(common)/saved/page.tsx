"use client";

import {
  ChevronRight,
} from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { Sidebar } from "@/components/home/savedcomp";
import { ListingRow } from "@/components/home/savedcomp";
type ListingStatus = "priceDropped" | "backInStock" | "soldOut" | "none";

interface Listing {
  id: string;
  brand: string;
  name: string;
  spec: string;
  savedAgo: string;
  shops?: number;
  priceFrom?: string;
  originalPrice?: string;
  status: ListingStatus;
  statusText?: string;
  alertPriceDrop: boolean;
  alertBackInStock: boolean;
}

/* -------------------------------------------------------------------- */
/*  Mock data (swap for real data / API results)                        */
/* -------------------------------------------------------------------- */

const listings: Listing[] = [
  {
    id: "iphone-15-pro",
    brand: "APPLE",
    name: "iPhone 15 Pro",
    spec: "256GB, Natural Ti",
    savedAgo: "Saved 6 days ago",
    shops: 5,
    priceFrom: "ETB 142,500",
    status: "priceDropped",
    statusText: "ETB 4,000 since saved",
    alertPriceDrop: true,
    alertBackInStock: true,
  },
  {
    id: "airpods-pro-2",
    brand: "APPLE",
    name: "AirPods Pro 2",
    spec: "USB-C",
    savedAgo: "Saved 1 week ago",
    shops: 9,
    priceFrom: "ETB 18,500",
    status: "priceDropped",
    statusText: "ETB 1,300 since saved",
    alertPriceDrop: true,
    alertBackInStock: false,
  },
  {
    id: "ipad-air-13",
    brand: "APPLE",
    name: 'iPad Air 13"',
    spec: "M2, 256GB",
    savedAgo: "Saved 2 weeks ago",
    shops: 3,
    priceFrom: "ETB 88,900",
    status: "backInStock",
    statusText: "Back in stock",
    alertPriceDrop: true,
    alertBackInStock: true,
  },
  {
    id: "galaxy-s24-ultra",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    spec: "256GB, Titanium",
    savedAgo: "Saved 3 days ago",
    shops: 5,
    priceFrom: "ETB 135,000",
    status: "none",
    statusText: "No change",
    alertPriceDrop: true,
    alertBackInStock: false,
  },
  {
    id: "sony-wh1000xm5",
    brand: "Sony",
    name: "Sony WH-1000XM5",
    spec: "Black",
    savedAgo: "Saved 2 days ago",
    originalPrice: "ETB 24,500",
    status: "soldOut",
    statusText: "Sold out",
    alertPriceDrop: false,
    alertBackInStock: true,
  },
  {
    id: "macbook-pro-14",
    brand: "APPLE",
    name: 'MacBook Pro 14"',
    spec: "M3, 16/512",
    savedAgo: "Saved 5 days ago",
    shops: 4,
    priceFrom: "ETB 198,000",
    status: "priceDropped",
    statusText: "ETB 6,000",
    alertPriceDrop: true,
    alertBackInStock: false,
  },
];

const tabs = [
  { label: "All saved", count: 6, active: true },
  { label: "Price dropped", count: 2, active: false },
  { label: "Back in stock", count: 1, active: false },
  { label: "Sold out", count: 1, active: false },
];


/* -------------------------------------------------------------------- */
/*  Types                                                                */
/* -------------------------------------------------------------------- */


/* -------------------------------------------------------------------- */
/*  Page                                                                 */
/* -------------------------------------------------------------------- */

export default function SavedPage() {
  const droppedCount = listings.filter((l) => l.status === "priceDropped").length;
  const totalSaved = "ETB 5,300";

  return (
    <main className="min-h-screen bg-gray-50/40 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
          <span>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span>Hanna</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-600 font-bold">Saved</span>
        </nav>

        {/* Title */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved</h1>
            <p className="mt-1 text-sm text-gray-500">
              <span className="text-black font-bold">6</span> listings watched · <span className="text-green-700 font-bold">2</span> dropped in price · <span className="text-orange-700">1</span> back in stock
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Browse more
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex items-center gap-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`relative pb-3 text-sm font-medium ${
                tab.active
                  ? "text-gray-900 font-semibold     "
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  tab.active
                    ? "bg-orange-100 text-orange-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
              {tab.active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Main column */}
          <div className="min-w-0 flex-1">
            {/* Price drop banner */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border bg-green-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border  text-emerald-600">
                  <Icon className="h-4 w-4"  name="bolt"/>
                </span>
                <div>
                  <p className="text-sm  text-green-700 font-bold ">
                    {droppedCount} of your saved phones dropped in price
                  </p>
                  <p className="text-xs text-green-700 ">
                    That&apos;s  <span className="font-bold font-tn-mono">{totalSaved}</span> off since you saved them. Reach out
                    before the price turns over.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                View drops
              </button>
            </div>

            {/* Listings */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {listings.map((item) => (
                <ListingRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          <Sidebar />
        </div>
      </div>
    </main>
  );
}
