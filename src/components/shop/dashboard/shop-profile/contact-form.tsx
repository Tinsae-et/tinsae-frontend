"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { updateShopProfile } from "@/lib/api/client";
import type { Shop } from "@/lib/types";
import { Feedback, FeedbackBanner, Field, SettingsCard, inputClass } from "./settings-card";

type Props = {
  shop: Shop;
  slug: string;
  onShopUpdated?: (shop: Shop) => void;
};

export default function ContactForm({ shop, slug, onShopUpdated }: Props) {
  const [phone, setPhone] = useState<string>(shop.phone ?? "");
  // PLACEHOLDER: the shop API has no public-email field yet; this is not saved.
  const [publicEmail, setPublicEmail] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setFeedback({
        type: "error",
        message: "Phone number is required so buyers can contact your shop.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopProfile(slug, { phone: cleanPhone });
      onShopUpdated?.(updated);
      setFeedback({ type: "success", message: "Contact details saved." });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Could not update phone number. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      title="Contact"
      sub="Buyers reach you through these — keep them current."
      onSubmit={handleSubmit}
      footer={
        <Pill kind="solid" size="sm" icon={saving ? undefined : "check"} type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Pill>
      }
    >
      <FeedbackBanner feedback={feedback} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone" hint={<>Shown only after a buyer taps &ldquo;reveal&rdquo;.</>}>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="+251 9X XXX XXXX"
            className={`${inputClass} font-tn-mono`}
          />
        </Field>

        <Field label="Public email (optional)">
          <input
            type="email"
            name="publicEmail"
            value={publicEmail}
            onChange={(e) => setPublicEmail(e.target.value)}
            placeholder="sales@yourshop.et"
            className={inputClass}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
