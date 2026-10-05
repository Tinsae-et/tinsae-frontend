"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { SettingsCard } from "./settings-card";
import {
  deleteShopPhoto,
  getShopPhotos,
  uploadShopPhoto,
} from "@/lib/api/client";
import type { ShopPhoto } from "@/lib/types";

const MAX_PHOTOS = 8;

export default function PhotosPanel({ slug }: { slug: string }) {
  const [photos, setPhotos] = useState<ShopPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getShopPhotos(slug)
      .then(setPhotos)
      .catch(() => setError("Could not load shop photos."))
      .finally(() => setLoading(false));
  }, [slug]);

  const removePhoto = async (id: number) => {
    setError(null);
    try {
      await deleteShopPhoto(slug, id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Could not remove that photo.");
    }
  };

  const addPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || photos.length >= MAX_PHOTOS) return;
    setSaving(true);
    setError(null);
    try {
      const photo = await uploadShopPhoto(
        slug,
        file,
        photos.length,
        photos.length === 0,
      );
      setPhotos((prev) => [...prev, photo]);
    } catch {
      setError("Could not upload that photo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      title="Shop photos"
      sub="Up to 8 photos of your storefront and inside. The first is your cover."
      footer={
        <Pill
          kind="solid"
          size="sm"
          icon="check"
          disabled={saving}
          onClick={() => inputRef.current?.click()}
        >
          {saving ? "Uploading…" : "Add photo"}
        </Pill>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={addPhoto}
      />
      {loading && <p className="text-[13.5px] text-tn-mute">Loading photos…</p>}
      {error && <p className="mb-3 text-[13.5px] text-tn-red">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-4/3 rounded-[13px] overflow-hidden border border-tn-hair bg-tn-paper"
          >
            <Image
              src={item.url}
              alt={`Shop photo ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />

            {index === 0 && (
              <span className="absolute top-2 left-2 h-[22px] px-[9px] rounded-[7px] bg-white/95 text-[10.5px] font-extrabold text-tn-ink inline-flex items-center">
                Cover
              </span>
            )}

            <button
              type="button"
              onClick={() => removePhoto(item.id)}
              className="absolute top-2 right-2 size-[26px] rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
              aria-label={`Remove photo ${index + 1}`}
            >
              <Icon name="trash" size={13} />
            </button>
          </div>
        ))}

        {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-4/3 rounded-[13px] border-[1.5px] border-dashed border-tn-hair bg-tn-paper flex flex-col items-center justify-center gap-[7px] cursor-pointer text-tn-mute hover:border-tn-ink/30 hover:text-tn-ink transition-colors"
          >
            <Icon name="plus" size={20} />
            <span className="text-xs font-bold">Add photo</span>
          </button>
        ))}
      </div>
    </SettingsCard>
  );
}
