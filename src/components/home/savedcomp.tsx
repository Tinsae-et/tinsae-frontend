"use client";
import {
  Trash2,CheckCircle2,
} from "lucide-react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
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



const alertStats = [
  { icon: "tag", label: "Price-drop alerts", value: "4 active" , bg:"text-green-600 bg-gray-200" ,bord:"border-b border-gray-300"},
  { icon: "box", label: "Back-in-stock alerts", value: "2 active",bg:"text-orange-600 bg-gray-200",bord:"border-b  border-gray-300" },
  { icon: "search", label: "Saved searches", value: "3 active",bg:"text-gray-600 bg-gray-200",bord:"" },
]as const;

const savedSearches = [
  {
    title: "Sealed iPhone · under ETB 50,000 · Bole",
    meta: "4 filters · 1 new",
    badge: 1,
  },
  {
    title: "MacBook Pro M3 · incl. refurbished",
    meta: "2 filters · no new matches",
    badge: 0,
  },
  {
    title: "Sony cameras · under ETB 200,000",
    meta: "3 filters · 1 new",
    badge: 1,
  },
];


function Toggle({ on }: { on: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-emerald-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-0" : "-translate-x-4"
        }`}
      />
    </button>
  );
}

export function StatusPill({ status, text }: { status: ListingStatus; text?: string }) {
  if (!text) return null;

  const styles: Record<ListingStatus, string> = {
    priceDropped: "bg-emerald-50 text-emerald-600",
    backInStock: "bg-emerald-50 text-emerald-600",
    soldOut: "bg-orange-50 text-orange-500",
    none: "text-gray-400",
  };

  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${styles[status]}`}
    >
        <Icon name="chevd"/>
      {status === "backInStock" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {text}
    </span>
  );
}

export function ListingRow({ item }: { item: Listing }) {
  const isSoldOut = item.status === "soldOut";

  return (
    <div className=" border-gray-300 rounded-2xl my-2 border hover:shadow-2xl hover:-translate-y-1 transition hover:border-orange-500 ">
      <div className="flex items-start gap-4 px-5 pt-4 pb-3">
        <div className="flex h-17 w-15 shrink-0 items-center justify-center rounded-lg bg-gray-300 text-gray-400">
            <div  className="h-5 w-6 flex items-center justify-center">
                <div className="bg-black h-10 rounded w-6"></div>
            </div>
            </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs fon text-gray-500">{item.brand}</p>
          <h3 className=" text-xl font-bold text-gray-900">
            {item.name}
          </h3>
          <p className="text-xs text-gray-600">{item.spec}</p>
          <p className="mt-1 text-xs text-gray-600 flex gap-2 font-mono items-center">
            <Icon name="heart" size={12} className="text-orange-700"/>
            {item.savedAgo}
            {item.shops ? ` · ${item.shops} shops` : ""}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <button
            type="button"
            aria-label="Remove from saved"
            className="text-gray-300 transition-colors hover:text-gray-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {isSoldOut ? (
            <>
              <span className="text-sm text-gray-300 line-through">
                {item.originalPrice}
              </span>
              <StatusPill status={item.status} text={item.statusText} />
            </>
          ) : (
            <>
              <span className=" font-mono font-semibold text-orange-600">
                {item.priceFrom && (
                  <span className="mr-1 text-xs font-normal text-gray-400">
                    FORM
                  </span>
                )}
                {item.priceFrom}
              </span>
              <StatusPill status={item.status} text={item.statusText} />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t rounded-b-2xl bg-orange-100 px-5 py-2.5">
        <div className="flex items-center gap-5">
          <span className="text-xs text-gray-500 font-bold">ALERT ME</span>

          <label className="flex items-center gap-2"> 
            <Toggle on={item.alertPriceDrop} />
            <Icon name="tag" size={16} className="text-gray-700"/>
            <span className="text-xs text-black font-bold">Price drop</span>
          </label>
          
          <label className="flex items-center gap-2">
            <Toggle on={item.alertBackInStock} />
            <Icon name="box" size={16} className="text-gray-700"/>
            <span className="text-xs text-black font-bold">Back in stock</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <a href="#" className="text-xs  text-gray-700 font-bold hover:text-gray-700">
            View listing
          </a>
              <Pill icon="tg"   
              >Contact shop</Pill>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Sidebar                                                              */
/* -------------------------------------------------------------------- */
export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
      <div className="rounded-2xl border bg-white p-4 border-gray-200">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Your alerts</h4>
        <ul className="space-y-3">
          {alertStats.map(({icon, label, value,bg,bord }) => (
           
            <div key={label} className={`flex items-center py-3 gap-3 ${bord} `}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                <Icon name={icon} size={17} className={` ${bg}` } />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-gray-500">{label}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-gray-900">
                {value}
              </span>
              <hr className="border-t-2 border-gray-500" />
            </div>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-300 bg-white p-4 ">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Saved searches
        </h4>
        <ul className="space-y-3 ">
          {savedSearches.map((s) => (
            <li key={s.title} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className=" text-sm font-bold text-black">
                  {s.title}
                </p>
                <p className="text-[11px] text-gray-500 font-mono">{s.meta}</p>
              </div>
              {s.badge > 0 && (
                <span className="flex h-4 w-5 p-1 shrink-0 items-center justify-center rounded-full bg-orange-700 text-[10px] font-semibold text-white">
                    <Icon name="plus"/>
                  {s.badge}
                </span>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-bold text-black hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1 transition hover:border-orange-500 "
        >
          <Icon name="plus" className=" text-orange-700 font-bold " />
          New saved search
        </button>
      </div>
    </aside>
  );
}