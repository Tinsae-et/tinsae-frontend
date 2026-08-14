"use client"

import { Icon } from "@/components/tinsae/icon"
import type { Product, ProductImage } from "@/lib/types";
import { ProdPlaceholder } from "@/components/tinsae/prod-placeholder";
import { ProductGrid } from "@/components/products/product-grid";
import { ShopRow } from "@/components/shops/shop-row";
import { formatETB } from "@/lib/format";
import Image from "next/image";
import { useState } from "react";

const SHOPROWS: {
    n: string;
    loc: string;
    p: number;
    fresh: number;
    best?: boolean;
    aging?: boolean;
    tag?: string;
    c: string;
}[] = [
        { n: "Almeda Electronics", loc: "Bole · Atlas", p: 142500, fresh: 1, best: true, c: "#0F2A4D" },
        { n: "Kuriftu Mobile", loc: "Bole · Medhanialem", p: 138900, fresh: 8, tag: "Open box", c: "#7A2E2E" },
        { n: "Mosaic Tech Hub", loc: "Bole · Friendship", p: 144800, fresh: 4, c: "#3B5742" },
        { n: "Axum Digital", loc: "Bole · Olympia", p: 145200, fresh: 14, aging: true, c: "#2D4A5E" },
        { n: "Gada Trading", loc: "Bole · Rwanda", p: 147000, fresh: 22, aging: true, c: "#2D4A5E" },
    ];

const products: Product[] = [
    { id: 1, title: "Iphone 15 Pro", description: "new iphone", price: "145000", currency: "ETB", shop_name: "Gada Trading", shop_verified: true, category: null, images: [{ id: 1, url: "/file.svg", is_primary: true, display_order: 1 }], last_confirmed_at: null, slug: "slug", specs: {} },
    { id: 2, title: "Iphone 15 Pro", description: "new iphone", price: "145000", currency: "ETB", shop_name: "Gada Trading", shop_verified: true, category: null, images: [{ id: 1, url: "/file.svg", is_primary: true, display_order: 1 }], last_confirmed_at: null, slug: "slug", specs: {} },
    { id: 3, title: "Iphone 15 Pro", description: "new iphone", price: "145000", currency: "ETB", shop_name: "Gada Trading", shop_verified: true, category: null, images: [{ id: 1, url: "/file.svg", is_primary: true, display_order: 1 }], last_confirmed_at: null, slug: "slug", specs: {} },
    { id: 4, title: "Iphone 15 Pro", description: "new iphone", price: "145000", currency: "ETB", shop_name: "Gada Trading", shop_verified: true, category: null, images: [{ id: 1, url: "/file.svg", is_primary: true, display_order: 1 }], last_confirmed_at: null, slug: "slug", specs: {} },
]

const product: Product = {
    id: 1,
    title: "iPhone 15 Pro",
    description: "Natural Titanium",
    price: "138,900",
    currency: "ETB",
    shop_name: "Kuriftu Mobile",
    shop_verified: true,
    category: null,
    images: [
        { id: 1, url: "/file.svg", is_primary: true, display_order: 1 },
        { id: 2, url: "/file.svg", is_primary: false, display_order: 2 },
        { id: 3, url: "/file.svg", is_primary: false, display_order: 3 },
        { id: 4, url: "/file.svg", is_primary: false, display_order: 4 },
    ],
    last_confirmed_at: null,
    slug: "iphone-15pro",
    specs: {
        storage: "256 GB",
        display: "6.1\" OLED",
        chip: "A 18 Pro",
        camera: "48 MP triple",
        battery: "3,274",
        n5g: "yes",
        year: "2023",
        weigth: "187 g",
        sim: "Nano + eSIM"
    }
}

function goToPage(page: number) {
    console.log(page)
}

function retry() {
    console.log("retry")
}

function ImageGallary({ images }: { images: ProductImage[] }) {
    const [imageId, setImageId] = useState<number>(1);
    const [mainImage, setMainImage] = useState<ProductImage>(images.find((image: ProductImage) => image.is_primary)!);

    return (
        <>
            <div className="relative rounded-2xl row-span-3 flex items-center justify-center bg-[linear-gradient(180deg,#16114F_0%,#050505_100%)]">
                <span className="bg-white/95 text-tn-green absolute top-[18px] left-[18px] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold">
                    <Icon name="check" />
                    Confirmed in stock today
                </span>
                <span className="absolute bottom-[18px] right-[18px] text-white">
                    {imageId} / {images.length}
                </span>
                <ProdPlaceholder kind="phone" />
                <Image src={mainImage.url} alt={mainImage.url} width={10} height={10}/>
                
            </div>

            <div className="grid grid-cols-4 row-span-1 gap-2">
                {
                    images.map((image: ProductImage) => (
                        <button
                            key={image.id}
                            onClick={() => { setImageId(image.id); setMainImage(image) }}
                            className={`rounded-2xl border-[4px] hover:scale-101 hover:cursor-pointer flex items-center justify-center bg-[linear-gradient(180deg,#16110F_0%,#050505_100%)] ${image.id === imageId ? "border-orange-400" : ""
                                }`}
                        >
                            <Image src={image.url} alt="image" className="w-full" height={10} width={10} />
                        </button>
                    ))
                }
            </div>
        </>
    )
}

