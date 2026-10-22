"use client";

import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { cn } from "@/lib/utils";
import type { Inquiry, InquiryMessage } from "@/lib/types";

function formatMessageTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatThreadDate(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) return formatMessageTime(iso);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getDateGroupLabel(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function UnifiedMessagesView() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract initial id from path /messages/[id] or query ?inquiry=[id]
  const pathId = Array.isArray(params?.id)
    ? Number(params.id[0])
    : typeof params?.id === "string"
      ? Number(params.id)
      : null;
  const queryId = searchParams.get("inquiry") || searchParams.get("id");
  const initialTargetId =
    pathId && !Number.isNaN(pathId)
      ? pathId
      : queryId && !Number.isNaN(Number(queryId))
        ? Number(queryId)
        : null;

  const queryRole = searchParams.get("role");
  const [activeRole, setActiveRole] = useState<"buyer" | "shop">(
    queryRole === "shop" ? "shop" : "buyer",
  );

  const [hasMerchantShops, setHasMerchantShops] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(initialTargetId);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "open" | "resolved">("all");
  const [mobileView, setMobileView] = useState<"list" | "thread">(
    initialTargetId ? "thread" : "list",
  );
  const [copiedPhone, setCopiedPhone] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if current user is also a merchant (owns a shop)
  useEffect(() => {
    let ignore = false;
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const actualUser = data?.user || data;
          if (!ignore && actualUser?.shops && actualUser.shops.length > 0) {
            setHasMerchantShops(true);
          }
        }
      } catch {
        // Ignored; falls back to buyer
      }
    }
    void checkUser();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch inquiries whenever activeRole changes
  useEffect(() => {
    let ignore = false;
    async function loadInquiries() {
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          activeRole === "shop" ? "/api/inquiries/shop" : "/api/inquiries/buyer";
        const res = await fetch(endpoint);
        if (res.status === 401) {
          if (!ignore) {
            setError("Please sign in to view your messages.");
            setLoading(false);
          }
          return;
        }
        if (!res.ok) throw new Error("Failed to load conversations.");
        const data = await res.json();
        const list: Inquiry[] = Array.isArray(data) ? data : data.results || [];
        if (!ignore) {
          setInquiries(list);
          if (initialTargetId && list.some((i) => i.id === initialTargetId)) {
            setSelectedInquiryId(initialTargetId);
            setMobileView("thread");
          } else if (list.length > 0) {
            setSelectedInquiryId((curr) => (curr && list.some((i) => i.id === curr) ? curr : list[0].id));
          } else {
            setSelectedInquiryId(null);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error loading messages.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadInquiries();
    return () => {
      ignore = true;
    };
  }, [activeRole, initialTargetId]);

  // Fetch single thread history and mark read
  useEffect(() => {
    if (!selectedInquiryId) return;

    let cancelled = false;
    const loadThread = async () => {
      try {
        const endpoint =
          activeRole === "shop"
            ? `/api/inquiries/shop/${selectedInquiryId}`
            : `/api/inquiries/buyer/${selectedInquiryId}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Could not retrieve conversation.");
        const thread: Inquiry = await res.json();
        if (!cancelled) {
          setInquiries((prev) =>
            prev.map((item) =>
              item.id === thread.id
                ? {
                    ...thread,
                    buyer_unread: activeRole === "buyer" ? 0 : thread.buyer_unread,
                    shop_unread: activeRole === "shop" ? 0 : thread.shop_unread,
                  }
                : item,
            ),
          );
        }
      } catch (err) {
        console.error("Thread load error:", err);
      }
    };

    void loadThread();
    return () => {
      cancelled = true;
    };
  }, [selectedInquiryId, activeRole]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedInquiryId, inquiries]);

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId) ?? null;

  // Filter conversations
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const unreadCount = activeRole === "shop" ? inq.shop_unread : inq.buyer_unread;
      if (filterTab === "unread" && unreadCount === 0) return false;
      if (filterTab === "open" && inq.status !== "open") return false;
      if (filterTab === "resolved" && inq.status !== "closed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shopMatch = inq.shop?.name?.toLowerCase().includes(q);
        const buyerMatch = (inq.buyer_name || String(inq.buyer)).toLowerCase().includes(q);
        const productMatch = inq.product?.title?.toLowerCase().includes(q);
        const lastMsgMatch = inq.messages.some((m) =>
          m.body.toLowerCase().includes(q),
        );
        return shopMatch || buyerMatch || productMatch || lastMsgMatch;
      }
      return true;
    });
  }, [inquiries, filterTab, searchQuery, activeRole]);

  const totalUnreadCount = useMemo(() => {
    return inquiries.reduce((acc, curr) => {
      const count = activeRole === "shop" ? curr.shop_unread : curr.buyer_unread;
      return acc + (count || 0);
    }, 0);
  }, [inquiries, activeRole]);

  const handleSelectInquiry = (id: number) => {
    setSelectedInquiryId(id);
    setMobileView("thread");
    // Update browser URL cleanly without full page reload
    if (typeof window !== "undefined") {
      const roleParam = activeRole === "shop" ? "?role=shop" : "";
      window.history.replaceState(null, "", `/messages/${id}${roleParam}`);
    }
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedInquiryId || sending) return;

    const body = replyText.trim();
    setReplyText("");
    setSending(true);

    const senderRole = activeRole === "shop" ? "shop" : "buyer";
    const optimisticMessage: InquiryMessage = {
      id: Date.now(),
      inquiry: selectedInquiryId,
      body,
      sent_via: "web",
      sender_role: senderRole,
      created_at: new Date().toISOString(),
    };

    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === selectedInquiryId
          ? {
              ...inq,
              last_message_at: new Date().toISOString(),
              messages: [...inq.messages, optimisticMessage],
            }
          : inq,
      ),
    );

    try {
      const endpoint =
        activeRole === "shop"
          ? `/api/inquiries/shop/${selectedInquiryId}/reply`
          : `/api/inquiries/buyer/${selectedInquiryId}/reply`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (!res.ok) {
        throw new Error("Unable to deliver message right now.");
      }

      const updated: Inquiry = await res.json();
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === updated.id ? updated : inq)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendReply();
    }
  };

  const handleToggleResolve = async () => {
    if (!selectedInquiryId || !selectedInquiry) return;

    if (selectedInquiry.status === "open") {
      if (!confirm("Are you sure you want to mark this conversation as resolved?")) {
        return;
      }
      try {
        const endpoint =
          activeRole === "shop"
            ? `/api/inquiries/shop/${selectedInquiryId}/close`
            : `/api/inquiries/buyer/${selectedInquiryId}/close`;
        const res = await fetch(endpoint, { method: "POST" });
        if (!res.ok) throw new Error("Could not close inquiry.");
        const updated: Inquiry = await res.json();
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === updated.id ? updated : inq)),
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to update conversation.");
      }
    }
  };

  const handleCopyPhone = (phone?: string) => {
    if (!phone || !navigator.clipboard) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center h-[calc(100dvh-64px)]">
        <div className="flex flex-col items-center">
          <div className="bg-tn-paper inline-flex size-14 items-center justify-center rounded-2xl animate-pulse">
            <Icon name="msg" size={24} className="text-tn-mute" />
          </div>
          <p className="text-tn-ink2 mt-4 text-sm font-semibold">Loading messages…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center h-[calc(100dvh-64px)]">
        <div className="border-tn-hair max-w-md rounded-[24px] border bg-white p-8 shadow-sm">
          <div className="bg-tn-paper mx-auto inline-flex size-14 items-center justify-center rounded-2xl">
            <Icon name="msg" size={24} className="text-tn-ink" />
          </div>
          <h2 className="text-tn-ink mt-4 text-xl font-extrabold">{error}</h2>
          <p className="text-tn-mute mt-2 text-xs leading-relaxed">
            Sign in to chat directly with verified Addis Ababa merchants and keep track of your product inquiries.
          </p>
          <div className="mt-6">
            <Link
              href="/signin?next=/messages"
              className="bg-tn-red hover:bg-tn-red-dark inline-flex h-10 items-center justify-center rounded-full px-6 text-xs font-bold text-white transition-colors"
            >
              Sign in to Tinsae
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] w-full overflow-hidden bg-tn-paper flex flex-col p-2 sm:p-4 md:p-5">
      <div className="border-tn-hair relative flex flex-1 min-h-0 w-full max-w-7xl mx-auto overflow-hidden rounded-[24px] border bg-white shadow-sm">
        {/* LEFT COLUMN: CONVERSATION INBOX */}
        <div
          className={cn(
            "border-tn-hair flex flex-col border-r bg-white min-h-0",
            "w-full md:w-80 lg:w-[360px] shrink-0",
            mobileView === "thread" ? "hidden md:flex" : "flex",
          )}
        >
          {/* Header & Role Switcher */}
          <div className="border-tn-hair2 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-tn-ink text-lg font-extrabold tracking-tight">
                  Messages
                </h1>
                {totalUnreadCount > 0 && (
                  <span className="bg-tn-red font-tn-mono rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                    {totalUnreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Merchant / Buyer Role Switcher (Shown only if user owns a shop) */}
            {hasMerchantShops && (
              <div className="bg-tn-paper mt-3 flex rounded-xl p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("buyer");
                    if (typeof window !== "undefined") {
                      window.history.replaceState(null, "", "/messages");
                    }
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all cursor-pointer",
                    activeRole === "buyer"
                      ? "bg-white text-tn-ink shadow-xs"
                      : "text-tn-mute hover:text-tn-ink",
                  )}
                >
                  <Icon name="msg" size={13} />
                  <span>Buying</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("shop");
                    if (typeof window !== "undefined") {
                      window.history.replaceState(null, "", "/messages?role=shop");
                    }
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all cursor-pointer",
                    activeRole === "shop"
                      ? "bg-white text-tn-ink shadow-xs"
                      : "text-tn-mute hover:text-tn-ink",
                  )}
                >
                  <Icon name="store" size={13} />
                  <span>My Shop</span>
                </button>
              </div>
            )}

            {hasMerchantShops && activeRole === "shop" && (
              <Link
                href="/shop/dashboard/inquiries"
                className="mt-2.5 flex items-center justify-between rounded-xl bg-tn-paper px-3 py-2 text-xs font-semibold text-tn-ink2 hover:bg-tn-hair2 transition-colors"
              >
                <span>Open in Shop Dashboard</span>
                <Icon name="arrow" size={13} />
              </Link>
            )}

            {/* Search Box */}
            <div className="relative mt-3">
              <Icon
                name="search"
                size={15}
                className="text-tn-mute absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeRole === "shop"
                    ? "Search customers or listings..."
                    : "Search shops or listings..."
                }
                className="border-tn-hair focus:border-tn-ink text-tn-ink placeholder:text-tn-mute w-full rounded-xl border bg-tn-paper/40 py-2 pr-3 pl-9 text-xs focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="mt-3 flex gap-1 text-[11px] font-bold">
              {[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "open", label: "Active" },
                { id: "resolved", label: "Resolved" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id as typeof filterTab)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-center transition-colors cursor-pointer",
                    filterTab === tab.id
                      ? "bg-tn-ink text-white"
                      : "text-tn-mute hover:bg-tn-paper hover:text-tn-ink",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-tn-hair2">
            {filteredInquiries.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="msg" size={24} className="text-tn-mute mx-auto mb-2 opacity-50" />
                <p className="text-tn-ink2 text-xs font-semibold">No conversations found</p>
                <p className="text-tn-mute mt-1 text-[11px]">
                  {searchQuery
                    ? "Try a different search query"
                    : activeRole === "shop"
                      ? "Customer questions about your shop listings will appear here."
                      : "Reach out to a shop to start messaging."}
                </p>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => {
                const isSelected = inquiry.id === selectedInquiryId;
                const lastMsg = inquiry.messages[inquiry.messages.length - 1];
                const unreadCount =
                  activeRole === "shop" ? inquiry.shop_unread : inquiry.buyer_unread;
                const isUnread = (unreadCount || 0) > 0;

                // When viewing as shop owner, display buyer name. As buyer, display shop name.
                const displayName =
                  activeRole === "shop"
                    ? inquiry.buyer_name || `Customer #${inquiry.buyer}`
                    : inquiry.shop?.name || "Shop";

                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => handleSelectInquiry(inquiry.id)}
                    className={cn(
                      "w-full p-3.5 text-left transition-colors cursor-pointer flex gap-3 items-start relative",
                      isSelected ? "bg-tn-paper/70 font-semibold" : "hover:bg-tn-paper/30",
                    )}
                  >
                    {isSelected && (
                      <span className="bg-tn-ink absolute inset-y-0 left-0 w-1" />
                    )}

                    <div className="bg-tn-paper border-tn-hair relative flex size-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold text-tn-ink">
                      {displayName.slice(0, 2).toUpperCase()}
                      {isUnread && (
                        <span className="bg-tn-red absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={cn(
                              "truncate text-xs",
                              isUnread ? "font-extrabold text-tn-ink" : "font-bold text-tn-ink2",
                            )}
                          >
                            {displayName}
                          </span>
                          {activeRole === "buyer" && inquiry.shop?.is_verified && (
                            <VerifiedBadge size={12} />
                          )}
                        </div>
                        <span className="font-tn-mono text-tn-mute shrink-0 text-[10px]">
                          {formatThreadDate(inquiry.last_message_at)}
                        </span>
                      </div>

                      {inquiry.product && (
                        <div className="text-tn-mute mt-0.5 truncate text-[11px] font-medium flex items-center gap-1">
                          <Icon name="box" size={11} className="shrink-0" />
                          <span className="truncate">{inquiry.product.title}</span>
                        </div>
                      )}

                      <p
                        className={cn(
                          "mt-1 truncate text-xs",
                          isUnread ? "font-bold text-tn-ink" : "text-tn-mute",
                        )}
                      >
                        {lastMsg?.body || "Inquiry started"}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                            inquiry.status === "open"
                              ? "bg-tn-green-soft text-tn-green"
                              : "bg-neutral-100 text-neutral-500",
                          )}
                        >
                          {inquiry.status}
                        </span>
                        {isUnread && (
                          <span className="bg-tn-red font-tn-mono rounded-full px-1.5 py-0.2 text-[9.5px] font-bold text-white">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT THREAD */}
        <div
          className={cn(
            "flex flex-1 flex-col bg-tn-paper/20 min-w-0 min-h-0",
            mobileView === "list" ? "hidden md:flex" : "flex",
          )}
        >
          {selectedInquiry ? (
            <>
              {/* Thread Header Bar */}
              <div className="border-tn-hair2 bg-white flex items-center justify-between border-b px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileView("list")}
                    className="text-tn-mute hover:text-tn-ink md:hidden p-1.5 cursor-pointer rounded-full hover:bg-tn-paper"
                    aria-label="Back to conversations list"
                  >
                    <Icon name="back" size={18} />
                  </button>

                  <div className="bg-tn-paper border-tn-hair hidden sm:flex size-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold text-tn-ink">
                    {(activeRole === "shop"
                      ? selectedInquiry.buyer_name || `C${selectedInquiry.buyer}`
                      : selectedInquiry.shop.name
                    ).slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {activeRole === "shop" ? (
                        <span className="text-tn-ink truncate text-sm font-extrabold">
                          {selectedInquiry.buyer_name || `Customer #${selectedInquiry.buyer}`}
                        </span>
                      ) : (
                        <Link
                          href={`/shops/${selectedInquiry.shop.slug}`}
                          className="text-tn-ink hover:text-tn-red truncate text-sm font-extrabold transition-colors"
                        >
                          {selectedInquiry.shop.name}
                        </Link>
                      )}
                      {activeRole === "buyer" && selectedInquiry.shop.is_verified && (
                        <VerifiedBadge size={14} />
                      )}
                    </div>

                    <div className="text-tn-mute flex items-center gap-2 text-[11px]">
                      {activeRole === "shop" ? (
                        <span>Customer Lead for {selectedInquiry.shop.name}</span>
                      ) : (
                        selectedInquiry.shop.city && (
                          <span className="flex items-center gap-1">
                            <Icon name="pin" size={11} />
                            <span>{selectedInquiry.shop.city}</span>
                          </span>
                        )
                      )}
                      <span>·</span>
                      <span className="capitalize">{selectedInquiry.status} inquiry</span>
                    </div>
                  </div>
                </div>

                {/* Direct Reach / Actions */}
                <div className="flex items-center gap-2">
                  {activeRole === "buyer" && selectedInquiry.shop.telegram_username && (
                    <a
                      href={`https://t.me/${selectedInquiry.shop.telegram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-tn-hair hover:border-[#229ED9] hover:text-[#229ED9] bg-white text-tn-ink2 hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition-colors"
                    >
                      <Icon name="tg" size={13} className="text-[#229ED9]" />
                      <span>Telegram</span>
                    </a>
                  )}

                  {activeRole === "buyer" && selectedInquiry.shop.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(selectedInquiry.shop.phone)}
                      className="border-tn-hair hover:border-tn-ink bg-white text-tn-ink2 hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Icon
                        name={copiedPhone ? "check" : "phone"}
                        size={12}
                        className={copiedPhone ? "text-tn-green" : "text-tn-mute"}
                      />
                      <span>{copiedPhone ? "Copied!" : "Phone"}</span>
                    </button>
                  )}

                  {selectedInquiry.status === "open" ? (
                    <button
                      type="button"
                      onClick={handleToggleResolve}
                      className="border-tn-hair hover:border-tn-ink hover:bg-tn-paper bg-white text-tn-mute hover:text-tn-ink inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Mark resolved
                    </button>
                  ) : (
                    <span className="border-tn-hair bg-tn-paper text-tn-mute inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-bold">
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Product Reference Banner (Clickable Card) */}
              {selectedInquiry.product && (
                <Link
                  href={`/products/${selectedInquiry.product.slug}`}
                  className="group border-tn-hair2 bg-white/90 hover:bg-tn-paper/70 backdrop-blur-xs flex items-center justify-between border-b px-4 py-2.5 sm:px-6 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedInquiry.product.images?.[0]?.url ? (
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-tn-hair">
                        <Image
                          src={selectedInquiry.product.images[0].url}
                          alt={selectedInquiry.product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="bg-tn-paper border-tn-hair flex size-11 shrink-0 items-center justify-center rounded-lg border text-tn-mute">
                        <Icon name="box" size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-tn-ink group-hover:text-tn-red truncate text-xs font-bold transition-colors">
                        {selectedInquiry.product.title}
                      </p>
                      <p className="font-tn-mono text-tn-ink2 text-[11px] font-semibold mt-0.5">
                        {selectedInquiry.product.price} {selectedInquiry.product.currency}
                      </p>
                    </div>
                  </div>

                  <span className="text-tn-red group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0 text-xs font-bold ml-2">
                    <span>View listing</span>
                    <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              )}

              {/* Message Feed */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
                {selectedInquiry.messages.map((msg, index) => {
                  // In buyer mode: sender_role === "buyer" is on right (You).
                  // In shop mode: sender_role === "shop" is on right (You as merchant).
                  const isSentByMe =
                    activeRole === "shop"
                      ? msg.sender_role === "shop"
                      : msg.sender_role === "buyer";

                  const prevMsg = selectedInquiry.messages[index - 1];
                  const showDateGroup =
                    !prevMsg ||
                    getDateGroupLabel(prevMsg.created_at) !==
                      getDateGroupLabel(msg.created_at);

                  return (
                    <div key={msg.id} className="space-y-3">
                      {showDateGroup && (
                        <div className="flex justify-center my-3">
                          <span className="border-tn-hair bg-white/90 text-tn-mute rounded-full border px-3 py-0.5 text-[10.5px] font-semibold shadow-2xs">
                            {getDateGroupLabel(msg.created_at)}
                          </span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "flex flex-col",
                          isSentByMe ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[70%] rounded-[18px] px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                            isSentByMe
                              ? "bg-tn-ink text-white rounded-br-xs"
                              : "bg-white border-tn-hair text-tn-ink border rounded-bl-xs",
                          )}
                        >
                          {msg.body}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-tn-mute font-tn-mono">
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {!isSentByMe && (
                            <span className="flex items-center gap-1">
                              · {msg.sent_via === "telegram" ? "via Telegram" : "via Web"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Reply Composer */}
              {selectedInquiry.status === "open" ? (
                <div className="border-tn-hair2 bg-white border-t p-3 sm:p-4">
                  {/* Quick-reply Suggestions */}
                  <div className="mb-2 flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                    {(activeRole === "shop"
                      ? [
                          "Yes, it is in stock!",
                          "You can visit our shop today.",
                          "We can deliver in Addis.",
                          "Best price is as listed.",
                        ]
                      : [
                          "Thank you!",
                          "When can I visit the shop?",
                          "Where is your exact location?",
                          "Is price negotiable?",
                        ]
                    ).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setReplyText(prompt);
                          textareaRef.current?.focus();
                        }}
                        className="border-tn-hair hover:border-tn-ink hover:bg-tn-paper text-tn-ink2 rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendReply} className="flex items-end gap-2">
                    <div className="relative flex-1">
                      <textarea
                        ref={textareaRef}
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          activeRole === "shop"
                            ? `Reply to customer as ${selectedInquiry.shop.name}...`
                            : `Write a reply to ${selectedInquiry.shop.name}...`
                        }
                        disabled={sending}
                        className="border-tn-hair focus:border-tn-ink text-tn-ink placeholder:text-tn-mute w-full resize-none rounded-2xl border bg-tn-paper/40 p-3 text-xs focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className="bg-tn-red hover:bg-tn-red-dark inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer mb-1"
                      aria-label="Send reply"
                    >
                      <Icon name="arrow" size={17} />
                    </button>
                  </form>
                  <p className="text-tn-mute mt-1 text-[10px]">
                    Press Enter to send · Shift+Enter for newline
                  </p>
                </div>
              ) : (
                <div className="border-tn-hair2 bg-tn-paper/50 border-t p-4 text-center text-xs text-tn-mute">
                  This conversation has been marked as resolved. Contact the shop from their listing or profile to open a new inquiry.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="bg-white border-tn-hair flex size-16 items-center justify-center rounded-2xl border shadow-xs">
                <Icon name="msg" size={28} className="text-tn-mute" />
              </div>
              <h2 className="text-tn-ink mt-4 text-base font-bold">Select a conversation</h2>
              <p className="text-tn-mute mt-1 max-w-xs text-xs">
                {activeRole === "shop"
                  ? "Choose a customer message from the left panel to review questions and reply."
                  : "Choose a chat from the left panel to review message history and reply to merchants."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessagesLoadingFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center h-[calc(100dvh-64px)]">
      <div className="flex flex-col items-center">
        <div className="bg-tn-paper inline-flex size-14 items-center justify-center rounded-2xl animate-pulse">
          <Icon name="msg" size={24} className="text-tn-mute" />
        </div>
        <p className="text-tn-ink2 mt-4 text-sm font-semibold">Loading messages…</p>
      </div>
    </div>
  );
}

export default function BuyerMessagesPage() {
  return (
    <Suspense fallback={<MessagesLoadingFallback />}>
      <UnifiedMessagesView />
    </Suspense>
  );
}

