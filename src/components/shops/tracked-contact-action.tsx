"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import type { ContactChannel, ContactIntentResponse } from "@/lib/types";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

type ShopInfo = {
  id?: number;
  name: string;
  slug: string;
  phone?: string;
  has_phone?: boolean;
  telegram_username?: string | null;
  is_verified?: boolean;
  city?: string;
};

type ProductInfo = {
  id?: number;
  title: string;
  slug: string;
};

type Props = {
  shop: ShopInfo;
  product?: ProductInfo;
  isAuthenticated?: boolean;
  size?: "sm" | "md" | "lg";
  kind?: "solid" | "dark" | "outline" | "ghost" | "light";
  className?: string;
  label?: string;
};

export function TrackedContactAction({
  shop,
  product,
  isAuthenticated = false,
  size = "md",
  kind = "solid",
  className,
  label,
}: Props) {
  const mounted = useIsMounted();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"message" | "telegram" | "phone">("message");
  const [loadingChannel, setLoadingChannel] = useState<ContactChannel | null>(null);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(
    shop.phone?.trim() ? shop.phone : null,
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const pathname = usePathname();

  const [messageText, setMessageText] = useState(
    product ? `Hi, is "${product.title}" still available?` : "Hi, I am interested in your listings.",
  );
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const modalRef = useModal<HTMLDivElement>(open, () => setOpen(false));

  const hasPhoneOption = Boolean(shop.has_phone || shop.phone?.trim());
  const hasTelegramOption = Boolean(shop.telegram_username?.trim());

  // Default trigger button icon & label
  const buttonIcon = hasTelegramOption ? "tg" : hasPhoneOption ? "phone" : "msg";
  const buttonLabel = label || (hasTelegramOption ? "Contact on Telegram" : "Contact shop");

  const quickChips = [
    product ? "Is this still available?" : "Are your listings available?",
    "Can I visit the shop today?",
    "What is your best price?",
    "Can you deliver in Addis?",
  ];

  const handleContactIntent = async (channel: ContactChannel) => {
    setError(null);
    setLoadingChannel(channel);

    try {
      const res = await fetch("/api/inquiries/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          shop: shop.id ?? shop.slug,
          product: product?.id ?? product?.slug,
          honeypot,
        }),
      });

      const data = (await res.json()) as ContactIntentResponse & { detail?: string };

      if (!res.ok) {
        throw new Error(data.detail || "Unable to reach the shop right now.");
      }

      if (channel === "telegram" && data.target) {
        window.open(data.target, "_blank", "noopener,noreferrer");
        setOpen(false);
      } else if (channel === "phone" && data.target) {
        if (data.phone) setRevealedPhone(data.phone);
        window.location.href = data.target;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record contact.";
      setError(msg);
    } finally {
      setLoadingChannel(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setError(null);
    setSendingMessage(true);

    try {
      const res = await fetch("/api/inquiries/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop: shop.id ?? shop.slug,
          product: product?.id ?? product?.slug,
          body: messageText.trim(),
          honeypot,
        }),
      });

      const data = (await res.json()) as { id?: number; detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || "Unable to send message right now.");
      }

      setMessageSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message.";
      setError(msg);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCopyPhone = (number: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Pill
        kind={kind}
        size={size}
        icon={buttonIcon}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
      >
        {buttonLabel}
      </Pill>

      {mounted &&
        open &&
        createPortal(
          <div
            role="presentation"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              onClick={(e) => e.stopPropagation()}
              className="border-tn-hair relative w-full max-w-lg overflow-hidden rounded-[24px] border bg-white p-6 shadow-2xl sm:p-7 animate-in zoom-in-95 duration-150"
            >
              {/* Honeypot field for bot trapping */}
              <input
                type="text"
                name="b_contact_website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                className="sr-only absolute -left-[9999px] opacity-0"
              />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      id="contact-modal-title"
                      className="text-tn-ink text-xl font-extrabold tracking-[-0.02em] capitalize sm:text-2xl"
                    >
                      Contact {shop.name}
                    </h2>
                    {shop.is_verified && <VerifiedBadge size={16} />}
                  </div>
                  {product && (
                    <p className="text-tn-ink2 mt-1 truncate text-xs font-semibold">
                      Regarding: {product.title}
                    </p>
                  )}
                  {shop.city && (
                    <p className="text-tn-mute mt-1 flex items-center gap-1 text-xs">
                      <Icon name="pin" size={13} className="shrink-0" />
                      <span>{shop.city}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-tn-mute hover:text-tn-ink hover:bg-tn-paper rounded-full p-2 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                  {error}
                </div>
              )}

              {/* Segmented Control Tabs */}
              <div className="bg-tn-paper mt-5 flex rounded-2xl p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("message")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer",
                    activeTab === "message"
                      ? "bg-white text-tn-ink shadow-xs"
                      : "text-tn-mute hover:text-tn-ink",
                  )}
                >
                  <Icon name="msg" size={15} />
                  <span>Message</span>
                </button>

                {hasTelegramOption && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("telegram")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer",
                      activeTab === "telegram"
                        ? "bg-white text-tn-ink shadow-xs"
                        : "text-tn-mute hover:text-tn-ink",
                    )}
                  >
                    <Icon name="tg" size={15} />
                    <span>Telegram</span>
                  </button>
                )}

                {hasPhoneOption && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("phone")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer",
                      activeTab === "phone"
                        ? "bg-white text-tn-ink shadow-xs"
                        : "text-tn-mute hover:text-tn-ink",
                    )}
                  >
                    <Icon name="phone" size={15} />
                    <span>Phone</span>
                  </button>
                )}
              </div>

              {/* Active Tab Body */}
              <div className="mt-4">
                {/* TAB 1: IN-APP MESSAGE */}
                {activeTab === "message" && (
                  <div>
                    {messageSent ? (
                      <div className="rounded-2xl border border-tn-green/30 bg-tn-green-soft p-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-tn-green font-bold text-sm">
                          <Icon name="check" size={18} />
                          <span>Message sent to {shop.name}!</span>
                        </div>
                        <p className="text-tn-ink2 mt-2 text-xs leading-relaxed">
                          The merchant has been notified. You can review and continue your conversation in your account messages.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                          <Link
                            href="/messages"
                            onClick={() => setOpen(false)}
                            className="bg-tn-ink hover:bg-black inline-flex h-9 items-center rounded-full px-4 text-xs font-bold text-white transition-colors"
                          >
                            View your messages →
                          </Link>
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="border-tn-hair hover:border-tn-ink bg-white inline-flex h-9 items-center rounded-full border px-4 text-xs font-bold text-tn-ink transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-tn-hair rounded-2xl border bg-tn-paper/40 p-4">
                        {/* Quick-reply chips */}
                        <div className="mb-3">
                          <span className="text-tn-mute mb-1.5 block text-[11px] font-bold uppercase tracking-wider">
                            Suggested Questions
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {quickChips.map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setMessageText(chip)}
                                className="border-tn-hair hover:border-tn-ink hover:bg-white text-tn-ink2 rounded-full border bg-white/80 px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Textarea */}
                        <div className="relative">
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            disabled={!isAuthenticated || sendingMessage}
                            placeholder={`Write a question for ${shop.name}...`}
                            className="border-tn-hair focus:border-tn-ink text-tn-ink placeholder:text-tn-mute w-full resize-none rounded-xl border bg-white p-3 text-sm focus:outline-none disabled:bg-neutral-50 disabled:opacity-75"
                          />
                          <div className="font-tn-mono text-tn-mute absolute bottom-2.5 right-3 text-[10px]">
                            {messageText.length}/500
                          </div>
                        </div>

                        {/* Action row */}
                        <div className="mt-3 flex items-center justify-between">
                          {isAuthenticated ? (
                            <button
                              type="button"
                              onClick={handleSendMessage}
                              disabled={sendingMessage || !messageText.trim()}
                              className="bg-tn-red hover:bg-tn-red-dark inline-flex h-9 items-center justify-center rounded-full px-5 text-xs font-bold text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {sendingMessage ? "Sending…" : "Send message"}
                            </button>
                          ) : (
                            <Link
                              href={`/signin?next=${encodeURIComponent(pathname || `/shops/${shop.slug}`)}`}
                              className="border-tn-hair hover:border-tn-ink bg-white inline-flex h-9 items-center rounded-full border px-4 text-xs font-bold text-tn-ink transition-colors"
                            >
                              Sign in to message
                            </Link>
                          )}
                          <span className="text-tn-mute text-[11px]">Direct on Tinsae</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: TELEGRAM */}
                {activeTab === "telegram" && hasTelegramOption && (
                  <div className="border-tn-hair rounded-2xl border bg-tn-paper/30 p-5">
                    <div className="flex items-center gap-3.5">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#229ED9]/15 text-[#229ED9]">
                        <Icon name="tg" size={26} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-tn-ink font-bold text-base">
                          Telegram Merchant Chat
                        </div>
                        <div className="text-tn-mute font-tn-mono text-xs truncate">
                          @{shop.telegram_username}
                        </div>
                      </div>
                    </div>

                    <p className="text-tn-ink2 mt-3.5 text-xs leading-relaxed">
                      Chat directly with {shop.name} on Telegram. Ideal for instant replies, asking for real photos, and voice messages.
                    </p>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => handleContactIntent("telegram")}
                        disabled={loadingChannel !== null}
                        className="bg-[#229ED9] hover:bg-[#1f8ec4] inline-flex w-full h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Icon name="tg" size={16} />
                        <span>{loadingChannel === "telegram" ? "Opening…" : "Open Telegram Chat"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: PHONE */}
                {activeTab === "phone" && hasPhoneOption && (
                  <div className="border-tn-hair rounded-2xl border bg-tn-paper/30 p-5">
                    <div className="flex items-center gap-3.5">
                      <span className="bg-tn-green-soft text-tn-green flex size-12 shrink-0 items-center justify-center rounded-2xl">
                        <Icon name="phone" size={24} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-tn-ink font-bold text-base">
                          Direct Phone Call
                        </div>
                        <div className="font-tn-mono text-tn-ink2 text-xs font-semibold">
                          {revealedPhone || "Number hidden (Sign-in required)"}
                        </div>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <div className="mt-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleContactIntent("phone")}
                            disabled={loadingChannel !== null}
                            className="bg-tn-ink hover:bg-black inline-flex flex-1 h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Icon name="phone" size={16} />
                            <span>
                              {loadingChannel === "phone"
                                ? "Dialing…"
                                : revealedPhone
                                  ? "Call Shop"
                                  : "Reveal & Call"}
                            </span>
                          </button>

                          {revealedPhone && (
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(revealedPhone)}
                              className="border-tn-hair hover:border-tn-ink bg-white inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold text-tn-ink transition-colors cursor-pointer"
                            >
                              <Icon name={copied ? "check" : "box"} size={15} className={copied ? "text-tn-green" : "text-tn-mute"} />
                              <span>{copied ? "Copied!" : "Copy"}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-tn-mute mt-3 text-[11px] leading-relaxed">
                          Direct phone call connects via your mobile network or device dialer.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-tn-mute text-xs leading-relaxed">
                          To protect verified Addis merchants from automated telephone harvesting and telemarketing scrapers, phone numbers are visible only to signed-in buyers.
                        </p>
                        <div className="mt-4">
                          <Link
                            href={`/signin?next=${encodeURIComponent(pathname || `/shops/${shop.slug}`)}`}
                            className="bg-tn-ink hover:bg-black inline-flex w-full h-10 items-center justify-center rounded-xl text-xs font-bold text-white transition-colors"
                          >
                            Sign in to reveal number
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Trust disclaimer */}
              <p className="text-tn-mute mt-6 border-t border-tn-hair2 pt-4 text-center text-[11px] leading-relaxed">
                Tinsae connects you directly with Addis merchants. Always inspect items in person before payment.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
