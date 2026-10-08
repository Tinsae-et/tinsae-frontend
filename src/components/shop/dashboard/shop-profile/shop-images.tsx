"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/tinsae/icon";
import { PHOTO_TYPES, photoFileError } from "@/lib/shop-photos";
import { getShopColor } from "@/lib/shops-data";
import { getInitials } from "./settings-card";

/** A pending change to one image, held until the form saves. */
export type ImageEdit =
  | { kind: "keep" }
  | { kind: "new"; file: File; preview: string }
  | { kind: "remove" };

/** One image's edit state, with its preview URL cleaned up on change and unmount. */
export function useImageEdit() {
  const [edit, setEditState] = useState<ImageEdit>({ kind: "keep" });
  const current = useRef(edit);

  const setEdit = (next: ImageEdit) => {
    if (current.current.kind === "new") URL.revokeObjectURL(current.current.preview);
    current.current = next;
    setEditState(next);
  };

  useEffect(
    () => () => {
      if (current.current.kind === "new") URL.revokeObjectURL(current.current.preview);
    },
    [],
  );

  return {
    edit,
    choose: (file: File) => setEdit({ kind: "new", file, preview: URL.createObjectURL(file) }),
    remove: () => setEdit({ kind: "remove" }),
    reset: () => setEdit({ kind: "keep" }),
  };
}

function shownUrl(edit: ImageEdit, savedUrl: string | null): string | null {
  if (edit.kind === "new") return edit.preview;
  if (edit.kind === "remove") return null;
  return savedUrl;
}

/**
 * The cover banner and logo, laid out like the top of the public shop page so
 * the owner sees what buyers will see — including how the banner is cropped.
 */
export function ShopImages({
  shopName,
  cover,
  coverUrl,
  logo,
  logoUrl,
  coverError,
  logoError,
  disabled,
  onError,
}: {
  shopName: string;
  cover: ReturnType<typeof useImageEdit>;
  coverUrl: string | null;
  logo: ReturnType<typeof useImageEdit>;
  logoUrl: string | null;
  coverError?: string;
  logoError?: string;
  disabled?: boolean;
  /** A picked file's problem, or null once a valid one is chosen. */
  onError: (field: "cover" | "logo", message: string | null) => void;
}) {
  const coverSrc = shownUrl(cover.edit, coverUrl);
  const logoSrc = shownUrl(logo.edit, logoUrl);
  const brandColor = getShopColor(shopName);

  const picker =
    (field: "cover" | "logo", target: ReturnType<typeof useImageEdit>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const error = photoFileError(file);
      onError(field, error);
      if (!error) target.choose(file);
    };

  return (
    <div className="mb-[22px]">
      {/* Cover banner: same gradient fallback as the public page. */}
      <div
        className="relative h-[120px] sm:h-[150px] rounded-[14px] overflow-hidden border border-tn-hair"
        style={{
          background: `linear-gradient(120deg, ${brandColor} 0%, #1A4178 65%, #2D5A9E 100%)`,
        }}
      >
        {coverSrc ? (
          <Image src={coverSrc} alt="Cover photo" fill unoptimized className="object-cover" />
        ) : (
          <span className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-[11.5px] font-bold text-white/75 sm:-translate-y-[70%]">
            No cover photo — buyers see this colour instead
          </span>
        )}
        {cover.edit.kind !== "keep" && (
          <span className="absolute left-3 top-3 h-[22px] px-[9px] rounded-[7px] bg-tn-ink/85 text-[10.5px] font-extrabold text-white inline-flex items-center">
            Not saved
          </span>
        )}
        <div className="absolute right-3 bottom-3 flex gap-1.5">
          <ImageButton disabled={disabled} accept onChange={picker("cover", cover)}>
            <Icon name="camera" size={14} />
            {coverSrc ? "Change cover" : "Add cover"}
          </ImageButton>
          {coverSrc && (
            <ImageButton disabled={disabled} onClick={cover.remove} label="Remove cover photo">
              <Icon name="trash" size={13} />
            </ImageButton>
          )}
        </div>
      </div>

      {/* Logo, overlapping the banner as on the shop page. */}
      <div className="flex items-end gap-3.5 px-3 -mt-9 sm:-mt-10">
        <div
          className="relative size-[76px] sm:size-[84px] shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-[0_8px_24px_rgba(11,11,11,0.14)] flex items-center justify-center text-2xl font-extrabold text-white"
          style={{ backgroundColor: brandColor }}
        >
          {logoSrc ? (
            <Image src={logoSrc} alt="Shop logo" fill unoptimized className="object-cover" />
          ) : (
            getInitials(shopName)
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <ImageButton disabled={disabled} accept outline onChange={picker("logo", logo)}>
            <Icon name="camera" size={14} />
            {logoSrc ? "Change logo" : "Add logo"}
          </ImageButton>
          {logoSrc && (
            <ImageButton disabled={disabled} outline onClick={logo.remove} label="Remove logo">
              <Icon name="trash" size={13} />
            </ImageButton>
          )}
          {logo.edit.kind !== "keep" && (
            <span className="text-[11.5px] font-bold text-tn-mute">Not saved</span>
          )}
        </div>
      </div>

      {(coverError || logoError) && (
        <div className="mt-2 space-y-1">
          {coverError && <p className="text-[11.5px] text-tn-red">Cover: {coverError}</p>}
          {logoError && <p className="text-[11.5px] text-tn-red">Logo: {logoError}</p>}
        </div>
      )}
      <p className="mt-2 text-[11.5px] text-tn-mute">
        Cover: a wide photo of your storefront, at least 1600×400 — the middle is what shows
        on phones. Logo: square, at least 256×256. JPEG, PNG or WebP, up to 5 MB.
      </p>
    </div>
  );
}

/** A small pill over the images: a file picker when `accept`, else a button. */
function ImageButton({
  children,
  accept,
  outline,
  disabled,
  label,
  onClick,
  onChange,
}: {
  children: React.ReactNode;
  accept?: boolean;
  outline?: boolean;
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const className = `inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-colors ${
    outline
      ? "border-[1.5px] border-tn-hair bg-white text-tn-ink hover:border-tn-ink"
      : "bg-white/95 text-tn-ink shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-white"
  } ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}`;

  if (accept) {
    return (
      <label className={className}>
        <input
          type="file"
          accept={PHOTO_TYPES.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={onChange}
        />
        {children}
      </label>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={label} className={className}>
      {children}
    </button>
  );
}
