"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { useInquiries } from "@/hooks/use-inquiries";
import {
  counterpartName,
  INQUIRY_FILTERS,
  inquiryFilterLabel,
  initials,
  matchesInquiryFilter,
  matchesInquirySearch,
  threadTime,
  unreadFor,
  type InquiryFilter,
  type InquiryRole,
} from "@/lib/inquiries";
import { cn } from "@/lib/utils";
import { ConversationThread } from "./conversation-thread";

// /messages: every conversation the signed-in user is part of, as a list and
// the open thread side by side (one at a time on a phone). Someone who owns a
// shop can switch to the conversations their shop received; the dashboard's
// Inquiries page shows those too, with the same thread component.
//
// The page (a Server Component) has already checked the session and read the
// thread id and side from the URL, so nothing here reads the route: updating
// the address bar on select can't re-trigger a load.

export function MessagesView({
  initialRole,
  initialId,
  canSell,
}: {
  initialRole: InquiryRole;
  initialId: number | null;
  /** Owns a shop, so has a "My shop" side to switch to. */
  canSell: boolean;
}) {
  const [role, setRole] = useState<InquiryRole>(initialRole);

  const switchRole = (next: InquiryRole) => {
    setRole(next);
    window.history.replaceState(null, "", next === "shop" ? "/messages?role=shop" : "/messages");
  };

  return (
    <div className="bg-tn-paper flex h-[calc(100dvh-64px)] w-full flex-col overflow-hidden p-2 sm:p-4 md:p-5">
      <div className="border-tn-hair relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 overflow-hidden rounded-[24px] border bg-white shadow-sm">
        {/* Remounted per side: each has its own list, selection and polling. */}
        <Inbox
          key={role}
          role={role}
          initialId={role === initialRole ? initialId : null}
          canSell={canSell}
          onSwitchRole={switchRole}
        />
      </div>
    </div>
  );
}

