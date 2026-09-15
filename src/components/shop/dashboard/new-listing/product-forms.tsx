"use client";

import React, { useState, useEffect, useRef } from "react";
import { ImageIcon } from "lucide-react";
import { useForm, UseFormRegister, Controller, FieldErrors, Control } from "react-hook-form";
import Image from "next/image"
import { Icon } from "@/components/tinsae/icon";
import { Category, NewProduct } from "@/lib/types";
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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
        }`}
    >
      {value}
    </button>
  );
}


function ProductForm({ register, errors, control }: { register: UseFormRegister<NewProduct>, errors: FieldErrors<NewProduct>, control: Control<NewProduct, any, NewProduct> }) {
  const [model, setModel] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.results))
      .catch(error => console.log(error))
  }, [])

  return (
    <div className="flex-col gap-2 border border-gray-200 bg-white p-5 rounded-2xl block">
      <h1 className="font-bold text-black">Product</h1>
      <div className="flex flex-col gap-2">
        <span className="text-sm my-1 font-bold">Category</span>
        <Controller
          name="category"
          control={control}
          rules={{ required: "Please select a category" }}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => field.onChange(c.slug)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${field.value === c.slug
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        />
        {errors.category && (
          <span className="text-xs text-red-500">{errors.category.message}</span>
        )}
      </div>

      <div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Product name
            </label>
            <input
              {...register("name", {
                required: {
                  value: true,
                  message: "product name is required",
                },
                minLength: {
                  value: 3,
                  message: "product name must be at least 3 characters."
                }
              })}
              type="text"
              placeholder="e.g. iPhone 15 Pro"
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name.message}</span>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-700">
              Brand
            </label>
            <div className="relative">
              <select
                {...register("brand", {
                  required: {
                    value: true,
                    message: "brand is required"
                  }
                })}
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
            {errors.brand && (
              <span className="text-xs text-red-500">{errors.brand.message}</span>
            )}
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
          onChange={(event) => setModel(event.target.value)}
          placeholder="e.g. 256GB · Natural Ti"
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        />
      </div>
      <div className="mt-5">
        <label className="mb-2 block text-sm font-bold text-neutral-700">
          Description
        </label>
        <textarea
          {...register("description", {})}
          placeholder="Condition details, what's included, warranty..."
          rows={4}
          className="w-full resize-y rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        />
      </div>
    </div>
  )
}

function ProductImageForm() {
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
  return (
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

function ProductSpecificationForm({ register, errors, control }: { register: UseFormRegister<NewProduct>, errors: FieldErrors<NewProduct>, control: Control<NewProduct, any, NewProduct> }) {
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
          <Controller
            name="specs"
            control={control}
            rules={{}}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {STORAGE_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    value={opt}
                    active={field.value.storage === opt}
                    onClick={() => field.onChange({ ...field.value, "storage": opt })}
                  />
                ))}
              </div>
            )}
          />
        </div>

        {/* Color */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Color
          </label>
          <Controller
            name="specs"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    value={opt}
                    active={field.value.color === opt}
                    onClick={() => field.onChange({ ...field.value, "color": opt })}
                  />
                ))}
              </div>
            )}

          />

        </div>

        {/* SIM */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            SIM
          </label>
          <Controller
            name="specs"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {SIM_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    value={opt}
                    active={field.value.sim === opt}
                    onClick={() => field.onChange({ ...field.value, "sim": opt })}
                  />
                ))}
              </div>
            )}
          />

        </div>

        {/* Warranty */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Warranty
          </label>
          <Controller
            name="specs"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <select
                  onChange={(e) =>
                    field.onChange({
                      ...field.value,
                      warranty: e.target.value,
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                >
                  <option value="">Select warranty</option>
                  <option value="none">No warranty</option>
                  <option value="3m">3 months</option>
                  <option value="6m">6 months</option>
                  <option value="1y">1 year</option>
                </select>

                <Icon
                  name="chevd"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            )}
          />

        </div>
      </div>
    </div>
  )
}

function PriceAndStockForm({ register, errors, control }: { register: UseFormRegister<NewProduct>, errors: FieldErrors<NewProduct>, control: Control<NewProduct, any, NewProduct> }) {
  const [negotiable, setNegotiable] = useState(false);

  return (
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
            type="number"
            inputMode="numeric"
            {...register("price", {
              required:{
                value: true,
                message: "price is required"
              },
              min:{
                value: 1,
                message: "price must be a postive number"
              }
            })}
            placeholder="ETB 0"
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
          {
            errors.price && (
            <span className="text-xs text-red-500">{errors.price.message}</span>
          )
          }
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Stock count
          </label>
          <input
            type="number"
            inputMode="numeric"
            {...register("stock", {
              min:{
                value: 0,
                message: "stock count can not be a negative number"
              }
            })}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 font-mono text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
          {
            errors.stock && (
            <span className="text-xs text-red-500">{errors.stock.message}</span>
          )
          }
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
        <Controller
          name="condition"
          control={control}
          rules={{ required: "Please select a condition" }}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((opt) => (
                <Pill
                  key={opt}
                  value={opt}
                  active={field.value === opt}
                  onClick={() => field.onChange(opt)}
                />
              ))}
            </div>
          )}
        />
        {errors.condition && (
          <span className="text-xs text-red-500">{errors.condition.message}</span>
        )}
      </div>

      {/* Price negotiable toggle */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={negotiable}
          onClick={() => setNegotiable((v) => !v)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${negotiable ? "bg-neutral-900" : "bg-neutral-200"
            }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${negotiable ? "translate-x-5" : "translate-x-0"
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

  const { register, handleSubmit, control, formState: { errors } } = useForm<NewProduct>({
    defaultValues: {
      name: "",
      brand: "",
      description: "",
      price: "",
      currency: "ETB",
      category: "",
      condition: "",
      is_available: true,
      stock: 0,
      specs: {},
      status: "live"
    }
  });

  const submit = (data: NewProduct) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3" id="product-form">
      <ProductForm register={register} errors={errors} control={control} />
      <ProductImageForm />
      <ProductSpecificationForm register={register} errors={errors} control={control} />
      <PriceAndStockForm register={register} errors={errors} control={control} />
    </form>
  )
}