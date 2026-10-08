"use client";

import React, { useEffect, useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { updateShopProfile } from "@/lib/api/client";
import { fieldErrorsFrom, saveErrorMessage } from "@/lib/field-errors";
import type { Shop } from "@/lib/types";
import {
  Feedback,
  FeedbackBanner,
  Field,
  SettingsCard,
  inputClass,
} from "./settings-card";

type Props = {
  shop: Shop;
  slug: string;
  onShopUpdated?: (shop: Shop) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export default function ContactForm({
  shop,
  slug,
  onShopUpdated,
  onDirtyChange,
}: Props) {
  const [phone, setPhone] = useState<string>(shop.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dirty = phone !== (shop.phone ?? "");
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setFieldErrors({ phone: "Buyers need a number to reach your shop." });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopProfile(slug, { phone: cleanPhone });
      setPhone(updated.phone ?? cleanPhone);
      onShopUpdated?.(updated);
      setFieldErrors({});
      setFeedback({ type: "success", message: "Contact details saved." });
    } catch (err) {
      const fields = fieldErrorsFrom(err);
      setFieldErrors(fields);
      setFeedback({
        type: "error",
        message: saveErrorMessage(
          err,
          fields,
          "Couldn't save your phone number. Please try again.",
        ),
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
        <Pill
          kind="solid"
          size="sm"
          icon={saving ? undefined : "check"}
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </Pill>
      }
    >
      <FeedbackBanner feedback={feedback} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Phone"
          error={fieldErrors.phone}
          hint={<>Shown only after a buyer taps &ldquo;reveal&rdquo;.</>}
        >
          <input
            type="tel"
            name="phone"
            value={phone}
            aria-invalid={Boolean(fieldErrors.phone) || undefined}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldErrors((prev) => ({ ...prev, phone: "" }));
              if (feedback) setFeedback(null);
            }}
            placeholder="+251 9X XXX XXXX"
            className={`${inputClass} font-tn-mono`}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
