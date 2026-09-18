"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { Pill } from "@/components/tinsae/pill";
import { updateShopProfile } from "@/lib/api";
import type { Shop } from "@/lib/types";

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "SH";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type Props = {
  shop: Shop | null;
  slug: string;
  access: string;
  onShopUpdated?: (shop: Shop) => void;
};

export default function ProfileForm({ shop, slug, access, onShopUpdated }: Props) {
  const [name, setName] = useState<string>(shop?.name ?? "");
  const [city, setCity] = useState<string>(shop?.city ?? "");
  const [description, setDescription] = useState<string>(shop?.description ?? "");
  const [logo, setLogo] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const logoRef = useRef<string | null>(null);

  useEffect(() => {
    logoRef.current = logo;
  });

  useEffect(() => {
    return () => {
      if (logoRef.current) URL.revokeObjectURL(logoRef.current);
    };
  }, []);


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleReset = () => {
    if (shop) {
      setName(shop.name ?? "");
      setCity(shop.city ?? "");
      setDescription(shop.description ?? "");
    }
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFeedback({ type: "error", message: "Shop name cannot be blank. Enter your shop's trade name." });
      return;
    }

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setFeedback({ type: "error", message: "City / area is required so buyers can find your store." });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopProfile(
        slug,
        {
          name: trimmedName,
          city: trimmedCity,
          description: description.trim(),
        },
        access,
      );

      if (onShopUpdated) {
        onShopUpdated(updated);
      }
      setFeedback({ type: "success", message: "Shop profile saved successfully." });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Couldn't save your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isVerified = Boolean(shop?.is_verified);
  const telegramChatId = shop?.telegram_chat_id;

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-tn-hair rounded-[18px] bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[15.5px] font-extrabold text-tn-ink">Shop profile</h2>
          <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
            How your shop appears across Tinsae search and listings.
          </p>
        </div>
        <Link
          href={`/shops/${slug}`}
          className="text-xs font-bold text-tn-red hover:underline shrink-0 inline-flex items-center gap-1"
        >
          <span>View live store</span>
          <Icon name="arrow" size={12} />
        </Link>
      </div>


      {/* Body */}
      <div className="px-[22px] py-5 flex flex-col gap-5">
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

        {/* Identity row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {logo ? (
              <div className="size-[72px] rounded-2xl overflow-hidden border border-tn-hair bg-tn-paper flex items-center justify-center shrink-0">
                <Image
                  src={logo}
                  alt="Shop logo"
                  width={72}
                  height={72}
                  unoptimized={logo.startsWith("blob:")}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-[72px] bg-tn-ink rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shrink-0">
                {getInitials(name || shop?.name || "Shop")}
              </div>
            )}

            <div>
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <span className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-[13.5px] h-10 px-[18px] border-[1.5px] border-tn-hair bg-white text-tn-ink hover:border-tn-ink transition-colors">
                  <Icon name="camera" size={16} />
                  Change logo
                </span>
              </label>
              <p className="text-[11.5px] text-tn-mute mt-1.5">
                Square image, at least 256×256.
              </p>
            </div>
          </div>

          {/* Verification status (Read-only w/ explanation) */}
          <div className="shrink-0 self-start sm:self-center">
            {isVerified ? (
              <div className="bg-tn-green-soft px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#157049]">
                <VerifiedBadge size={13} />
                <span>Verified shop</span>
              </div>
            ) : (
              <div className="bg-tn-paper border border-tn-hair px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-tn-mute">
                <Icon name="clock" size={13} />
                <span>Unverified shop</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Explanation Note */}
        <div className="rounded-xl border border-tn-hair bg-tn-paper/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Icon name="shield" size={16} className="text-tn-mute shrink-0 mt-0.5" />
            <p className="text-tn-ink2 leading-relaxed">
              {isVerified
                ? "Your shop is verified. Badge is displayed across search results and shop storefront to build buyer trust."
                : "Verification is read-only and confirmed by Tinsae staff after reviewing business documents."}
            </p>
          </div>
          {!isVerified && (
            <Link
              href="/shop/dashboard/get-verified"
              className="text-tn-red font-bold hover:underline shrink-0 whitespace-nowrap self-end sm:self-auto"
            >
              Get verified →
            </Link>
          )}
        </div>

        {/* Telegram Link Status (Surfaced) */}
        <div className="rounded-xl border border-tn-hair bg-tn-paper/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Icon name="tg" size={16} className="text-tn-telegram shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-tn-ink flex items-center gap-2">
                <span>Telegram bot status:</span>
                {telegramChatId ? (
                  <span className="text-[#157049] inline-flex items-center gap-1 font-bold">
                    <Icon name="check" size={11} strokeWidth={3} />
                    Linked
                  </span>
                ) : (
                  <span className="text-tn-mute font-bold">Not linked</span>
                )}
              </div>
              <p className="text-tn-mute mt-0.5 leading-relaxed">
                {telegramChatId
                  ? "Connected to @TinsaeStockBot. You receive stock check-ins and inquiries here."
                  : "Link your shop via @TinsaeStockBot to confirm daily stock in one tap without logging into the website."}
              </p>
            </div>
          </div>
          {!telegramChatId && (
            <a
              href="https://t.me/TinsaeStockBot"
              target="_blank"
              rel="noreferrer"
              className="text-tn-telegram font-bold hover:underline shrink-0 whitespace-nowrap self-end sm:self-auto"
            >
              Open Bot →
            </a>
          )}
        </div>

        {/* 2-column fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Shop name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="e.g. Almeda Electronics"
              className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
            />
            <p className="text-[11px] text-tn-mute mt-1">
              Public store name. Store URL slug (
              <span className="font-mono text-tn-ink">/{slug}</span>) stays stable and will not change.
            </p>
          </div>

          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              City / Area
            </label>
            <input
              type="text"
              name="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="e.g. Addis Ababa or Bole"
              className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
            />
            <p className="text-[11px] text-tn-mute mt-1">
              Helps buyers find your store in local search filters.
            </p>
          </div>
        </div>

        {/* About field */}
        <div>
          <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
            About your shop
          </label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Describe your shop, what you sell, warranty policies, store address..."
            rows={3}
            className="w-full rounded-xl border-[1.5px] border-tn-hair bg-white p-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink resize-y"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-[22px] py-3.5 border-t border-tn-hair bg-tn-paper flex justify-end items-center gap-3">
        <Pill
          kind="outline"
          size="md"
          type="button"
          onClick={handleReset}
          disabled={saving}
        >
          Cancel
        </Pill>
        <Pill
          kind="solid"
          size="md"
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