"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Plus,
  Star,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Icon, IconName } from "@/components/tinsae/icon";
import { Category, NewProduct, ShopProduct, ShopProductImage } from "@/lib/types";
import {
  ApiError,
  createListing,
  getCategories,
  updateListing,
  updateListingImage,
  uploadListingImage,
  deleteListingImage,
} from "@/lib/api";
import { BeforePublication, DailyStockCheckIn, ProductPreview } from "./buyer-preview";
import { normalizeImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

const BRANDS = [
  "Apple",
  "Samsung",
  "Sony",
  "Dell",
  "HP",
  "JBL",
  "Anker",
  "Tecno",
  "Xiaomi",
  "Google",
  "Other",
];

const CONDITION_OPTIONS = [
  { value: "new", label: "New · Sealed" },
  { value: "refurbished", label: "New · Open box" },
  { value: "used", label: "Used" },
];

const MARKET_RANGES: Record<string, [number, number]> = {
  phone: [138000, 148000],
  phones: [138000, 148000],
  laptop: [150000, 205000],
  laptops: [150000, 205000],
  audio: [16000, 26000],
  tablet: [80000, 95000],
  tablets: [80000, 95000],
  accessories: [300, 2500],
  plug: [300, 2500],
  camera: [240000, 275000],
  cameras: [240000, 275000],
};

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeInMb}MB). Maximum allowed size is 5MB.`;
  }
  return null;
}

export function formatETB(amount: number): string {
  return "ETB " + amount.toLocaleString("en-US");
}

function getCategoryIconName(slug: string): IconName {
  if (slug.includes("phone")) return "phone";
  if (slug.includes("laptop")) return "laptop";
  if (slug.includes("audio")) return "audio";
  if (slug.includes("tablet")) return "tablet";
  if (slug.includes("access") || slug.includes("plug")) return "plug";
  if (slug.includes("camera")) return "camera";
  return "tag";
}

function ProductCardSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-tn-hair bg-white p-6 mb-4">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-base font-extrabold text-tn-ink tracking-[-0.02em]">
          {title}
        </h3>
        {hint && <span className="text-xs text-tn-mute font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Form({
  shopSlug,
  action,
  initialProduct = null,
  initialImages = [],
}: {
  shopSlug: string;
  action: string;
  initialProduct?: ShopProduct | null;
  initialImages?: ShopProductImage[];
}) {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    brand: initialProduct?.brand || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price ? String(initialProduct.price) : "",
    currency: "ETB",
    category: initialProduct?.category || "",
    condition: initialProduct?.condition || "new",
    is_available: initialProduct ? initialProduct.is_available : true,
    stock: initialProduct?.stock ?? 1,
    status: initialProduct?.status || "live",
    slug: initialProduct?.slug,
  });

  const [variant, setVariant] = useState<string>(() => {
    return (initialProduct?.specs?.variant as string) || "";
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((res) => {
        if (mounted) {
          setCategories(res.results || []);
          setLoadingCats(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
        if (mounted) setLoadingCats(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Photos State
  const [coverPhoto, setCoverPhoto] = useState<ShopProductImage | null>(() => {
    if (initialImages && initialImages.length > 0) {
      const img = initialImages.find((i) => i.is_primary) || initialImages[0];
      const rawSrc = img.url || img.image || img.preview || "";
      const normalized = typeof rawSrc === "string" ? (normalizeImageUrl(rawSrc) || rawSrc) : "";
      return {
        ...img,
        image: img.image || rawSrc,
        preview: img.preview ? (normalizeImageUrl(img.preview) || img.preview) : normalized,
        url: typeof img.url === "string" ? (normalizeImageUrl(img.url) || img.url) : normalized,
      };
    }
    return null;
  });

  const [extraPhotos, setExtraPhotos] = useState<(ShopProductImage | null)[]>(() => {
    const slots: (ShopProductImage | null)[] = [null, null, null, null];
    if (initialImages && initialImages.length > 0) {
      const primary = initialImages.find((img) => img.is_primary) || initialImages[0];
      const others = initialImages.filter((img) => img !== primary);
      others.slice(0, 4).forEach((img, idx) => {
        const rawSrc = img.url || img.image || img.preview || "";
        const normalized = typeof rawSrc === "string" ? (normalizeImageUrl(rawSrc) || rawSrc) : "";
        slots[idx] = {
          ...img,
          image: img.image || rawSrc,
          preview: img.preview ? (normalizeImageUrl(img.preview) || img.preview) : normalized,
          url: typeof img.url === "string" ? (normalizeImageUrl(img.url) || img.url) : normalized,
        };
      });
    }
    return slots;
  });

  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  // Upload & Submission State
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const extraInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dirty state tracking for unsaved changes warning
  const isDirty = useMemo(() => {
    return (
      formData.name !== (initialProduct?.name || "") ||
      formData.brand !== (initialProduct?.brand || "") ||
      formData.description !== (initialProduct?.description || "") ||
      formData.price !== (initialProduct?.price ? String(initialProduct.price) : "") ||
      formData.category !== (initialProduct?.category || "") ||
      formData.condition !== (initialProduct?.condition || "new") ||
      formData.is_available !== (initialProduct ? initialProduct.is_available : true) ||
      formData.stock !== (initialProduct?.stock ?? 1) ||
      variant !== ((initialProduct?.specs?.variant as string) || "")
    );
  }, [formData, initialProduct, variant]);

  useEffect(() => {
    const isPhotosModified =
      deletedImageIds.length > 0 ||
      Boolean(coverPhoto?.image instanceof File) ||
      extraPhotos.some((p) => p?.image instanceof File);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((isDirty || isPhotosModified) && !uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, deletedImageIds, coverPhoto, extraPhotos, uploading]);

  // Field updater
  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  // Image handlers
  const handleCoverUpload = (file: File) => {
    setImageError(null);
    const err = validateImageFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    if (coverPhoto?.id) {
      setDeletedImageIds((prev) => [...prev, coverPhoto.id!]);
    }
    setCoverPhoto({
      image: file,
      preview: URL.createObjectURL(file),
      display_order: 0,
      is_primary: true,
    });
  };

  const handleExtraUpload = (index: number, file: File) => {
    setImageError(null);
    const err = validateImageFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    const current = extraPhotos[index];
    if (current?.id) {
      setDeletedImageIds((prev) => [...prev, current.id!]);
    }
    const newImage: ShopProductImage = {
      image: file,
      preview: URL.createObjectURL(file),
      display_order: index + 1,
      is_primary: false,
    };
    setExtraPhotos((prev) => {
      const next = [...prev];
      next[index] = newImage;
      return next;
    });
  };

  const handleMakeCover = (index: number) => {
    const candidate = extraPhotos[index];
    if (!candidate) return;

    const oldCover = coverPhoto;
    setCoverPhoto({
      ...candidate,
      is_primary: true,
      display_order: 0,
    });

    setExtraPhotos((prev) => {
      const next = [...prev];
      next[index] = oldCover
        ? {
            ...oldCover,
            is_primary: false,
            display_order: index + 1,
          }
        : null;
      return next;
    });
  };

  const handleDeleteCover = () => {
    if (coverPhoto?.id) {
      setDeletedImageIds((prev) => [...prev, coverPhoto.id!]);
    }
    const firstExtraIdx = extraPhotos.findIndex((p) => p !== null);
    if (firstExtraIdx !== -1) {
      const promoted = extraPhotos[firstExtraIdx]!;
      setCoverPhoto({
        ...promoted,
        is_primary: true,
        display_order: 0,
      });
      setExtraPhotos((prev) => {
        const next = [...prev];
        next[firstExtraIdx] = null;
        return next;
      });
    } else {
      setCoverPhoto(null);
    }
  };

  const handleDeleteExtra = (index: number) => {
    const photo = extraPhotos[index];
    if (photo?.id) {
      setDeletedImageIds((prev) => [...prev, photo.id!]);
    }
    setExtraPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleMoveExtra = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= extraPhotos.length) return;
    setExtraPhotos((prev) => {
      const next = [...prev];
      const temp = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = temp;
      return next;
    });
  };

  const getImageSrc = (photo: ShopProductImage | null) => {
    if (!photo) return "";
    if (photo.image instanceof File) {
      if (typeof photo.preview === "string" && photo.preview.startsWith("blob:")) {
        return photo.preview;
      }
      return URL.createObjectURL(photo.image);
    }
    const src = photo.preview || photo.image || photo.url;
    if (typeof src === "string") {
      return normalizeImageUrl(src) || src;
    }
    return "";
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters";
    }
    if (!formData.brand.trim()) {
      errors.brand = "Brand is required";
    }
    if (!formData.category) {
      errors.category = "Please select a category";
    }
    if (!formData.price.trim()) {
      errors.price = "Price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.trim())) {
      errors.price = "Please enter a valid decimal number in ETB (e.g. 1500 or 1500.50)";
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }
    if (!formData.condition) {
      errors.condition = "Please select a condition";
    }
    if (formData.stock < 0) {
      errors.stock = "Stock count cannot be negative";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress("Saving listing...");
    setServerError(null);

    try {
      const payload: NewProduct = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        description: formData.description.trim(),
        price: String(formData.price).trim(), // Never sent as float
        currency: "ETB",
        category: formData.category,
        condition: formData.condition,
        is_available: formData.is_available,
        stock: Number(formData.stock) || 0,
        specs: {
          ...(initialProduct?.specs || {}),
          ...(variant.trim() ? { variant: variant.trim() } : {}),
        },
        status: formData.status || "live",
        slug: formData.slug,
      };

      let savedProduct: ShopProduct;
      if (action === "new") {
        savedProduct = await createListing(payload, shopSlug);
      } else {
        savedProduct = await updateListing(payload, shopSlug);
      }

      const productSlug = savedProduct.slug;

      // Handle image deletions
      if (deletedImageIds.length > 0) {
        setUploadProgress("Removing deleted photos...");
        await Promise.allSettled(
          deletedImageIds.map((id) =>
            deleteListingImage(productSlug, shopSlug, id)
          )
        );
      }

      // Handle cover photo
      if (coverPhoto) {
        if (coverPhoto.image instanceof File) {
          setUploadProgress("Uploading cover photo...");
          await uploadListingImage(
            productSlug,
            shopSlug,
            { ...coverPhoto, is_primary: true, display_order: 0 }
          );
        } else if (coverPhoto.id) {
          await updateListingImage(
            productSlug,
            shopSlug,
            { ...coverPhoto, is_primary: true, display_order: 0 }
          ).catch((e) => console.warn("Failed to update cover display order:", e));
        }
      }

      // Handle extra photos
      const activeExtra = extraPhotos
        .map((photo, idx) => ({ photo, order: idx + 1 }))
        .filter((item): item is { photo: ShopProductImage; order: number } => item.photo !== null);

      let count = 0;
      for (const { photo, order } of activeExtra) {
        count++;
        if (photo.image instanceof File) {
          setUploadProgress(`Uploading photo ${count} of ${activeExtra.length}...`);
          await uploadListingImage(
            productSlug,
            shopSlug,
            { ...photo, is_primary: false, display_order: order }
          );
        } else if (photo.id) {
          await updateListingImage(
            productSlug,
            shopSlug,
            { ...photo, is_primary: false, display_order: order }
          ).catch((e) => console.warn("Failed to update extra image order:", e));
        }
      }

      setUploadProgress("Listing saved successfully!");
      router.push("/shop/dashboard/listings");
      router.refresh();
    } catch (err: unknown) {
      console.error("Listing save error:", err);
      if (err instanceof ApiError && err.status === 400 && err.data) {
        const fieldKeys = ["name", "brand", "category", "price", "description", "stock", "condition"];
        const errorsMap: Record<string, string> = {};
        let mappedAny = false;
        Object.entries(err.data).forEach(([key, val]) => {
          if (fieldKeys.includes(key)) {
            const message = Array.isArray(val) ? val.join(" ") : String(val);
            errorsMap[key] = message;
            mappedAny = true;
          }
        });
        setFieldErrors(errorsMap);
        if (!mappedAny) {
          const detail = err.data.detail || err.data.non_field_errors || "Please check the form for errors.";
          setServerError(Array.isArray(detail) ? detail.join(" ") : String(detail));
        }
      } else {
        const msg = err instanceof Error ? err.message : "Failed to save listing. Please try again.";
        setServerError(msg);
      }
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Price & Market Hint Calculation
  const priceNum = parseFloat(formData.price || "0");
  const [lo, hi] = MARKET_RANGES[formData.category] || [138000, 148000];

  let marketCopy = "Set a price to compare";
  let marketColor = "text-tn-mute";
  let marketBg = "bg-tn-paper";

  if (!isNaN(priceNum) && priceNum > 0) {
    if (priceNum < lo) {
      marketCopy = "Below market — strong deal";
      marketColor = "text-tn-green";
      marketBg = "bg-tn-green-soft";
    } else if (priceNum <= hi) {
      marketCopy = "Competitive with nearby shops";
      marketColor = "text-tn-green";
      marketBg = "bg-tn-green-soft";
    } else {
      marketCopy = "Above market — may sell slower";
      marketColor = "text-[#8a5512]";
      marketBg = "bg-amber-50";
    }
  }

  const photoCount = (coverPhoto ? 1 : 0) + extraPhotos.filter(Boolean).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Form Column (max 660px per design) */}
      <div className="flex-1 min-w-0 max-w-[660px] w-full">
        {serverError && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[14px] bg-tn-red-soft p-4 text-xs font-semibold text-tn-red border border-tn-red/20">
            <AlertCircle size={17} className="shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[14px] bg-tn-green-soft p-4 text-xs font-bold text-tn-green border border-tn-green/20">
            <Loader2 size={16} className="animate-spin shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        <form id="product-form" onSubmit={handleSubmit} className="flex flex-col">
          {/* Section 1: Product */}
          <ProductCardSection title="Product">
            <div>
              <label className="text-[12.5px] font-bold text-tn-ink2 mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {loadingCats ? (
                  <span className="text-xs text-tn-mute">Loading categories...</span>
                ) : (
                  categories.map((c) => {
                    const isSelected = formData.category === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateField("category", c.slug)}
                        className={cn(
                          "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[11px] text-xs font-bold transition-colors cursor-pointer border",
                          isSelected
                            ? "border-tn-ink bg-tn-ink text-white"
                            : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
                        )}
                      >
                        <Icon
                          name={getCategoryIconName(c.slug)}
                          size={15}
                          className={isSelected ? "text-white" : "text-tn-mute"}
                        />
                        {c.name}
                      </button>
                    );
                  })
                )}
              </div>
              {fieldErrors.category && (
                <span className="text-xs text-tn-red mt-1.5 block">
                  {fieldErrors.category}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                  Product name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. iPhone 15 Pro"
                  className="w-full h-[46px] px-3.5 rounded-[11px] border border-tn-hair bg-white text-sm text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors"
                />
                {fieldErrors.name && (
                  <span className="text-xs text-tn-red mt-1 block">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                  Brand
                </label>
                <div className="relative">
                  <select
                    value={formData.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    className="w-full h-[46px] px-3.5 appearance-none rounded-[11px] border border-tn-hair bg-white text-sm font-semibold text-tn-ink focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors cursor-pointer"
                  >
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="chevd"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tn-mute"
                  />
                </div>
                {fieldErrors.brand && (
                  <span className="text-xs text-tn-red mt-1 block">
                    {fieldErrors.brand}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                Model / variant
              </label>
              <input
                type="text"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                placeholder="e.g. 256GB · Natural Ti"
                className="w-full h-[46px] px-3.5 rounded-[11px] border border-tn-hair bg-white text-sm text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors"
              />
            </div>

            <div className="mt-4">
              <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Condition details, what's included, warranty..."
                rows={3}
                className="w-full p-3.5 rounded-[11px] border border-tn-hair bg-white text-sm text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink resize-y leading-relaxed transition-colors"
              />
            </div>
          </ProductCardSection>

          {/* Section 2: Photos */}
          <ProductCardSection
            title="Photos"
            hint={`${photoCount}/${MAX_PHOTOS} · first is the cover`}
          >
            {imageError && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-tn-red-soft p-3 text-xs text-tn-red">
                <AlertCircle size={15} className="shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Cover Slot */}
            <div className="relative">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                  e.target.value = "";
                }}
              />

              {coverPhoto ? (
                <div className="relative h-[170px] w-full rounded-[14px] overflow-hidden border border-tn-hair group">
                  <Image
                    src={getImageSrc(coverPhoto)}
                    alt="Cover preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 z-10 text-[10.5px] font-extrabold tracking-[0.05em] text-white bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    COVER
                  </span>

                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="size-7 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer text-xs"
                      title="Change cover photo"
                    >
                      <ImageIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCover}
                      className="size-7 rounded-full bg-tn-red text-white hover:bg-tn-red/90 flex items-center justify-center transition-colors cursor-pointer text-xs"
                      title="Remove cover photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-[170px] rounded-[14px] border-[1.5px] border-dashed border-tn-hair bg-tn-paper hover:bg-tn-hair2/60 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <ImageIcon size={28} className="text-tn-mute" />
                  <div className="text-center">
                    <span className="text-[13.5px] font-bold text-tn-ink block">
                      Add cover photo
                    </span>
                    <span className="text-xs text-tn-mute block mt-0.5">
                      Click to upload (JPEG, PNG, WebP up to 5MB)
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Extra Slots */}
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {extraPhotos.map((photo, i) => (
                <div key={i} className="relative aspect-square">
                  <input
                    ref={(el) => {
                      extraInputRefs.current[i] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleExtraUpload(i, file);
                      e.target.value = "";
                    }}
                  />

                  {photo ? (
                    <div className="relative size-full rounded-[12px] overflow-hidden border border-tn-hair group">
                      <Image
                        src={getImageSrc(photo)}
                        alt={`Photo ${i + 2}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                        <div className="flex justify-between items-center w-full">
                          <button
                            type="button"
                            onClick={() => handleMakeCover(i)}
                            className="size-6 rounded-full bg-white/90 text-tn-ink hover:bg-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                            title="Promote to cover"
                          >
                            <Star size={11} className="fill-tn-ink" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExtra(i)}
                            className="size-6 rounded-full bg-tn-red text-white hover:bg-tn-red/90 flex items-center justify-center cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center w-full">
                          {i > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleMoveExtra(i, i - 1)}
                              className="size-5 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center cursor-pointer"
                              title="Move left"
                            >
                              <ArrowLeft size={10} />
                            </button>
                          ) : (
                            <span />
                          )}
                          {i < extraPhotos.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => handleMoveExtra(i, i + 1)}
                              className="size-5 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center cursor-pointer"
                              title="Move right"
                            >
                              <ArrowRight size={10} />
                            </button>
                          ) : (
                            <span />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => extraInputRefs.current[i]?.click()}
                      className="size-full rounded-[12px] border-[1.5px] border-dashed border-tn-hair bg-tn-paper hover:bg-tn-hair2/60 transition-colors flex items-center justify-center cursor-pointer"
                      title="Add photo"
                    >
                      <Plus size={20} className="text-tn-mute/60" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ProductCardSection>

          {/* Section 3: Price & Stock */}
          <ProductCardSection title="Price & stock">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                  Price (ETB)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-tn-mono text-xs font-bold text-tn-mute select-none">
                    ETB
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="w-full h-[46px] pl-12 pr-3.5 rounded-[11px] border border-tn-hair bg-white font-tn-mono text-sm font-semibold text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors"
                  />
                </div>
                {fieldErrors.price && (
                  <span className="text-xs text-tn-red mt-1 block">
                    {fieldErrors.price}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                  Stock count
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="1"
                  value={formData.stock}
                  onChange={(e) => updateField("stock", parseInt(e.target.value) || 0)}
                  className="w-full h-[46px] px-3.5 rounded-[11px] border border-tn-hair bg-white font-tn-mono text-sm font-semibold text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors"
                />
                {fieldErrors.stock && (
                  <span className="text-xs text-tn-red mt-1 block">
                    {fieldErrors.stock}
                  </span>
                )}
              </div>
            </div>

            {/* Market Comparison */}
            <div className={cn("flex items-center gap-3 p-3.5 rounded-[13px] mb-4 transition-colors", marketBg)}>
              <Icon name="pulse" size={18} className={cn("shrink-0", marketColor)} />
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-bold", marketColor)}>{marketCopy}</div>
                <div className="text-[11.5px] text-tn-ink2/80 font-tn-mono mt-0.5">
                  5 shops nearby: {formatETB(lo)} – {formatETB(hi)}
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="text-[12.5px] font-bold text-tn-ink2 mb-2 block">
                Condition
              </label>
              <div className="flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((c) => {
                  const active = formData.condition === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => updateField("condition", c.value)}
                      className={cn(
                        "h-9 px-3.5 rounded-full text-xs font-bold border transition-colors cursor-pointer",
                        active
                          ? "border-tn-ink bg-tn-ink text-white"
                          : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {fieldErrors.condition && (
                <span className="text-xs text-tn-red mt-1 block">
                  {fieldErrors.condition}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="pt-3 border-t border-tn-hair2 flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-bold text-tn-ink">Availability</div>
                <div className="text-xs text-tn-mute">
                  Control whether this listing is active and purchasable by buyers
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_available}
                onClick={() => updateField("is_available", !formData.is_available)}
                className={cn(
                  "relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors cursor-pointer border-none",
                  formData.is_available ? "bg-tn-green" : "bg-tn-hair"
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-150",
                    formData.is_available ? "left-[22px]" : "left-[3px]"
                  )}
                />
              </button>
            </div>
          </ProductCardSection>
        </form>
      </div>

      {/* Right Rail (320px sticky at top 98px per design) */}
      <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[98px] flex flex-col gap-4">
        <ProductPreview
          name={formData.name}
          category={formData.category}
          brand={formData.brand}
          variant={variant}
          price={formData.price}
          isAvailable={formData.is_available}
          coverPhoto={coverPhoto}
        />

        <DailyStockCheckIn />

        <BeforePublication
          name={formData.name}
          price={formData.price}
          condition={formData.condition}
          coverPhoto={coverPhoto}
          extraPhotos={extraPhotos}
          action={action}
          submitting={uploading}
        />
      </div>
    </div>
  );
}