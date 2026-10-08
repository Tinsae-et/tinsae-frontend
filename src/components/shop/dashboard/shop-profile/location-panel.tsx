"use client";

import React, { useEffect, useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import type { Shop } from "@/lib/types";
import { updateShopProfile } from "@/lib/api/client";
import { fieldErrorsFrom, saveErrorMessage } from "@/lib/field-errors";
import {
  Feedback,
  FeedbackBanner,
  Field,
  SettingsCard,
  inputClass,
} from "./settings-card";

export default function LocationPanel({
  shop,
  slug,
  onShopUpdated,
  onDirtyChange,
}: {
  shop: Shop;
  slug: string;
  onShopUpdated?: (shop: Shop) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [city, setCity] = useState(shop.city ?? "");
  const [address, setAddress] = useState(shop.address ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dirty = city !== (shop.city ?? "") || address !== (shop.address ?? "");
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanCity = city.trim();
    if (!cleanCity) {
      setFieldErrors({ city: "Enter the city your shop is in." });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopProfile(slug, {
        city: cleanCity,
        address: address.trim(),
      });
      setCity(updated.city ?? cleanCity);
      setAddress(updated.address ?? "");
      onShopUpdated?.(updated);
      setFieldErrors({});
      setFeedback({ type: "success", message: "Location saved." });
    } catch (err) {
      const fields = fieldErrorsFrom(err);
      setFieldErrors(fields);
      setFeedback({
        type: "error",
        message: saveErrorMessage(
          err,
          fields,
          "Couldn't save your location. Please try again.",
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const edit =
    (field: "city" | "address", set: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      set(e.target.value);
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
      if (feedback) setFeedback(null);
    };

  return (
    <SettingsCard
      title="Location"
      sub="Where buyers find your shop. Shown on your public shop page."
      onSubmit={handleSubmit}
      footer={
        <Pill
          kind="solid"
          size="sm"
          icon={saving ? undefined : "check"}
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save location"}
        </Pill>
      }
    >
      <FeedbackBanner feedback={feedback} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="City" error={fieldErrors.city}>
          <input
            type="text"
            name="city"
            value={city}
            aria-invalid={Boolean(fieldErrors.city) || undefined}
            onChange={edit("city", setCity)}
            placeholder="e.g. Addis Ababa"
            className={inputClass}
          />
        </Field>
        <Field
          label="Area / address"
          error={fieldErrors.address}
          hint="Neighbourhood, street or a landmark buyers will recognise."
        >
          <input
            type="text"
            name="address"
            value={address}
            aria-invalid={Boolean(fieldErrors.address) || undefined}
            onChange={edit("address", setAddress)}
            placeholder="e.g. Bole, behind Atlas Hotel"
            className={inputClass}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