function StockFreshness() {
    return (
        <div className="relative pt-2 pb-6 px-3 ">
            <div className="absolute top-[14px] left-3 right-3 h-1.5 rounded-full bg-gradient-to-r from-emerald-100 via-amber-100 to-orange-200/50"></div>
            <div className="relative flex justify-between items-center z-10">

                <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white ring-4 ring-emerald-100/50"></div>
                    <span className="absolute top-6 text-xs text-gray-400 font-medium whitespace-nowrap">now</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white ring-4 ring-amber-50"></div>
                    <span className="absolute top-6 text-xs text-gray-400 font-medium whitespace-nowrap">6h</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400 border-2 border-white ring-4 ring-gray-50"></div>
                    <span className="absolute top-6 text-xs text-gray-400 font-medium whitespace-nowrap">12h</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400 border-2 border-white ring-4 ring-gray-50"></div>
                    <span className="absolute top-6 text-xs text-gray-400 font-medium whitespace-nowrap">18h</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400 border-2 border-white ring-4 ring-gray-50"></div>
                    <span className="absolute top-6 text-xs text-gray-400 font-medium whitespace-nowrap">24h</span>
                </div>
            </div>
        </div>
    )
}

function Specification({ name, value }: { name: string, value: string }) {
    return (
        <div className="flex flex-col bg-gray-100 rounded-lg p-2 mx-2 my-1 hover:shadow">
            <span className="text-sm font-bold text-gray-500 uppercase">{name}</span>
            <span className="font-bold ">{value}</span>
        </div>
    )
}

function ProductDetail() {
    return (
        <div className="px-10">
            <div className="flex flex-col gap-4">
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-2">
                    <div className="grid gird-cols-4 p-2 gap-2">
                        <ImageGallary images={product.images} />
                    </div>

                    <div className="flex flex-col p-2 gap-3">
                        <div className="flex gap-2">
                            <span className="text-green-600 rounded-full bg-green-100 px-4 py-1 font-semibold flex items-center gap-1 text-sm">
                                <Icon name="check" className="size-5" />
                                3 shops confirmed today
                            </span>
                            <span className="text-gray-900 bg-gray-200 rounded-full px-4 py-1 font-semibold flex items-center gap-3">
                                <Icon name="bolt" />
                                Trending #2
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-gray-800 font-semibold">APPLE</span>
                            <h1 className="font-bold text-5xl">{product.title} <span className="text-gray-500">256GB</span></h1>
                            <span className="font-semibold text-lg">{product.description}</span>
                        </div>

                        <div className="flex justify-between border border-gray-300 p-4 rounded-2xl bg-gray-50">
                            <div className="flex flex-col items-bottom pt-5">
                                <span className="text-red-700 text-xs font-bold ">LOWEST PRICE</span>
                                <h1 className="text-red-600 text-4xl font-bold">{formatETB(138900)}</h1>
                                <p className="text-gray-700 font-semibold text-sm">across <span className="font-bold text-gray-800">5 verified shops</span> spread 5.8%</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button className="text-white bg-red-500 p-3 rounded-full font-bold hover:shadow-lg hover:scale-[101%] hover:cursor-pointer flex items-center gap-2 text-sm"><Icon name="tg" /> Contact best shop</button>
                                <button className="border border-gray-300 p-3 hover:border-gray-900 hover:shadow hover:cursor-pointer rounded-full font-bold shadow bg-white flex items-center gap-2"><Icon name="heart" /> Save to wishlist</button>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 font-sans select-none">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm sm:text-base">
                                    <Icon name="clock" />
                                    <span>Stock freshness · last 24h</span>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-400 font-normal">5 of 5 responded</span>
                            </div>
                            <StockFreshness />
                        </div>

                        <div>
                            <span className="font-bold text-2sm">Key specifications</span>
                            <div className="grid grid-cols-3 gap-1">
                                {
                                    Object.entries(product.specs).map(([name, value]) => (
                                        <Specification key={name} name={name} value={String(value)} />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between">
                        <div>
                            <h1 className="font-bold text-3xl">Available at 5 verified shops</h1>
                            <span className="text-gray-500 ">Sorted by lowest price all reconfirmed within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-3 ">
                            <div className="border border-gray-300 py-2 px-4 rounded-full ">
                                <span className="font-bold">Sort: </span>
                                <select name="" id="" className="font-bold">
                                    <option value="price">Price</option>
                                    <option value="">Freshness</option>
                                </select>
                            </div>

                            <button className="border border-gray-300 py-2 px-4 rounded-full font-bold flex items-center gap-2"><Icon name="filter" />Filter</button>
                        </div>
                    </div>
                    <div className="my-2 flex flex-col gap-3">
                        <div className="min-w-[500px] overflow-x-scroll flex flex-col gap-3">
                            {
                                SHOPROWS.map(r => (
                                    <ShopRow key={r.n} shop={r} />
                                ))
                            }
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl flex items-center gap-2">
                            <Icon name="shield" className="text-green-500" />
                            <p className="text-sm">
                                All shops are <span className="font-bold">verified by Tinsae.</span>
                                Stock is reconfirmed daily via Telegram. Tinsae does not handle payment-visit the hsop to inspect and complete your purchase.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="font-bold text-3xl">Similar phones</h2>
                    <div className="py-4">
                        <ProductGrid
                            products={products}
                            total={4}
                            loading={false}
                            error={null}
                            page={1}
                            view={"grid"}
                            onPageChange={goToPage}
                            onRetry={retry}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail;
