"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import {
  deleteShopPhoto,
  updateShopProfile,
  uploadShopPhoto,
} from "@/lib/api/client";
import { fieldErrorsFrom, saveErrorMessage } from "@/lib/field-errors";
import { normalizeImageUrl } from "@/lib/format";
import type { Shop, ShopPhoto, TelegramState } from "@/lib/types";
import type { VerificationStateResponse } from "@/lib/verification";
import { VerificationStatus } from "./verification-status";
import { ShopImages, useImageEdit } from "./shop-images";
import {
  Feedback,
  FeedbackBanner,
  Field,
  SettingsCard,
  inputClass,
  textareaClass,
} from "./settings-card";

type Props = {
  shop: Shop;
  slug: string;
  /** The shop's cover photo, shown as the banner on its public page. */
  initialCover: ShopPhoto | null;
  /** Null when the state couldn't be read; the form still works without it. */
  telegram: TelegramState | null;
  /** The owner's linked Telegram account; the shop API has no handle field. */
  telegramUsername?: string;
  verification: VerificationStateResponse | null;
  onShopUpdated?: (shop: Shop) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export default function ProfileForm({
  shop,
  slug,
  initialCover,
  telegram,
  telegramUsername,
  verification,
  onShopUpdated,
  onDirtyChange,
}: Props) {
  const [name, setName] = useState<string>(shop.name ?? "");
  const [description, setDescription] = useState<string>(
    shop.description ?? "",
  );
  const [savedCover, setSavedCover] = useState<ShopPhoto | null>(initialCover);
  const logo = useImageEdit();
  const cover = useImageEdit();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dirty =
    name !== (shop.name ?? "") ||
    description !== (shop.description ?? "") ||
    logo.edit.kind !== "keep" ||
    cover.edit.kind !== "keep";
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const handleReset = () => {
    setName(shop.name ?? "");
    setDescription(shop.description ?? "");
    logo.reset();
    cover.reset();
    setFeedback(null);
    setFieldErrors({});
  };

  /**
   * The banner is the shop's single cover photo. The new one is uploaded
   * before the old one goes, so a failed upload never leaves the shop bare.
   */
  const saveCover = async (): Promise<ShopPhoto | null> => {
    if (cover.edit.kind === "new") {
      const uploaded = await uploadShopPhoto(slug, cover.edit.file, 0, true);
      if (savedCover) await deleteShopPhoto(slug, savedCover.id);
      return uploaded;
    }
    if (cover.edit.kind === "remove" && savedCover) {
      await deleteShopPhoto(slug, savedCover.id);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldErrors({ name: "Enter your shop's trade name." });
      return;
    }

    setSaving(true);
    let profileSaved = false;
    try {
      let updated: Shop;
      if (logo.edit.kind === "new") {
        const profile = new FormData();
        profile.append("name", trimmedName);
        profile.append("description", description.trim());
        profile.append("logo", logo.edit.file);
        updated = await updateShopProfile(slug, profile);
      } else {
        updated = await updateShopProfile(slug, {
          name: trimmedName,
          description: description.trim(),
          ...(logo.edit.kind === "remove" ? { logo: null } : {}),
        });
      }
      profileSaved = true;
      logo.reset();
      setName(updated.name ?? trimmedName);
      setDescription(updated.description ?? "");
      onShopUpdated?.(updated);

      if (cover.edit.kind !== "keep") {
        setSavedCover(await saveCover());
        cover.reset();
      }
      setFieldErrors({});
      setFeedback({ type: "success", message: "Shop profile saved." });
    } catch (err) {
      const fields = fieldErrorsFrom(err);
      if (profileSaved) {
        // Only the cover failed; the rest is already saved.
        setFieldErrors({ cover: fields.image ?? "Couldn't save the cover photo." });
        setFeedback({
          type: "error",
          message: "Profile saved, but the cover photo didn't. Try saving again.",
        });
      } else {
        setFieldErrors(fields);
        setFeedback({
          type: "error",
          message: saveErrorMessage(
            err,
            fields,
            "Couldn't save your profile. Please try again.",
          ),
        });
      }
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
      sub="How your shop appears across Tinsae search and product pages."
      onSubmit={handleSubmit}
      footer={
        <>
          <Pill
            kind="outline"
            size="sm"
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
            {saving ? "Saving…" : "Save changes"}
          </Pill>
        </>
      }
    >
      <FeedbackBanner feedback={feedback} />

      <ShopImages
        shopName={name || shop.name}
        cover={cover}
        coverUrl={normalizeImageUrl(savedCover?.url)}
        logo={logo}
        logoUrl={normalizeImageUrl(shop.logo)}
        coverError={fieldErrors.cover}
        logoError={fieldErrors.logo}
        disabled={saving}
        onError={(field, message) =>
          setFieldErrors((prev) => ({ ...prev, [field]: message ?? "" }))
        }
      />

      <div className="mb-[22px]">
        <VerificationStatus
          isVerified={shop.is_verified}
          verification={verification}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Field label="Shop name" error={fieldErrors.name}>
          <input
            type="text"
            name="name"
            value={name}
            aria-invalid={Boolean(fieldErrors.name) || undefined}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: "" }));
              clearFeedback();
            }}
            placeholder="Enter shop name"
            className={inputClass}
          />
        </Field>

        <TelegramField telegram={telegram} username={telegramUsername} />
      </div>

      <Field label="About" error={fieldErrors.description}>
        <textarea
          name="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setFieldErrors((prev) => ({ ...prev, description: "" }));
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

const TELEGRAM_CHIP: Record<
  TelegramState["status"] | "unknown",
  { label: string; className: string }
> = {
  connected: { label: "Connected", className: "bg-tn-green/10 text-tn-green" },
  blocked: { label: "Bot blocked", className: "bg-tn-warn/15 text-tn-warn" },
  idle: { label: "Not linked", className: "bg-tn-hair text-tn-mute" },
  unknown: { label: "Unavailable", className: "bg-tn-hair text-tn-mute" },
};

/** Read-only link state; linking itself happens on the Telegram setup page. */
function TelegramField({
  telegram,
  username,
}: {
  telegram: TelegramState | null;
  username?: string;
}) {
  const status = telegram?.status ?? "unknown";
  const chip = TELEGRAM_CHIP[status];
  const handle =
    status === "connected" && username ? `@${username.replace(/^@/, "")}` : null;
  const text =
    handle ??
    {
      connected: "Bot linked",
      blocked: "The bot can't message you",
      idle: "Not linked yet",
      unknown: "Couldn't check the bot",
    }[status];

  return (
    <Field
      label="Telegram bot"
      hint={
        <Link
          href="/shop/dashboard/telegram"
          className="font-bold text-tn-ink underline"
        >
          {status === "connected" ? "Manage bot" : "Set up bot"}
        </Link>
      }
    >
      <div className="flex h-12 w-full items-center justify-between gap-2 rounded-xl border-[1.5px] border-tn-hair bg-tn-paper px-3.5">
        <span
          className={`truncate text-sm font-semibold text-tn-ink ${handle ? "font-tn-mono" : ""}`}
        >
          {text}
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${chip.className}`}
        >
          {status === "connected" && (
            <Icon name="check" size={12} strokeWidth={2.5} />
          )}
          {chip.label}
        </span>
      </div>
    </Field>
  );
}
