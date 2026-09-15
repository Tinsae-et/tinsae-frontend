"use client";

import React, { useState, useEffect, useRef } from "react";
import { ImageIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/shop/onboarding-state"
import Image from "next/image"
import { Icon } from "@/components/tinsae/icon";
import { Category } from "@/lib/types";
import { getCategories } from "@/lib/api";

type Storage = "64GB" | "128GB" | "256GB" | "512GB" | "1TB";
type Color = "Black" | "White" | "Blue" | "Natural Ti" | "Gold";
type Sim = "Single" | "Dual";
type Condition = "New · Sealed" | "New · Open box" | "Used";

const STORAGE_OPTIONS: Storage[] = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const COLOR_OPTIONS: Color[] = ["Black", "White", "Blue", "Natural Ti", "Gold"];
const SIM_OPTIONS: Sim[] = ["Single", "Dual"];
const CONDITION_OPTIONS: Condition[] = [
  "New · Sealed",
  "New · Open box",
  "Used",
];

function Pill<T extends string>({
  value,
  active,
  onClick,
}: {
  value: T;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {value}
    </button>
  );
}


function ProductForm(){
    const [category, setCategory] = useState<string>("")
    const [productName, setProductName] = useState<string>("");
    const [brand, setBrand] = useState<string>("");
    const [model, setModel] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(()=>{
      getCategories()
        .then(res=>setCategories(res.results))
        .catch(error=>console.log(error))
    },[])
    
    return (
        <div className="flex-col gap-2 border border-gray-200 bg-white p-5 rounded-2xl block">
            <h1 className="font-bold text-black">Product</h1>
            <div className="flex flex-col gap-2">
                <span className="text-sm my-1 font-bold">Category</span>
                <div className="flex flex-wrap gap-2">
                    {
                        categories.map((c)=>(
                            <button
                                key={c.id}
                                onClick={()=>{setCategory(c.slug)}}
                                type="button"
                                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                                category === c.slug
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                                }`}
                            >
                                {c.name}
                            </button>
                        ))
                    }
                </div>
            </div>

            <div>
                <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Product name
                    </label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(event)=>setProductName(event.target.value)}
                        placeholder="e.g. iPhone 15 Pro"
                        className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                    />
                    </div>
                    <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                        Brand
                    </label>
                    <div className="relative">
                        <select
                        value={brand}
                        onChange={(event)=>setBrand(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                        >
                        <option value="">Select brand</option>
                        <option value="apple">Apple</option>
                        <option value="samsung">Samsung</option>
                        <option value="google">Google</option>
                        <option value="other">Other</option>
                        </select>
                        <Icon name="chevd" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-neutral-700">
                    Model / variant
                </label>
                <input
                type="text"
                value={model}
                onChange={(event)=>setModel(event.target.value)}
                placeholder="e.g. 256GB · Natural Ti"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                />
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold text-neutral-700">
              Description
            </label>
            <textarea
                value={description}
                onChange={(event)=>setDescription(event.target.value)}
                placeholder="Condition details, what's included, warranty..."
                rows={4}
                className="w-full resize-y rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                />
            </div>
        </div>
    )
}

function ProductImageForm(){
    const MAX_PHOTOS = 5;
    const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
    const [extraPhotos, setExtraPhotos] = useState<(string | null)[]>([
        null,
        null,
        null,
        null,
    ]);
    const photoCount = (coverPhoto ? 1 : 0) + extraPhotos.filter(Boolean).length;

    const coverPhotoRef = useRef<string | null>(null);
    const extraPhotosRef = useRef<(string | null)[]>(extraPhotos);

    useEffect(() => {
        coverPhotoRef.current = coverPhoto;
        extraPhotosRef.current = extraPhotos;
    });

    useEffect(() => {
        return () => {
            if (coverPhotoRef.current) URL.revokeObjectURL(coverPhotoRef.current);
            extraPhotosRef.current.forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverPhoto((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
    };

    const handleExtraUpload = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setExtraPhotos((prev) => {
            const next = [...prev];
            if (next[index]) URL.revokeObjectURL(next[index]!);
            next[index] = url;
            return next;
        });
    };
    return(
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 block">
            <div >
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-neutral-900">Photos</h2>
                    <span className="text-xs text-neutral-400">
                    {photoCount}/{MAX_PHOTOS} · first is the cover
                    </span>
                </div>

                {/* Cover photo dropzone */}
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 py-10 text-center hover:bg-neutral-50">
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    />
                    {coverPhoto ? (
                    <Image
                        src={coverPhoto}
                        alt="Cover"
                        width={20}
                        height={20}
                        unoptimized
                        className="h-32 w-full rounded-lg object-cover"
                    />
                    ) : (
                    <>
                        <ImageIcon className="h-6 w-6 text-neutral-400" />
                        <div>
                        <div className="text-sm font-medium text-neutral-700">
                            Add cover photo
                        </div>
                        <div className="text-xs text-neutral-400">
                            Drag &amp; drop or click to upload
                        </div>
                        </div>
                    </>
                    )}
                </label>

                {/* Extra photo slots */}
                <div className="mt-3 grid grid-cols-4 gap-3">
                    {extraPhotos.map((photo, i) => (
                    <label
                        key={i}
                        className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50"
                    >
                        <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleExtraUpload(i, e)}
                        />
                        {photo ? (
                        <Image
                            src={photo}
                            alt={`Photo ${i + 2}`}
                            width={20}
                            height={20}
                            unoptimized
                            className="h-full w-full rounded-xl object-cover"
                        />
                        ) : (
                        <Icon name="plus" className="h-5 w-5 text-neutral-300" />
                        )}
                    </label>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ProductSpecificationForm(){
  const [storage, setStorage] = useState<Storage | null>(null);
  const [color, setColor] = useState<Color | null>(null);
  const [sim, setSim] = useState<Sim | null>(null);
  const [warranty, setWarranty] = useState("");

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">
              Specifications
            </h2>
            <span className="text-sm text-neutral-400">Phones</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
            {/* Storage */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Storage
              </label>
              <div className="flex flex-wrap gap-2">
                {STORAGE_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    value={opt}
                    active={storage === opt}
                    onClick={() => setStorage(opt)}
                  />
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    value={opt}
                    active={color === opt}
                    onClick={() => setColor(opt)}
                  />
                ))}
              </div>
            </div>

            {/* SIM */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                SIM
              </label>
              <div className="flex flex-wrap gap-2">
                {SIM_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    value={opt}
                    active={sim === opt}
                    onClick={() => setSim(opt)}
                  />
                ))}
              </div>
            </div>

            {/* Warranty */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Warranty
              </label>
              <div className="relative">
                <select
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                >
                  <option value="">Select warranty</option>
                  <option value="none">No warranty</option>
                  <option value="3m">3 months</option>
                  <option value="6m">6 months</option>
                  <option value="1y">1 year</option>
                </select>
                <Icon name="chevd" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
    )
}

function PriceAndStockForm(){
    
    const [price, setPrice] = useState("");
    const [stockCount, setStockCount] = useState("1");
    const [condition, setCondition] = useState<Condition>("New · Sealed");
    const [negotiable, setNegotiable] = useState(false);

    return(
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Price &amp; stock
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Price (ETB)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ETB 0"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Stock count
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 font-mono text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
          </div>

          {/* Price comparison hint */}
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-neutral-50 px-4 py-3.5">
            <Icon name="pulse" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
            <div>
              <div className="text-sm font-medium text-neutral-700">
                Set a price to compare
              </div>
              <div className="font-mono text-xs text-neutral-400">
                5 shops nearby: ETB 138,000 - ETB 148,000
              </div>
            </div>
          </div>

          {/* Condition */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((opt) => (
                <Pill
                  key={opt}
                  value={opt}
                  active={condition === opt}
                  onClick={() => setCondition(opt)}
                />
              ))}
            </div>
          </div>

          {/* Price negotiable toggle */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={negotiable}
              onClick={() => setNegotiable((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                negotiable ? "bg-neutral-900" : "bg-neutral-200"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  negotiable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <div className="text-sm font-medium text-neutral-800">
                Price negotiable
              </div>
              <div className="text-xs text-neutral-400">
                Show buyers you&apos;re open to offers
              </div>
            </div>
          </div>
        </div>
    )
}

export function Form() {
  

  return (
    <form className="flex flex-col gap-3">
      <ProductForm />
      <ProductImageForm />
      <ProductSpecificationForm />
      <PriceAndStockForm />
    </form>
  )
}