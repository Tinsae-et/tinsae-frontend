"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import { updateShopProfile } from "@/lib/api";
import type { Shop } from "@/lib/types";

type Props = {
  shop: Shop | null;
  slug: string;
  access: string;
  onShopUpdated?: (shop: Shop) => void;
};

export default function ContactForm({
  shop,
  slug,
  access,
  onShopUpdated,
}: Props) {
  const [phone, setPhone] = useState<string>(shop?.phone ?? "");
  const [publicEmail, setPublicEmail] = useState<string>(
    shop?.slug ? `sales@${shop.slug.replace(/[^a-zA-Z0-9]/g, "")}.et` : "sales@almeda.et"
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      const updated = await updateShopProfile(
        slug,
        { phone: cleanPhone },
        access
      );

      if (onShopUpdated) {
        onShopUpdated(updated);
      }
      setFeedback({
        type: "success",
        message: "Contact information saved successfully.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not update phone number. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs"
    >
      {/* Header */}
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
          Contact
        </h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          Buyers reach you through these — keep them current.
        </p>
      </div>

      {/* Body */}
      <div className="px-[22px] py-5 flex flex-col gap-4">
        {/* Feedback alert */}
        {feedback && (
          <div
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-tn-green-soft text-[#157049] border border-[#157049]/20"
                : "bg-tn-red-soft text-tn-red border border-tn-red/20"
            }`}
          >
            <Icon
              name={feedback.type === "success" ? "check" : "close"}
              size={14}
            />
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="+251 91 142 5006"
              className="font-tn-mono h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors"
            />
            <p className="text-[11.5px] text-tn-mute mt-1.5">
              Shown only after a buyer taps &ldquo;reveal&rdquo;.
            </p>
          </div>

          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Public email (optional)
            </label>
            <input
              type="email"
              name="publicEmail"
              value={publicEmail}
              onChange={(e) => {
                setPublicEmail(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="sales@almeda.et"
              className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center">
        <Pill
          kind="solid"
          size="sm"
          icon={saving ? undefined : "check"}
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </Pill>
      </div>
    </form>
  );
}