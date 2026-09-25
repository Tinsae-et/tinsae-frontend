"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { SettingsCard } from "./settings-card";

// PLACEHOLDER: shop photos are not stored by the API yet; these are colour
// swatches and nothing here is saved.
const INITIAL_PHOTOS = [
  { id: "1", tone: "#0F2A4D" },
  { id: "2", tone: "#3a342c" },
  { id: "3", tone: "#2a2a33" },
  { id: "4", tone: "#23302a" },
];
const MAX_PHOTOS = 8;
const TONES = ["#1a2a3a", "#2c1f1f", "#1f2c24", "#2c261f"];

export default function PhotosPanel() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [saved, setSaved] = useState(false);

  const removePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  const addPhoto = () => {
    setPhotos((prev) =>
      prev.length >= MAX_PHOTOS
        ? prev
        : [...prev, { id: String(Date.now()), tone: TONES[prev.length % TONES.length] }],
    );
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
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        >
          {saved ? "Saved" : "Save photos"}
        </Pill>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-4/3 rounded-[13px] overflow-hidden border border-tn-hair flex items-center justify-center"
            style={{ background: `linear-gradient(145deg, ${item.tone}, #0a0a0a)` }}
          >
            <Icon name="building" size={30} className="text-white opacity-40" />

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
            onClick={addPhoto}
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
