import {Shirt, Sofa,Wrench} from "lucide-react";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { Trendinglisting,UpcomingCategoryCard   }from "@/components/catagory/catagory_comps"

import LiveCatagory from "@/components/catagory/live_catagory";
// ---------- Types ----------




interface UpcomingCategory {
  name: string;
  items: string;
  status: string;
  icon: React.ReactNode;
}

// ---------- Data ----------



const upcomingCategories: UpcomingCategory[] = [
  {
    name: "Vehicles",
    items: "Cars, motorcycles, parts",
    status: "Coming soon",
    icon: <Icon name="car" className="h-5 w-5 " strokeWidth={1.5} />,
  },
  {
    name: "Property",
    items: "Rent, sale, land",
    status: "Coming soon",
    icon: <Icon name="building" className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    name: "Fashion",
    items: "Clothing, shoes, bags",
    status: "Coming soon",
    icon: <Shirt className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    name: "Home & Furniture",
    items: "Furniture, appliances",
    status: "Coming soon",
    icon: <Sofa className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    name: "Services",
    items: "Repairs, tutors, jobs",
    status: "Coming soon",
    icon: <Wrench className="h-5 w-5" strokeWidth={1.5} />,
  },
];

// ---------- Small building blocks ----------

// ---------- Page ----------

export default function CatagoryPage() {




  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-neutral-400">
          <a href="#" className="hover:text-neutral-600">
            Home
          </a>
          <span>/</span>
          <span className="text-neutral-600">Browse all</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Everything on Tinsae
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-500 ">
          Every verified category in Addis Ababa, one marketplace. Electronics
          is live now, more verticals are on the way.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-neutral-500">
          <span>
            <span className="font-medium text-neutral-900">6</span> categories live
          </span>
          <span>
            <span className="font-medium text-neutral-900">850+</span> verified shops
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Stock confirmed daily
          </span>
        </div>
      </section>

      <div className="border-t border-neutral-100" />

      {/* Live: Electronics */}
      <LiveCatagory/>

      {/* Trending */}
      <Trendinglisting />

      {/* Roadmap */}
      <section className="bg-neutral-50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium text-orange-700">
            ON THE ROADMAP
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            More marketplaces, coming to Addis
          </h2>
          <p className="mt-1 max-w-md text-sm text-neutral-400">
            Tinsae is built catagory-agnostic. Each new Vertical launches with the same 
            verified shops and confirmed-stock promise
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {upcomingCategories.map((category) => (
              <UpcomingCategoryCard key={category.name} category={category} />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex  gap-2 items-center">
                <Icon name="tg" className="text-blue-400"/>
              <p className="text-sm text-black font-bold">
                Run a shop in one of these categories?
                <span className="text-neutral-400 ml-4">
                  Get listed early and we&apos;ll onboard you the moment your vertical goes live.
                </span>
              </p>   

            </div>
            
              <Pill icon="tg" className="bg-black shadow shadow-black" >jobs the waitlist</Pill>
           
          </div>
        </div>
      </section>
    </main>
  );
}