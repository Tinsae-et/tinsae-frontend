"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function ProfileForm({
  shop,
  slug,
  access,
  onShopUpdated,
}: Props) {
  const [name, setName] = useState<string>(shop?.name ?? "");
  const [telegramHandle, setTelegramHandle] = useState<string>(
    shop?.name ? `@${shop.name.replace(/\s+/g, "")}` : "@MyElectronics"
  );
  const [description, setDescription] = useState<string>(
    shop?.description ?? ""
  );
  const [logo, setLogo] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      setTelegramHandle(
        shop.name ? `@${shop.name.replace(/\s+/g, "")}` : "@MyElectronics"
      );
      setDescription(shop.description ?? "");
    }
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFeedback({
        type: "error",
        message: "Shop name cannot be blank. Enter your shop's trade name.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopProfile(
        slug,
        {
          name: trimmedName,
          description: description.trim(),
        },
        access
      );

      if (onShopUpdated) {
        onShopUpdated(updated);
      }
      setFeedback({
        type: "success",
        message: "Shop profile saved successfully.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Couldn't save your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isVerified = Boolean(shop?.is_verified);

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs"
    >
      {/* Header */}
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
          Shop profile
        </h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          How your shop appears across Tinsae search and listings.
        </p>
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
        <div className="flex items-center gap-[18px] flex-wrap">
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
            <div className="size-[72px] bg-[#0F2A4D] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shrink-0">
              {getInitials(name || shop?.name || "Shop")}
            </div>
          )}

          <div>
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <span className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-[13.5px] h-10 px-[18px] border-[1.5px] border-tn-hair bg-white text-tn-ink hover:border-tn-ink transition-colors">
                <Icon name="camera" size={16} />
                Change logo
              </span>
            </label>
            <p className="text-[11.5px] text-tn-mute mt-2">
              Square PNG, at least 256×256.
            </p>
          </div>

          <div className="ml-auto shrink-0">
            {isVerified ? (
              <div className="bg-tn-green-soft px-3.5 py-2 rounded-xl flex items-center gap-2 text-[12.5px] font-bold text-[#157049]">
                <VerifiedBadge size={14} />
                <span>Verified shop</span>
              </div>
            ) : (
              <div className="bg-tn-paper border border-tn-hair px-3.5 py-2 rounded-xl flex items-center gap-2 text-[12.5px] font-bold text-tn-mute">
                <Icon name="clock" size={14} />
                <span>Unverified shop</span>
              </div>
            )}
          </div>
        </div>

        {/* 2-column fields: Shop name & Telegram handle */}
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
              className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors"
            />
          </div>

          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Telegram handle
            </label>
            <input
              type="text"
              name="telegramHandle"
              value={telegramHandle}
              onChange={(e) => {
                setTelegramHandle(e.target.value);
                if (feedback) setFeedback(null);
              }}
              placeholder="@ShopHandle"
              className="font-tn-mono h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors"
            />
          </div>
        </div>

        {/* About field */}
        <div>
          <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
            About
          </label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Verified electronics retailer in Bole, Atlas — phones, laptops and audio. Sealed and open-box stock, confirmed daily. Walk-ins welcome behind Atlas Hotel."
            rows={3}
            className="w-full rounded-xl border-[1.5px] border-tn-hair bg-white p-3.5 text-[14px] leading-relaxed text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink resize-y transition-colors"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center gap-2.5">
        <Pill
          kind="outline"
          size="sm"
          type="button"
          onClick={handleReset}
          disabled={saving}
        >
          Cancel
        </Pill>
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