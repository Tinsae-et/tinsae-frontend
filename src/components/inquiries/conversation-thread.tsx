"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import type { SendResult } from "@/hooks/use-inquiries";
import { formatETB } from "@/lib/format";
import {
  asksForAdvancePayment,
  counterpartName,
  dayLabel,
  initials,
  isPendingMessage,
  isSeen,
  MESSAGE_MAX_LENGTH,
  messageTime,
  QUICK_REPLIES,
  telegramProfileUrl,
  type InquiryRole,
} from "@/lib/inquiries";
import { resolveProductImages } from "@/lib/product-images";
import type { Inquiry, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// One conversation: who it's with, the listing it's about, the messages, and
// the composer. Both inboxes render this — /messages beside its list, the
// dashboard inside a drawer — so a buyer and a shop see the same thread
// behave the same way. Data and writes come from useInquiries via props.

type Props = {
  inquiry: Inquiry;
  role: InquiryRole;
  /** `ok: false` when the message didn't go; the text goes back in the box. */
  onSend: (body: string) => Promise<SendResult>;
  onResolve: () => Promise<boolean>;
  /** Phone layout: a back arrow to the conversation list. */
  onBack?: () => void;
  /** Drawer layout: a close button. */
  onDismiss?: () => void;
};

export function ConversationThread({ inquiry, role, onSend, onResolve, onBack, onDismiss }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <ThreadHeader
        inquiry={inquiry}
        role={role}
        onResolve={onResolve}
        onBack={onBack}
        onDismiss={onDismiss}
      />
      {inquiry.product && <ListingBanner product={inquiry.product} />}
      <MessageFeed inquiry={inquiry} role={role} />
      {inquiry.status === "open" ? (
        // Keyed so a half-typed reply doesn't follow you into another thread.
        <Composer key={inquiry.id} inquiry={inquiry} role={role} onSend={onSend} />
      ) : (
        <div className="border-tn-hair2 bg-tn-paper/60 text-tn-mute border-t p-4 text-center text-xs leading-relaxed">
          {role === "buyer"
            ? "This conversation is resolved. To ask something new, contact the shop from its listing or profile."
            : "This conversation is resolved."}
        </div>
      )}
    </div>
  );
}

