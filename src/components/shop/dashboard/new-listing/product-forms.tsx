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
import { Icon, isIconName } from "@/components/tinsae/icon";
import {
  Category,
  NewProduct,
  ShopProduct,
  ShopProductImage,
} from "@/lib/types";
import {
  createListing,
  updateListing,
  updateListingImage,
  uploadListingImage,
  deleteListingImage,
} from "@/lib/api/client";
import { ApiError, getCategories } from "@/lib/api/public";
import {
  BeforePublication,
  DailyStockCheckIn,
  ProductPreview,
} from "./buyer-preview";
import { SpecFields } from "./spec-fields";
import { FormCombobox } from "@/components/tinsae/form-select";
import { useListingSpecs } from "./use-listing-specs";
import { normalizeImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

// Suggested brands before a category (and its schema) is picked.
const BRANDS = [
  "Apple",
  "Samsung",
  "Tecno",
  "Infinix",
  "Xiaomi",
  "Sony",
  "Dell",
  "HP",
  "Lenovo",
  "JBL",
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
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

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
        {hint && (
          <span className="text-xs text-tn-mute font-medium">{hint}</span>
        )}
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
  allowedCategorySlugs,
}: {
  shopSlug: string;
  action: string;
  initialProduct?: ShopProduct | null;
  initialImages?: ShopProductImage[];
  allowedCategorySlugs?: string[];
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

  const specs = useListingSpecs({
    category: formData.category,
    condition: formData.condition,
    initialProduct,
  });
  const { schema, context: specContext, errors: specErrors } = specs;
  // Property: no "New / Used", the brand is the developer, rent is per month.
  const hasCondition = schema?.hasCondition !== false;
  const brandLabel = schema?.brandLabel ?? "Brand";
  const isRent = specContext.listing_type === "rent";

  const updateSpec = (key: string, value: string | string[]) => {
    specs.setValue(key, value);
    const errorKey = `spec.${key}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  // Suggestions only; any brand can be typed.
  const brandOptions = schema?.brands ?? BRANDS;

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((res) => {
        if (mounted) {
          // A parent ("Vehicles & Auto") only groups its subcategories and
          // takes no listings itself; the backend rejects one too.
          const available = (res.results || []).filter(
            (category) => !category.children?.length,
          );
          setCategories(
            allowedCategorySlugs
              ? available.filter((category) =>
                  allowedCategorySlugs.includes(category.slug),
                )
              : available,
          );
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
  }, [allowedCategorySlugs]);

  // Photos State
  const [coverPhoto, setCoverPhoto] = useState<ShopProductImage | null>(() => {
    if (initialImages && initialImages.length > 0) {
      const img = initialImages.find((i) => i.is_primary) || initialImages[0];
      const rawSrc = img.url || img.image || img.preview || "";
      const normalized =
        typeof rawSrc === "string" ? normalizeImageUrl(rawSrc) || rawSrc : "";
      return {
        ...img,
        image: img.image || rawSrc,
        preview: img.preview
          ? normalizeImageUrl(img.preview) || img.preview
          : normalized,
        url:
          typeof img.url === "string"
            ? normalizeImageUrl(img.url) || img.url
            : normalized,
      };
    }
    return null;
  });

  const [extraPhotos, setExtraPhotos] = useState<(ShopProductImage | null)[]>(
    () => {
      const slots: (ShopProductImage | null)[] = [null, null, null, null];
      if (initialImages && initialImages.length > 0) {
        const primary =
          initialImages.find((img) => img.is_primary) || initialImages[0];
        const others = initialImages.filter((img) => img !== primary);
        others.slice(0, 4).forEach((img, idx) => {
          const rawSrc = img.url || img.image || img.preview || "";
          const normalized =
            typeof rawSrc === "string"
              ? normalizeImageUrl(rawSrc) || rawSrc
              : "";
          slots[idx] = {
            ...img,
            image: img.image || rawSrc,
            preview: img.preview
              ? normalizeImageUrl(img.preview) || img.preview
              : normalized,
            url:
              typeof img.url === "string"
                ? normalizeImageUrl(img.url) || img.url
                : normalized,
          };
        });
      }
      return slots;
    },
  );

  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  // Upload & Submission State
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  // What a failed save already stored, so a retry picks up where it stopped.
  // Creating the product and uploading its photos are separate requests: if
  // photo 2 of 4 failed, the product and photo 1 exist, and resubmitting used
  // to create a duplicate listing (and upload photo 1 twice).
  const createdSlugRef = useRef<string | null>(null);
  const uploadedIdsRef = useRef(new Map<File, number>());
  const extraInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dirty state tracking for unsaved changes warning
  const isDirty = useMemo(() => {
    return (
      formData.name !== (initialProduct?.name || "") ||
      formData.brand !== (initialProduct?.brand || "") ||
      formData.description !== (initialProduct?.description || "") ||
      formData.price !==
        (initialProduct?.price ? String(initialProduct.price) : "") ||
      formData.category !== (initialProduct?.category || "") ||
      formData.condition !== (initialProduct?.condition || "new") ||
      formData.is_available !==
        (initialProduct ? initialProduct.is_available : true) ||
      formData.stock !== (initialProduct?.stock ?? 1) ||
      variant !== ((initialProduct?.specs?.variant as string) || "") ||
      specs.isDirty
    );
  }, [formData, initialProduct, variant, specs.isDirty]);

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
  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
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
      if (
        typeof photo.preview === "string" &&
        photo.preview.startsWith("blob:")
      ) {
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
    // Unbranded goods (a locally made sofa, a rug) may leave it blank; the
    // category's schema says which. Drafts can skip it, like the backend allows.
    const brandRequired = schema?.brandRequired !== false;
    const isDraft = formData.status === "draft";
    if (brandRequired && !isDraft && !formData.brand.trim()) {
      errors.brand = `${brandLabel} is required`;
    }
    if (!formData.category) {
      errors.category = "Please select a category";
    }
    if (!formData.price.trim()) {
      errors.price = "Price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.trim())) {
      errors.price =
        "Please enter a valid decimal number in ETB (e.g. 1500 or 1500.50)";
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }
    if (!formData.condition) {
      errors.condition = "Please select a condition";
    }
    if (formData.stock < 0) {
      errors.stock = "Stock count cannot be negative";
    }
    for (const [key, message] of Object.entries(specErrors)) {
      errors[`spec.${key}`] = message;
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
        specs: specs.toPayload(variant),
        status: formData.status || "live",
        slug: formData.slug,
      };

      let savedProduct: ShopProduct;
      if (action === "new" && !createdSlugRef.current) {
        savedProduct = await createListing(payload, shopSlug);
        createdSlugRef.current = savedProduct.slug;
      } else {
        savedProduct = await updateListing(
          { ...payload, slug: createdSlugRef.current ?? payload.slug },
          shopSlug,
        );
      }

      const productSlug = savedProduct.slug;

      /**
       * Uploads a new photo once, or re-orders one already stored. A File
       * uploaded by an earlier, partly failed attempt counts as stored.
       */
      const savePhoto = async (
        photo: ShopProductImage,
        is_primary: boolean,
        display_order: number,
      ) => {
        const file = photo.image instanceof File ? photo.image : null;
        const storedId = file ? uploadedIdsRef.current.get(file) : photo.id;
        if (file && storedId === undefined) {
          const saved = await uploadListingImage(productSlug, shopSlug, {
            ...photo,
            is_primary,
            display_order,
          });
          uploadedIdsRef.current.set(file, saved.id);
        } else if (storedId !== undefined) {
          // A string `image` keeps imageForm from re-sending the file.
          await updateListingImage(productSlug, shopSlug, {
            ...photo,
            id: storedId,
            image: "",
            is_primary,
            display_order,
          }).catch((e) => console.warn("Failed to update image order:", e));
        }
      };

      // Handle image deletions
      if (deletedImageIds.length > 0) {
        setUploadProgress("Removing deleted photos...");
        await Promise.allSettled(
          deletedImageIds.map((id) =>
            deleteListingImage(productSlug, shopSlug, id),
          ),
        );
      }

      // Handle cover photo
      if (coverPhoto) {
        setUploadProgress("Uploading cover photo...");
        await savePhoto(coverPhoto, true, 0);
      }

      // Handle extra photos
      const activeExtra = extraPhotos
        .map((photo, idx) => ({ photo, order: idx + 1 }))
        .filter(
          (item): item is { photo: ShopProductImage; order: number } =>
            item.photo !== null,
        );

      let count = 0;
      for (const { photo, order } of activeExtra) {
        count++;
        setUploadProgress(
          `Uploading photo ${count} of ${activeExtra.length}...`,
        );
        await savePhoto(photo, false, order);
      }

      setUploadProgress("Listing saved successfully!");
      router.push("/shop/dashboard/listings");
      router.refresh();
    } catch (err: unknown) {
      console.error("Listing save error:", err);
      if (err instanceof ApiError && err.status === 400 && err.data) {
        const fieldKeys = [
          "name",
          "brand",
          "category",
          "price",
          "description",
          "stock",
          "condition",
        ];
        const errorsMap: Record<string, string> = {};
        let mappedAny = false;
        Object.entries(err.data).forEach(([key, val]) => {
          // Spec errors arrive nested: {"specs": {"storage": ["..."]}}.
          if (
            key === "specs" &&
            val &&
            typeof val === "object" &&
            !Array.isArray(val)
          ) {
            const shown = new Set(schema?.fields.map((f) => f.key) ?? []);
            const unshown: string[] = [];
            Object.entries(val as Record<string, unknown>).forEach(
              ([specKey, specVal]) => {
                const message = Array.isArray(specVal)
                  ? specVal.join(" ")
                  : String(specVal);
                if (shown.has(specKey)) {
                  errorsMap[`spec.${specKey}`] = message;
                  mappedAny = true;
                } else {
                  // No field to show it on (e.g. an old key): surface it rather
                  // than failing silently.
                  unshown.push(message);
                }
              },
            );
            if (unshown.length)
              setServerError(`Specifications: ${unshown.join(" ")}`);
            return;
          }
          if (fieldKeys.includes(key)) {
            const message = Array.isArray(val) ? val.join(" ") : String(val);
            errorsMap[key] = message;
            mappedAny = true;
          }
        });
        setFieldErrors(errorsMap);
        if (!mappedAny) {
          const detail =
            err.data.detail ||
            err.data.non_field_errors ||
            "Please check the form for errors.";
          setServerError(
            Array.isArray(detail) ? detail.join(" ") : String(detail),
          );
        }
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to save listing. Please try again.";
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
    // Full width by choice: the design caps the form at 660px, but here it
    // fills whatever the 320px rail leaves, inside the shell's padding.
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Form Column (fills the remaining width) */}
      <div className="flex-1 min-w-0 w-full">
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

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex flex-col"
        >
          {/* Section 1: Product */}
          <ProductCardSection title="Product">
            <div>
              <label className="text-[12.5px] font-bold text-tn-ink2 mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {loadingCats ? (
                  <span className="text-xs text-tn-mute">
                    Loading categories...
                  </span>
                ) : categories.length === 0 ? (
                  <span className="text-xs text-tn-mute">
                    Select categories in Shop settings before adding a product.
                  </span>
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
                            : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper",
                        )}
                      >
                        <Icon
                          name={isIconName(c.icon) ? c.icon : "tag"}
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
                  // The picked category's own example: "e.g. Corolla" for
                  // cars, not an iPhone.
                  placeholder={`e.g. ${schema?.listingExamples?.name ?? "the product's model name"}`}
                  className="w-full h-[46px] px-3.5 rounded-[11px] border border-tn-hair bg-white text-sm text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors"
                />
                {fieldErrors.name && (
                  <span className="text-xs text-tn-red mt-1 block">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="listing-brand"
                  className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block"
                >
                  {brandLabel}
                  {schema?.brandRequired === false && (
                    <span className="font-medium text-tn-mute">
                      {" "}
                      (optional)
                    </span>
                  )}
                </label>
                {/* Typed, with the category's common brands suggested: a list
                    with an "Other" entry saved the word "Other" as the brand. */}
                <FormCombobox
                  id="listing-brand"
                  value={formData.brand}
                  onChange={(v) => updateField("brand", v)}
                  suggestions={brandOptions}
                  maxLength={100}
                  placeholder={
                    brandOptions.length
                      ? `e.g. ${brandOptions[0]}`
                      : schema?.brandRequired === false
                        ? "Leave blank if unbranded"
                        : brandLabel
                  }
                  className="font-semibold placeholder:font-normal"
                />
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
                placeholder={`e.g. ${schema?.listingExamples?.variant ?? "size, colour or edition"}`}
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
                placeholder={
                  hasCondition
                    ? "Condition details, what's included, warranty..."
                    : "Layout, view, access road, what's nearby, viewing times..."
                }
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

          {/* Section 3: Specifications (driven by the category's schema) */}
          <ProductCardSection
            title="Specifications"
            hint={categories.find((c) => c.slug === formData.category)?.name}
          >
            {!formData.category ? (
              <p className="text-[13px] text-tn-mute">
                Pick a category to see the specs buyers compare on.
              </p>
            ) : specs.loadFailed ? (
              <p className="text-[13px] text-tn-red">
                Couldn&rsquo;t load the spec fields for this category. Check
                your connection and pick it again.
              </p>
            ) : specs.loading ? (
              <p className="text-[13px] text-tn-mute">Loading spec fields…</p>
            ) : !schema ? (
              <p className="text-[13px] text-tn-mute">
                This category has no spec fields yet.
              </p>
            ) : (
              <SpecFields
                schema={schema}
                values={specContext}
                errors={Object.fromEntries(
                  Object.entries(fieldErrors)
                    .filter(([k]) => k.startsWith("spec."))
                    .map(([k, v]) => [k.slice(5), v]),
                )}
                onChange={updateSpec}
              />
            )}
          </ProductCardSection>

          {/* Section 4: Price & Stock */}
          <ProductCardSection title="Price & stock">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="text-[12.5px] font-bold text-tn-ink2 mb-1.5 block">
                  {isRent ? "Rent per month (ETB)" : "Price (ETB)"}
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

              {/* One house is one listing: no stock to count for property. */}
              {hasCondition && (
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
                    onChange={(e) =>
                      updateField("stock", parseInt(e.target.value) || 0)
                    }
                    className="w-full h-[46px] px-3.5 rounded-[11px] border border-tn-hair bg-white font-tn-mono text-sm font-semibold text-tn-ink placeholder:text-tn-mute/50 focus:outline-none focus:ring-2 focus:ring-tn-hair focus:border-tn-ink transition-colors"
                  />
                  {fieldErrors.stock && (
                    <span className="text-xs text-tn-red mt-1 block">
                      {fieldErrors.stock}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Market Comparison */}
            <div
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-[13px] mb-4 transition-colors",
                marketBg,
              )}
            >
              <Icon
                name="pulse"
                size={18}
                className={cn("shrink-0", marketColor)}
              />
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-bold", marketColor)}>
                  {marketCopy}
                </div>
                <div className="text-[11.5px] text-tn-ink2/80 font-tn-mono mt-0.5">
                  5 shops nearby: {formatETB(lo)} – {formatETB(hi)}
                </div>
              </div>
            </div>

            {/* Condition: goods only; property says sale or rent instead */}
            {hasCondition && (
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
                            : "border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper",
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
            )}

            {/* Availability */}
            <div className="pt-3 border-t border-tn-hair2 flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-bold text-tn-ink">
                  Availability
                </div>
                <div className="text-xs text-tn-mute">
                  Control whether this product is active and purchasable by
                  buyers
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_available}
                onClick={() =>
                  updateField("is_available", !formData.is_available)
                }
                className={cn(
                  "relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors cursor-pointer border-none",
                  formData.is_available ? "bg-tn-green" : "bg-tn-hair",
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-150",
                    formData.is_available ? "left-[22px]" : "left-[3px]",
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
          priceUnit={isRent ? "/ month" : ""}
          availableLabel={hasCondition ? "In stock" : "Available"}
          isAvailable={formData.is_available}
          coverPhoto={coverPhoto}
        />

        <DailyStockCheckIn />

        <BeforePublication
          name={formData.name}
          price={formData.price}
          condition={formData.condition}
          showCondition={hasCondition}
          specsComplete={
            !specs.loading &&
            !specs.loadFailed &&
            Object.keys(specErrors).length === 0
          }
          coverPhoto={coverPhoto}
          extraPhotos={extraPhotos}
          action={action}
          submitting={uploading}
        />
      </div>
    </div>
  );
}
