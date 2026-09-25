"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";

// PLACEHOLDER: shop photos are not stored by the API yet; these are colour
// swatches and nothing here is saved.
const INITIAL_PHOTOS = [
  { id: "1", tone: "#0F2A4D", isCover: true },
  { id: "2", tone: "#3a342c", isCover: false },
  { id: "3", tone: "#2a2a33", isCover: false },
  { id: "4", tone: "#23302a", isCover: false },
];

export default function PhotosPanel() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [saved, setSaved] = useState(false);

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const addPhoto = () => {
    if (photos.length >= 8) return;
    const newId = String(Date.now());
    const colors = ["#1a2a3a", "#2c1f1f", "#1f2c24", "#2c261f"];
    const randomTone = colors[photos.length % colors.length];
    setPhotos((prev) => [
      ...prev,
      { id: newId, tone: randomTone, isCover: prev.length === 0 },
    ]);
  };

  const emptySlotsCount = Math.max(0, 8 - photos.length);

  return (
    <div className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs">
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
          Shop photos
        </h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          Up to 8 photos of your storefront and inside. The first is your cover.
        </p>
      </div>

      <div className="px-[22px] py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-4/3 rounded-2xl overflow-hidden border border-tn-hair flex items-center justify-center group"
              style={{
                background: `linear-gradient(145deg, ${item.tone}, #0a0a0a)`,
              }}
            >
              <div className="opacity-40 text-white">
                <Icon name="building" size={28} />
              </div>

              {index === 0 && (
                <span className="absolute top-2 left-2 h-5 px-2 rounded-md bg-white/95 text-[10.5px] font-extrabold text-tn-ink inline-flex items-center shadow-xs">
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => removePhoto(item.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-black/80 transition-opacity cursor-pointer"
                aria-label="Remove photo"
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}

          {Array.from({ length: emptySlotsCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={addPhoto}
              className="aspect-4/3 rounded-2xl border-[1.5px] border-dashed border-tn-hair bg-tn-paper flex flex-col items-center justify-center gap-1.5 cursor-pointer text-tn-mute hover:border-tn-ink/30 hover:text-tn-ink transition-colors"
            >
              <Icon name="plus" size={18} />
              <span className="text-xs font-bold">Add photo</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center">
        <Pill
          kind="solid"
          size="sm"
          icon="check"
          type="button"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        >
          {saved ? "Saved" : "Save photos"}
        </Pill>
      </div>
    </div>
  );
}