function Inbox({
  role,
  initialId,
  canSell,
  onSwitchRole,
}: {
  role: InquiryRole;
  initialId: number | null;
  canSell: boolean;
  onSwitchRole: (role: InquiryRole) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(initialId);
  const [phoneView, setPhoneView] = useState<"list" | "thread">(initialId ? "thread" : "list");
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const [query, setQuery] = useState("");
  const { items, status, send, resolve, retry } = useInquiries(role, selectedId);

  const visible = useMemo(
    () => items.filter((i) => matchesInquiryFilter(i, filter, role) && matchesInquirySearch(i, query)),
    [items, filter, query, role],
  );
  const totalUnread = items.reduce((sum, i) => sum + unreadFor(i, role), 0);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const select = (id: number) => {
    setSelectedId(id);
    setPhoneView("thread");
    window.history.replaceState(null, "", `/messages/${id}${role === "shop" ? "?role=shop" : ""}`);
  };

  return (
    <>
      {/* ── Conversation list ── */}
      <div
        className={cn(
          "border-tn-hair flex min-h-0 w-full shrink-0 flex-col border-r bg-white md:w-80 lg:w-[360px]",
          phoneView === "thread" ? "hidden md:flex" : "flex",
        )}
      >
        <div className="border-tn-hair2 border-b p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-tn-ink text-lg font-extrabold tracking-tight">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-tn-red font-tn-mono rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>

          {canSell && (
            <div className="bg-tn-paper mt-3 flex rounded-xl p-1 text-xs font-bold" role="tablist">
              {(["buyer", "shop"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  role="tab"
                  aria-selected={role === side}
                  onClick={() => role !== side && onSwitchRole(side)}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all",
                    role === side ? "text-tn-ink bg-white shadow-xs" : "text-tn-mute hover:text-tn-ink",
                  )}
                >
                  <Icon name={side === "buyer" ? "msg" : "store"} size={13} />
                  {side === "buyer" ? "Buying" : "My shop"}
                </button>
              ))}
            </div>
          )}

          {role === "shop" && (
            <Link
              href="/shop/dashboard/inquiries"
              className="bg-tn-paper text-tn-ink2 hover:bg-tn-hair2 mt-2.5 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              Open in shop dashboard
              <Icon name="arrow" size={13} />
            </Link>
          )}

          <div className="relative mt-3">
            <Icon
              name="search"
              size={15}
              className="text-tn-mute pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search conversations"
              placeholder={role === "shop" ? "Search customers or listings…" : "Search shops or listings…"}
              className="border-tn-hair focus:border-tn-ink text-tn-ink placeholder:text-tn-mute bg-tn-paper/40 w-full rounded-xl border py-2 pr-3 pl-9 text-xs focus:outline-none"
            />
          </div>

          <div className="mt-3 flex gap-1 text-[11px] font-bold">
            {INQUIRY_FILTERS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg py-1.5 text-center transition-colors",
                  filter === id ? "bg-tn-ink text-white" : "text-tn-mute hover:bg-tn-paper hover:text-tn-ink",
                )}
              >
                {inquiryFilterLabel(id, role)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-tn-hair2 min-h-0 flex-1 divide-y overflow-y-auto">
          {status === "loading" ? (
            <ListSkeleton />
          ) : status === "signed-out" ? (
            <ListNotice
              title="Your session has ended"
              body="Sign in again to see your messages."
              action={
                <Link href="/signin?next=/messages" className="text-tn-red font-bold">
                  Sign in
                </Link>
              }
            />
          ) : status === "error" ? (
            <ListNotice
              title="We couldn't load your messages"
              body="Check your connection and try again."
              action={
                <button type="button" onClick={() => void retry()} className="text-tn-red cursor-pointer font-bold">
                  Try again
                </button>
              }
            />
          ) : visible.length === 0 ? (
            <ListNotice
              title={items.length === 0 ? "No conversations yet" : "Nothing matches"}
              body={
                items.length > 0
                  ? "Try another filter or search."
                  : role === "shop"
                    ? "Questions buyers send about your listings will appear here."
                    : "Message a shop from any listing and the conversation shows up here."
              }
              action={
                items.length === 0 && role === "buyer" ? (
                  <Link href="/products" className="text-tn-red font-bold">
                    Browse listings
                  </Link>
                ) : null
              }
            />
          ) : (
            visible.map((inquiry) => {
              const name = counterpartName(inquiry, role);
              const unread = unreadFor(inquiry, role);
              const last = inquiry.messages.at(-1);
              const isSelected = inquiry.id === selectedId;
              return (
                <button
                  key={inquiry.id}
                  type="button"
                  onClick={() => select(inquiry.id)}
                  aria-current={isSelected ? "true" : undefined}
                  className={cn(
                    "relative flex w-full cursor-pointer items-start gap-3 p-3.5 text-left transition-colors",
                    isSelected ? "bg-tn-paper/70" : "hover:bg-tn-paper/30",
                  )}
                >
                  {isSelected && <span className="bg-tn-ink absolute inset-y-0 left-0 w-1" />}
                  <div className="bg-tn-paper border-tn-hair text-tn-ink relative flex size-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold">
                    {initials(name)}
                    {unread > 0 && (
                      <span className="bg-tn-red absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={cn(
                            "truncate text-xs",
                            unread > 0 ? "text-tn-ink font-extrabold" : "text-tn-ink2 font-bold",
                          )}
                        >
                          {name}
                        </span>
                        {role === "buyer" && inquiry.shop?.is_verified && <VerifiedBadge size={12} />}
                      </div>
                      <span className="font-tn-mono text-tn-mute shrink-0 text-[10px]">
                        {threadTime(inquiry.last_message_at)}
                      </span>
                    </div>
                    {inquiry.product && (
                      <div className="text-tn-mute mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium">
                        <Icon name="box" size={11} className="shrink-0" />
                        <span className="truncate">{inquiry.product.title}</span>
                      </div>
                    )}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-xs",
                          unread > 0 ? "text-tn-ink font-bold" : "text-tn-mute",
                        )}
                      >
                        {last ? `${last.sender_role === role ? "You: " : ""}${last.body}` : "Conversation started"}
                      </p>
                      {unread > 0 ? (
                        <span className="bg-tn-red font-tn-mono shrink-0 rounded-full px-1.5 text-[9.5px] font-bold text-white">
                          {unread}
                        </span>
                      ) : (
                        inquiry.status === "closed" && (
                          <span className="text-tn-mute shrink-0 text-[9.5px] font-bold uppercase">Resolved</span>
                        )
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Open thread ── */}
      <div
        className={cn(
          "bg-tn-paper/20 flex min-h-0 min-w-0 flex-1 flex-col",
          phoneView === "list" ? "hidden md:flex" : "flex",
        )}
      >
        {selected ? (
          <ConversationThread
            inquiry={selected}
            role={role}
            onSend={(body) => send(selected.id, body)}
            onResolve={() => resolve(selected.id)}
            onBack={() => setPhoneView("list")}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="border-tn-hair flex size-16 items-center justify-center rounded-2xl border bg-white">
              <Icon name="msg" size={28} className="text-tn-mute" />
            </div>
            <h2 className="text-tn-ink mt-4 text-base font-bold">
              {status === "ready" && selectedId !== null ? "Conversation not found" : "Select a conversation"}
            </h2>
            <p className="text-tn-mute mt-1 max-w-xs text-xs">
              {status === "ready" && selectedId !== null
                ? "It may belong to your other inbox, or it's no longer available."
                : role === "shop"
                  ? "Pick a customer on the left to read and reply."
                  : "Pick a shop on the left to read and reply."}
            </p>
            {selectedId !== null && (
              <button
                type="button"
                onClick={() => setPhoneView("list")}
                className="text-tn-red mt-3 cursor-pointer text-xs font-bold md:hidden"
              >
                Back to conversations
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading conversations">
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="flex gap-3 p-3.5">
          <div className="bg-tn-hair2 size-10 animate-pulse rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="bg-tn-hair2 h-3 w-1/2 animate-pulse rounded" />
            <div className="bg-tn-hair2 h-3 w-4/5 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListNotice({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="p-8 text-center">
      <Icon name="msg" size={24} className="text-tn-mute mx-auto mb-2 opacity-50" />
      <p className="text-tn-ink2 text-xs font-semibold">{title}</p>
      <p className="text-tn-mute mt-1 text-[11px]">{body}</p>
      {action && <div className="mt-3 text-xs">{action}</div>}
    </div>
  );
}
