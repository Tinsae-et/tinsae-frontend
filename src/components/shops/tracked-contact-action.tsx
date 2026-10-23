"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { useModal } from "@/hooks/use-modal";
import { recordContactIntent, startInquiry } from "@/lib/api/inquiries";
import { MESSAGE_MAX_LENGTH, safeContactTarget } from "@/lib/inquiries";
import { cn } from "@/lib/utils";
import type { ContactChannel } from "@/lib/types";

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
  /**
   * Reopen with the buyer's unsent message after they come back from signing
   * in. Turn it off on a second button for the same shop and listing on one
   * page, or both dialogs would open.
   */
  restoreDraft?: boolean;
};

// A signed-out buyer can write their message first; "Sign in to send" keeps
// it in sessionStorage (an unsent draft — CLAUDE.md allows that) and the
// dialog reopens with it once they're back. Never sent automatically: they
// press send themselves.
const draftKey = (shop: ShopInfo, product?: ProductInfo) =>
  `tinsae:contact-draft:${shop.slug}:${product?.slug ?? ""}`;

function readDraft(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeDraft(key: string, value: string | null) {
  try {
    if (value) window.sessionStorage.setItem(key, value);
    else window.sessionStorage.removeItem(key);
  } catch {
    // Private mode or storage blocked: the draft just isn't kept.
  }
}

export function TrackedContactAction({
  shop,
  product,
  isAuthenticated = false,
  size = "md",
  kind = "solid",
  className,
  label,
  restoreDraft = true,
}: Props) {
  const mounted = useIsMounted();
  const pathname = usePathname();
  const key = draftKey(shop, product);

  // Read once, on the client, before the first paint of the dialog. The
  // dialog only renders after mount, so this can't cause a hydration mismatch.
  const [draft] = useState(() => (restoreDraft && isAuthenticated ? readDraft(key) : null));
  const [open, setOpen] = useState(Boolean(draft));
  const [messageText, setMessageText] = useState(
    draft ??
      (product ? `Hi, is "${product.title}" still available?` : "Hi, I'm interested in your listings."),
  );
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState<number | "unknown" | null>(null);
  const [loadingChannel, setLoadingChannel] = useState<ContactChannel | null>(null);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(
    shop.phone?.trim() ? shop.phone : null,
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const close = () => {
    setOpen(false);
    writeDraft(key, null);
  };
  const modalRef = useModal<HTMLDivElement>(mounted && open, close);

  const hasPhoneOption = Boolean(shop.has_phone || shop.phone?.trim());
  const hasTelegramOption = Boolean(shop.telegram_username?.trim());
  const signinHref = `/signin?next=${encodeURIComponent(pathname || `/shops/${shop.slug}`)}`;

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
      const data = await recordContactIntent({
        channel,
        shop: shop.id ?? shop.slug,
        product: product?.id ?? product?.slug,
        honeypot,
      });
      const target = safeContactTarget(data.target);
      if (!target) throw new Error("We couldn't open that contact link.");
      if (channel === "phone") {
        if (data.phone) setRevealedPhone(data.phone);
        window.location.href = target;
      } else {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to reach the shop right now.");
    } finally {
      setLoadingChannel(null);
    }
  };

  const handleSendMessage = async () => {
    const body = messageText.trim();
    if (!body || sending) return;
    setError(null);
    setSending(true);
    try {
      const data = await startInquiry({
        shop: shop.id ?? shop.slug,
        product: product?.id ?? product?.slug,
        body,
        honeypot,
      });
      writeDraft(key, null);
      setSentId(typeof data.id === "number" ? data.id : "unknown");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to send your message right now.");
    } finally {
      setSending(false);
    }
  };

  const handleCopyPhone = async (number: string) => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused; the number is on screen to copy by hand.
    }
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
            className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget) close();
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              onClick={(e) => e.stopPropagation()}
              className="border-tn-hair animate-in zoom-in-95 relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[24px] border bg-white p-6 shadow-2xl duration-150 sm:p-7"
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

              {/* Header */}
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
                      About: {product.title}
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
                  onClick={close}
                  className="text-tn-mute hover:text-tn-ink hover:bg-tn-paper cursor-pointer rounded-full p-2 transition-colors"
                  aria-label="Close dialog"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
                >
                  {error}
                </div>
              )}

              {/* Message — the main way to reach the shop */}
              <div className="mt-5">
                {sentId !== null ? (
                  <div className="border-tn-green/30 bg-tn-green-soft rounded-2xl border p-5 text-center">
                    <div className="text-tn-green flex items-center justify-center gap-2 text-sm font-bold">
                      <Icon name="check" size={18} />
                      <span>Sent to {shop.name}</span>
                    </div>
                    <p className="text-tn-ink2 mt-2 text-xs leading-relaxed">
                      The shop has been notified. Their reply will appear in Messages and in your
                      notifications.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href={sentId === "unknown" ? "/messages" : `/messages/${sentId}`}
                        onClick={() => setOpen(false)}
                        className="bg-tn-ink inline-flex h-9 items-center rounded-full px-4 text-xs font-bold text-white transition-colors hover:bg-black"
                      >
                        Open conversation →
                      </Link>
                      <button
                        type="button"
                        onClick={close}
                        className="border-tn-hair hover:border-tn-ink text-tn-ink inline-flex h-9 cursor-pointer items-center rounded-full border bg-white px-4 text-xs font-bold transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSendMessage();
                    }}
                    className="border-tn-hair bg-tn-paper/40 rounded-2xl border p-4"
                  >
                    <label
                      htmlFor="contact-message"
                      className="text-tn-ink mb-2 block text-sm font-extrabold"
                    >
                      Send a message
                    </label>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {quickChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setMessageText(chip)}
                          className="border-tn-hair hover:border-tn-ink text-tn-ink2 cursor-pointer rounded-full border bg-white/80 px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-white"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <textarea
                        id="contact-message"
                        rows={3}
                        maxLength={MESSAGE_MAX_LENGTH}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={sending}
                        placeholder={`Write a question for ${shop.name}…`}
                        className="border-tn-hair focus:border-tn-ink text-tn-ink placeholder:text-tn-mute w-full resize-none rounded-xl border bg-white p-3 pb-6 text-sm focus:outline-none disabled:opacity-75"
                      />
                      <div className="font-tn-mono text-tn-mute absolute right-3 bottom-2.5 text-[10px]">
                        {messageText.length}/{MESSAGE_MAX_LENGTH}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {isAuthenticated ? (
                        <button
                          type="submit"
                          disabled={sending || !messageText.trim()}
                          className="bg-tn-red hover:bg-tn-red-dark inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-5 text-xs font-bold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {sending ? "Sending…" : "Send message"}
                        </button>
                      ) : (
                        <Link
                          href={signinHref}
                          onClick={() => writeDraft(key, messageText.trim() || null)}
                          className="bg-tn-red hover:bg-tn-red-dark inline-flex h-9 items-center rounded-full px-5 text-xs font-bold text-white transition-colors"
                        >
                          Sign in to send
                        </Link>
                      )}
                      <span className="text-tn-mute text-[11px]">
                        {isAuthenticated ? "Replies arrive in Messages" : "We'll keep your message"}
                      </span>
                    </div>
                  </form>
                )}
              </div>

              {/* Other ways to reach the shop */}
              {(hasPhoneOption || hasTelegramOption) && (
                <div className="mt-5">
                  <p className="text-tn-mute mb-2 text-[11px] font-bold tracking-wider uppercase">
                    Or reach them directly
                  </p>
                  <div className="flex flex-col gap-2">
                    {hasPhoneOption && (
                      <div className="border-tn-hair flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="bg-tn-green-soft text-tn-green flex size-9 shrink-0 items-center justify-center rounded-xl">
                            <Icon name="phone" size={17} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-tn-ink text-sm font-bold">Phone</div>
                            <div className="font-tn-mono text-tn-ink2 truncate text-xs">
                              {revealedPhone || (isAuthenticated ? "Tap to reveal" : "Shown after sign-in")}
                            </div>
                          </div>
                        </div>
                        {isAuthenticated ? (
                          <div className="flex items-center gap-1.5">
                            {revealedPhone && (
                              <button
                                type="button"
                                onClick={() => void handleCopyPhone(revealedPhone)}
                                className="border-tn-hair hover:border-tn-ink text-tn-ink inline-flex h-9 cursor-pointer items-center gap-1 rounded-full border bg-white px-3 text-xs font-bold transition-colors"
                              >
                                <Icon
                                  name={copied ? "check" : "box"}
                                  size={13}
                                  className={copied ? "text-tn-green" : "text-tn-mute"}
                                />
                                {copied ? "Copied" : "Copy"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void handleContactIntent("phone")}
                              disabled={loadingChannel !== null}
                              className="bg-tn-ink inline-flex h-9 cursor-pointer items-center rounded-full px-4 text-xs font-bold text-white transition-colors hover:bg-black disabled:opacity-50"
                            >
                              {loadingChannel === "phone" ? "Dialing…" : revealedPhone ? "Call" : "Reveal & call"}
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={signinHref}
                            onClick={() => writeDraft(key, messageText.trim() || null)}
                            className="border-tn-hair hover:border-tn-ink text-tn-ink inline-flex h-9 items-center rounded-full border bg-white px-4 text-xs font-bold transition-colors"
                          >
                            Sign in to see
                          </Link>
                        )}
                      </div>
                    )}

                    {hasTelegramOption && (
                      <div className="border-tn-hair flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#229ED9]/15 text-[#229ED9]">
                            <Icon name="tg" size={18} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-tn-ink text-sm font-bold">Telegram</div>
                            <div className="font-tn-mono text-tn-mute truncate text-xs">
                              @{shop.telegram_username}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleContactIntent("telegram")}
                          disabled={loadingChannel !== null}
                          className={cn(
                            "inline-flex h-9 cursor-pointer items-center rounded-full bg-[#229ED9] px-4 text-xs font-bold text-white transition-colors hover:bg-[#1f8ec4] disabled:opacity-50",
                          )}
                        >
                          {loadingChannel === "telegram" ? "Opening…" : "Open chat"}
                        </button>
                      </div>
                    )}
                  </div>
                  {!isAuthenticated && hasPhoneOption && (
                    <p className="text-tn-mute mt-2 text-[11px] leading-relaxed">
                      Numbers are shown only to signed-in buyers, to protect shops from scrapers
                      and spam calls.
                    </p>
                  )}
                </div>
              )}

              <p className="text-tn-mute border-tn-hair2 mt-6 border-t pt-4 text-center text-[11px] leading-relaxed">
                Tinsae never handles payment. Inspect the item in the shop before you pay.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