function ThreadHeader({
  inquiry,
  role,
  onResolve,
  onBack,
  onDismiss,
}: Omit<Props, "onSend">) {
  const [confirming, setConfirming] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const name = counterpartName(inquiry, role);
  const shop = inquiry.shop;
  const telegram = role === "buyer" ? telegramProfileUrl(shop.telegram_username) : null;
  const phone = role === "buyer" ? shop.phone?.trim() : undefined;

  const resolve = async () => {
    setResolving(true);
    setError(null);
    const ok = await onResolve();
    setResolving(false);
    setConfirming(false);
    if (!ok) setError("Couldn't mark it resolved. Try again.");
  };

  const copyPhone = async () => {
    if (!phone || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (permissions); the number is still on the shop page.
    }
  };

  return (
    <div className="border-tn-hair2 shrink-0 border-b px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-tn-mute hover:text-tn-ink hover:bg-tn-paper -ml-1 cursor-pointer rounded-full p-1.5 md:hidden"
              aria-label="Back to conversations"
            >
              <Icon name="back" size={18} />
            </button>
          )}
          <div className="bg-tn-ink hidden size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white sm:flex">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {role === "buyer" ? (
                <Link
                  href={`/shops/${shop.slug}`}
                  className="text-tn-ink hover:text-tn-red truncate text-sm font-extrabold transition-colors"
                >
                  {name}
                </Link>
              ) : (
                <span className="text-tn-ink truncate text-sm font-extrabold">{name}</span>
              )}
              {role === "buyer" && shop.is_verified && <VerifiedBadge size={13} />}
              <StatusPill status={inquiry.status} />
            </div>
            <p className="text-tn-mute truncate text-[11px]">
              {role === "shop" ? `Asking ${shop.name}` : shop.city || "Shop on Tinsae"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {telegram && (
            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="border-tn-hair text-tn-ink2 hidden h-8 items-center gap-1.5 rounded-full border bg-white px-3 text-[11px] font-bold transition-colors hover:border-[#229ED9] hover:text-[#229ED9] sm:inline-flex"
            >
              <Icon name="tg" size={13} className="text-[#229ED9]" />
              Telegram
            </a>
          )}
          {phone && (
            <button
              type="button"
              onClick={copyPhone}
              className="border-tn-hair hover:border-tn-ink text-tn-ink2 hidden h-8 cursor-pointer items-center gap-1.5 rounded-full border bg-white px-3 text-[11px] font-bold transition-colors sm:inline-flex"
            >
              <Icon
                name={copied ? "check" : "phone"}
                size={12}
                className={copied ? "text-tn-green" : "text-tn-mute"}
              />
              {copied ? "Copied" : "Copy phone"}
            </button>
          )}
          {inquiry.status === "open" && !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="border-tn-hair hover:border-tn-ink text-tn-mute hover:text-tn-ink inline-flex h-8 cursor-pointer items-center rounded-full border bg-white px-3 text-[11px] font-bold transition-colors"
            >
              Mark resolved
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-tn-ink hover:bg-tn-paper flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
              aria-label="Close conversation"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div
          role="alertdialog"
          aria-label="Mark this conversation resolved?"
          className="bg-tn-paper mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5"
        >
          <span className="text-tn-ink2 text-xs font-semibold">
            Mark resolved? {role === "buyer" ? "You won't be able to reply here." : "The buyer can't reply here after this."}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={resolving}
              className="text-tn-ink2 hover:text-tn-ink h-7 cursor-pointer rounded-full px-3 text-[11px] font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={resolve}
              disabled={resolving}
              className="bg-tn-ink h-7 cursor-pointer rounded-full px-3 text-[11px] font-bold text-white hover:bg-black disabled:opacity-50"
            >
              {resolving ? "Resolving…" : "Yes, resolve"}
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-tn-red mt-2 text-[11px] font-semibold">{error}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: Inquiry["status"] }) {
  return status === "open" ? (
    <span className="bg-tn-green-soft text-tn-green shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
      Active
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
      Resolved
    </span>
  );
}

function ListingBanner({ product }: { product: Product }) {
  const image = resolveProductImages(product.images)[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group border-tn-hair2 hover:bg-tn-paper/60 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 transition-colors sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-tn-paper border-tn-hair text-tn-mute relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {image ? (
            <Image src={image} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <Icon name="box" size={18} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-tn-ink group-hover:text-tn-red truncate text-xs font-bold transition-colors">
            {product.title}
          </p>
          <p className="font-tn-mono text-tn-ink2 mt-0.5 text-[11px] font-semibold">
            {formatETB(product.price)}
          </p>
        </div>
      </div>
      <span className="text-tn-red flex shrink-0 items-center gap-1 text-xs font-bold">
        View listing <Icon name="arrow" size={12} />
      </span>
    </Link>
  );
}

function MessageFeed({ inquiry, role }: { inquiry: Inquiry; role: InquiryRole }) {
  const feed = useRef<HTMLDivElement>(null);
  const count = inquiry.messages.length;

  // Stick to the newest message when the thread opens or grows. Scrolling the
  // feed itself, not scrollIntoView, so the page behind never jumps.
  useEffect(() => {
    const el = feed.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [inquiry.id, count]);

  const seen = isSeen(inquiry, role);

  return (
    <div ref={feed} className="bg-tn-paper/20 min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
      {count === 0 && (
        <p className="text-tn-mute py-8 text-center text-xs">No messages in this conversation yet.</p>
      )}
      {inquiry.messages.map((msg, index) => {
        const mine = msg.sender_role === role;
        const pending = isPendingMessage(msg);
        const label = dayLabel(msg.created_at);
        const showDay = index === 0 || dayLabel(inquiry.messages[index - 1].created_at) !== label;
        const isLast = index === count - 1;
        const warn = role === "buyer" && !mine && asksForAdvancePayment(msg.body);

        return (
          <div key={msg.id}>
            {showDay && label && (
              <div className="my-3 flex justify-center">
                <span className="border-tn-hair text-tn-mute rounded-full border bg-white px-3 py-0.5 text-[10.5px] font-semibold">
                  {label}
                </span>
              </div>
            )}
            <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-[18px] px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words sm:max-w-[70%]",
                  mine
                    ? "bg-tn-ink rounded-br-sm text-white"
                    : "border-tn-hair text-tn-ink rounded-bl-sm border bg-white",
                  pending && "opacity-60",
                )}
              >
                {msg.body}
              </div>
              <div className="font-tn-mono text-tn-mute mt-1 flex items-center gap-1.5 px-1 text-[10px]">
                {pending ? (
                  <span>Sending…</span>
                ) : (
                  <>
                    <span>{messageTime(msg.created_at)}</span>
                    {!mine && msg.sent_via === "telegram" && <span>· via Telegram</span>}
                    {mine && isLast && seen && (
                      <span className="text-tn-green flex items-center gap-0.5">
                        · <Icon name="check" size={10} /> Seen
                      </span>
                    )}
                  </>
                )}
              </div>
              {warn && (
                <div className="mt-2 flex max-w-[85%] items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-900 sm:max-w-[70%]">
                  <Icon name="shield" size={13} className="mt-0.5 shrink-0" />
                  <span>
                    Tinsae shops never need payment before you&apos;ve seen the item. Inspect it in
                    the shop first.{" "}
                    <Link href="/trust-and-safety" className="font-bold underline">
                      Stay safe
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function subscribePointer(onChange: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True on touch screens, where Enter should add a line rather than send. */
function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribePointer,
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}

function Composer({
  inquiry,
  role,
  onSend,
}: {
  inquiry: Inquiry;
  role: InquiryRole;
  onSend: (body: string) => Promise<SendResult>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const touch = useCoarsePointer();

  const submit = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    setText("");
    const result = await onSend(body);
    setSending(false);
    if (!result.ok) {
      // Give the text back unless they've already started typing again.
      setText((current) => (current.trim() ? current : body));
      setError(result.error ?? "Couldn't send. Your message is still here — try again.");
    }
    textarea.current?.focus();
  };

  const remaining = MESSAGE_MAX_LENGTH - text.length;

  return (
    <div className="border-tn-hair2 shrink-0 border-t bg-white p-3 sm:p-4">
      <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {QUICK_REPLIES[role].map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => {
              setText(reply);
              textarea.current?.focus();
            }}
            className="border-tn-hair hover:border-tn-ink text-tn-ink2 shrink-0 cursor-pointer rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex items-end gap-2"
      >
        <textarea
          ref={textarea}
          rows={2}
          maxLength={MESSAGE_MAX_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (!touch && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void submit();
            }
          }}
          aria-label={role === "shop" ? "Reply to customer" : `Message ${inquiry.shop.name}`}
          placeholder={
            role === "shop" ? "Reply to the customer…" : `Write to ${inquiry.shop.name}…`
          }
          className="border-tn-hair focus:border-tn-ink text-tn-ink placeholder:text-tn-mute bg-tn-paper/40 w-full flex-1 resize-none rounded-2xl border p-3 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-tn-red hover:bg-tn-red-dark mb-1 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send"
        >
          <Icon name="arrow" size={17} />
        </button>
      </form>

      <div className="mt-1 flex items-center justify-between gap-2 text-[10.5px]">
        {error ? (
          <span role="alert" className="text-tn-red font-semibold">
            {error}
          </span>
        ) : (
          <span className="text-tn-mute">
            {touch ? "Tap send when you're ready" : "Enter to send · Shift+Enter for a new line"}
          </span>
        )}
        {remaining <= 100 && (
          <span className={cn("font-tn-mono", remaining <= 20 ? "text-tn-red" : "text-tn-mute")}>
            {remaining}
          </span>
        )}
      </div>
    </div>
  );
}
