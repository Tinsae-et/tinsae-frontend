"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { Pill } from "@/components/tinsae/pill";
import { getTelegramState, updateShopProfile } from "@/lib/api/client";
import type { Shop, TelegramState } from "@/lib/types";
import {
  Feedback,
  FeedbackBanner,
  Field,
  SettingsCard,
  getInitials,
  inputClass,
  textareaClass,
} from "./settings-card";

type Props = {
  shop: Shop;
  slug: string;
  /** The owner's linked Telegram account; the shop API has no handle field. */
  telegramUsername?: string;
  onShopUpdated?: (shop: Shop) => void;
};

export default function ProfileForm({ shop, slug, telegramUsername, onShopUpdated }: Props) {
  const [name, setName] = useState<string>(shop.name ?? "");
  const [description, setDescription] = useState<string>(shop.description ?? "");
  // PLACEHOLDER: the logo is preview-only; the shop API has no logo field yet.
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [telegramState, setTelegramState] = useState<TelegramState | null>(null);

  useEffect(() => {
    getTelegramState(slug)
      .then(setTelegramState)
      .catch(() => {});
  }, [slug]);

  const logoRef = useRef<string | null>(null);
  useEffect(() => {
    logoRef.current = logo;
  });
  useEffect(() => {
    return () => {
      if (logoRef.current) URL.revokeObjectURL(logoRef.current);
    };
  }, []);

  const replaceLogo = (next: string | null) => {
    setLogo((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return next;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) replaceLogo(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setName(shop.name ?? "");
    setDescription(shop.description ?? "");
    replaceLogo(null);
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
      const updated = await updateShopProfile(slug, {
        name: trimmedName,
        description: description.trim(),
      });
      onShopUpdated?.(updated);
      setFeedback({ type: "success", message: "Shop profile saved." });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Couldn't save your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearFeedback = () => {
    if (feedback) setFeedback(null);
  };

  return (
    <SettingsCard
      title="Shop profile"
      sub="How your shop appears across Tinsae search and listings."
      onSubmit={handleSubmit}
      footer={
        <>
          <Pill kind="outline" size="sm" onClick={handleReset} disabled={saving}>
            Cancel
          </Pill>
          <Pill kind="solid" size="sm" icon={saving ? undefined : "check"} type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Pill>
        </>
      }
    >
      <FeedbackBanner feedback={feedback} />

      {/* Identity row */}
      <div className="flex items-center gap-[18px] flex-wrap mb-[22px]">
        {logo ? (
          <div className="size-[72px] rounded-2xl overflow-hidden border border-tn-hair bg-tn-paper shrink-0">
            <Image src={logo} alt="Shop logo" width={72} height={72} unoptimized className="size-full object-cover" />
          </div>
        ) : (
          <div className="size-[72px] bg-[#0F2A4D] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shrink-0">
            {getInitials(name || shop.name)}
          </div>
        )}

        <div>
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={handleLogoUpload}
            />
            <span className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-[13.5px] h-10 px-[18px] border-[1.5px] border-tn-hair bg-white text-tn-ink hover:border-tn-ink transition-colors">
              <Icon name="camera" size={16} />
              Change logo
            </span>
          </label>
          <p className="text-[11.5px] text-tn-mute mt-2">Square PNG, at least 256×256.</p>
        </div>

        <div className="ml-auto shrink-0">
          {shop.is_verified ? (
            <div className="bg-tn-green-soft px-3.5 py-[9px] rounded-xl flex items-center gap-2 text-[12.5px] font-bold text-[#157049]">
              <VerifiedBadge size={14} />
              <span>Verified shop</span>
            </div>
          ) : (
            <Link
              href="/shop/dashboard/get-verified"
              className="bg-tn-paper border border-tn-hair px-3.5 py-[9px] rounded-xl flex items-center gap-2 text-[12.5px] font-bold text-tn-ink2 hover:border-tn-ink transition-colors"
            >
              <Icon name="shield" size={14} />
              <span>Get verified</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Field label="Shop name">
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFeedback();
            }}
            placeholder="Enter shop name"
            className={inputClass}
          />
        </Field>

        <Field
          label="Telegram bot"
          hint={
            <Link href="/shop/dashboard/telegram" className="font-bold text-tn-ink underline">
              {telegramState?.status === "connected" ? "Manage bot" : "Set up bot"}
            </Link>
          }
        >
          <div className="flex h-12 w-full items-center justify-between rounded-xl border-[1.5px] border-tn-hair bg-tn-paper px-3.5">
            <span className="font-tn-mono text-sm font-semibold text-tn-ink">
              {telegramUsername
                ? `@${telegramUsername.replace(/^@/, "")}`
                : telegramState?.status === "connected"
                  ? "Connected"
                  : "Not linked yet"}
            </span>
            {telegramState?.status === "connected" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-tn-green/10 px-2.5 py-0.5 text-xs font-bold text-tn-green">
                <Icon name="check" size={12} strokeWidth={2.5} />
                Connected
              </span>
            ) : telegramState?.status === "blocked" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-tn-warn/15 px-2.5 py-0.5 text-xs font-bold text-tn-warn">
                Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-tn-hair px-2.5 py-0.5 text-xs font-bold text-tn-mute">
                Disconnected
              </span>
            )}
          </div>
        </Field>
      </div>

      <Field label="About">
        <textarea
          name="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearFeedback();
          }}
          placeholder="What you sell, where to find you, and what makes your shop worth the trip."
          rows={3}
          className={textareaClass}
        />
      </Field>
    </SettingsCard>
  );
}
