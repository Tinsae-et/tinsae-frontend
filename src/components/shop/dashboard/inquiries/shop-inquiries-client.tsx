"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ConversationThread } from "@/components/inquiries/conversation-thread";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { useInquiries } from "@/hooks/use-inquiries";
import { formatETB } from "@/lib/format";
import {
  counterpartName,
  INQUIRY_FILTERS,
  inquiryFilterLabel,
  initials,
  matchesInquiryFilter,
  needsReply,
  type InquiryFilter,
} from "@/lib/inquiries";
import { timeAgo } from "@/lib/notifications";
import { resolveProductImages } from "@/lib/product-images";
import type { Inquiry } from "@/lib/types";
import { cn } from "@/lib/utils";

// The dashboard's Inquiries page: the shop's conversations as a lead
// pipeline, with the thread in a slide-in drawer. Same data, polling and
// thread component as /messages?role=shop (hooks/use-inquiries,
// components/inquiries/conversation-thread).
//
// The open thread is mirrored into ?id= with history.replaceState rather than
// router.replace: a router navigation re-renders the server page and used to
// refetch the whole list on every open and close.

export default function ShopInquiriesClient({ initialSelectedId }: { initialSelectedId: number | null }) {
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId);
  const [tab, setTab] = useState<InquiryFilter>("all");
  const { items, status, send, resolve, retry } = useInquiries("shop", selectedId);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const open = (id: number) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `/shop/dashboard/inquiries?id=${id}`);
  };

  const close = useCallback(() => {
    setSelectedId(null);
    window.history.replaceState(null, "", "/shop/dashboard/inquiries");
  }, []);

  // Escape closes the drawer.
  const drawerOpen = selected !== null;
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, close]);

  const counts = useMemo(() => {
    const out = {} as Record<InquiryFilter, number>;
    for (const f of INQUIRY_FILTERS) out[f] = items.filter((i) => matchesInquiryFilter(i, f, "shop")).length;
    return out;
  }, [items]);

  const visible = useMemo(() => items.filter((i) => matchesInquiryFilter(i, tab, "shop")), [items, tab]);

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Pipeline stats */}
      <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
        <StatCard
          label="Needs reply"
          value={counts.unread}
          hint="Buyers waiting on you"
          icon="bell"
          tone="bg-[#CC3000]/10 text-tn-red"
        />
        <StatCard
          label="Active"
          value={counts.open}
          hint="Open conversations"
          icon="msg"
          tone="bg-[#229ED9]/15 text-[#229ED9]"
        />
        <StatCard
          label="Total leads"
          value={counts.all}
          hint="Product & shop inquiries"
          icon="user"
          tone="bg-[#B8741F]/15 text-[#B8741F]"
        />
        <StatCard
          label="Resolved"
          value={counts.closed}
          hint="Finished conversations"
          icon="check"
          tone="bg-[#1F8A5B]/15 text-[#1F8A5B]"
        />
      </div>

      {/* Filter tabs */}
      <div className="border-tn-hair2 no-scrollbar flex items-center gap-1 overflow-x-auto border-b">
        {INQUIRY_FILTERS.map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={active}
              className={cn(
                "relative flex shrink-0 cursor-pointer items-center gap-2 px-[15px] py-[11px] text-[13.5px] font-semibold transition-colors",
                active
                  ? "text-tn-ink after:bg-tn-red font-bold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2.5px]"
                  : "text-tn-mute hover:text-tn-ink",
              )}
            >
              {inquiryFilterLabel(key, "shop")}
              <span
                className={cn(
                  "font-tn-mono rounded-full px-2 py-0.5 text-[11px] font-bold",
                  active ? "bg-tn-ink text-white" : "bg-tn-paper text-tn-mute",
                )}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leads */}
      {status === "loading" ? (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border-tn-hair h-28 animate-pulse rounded-[15px] border bg-white" />
          ))}
        </div>
      ) : status === "error" || status === "signed-out" ? (
        <EmptyState
          title="We couldn't load your inquiries"
          body={status === "signed-out" ? "Your session has ended. Sign in again." : "Check your connection and try again."}
          action={
            status === "error" ? (
              <button
                type="button"
                onClick={() => void retry()}
                className="text-tn-red mt-3 cursor-pointer text-xs font-bold"
              >
                Try again
              </button>
            ) : null
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title={tab === "unread" && items.length > 0 ? "All caught up" : "No inquiries here"}
          body={
            tab === "unread" && items.length > 0
              ? "Every buyer has an answer. Nice work."
              : "When buyers message your shop about a listing, they'll appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((inquiry) => (
            <LeadRow key={inquiry.id} inquiry={inquiry} onOpen={() => open(inquiry.id)} />
          ))}
        </div>
      )}

      {/* Thread drawer */}
      {selected && (
        <>
          <button
            type="button"
            aria-label="Close conversation"
            onClick={close}
            className="bg-tn-ink/40 fixed inset-0 z-40 cursor-pointer backdrop-blur-xs"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Conversation with ${counterpartName(selected, "shop")}`}
            className="border-tn-hair animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-[92vw] flex-col border-l bg-white shadow-[-20px_0_60px_rgba(11,11,11,0.22)] duration-200 sm:w-[432px]"
          >
            <ConversationThread
              inquiry={selected}
              role="shop"
              onSend={(body) => send(selected.id, body)}
              onResolve={() => resolve(selected.id)}
              onDismiss={close}
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: IconName;
  tone: string;
}) {
  return (
    <div className="border-tn-hair flex flex-col justify-between rounded-[16px] border bg-white p-[16px_18px] shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-tn-mute text-[11.5px] font-bold tracking-[0.05em] uppercase">{label}</span>
        <div className={cn("flex size-7 items-center justify-center rounded-lg", tone)}>
          <Icon name={icon} size={15} />
        </div>
      </div>
      <span className="font-tn-mono text-tn-ink my-2 text-2xl font-semibold tracking-[-0.03em] sm:text-[30px]">
        {value}
      </span>
      <span className="text-tn-mute text-xs">{hint}</span>
    </div>
  );
}

function LeadRow({ inquiry, onOpen }: { inquiry: Inquiry; onOpen: () => void }) {
  const name = counterpartName(inquiry, "shop");
  const unread = inquiry.shop_unread > 0;
  const waiting = needsReply(inquiry);
  const last = inquiry.messages.at(-1);
  const product = inquiry.product;
  const image = product ? resolveProductImages(product.images)[0] : undefined;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "relative block w-full cursor-pointer rounded-[15px] border bg-white p-[16px_18px] text-left transition-all",
        unread
          ? "hover:border-tn-red/50 border-[#ECEAE3] bg-[#FCFBF9] shadow-xs"
          : "hover:border-tn-hair border-[#F2F0EA] hover:bg-[#FCFBF9]",
      )}
    >
      <div className="flex items-start gap-[15px]">
        <div className="bg-tn-ink flex size-[44px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {unread && <span className="bg-tn-red size-[7px] shrink-0 rounded-full" />}
              <span className="text-tn-ink truncate text-[15px] font-extrabold">{name}</span>
              {inquiry.status === "closed" ? (
                <span className="shrink-0 rounded-full bg-[#E8F5EE] px-2 py-0.5 text-[10.5px] font-bold text-[#1F8A5B]">
                  Resolved
                </span>
              ) : waiting ? (
                <span className="bg-tn-red-soft text-tn-red shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold">
                  Needs reply
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-[#EBF7FD] px-2 py-0.5 text-[10.5px] font-bold text-[#229ED9]">
                  Active
                </span>
              )}
            </div>
            <span className="font-tn-mono text-tn-mute shrink-0 text-[11.5px]">
              {inquiry.last_message_at ? timeAgo(inquiry.last_message_at) : ""}
            </span>
          </div>

          <p
            className={cn(
              "mt-1 line-clamp-1 text-[13.5px]",
              unread ? "font-semibold text-[#3A3A38]" : "font-medium text-[#76746E]",
            )}
          >
            {last ? `${last.sender_role === "shop" ? "You: " : ""}${last.body}` : "Conversation started"}
          </p>

          {product && (
            <div className="mt-2.5 inline-flex max-w-full items-center gap-2 rounded-[9px] border border-[#F2F0EA] bg-[#F7F6F2] py-[5px] pr-[10px] pl-[6px] sm:max-w-md">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  width={26}
                  height={30}
                  sizes="26px"
                  className="h-[30px] w-[26px] shrink-0 rounded bg-white object-cover"
                />
              ) : (
                <div className="border-tn-hair text-tn-mute flex h-[30px] w-[26px] shrink-0 items-center justify-center rounded border bg-white">
                  <Icon name="box" size={13} />
                </div>
              )}
              <span className="text-tn-ink max-w-[220px] truncate text-[12.5px] font-bold">{product.title}</span>
              <span className="font-tn-mono text-tn-ink ml-auto shrink-0 pl-1.5 text-xs font-semibold">
                {formatETB(product.price)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="border-tn-hair flex flex-col items-center justify-center rounded-2xl border bg-white p-12 text-center">
      <div className="bg-tn-paper text-tn-mute mb-3 flex size-14 items-center justify-center rounded-2xl">
        <Icon name="msg" size={24} />
      </div>
      <h3 className="text-tn-ink text-base font-bold">{title}</h3>
      <p className="text-tn-mute mt-1 max-w-sm text-xs">{body}</p>
      {action}
    </div>
  );
}
