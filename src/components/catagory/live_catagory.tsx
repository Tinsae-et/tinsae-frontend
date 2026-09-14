import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Icon } from '../tinsae/icon';
import Link from 'next/link';


interface LiveCategory {
  name: string;
  subtitle: string;
  listings: number;
  fromPrice: string;
  icon: React.ReactNode;
  slug:string
}


const liveCategories: LiveCategory[] = [
  {
    name: "Phones",
    subtitle: "iPhone, Samsung, Tecno",
    listings: 142,
    fromPrice: "8,500",
    icon: <Icon name="phone" className="h-5 w-5" strokeWidth={1.5} />,
    slug:"phones"
  },
  {
    name: "Laptops",
    subtitle: "MacBook, Dell, HP",
    listings: 89,
    fromPrice: "22,000",
    icon: <Icon name="laptop" className="h-5 w-5" strokeWidth={1.5} />,
    slug:"laptops",
  },
  {
    name: "Audio",
    subtitle: "Headphones, speakers, mics",
    listings: 253,
    fromPrice: "1,200",
    icon: <Icon name="audio" className="h-5 w-5" strokeWidth={1.5} />,
    slug:"audio"
  },
  {
    name: "Tablets",
    subtitle: "iPad, Galaxy Tab",
    listings: 56,
    fromPrice: "14,500",
    icon: <Icon name="tablet" className="h-5 w-5" strokeWidth={1.5} />,
    slug:"tablets"
  },
  {
    name: "Accessories",
    subtitle: "Chargers, cases, cables",
    listings: 402,
    fromPrice: "350",
    icon: <Icon name="plug" className="h-5 w-5" strokeWidth={1.5} />,
    slug:"accessories"
  },
  {
    name: "Cameras",
    subtitle: "Canon, Sony, GoPro",
    listings: 38,
    fromPrice: "18,000",
    icon: <Icon name="camera" className="h-5 w-5" strokeWidth={1.5} />,
    slug:"cameras"
  },
];



export function LiveCategoryCard({ category }: { category: LiveCategory }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
    >
      
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
            {category.icon}
          </span>
          <span className="text-xs text-gray-600 font-mono">
            {category.listings} <br /> listings
          </span>
        </div>
        <p className="truncate font-bold text-black">
          {category.name}
        </p>
        <p className="truncate text-xs text-gray-400">
          {category.subtitle}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-300  py-3">
          <p className="text-xs text-neutral-500 font-bold ">
            FROM <span className=" px-1 font-bold font-mono text-orange-700">ETB {category.fromPrice}</span>
          </p>
          <ArrowRight className="h-3.5 w-3.5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-600" />
        </div>
      </div>
    </Link>
  );
}




export default function LiveCatagory() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs font-medium text-orange-700">
                  Live now
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Electronics
                </h2>
                <p className="mt-1 max-w-md text-sm text-neutral-400">
                  Phones, laptop,audio and more - from verifed shops across
                  Bole. with stock confirmed every day
                </p>
              </div>
              <Link
                href="products"
                className="hidden shrink-0 items-center gap-1 font-bold text-sm text-black hover:text-neutral-900 sm:flex"
              >
                Browse all electronics
                <ArrowRight className="h-3.5 w-3.5 text-orange-600" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveCategories.map((category) => (
                <LiveCategoryCard key={category.name} category={category} />
              ))}
            </div>
          </section>
  )
}