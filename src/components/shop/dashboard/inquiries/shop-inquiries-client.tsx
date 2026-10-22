"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";
import { formatETB } from "@/lib/format";
import { resolveProductImages } from "@/lib/product-images";
import type { AuthShop } from "@/lib/auth/types";
import type { Inquiry } from "@/lib/types";

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function formatExactTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function getInitials(name?: string): string {
  if (!name) return "C";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type TabKey = "all" | "unread" | "open" | "closed";

export default function ShopInquiriesClient({
  shop: _shop,
  initialSelectedId,
}: {
  shop: AuthShop;
  initialSelectedId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId ?? null
  );
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const activeId = searchParams.get("id") || selectedId;
  const selectedInquiry = useMemo(
    () => inquiries.find((i) => String(i.id) === String(activeId)) ?? null,
    [inquiries, activeId]
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedId(null);
    router.replace("/shop/dashboard/inquiries");
  }, [router]);

  // Escape key closes detail drawer
  useEffect(() => {
    if (!selectedInquiry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedInquiry, handleCloseDrawer]);

  // Scroll to bottom when conversation messages change
  const messageCount = selectedInquiry?.messages?.length ?? 0;
  useEffect(() => {
    if (messageCount > 0) {
      scrollToBottom();
    }
  }, [messageCount]);

  // Fetch inquiries on mount / param changes
  useEffect(() => {
    let ignore = false;
    const targetId = searchParams.get("id") || initialSelectedId;

    fetch("/api/inquiries/shop", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (ignore) return;
        const list: Inquiry[] = Array.isArray(data) ? data : data.results || [];
        setInquiries(list);

        if (targetId) {
          const found = list.find((i) => String(i.id) === String(targetId));
          if (found && found.shop_unread > 0) {
            fetch(`/api/inquiries/shop/${found.id}`)
              .then(() => {
                if (ignore) return;
                setInquiries((prev) =>
                  prev.map((item) =>
                    item.id === found.id ? { ...item, shop_unread: 0 } : item
                  )
                );
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [searchParams, initialSelectedId]);

  const handleSelectInquiry = (inquiry: Inquiry) => {
    setSelectedId(String(inquiry.id));
    router.replace(`/shop/dashboard/inquiries?id=${inquiry.id}`);

    // Mark as read immediately on open
    if (inquiry.shop_unread > 0) {
      fetch(`/api/inquiries/shop/${inquiry.id}`)
        .then(() => {
          setInquiries((prev) =>
            prev.map((item) =>
              item.id === inquiry.id ? { ...item, shop_unread: 0 } : item
            )
          );
        })
        .catch(() => {});
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim() || sending) return;

    setSending(true);
    const body = replyText.trim();
    setReplyText("");

    try {
      const res = await fetch(`/api/inquiries/shop/${selectedInquiry.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (res.ok) {
        const updated: Inquiry = await res.json();
        setInquiries((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        setReplyText(body);
      }
    } catch {
      setReplyText(body);
    } finally {
      setSending(false);
    }
  };

  const handleCloseInquiry = async () => {
    if (!selectedInquiry || closing) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/inquiries/shop/${selectedInquiry.id}/close`, {
        method: "POST",
      });
      if (res.ok) {
        const updated: Inquiry = await res.json();
        setInquiries((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }
    } catch {
      // ignore
    } finally {
      setClosing(false);
    }
  };

  // Pipeline stats calculations
  const needsReplyCount = useMemo(
    () =>
      inquiries.filter(
        (i) =>
          i.shop_unread > 0 ||
          (i.status === "open" && i.last_sender_role === "buyer")
      ).length,
    [inquiries]
  );

  const activeCount = useMemo(
    () => inquiries.filter((i) => i.status === "open").length,
    [inquiries]
  );

  const totalLeadsCount = inquiries.length;

  const resolvedCount = useMemo(
    () => inquiries.filter((i) => i.status === "closed").length,
    [inquiries]
  );

  // Filtered inquiries for active tab
  const filteredInquiries = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return inquiries.filter(
          (i) =>
            i.shop_unread > 0 ||
            (i.status === "open" && i.last_sender_role === "buyer")
        );
      case "open":
        return inquiries.filter((i) => i.status === "open");
      case "closed":
        return inquiries.filter((i) => i.status === "closed");
      case "all":
      default:
        return inquiries;
    }
  }, [inquiries, activeTab]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* 1. Pipeline Stats Cards (4-column grid, gap: 14 per design spec) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
        {/* Needs Reply */}
        <div className="bg-white border border-tn-hair rounded-[16px] p-[16px_18px] shadow-xs flex flex-col justify-between hover:border-tn-ink/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
              Needs Reply
            </span>
            <div className="size-7 rounded-lg bg-[#CC3000]/10 flex items-center justify-center text-tn-red">
              <Icon name="bell" size={15} />
            </div>
          </div>
          <div className="my-2">
            <span className="font-tn-mono text-2xl sm:text-[30px] font-semibold tracking-[-0.03em] text-tn-ink">
              {needsReplyCount}
            </span>
          </div>
          <span className="text-xs text-tn-mute">Awaiting first reply</span>
        </div>

        {/* In Chat */}
        <div className="bg-white border border-tn-hair rounded-[16px] p-[16px_18px] shadow-xs flex flex-col justify-between hover:border-tn-ink/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
              In Chat
            </span>
            <div className="size-7 rounded-lg bg-[#229ED9]/15 flex items-center justify-center text-[#229ED9]">
              <Icon name="msg" size={15} />
            </div>
          </div>
          <div className="my-2">
            <span className="font-tn-mono text-2xl sm:text-[30px] font-semibold tracking-[-0.03em] text-tn-ink">
              {activeCount}
            </span>
          </div>
          <span className="text-xs text-tn-mute">Conversations active</span>
        </div>

        {/* Total Leads */}
        <div className="bg-white border border-tn-hair rounded-[16px] p-[16px_18px] shadow-xs flex flex-col justify-between hover:border-tn-ink/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
              Total Leads
            </span>
            <div className="size-7 rounded-lg bg-[#B8741F]/15 flex items-center justify-center text-[#B8741F]">
              <Icon name="phone" size={15} />
            </div>
          </div>
          <div className="my-2">
            <span className="font-tn-mono text-2xl sm:text-[30px] font-semibold tracking-[-0.03em] text-tn-ink">
              {totalLeadsCount}
            </span>
          </div>
          <span className="text-xs text-tn-mute">Product & shop inquiries</span>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-tn-hair rounded-[16px] p-[16px_18px] shadow-xs flex flex-col justify-between hover:border-tn-ink/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-tn-mute">
              Resolved
            </span>
            <div className="size-7 rounded-lg bg-[#1F8A5B]/15 flex items-center justify-center text-[#1F8A5B]">
              <Icon name="check" size={15} />
            </div>
          </div>
          <div className="my-2">
            <span className="font-tn-mono text-2xl sm:text-[30px] font-semibold tracking-[-0.03em] text-tn-ink">
              {resolvedCount}
            </span>
          </div>
          <span className="text-xs text-tn-mute">Completed inquiries</span>
        </div>
      </div>

      {/* 2. Filter Tabs (padding: 11px 15px per spec) */}
      <div className="flex items-center gap-1 border-b border-tn-hair2 overflow-x-auto no-scrollbar">
        {[
          { key: "all", label: "All", count: totalLeadsCount },
          { key: "unread", label: "Needs reply", count: needsReplyCount },
          { key: "open", label: "In chat", count: activeCount },
          { key: "closed", label: "Resolved", count: resolvedCount },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={cn(
                "flex items-center gap-2 px-[15px] py-[11px] text-[13.5px] transition-colors relative font-semibold shrink-0 cursor-pointer",
                isActive
                  ? "text-tn-ink font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-tn-red"
                  : "text-tn-mute hover:text-tn-ink"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "font-tn-mono text-[11px] px-2 py-0.5 rounded-full font-bold",
                  isActive
                    ? "bg-tn-ink text-white"
                    : "bg-tn-paper text-tn-mute"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Leads List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-tn-hair rounded-[15px] p-[16px_18px] h-28 animate-pulse"
            />
          ))}
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white border border-tn-hair rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="size-14 rounded-2xl bg-tn-paper flex items-center justify-center text-tn-mute mb-3">
            <Icon name="msg" size={24} />
          </div>
          <h3 className="text-tn-ink font-bold text-base">No inquiries found</h3>
          <p className="text-tn-mute text-xs max-w-sm mt-1">
            {activeTab === "unread"
              ? "All customer inquiries have been answered. Nice job!"
              : "When customers contact your shop about products, conversations will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const isUnread = inquiry.shop_unread > 0;
            const lastMsg = inquiry.messages?.slice(-1)[0];
            const product = inquiry.product;
            const productImgs = product
              ? resolveProductImages(product.images)
              : [];
            const primaryImg = productImgs[0];

            return (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => handleSelectInquiry(inquiry)}
                className={cn(
                  "w-full bg-white rounded-[15px] border text-left p-[16px_18px] transition-all cursor-pointer relative block",
                  isUnread
                    ? "border-[#ECEAE3] hover:border-tn-red/50 shadow-xs bg-[#FCFBF9]"
                    : "border-[#F2F0EA] hover:border-tn-hair hover:bg-[#FCFBF9]"
                )}
              >
                <div className="flex items-start gap-[15px]">
                  {/* Buyer Avatar with channel badge */}
                  <div className="relative shrink-0">
                    <div className="size-[44px] rounded-full bg-tn-ink text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {getInitials(inquiry.buyer_name)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 size-[19px] rounded-full bg-white border border-tn-hair shadow-xs flex items-center justify-center text-[#229ED9]">
                      <Icon name="tg" size={11} />
                    </div>
                  </div>

                  {/* Lead Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {isUnread && (
                          <span className="size-[7px] rounded-full bg-tn-red shrink-0" />
                        )}
                        <span className="text-[15px] font-extrabold text-tn-ink truncate">
                          @{inquiry.buyer_name || "customer"}
                        </span>
                        {inquiry.status === "closed" ? (
                          <span className="bg-[#E8F5EE] text-[#1F8A5B] text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            Resolved
                          </span>
                        ) : isUnread ? (
                          <span className="bg-tn-red-soft text-tn-red text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            Needs reply
                          </span>
                        ) : (
                          <span className="bg-[#EBF7FD] text-[#229ED9] text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            In chat
                          </span>
                        )}
                      </div>
                      <span className="font-tn-mono text-[11.5px] text-tn-mute shrink-0">
                        {formatRelativeTime(inquiry.last_message_at)}
                      </span>
                    </div>

                    {/* Preview message snippet */}
                    <p
                      className={cn(
                        "text-[13.5px] line-clamp-1 mt-1",
                        isUnread
                          ? "font-semibold text-[#3A3A38]"
                          : "font-medium text-[#76746E]"
                      )}
                    >
                      {lastMsg?.body || "Inquiry started"}
                    </p>

                    {/* Embedded Product Chip */}
                    {product && (
                      <div className="inline-flex items-center gap-2 bg-[#F7F6F2] border border-[#F2F0EA] rounded-[9px] px-[10px] py-[5px] pl-[6px] mt-2.5 max-w-full sm:max-w-md">
                        {primaryImg ? (
                          <Image
                            src={primaryImg}
                            alt={product.title}
                            width={26}
                            height={30}
                            unoptimized
                            className="size-[26px] h-[30px] rounded object-cover shrink-0 bg-white"
                          />
                        ) : (
                          <div className="size-[26px] h-[30px] rounded bg-white border border-tn-hair flex items-center justify-center shrink-0 text-tn-mute">
                            <Icon name="box" size={13} />
                          </div>
                        )}
                        <span className="text-[12.5px] font-bold text-tn-ink truncate max-w-[220px]">
                          {product.title}
                        </span>
                        <span className="font-tn-mono text-xs font-semibold text-tn-ink ml-auto shrink-0 pl-1.5">
                          {formatETB(product.price)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Slide-in Detail Drawer (432px per design spec) */}
      {selectedInquiry && (
        <>
          {/* Backdrop Scrim */}
          <button
            type="button"
            aria-label="Close conversation drawer"
            onClick={handleCloseDrawer}
            className="fixed inset-0 bg-tn-ink/40 backdrop-blur-xs z-40 transition-opacity cursor-pointer"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[432px] max-w-[92vw] bg-white shadow-[-20px_0_60px_rgba(11,11,11,0.22)] z-50 flex flex-col border-l border-tn-hair animate-in slide-in-from-right duration-200">
            {/* Drawer Header (padding: 20px 22px per spec) */}
            <div className="p-[20px_22px] border-b border-tn-hair2 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-full bg-tn-ink text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {getInitials(selectedInquiry.buyer_name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-extrabold text-tn-ink truncate">
                      @{selectedInquiry.buyer_name || "customer"}
                    </span>
                    {selectedInquiry.status === "closed" ? (
                      <span className="bg-[#E8F5EE] text-[#1F8A5B] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Resolved
                      </span>
                    ) : (
                      <span className="bg-[#EBF7FD] text-[#229ED9] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        In chat
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-tn-mute">
                    Customer Inquiry #{selectedInquiry.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="size-[34px] rounded-full hover:bg-tn-paper flex items-center justify-center text-tn-ink transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <Icon name="back" size={18} className="rotate-180" />
              </button>
            </div>

            {/* Product Context Banner */}
            {selectedInquiry.product && (
              <div className="p-[14px_22px] bg-tn-paper/70 border-b border-tn-hair2 shrink-0">
                <Link
                  href={`/products/${selectedInquiry.product.slug || selectedInquiry.product.id}`}
                  target="_blank"
                  className="flex items-center justify-between gap-3 bg-white border border-tn-hair rounded-[14px] p-3 hover:border-tn-ink/30 transition shadow-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {resolveProductImages(selectedInquiry.product.images)[0] ? (
                      <Image
                        src={
                          resolveProductImages(selectedInquiry.product.images)[0]
                        }
                        alt={selectedInquiry.product.title}
                        width={50}
                        height={60}
                        unoptimized
                        className="w-[50px] h-[60px] rounded-lg object-cover shrink-0 bg-tn-paper border border-tn-hair"
                      />
                    ) : (
                      <div className="w-[50px] h-[60px] rounded-lg bg-tn-paper border border-tn-hair flex items-center justify-center shrink-0 text-tn-mute">
                        <Icon name="box" size={20} />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-tn-mute uppercase tracking-wider">
                        Discussing product
                      </span>
                      <span className="text-[14.5px] font-extrabold text-tn-ink truncate group-hover:text-tn-red transition-colors">
                        {selectedInquiry.product.title}
                      </span>
                      <span className="font-tn-mono text-base font-semibold text-tn-red">
                        {formatETB(selectedInquiry.product.price)}
                      </span>
                    </div>
                  </div>
                  <div className="text-tn-mute group-hover:text-tn-ink p-1">
                    <Icon name="arrow" size={16} />
                  </div>
                </Link>
              </div>
            )}

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-[20px_22px] space-y-3.5 bg-white">
              {selectedInquiry.messages?.length === 0 ? (
                <div className="text-center py-8 text-xs text-tn-mute">
                  No messages recorded in this conversation yet.
                </div>
              ) : (
                selectedInquiry.messages?.map((msg) => {
                  const isShop = msg.sender_role === "shop";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        isShop ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-xs",
                          isShop
                            ? "bg-tn-ink text-white rounded-br-xs"
                            : "bg-tn-paper text-tn-ink border border-tn-hair2 rounded-bl-xs"
                        )}
                      >
                        {msg.body}
                      </div>
                      <span className="font-tn-mono text-[10px] text-tn-mute mt-1 px-1">
                        {formatExactTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Drawer Composer & Outcome Footer (padding: 16px 22px per spec) */}
            <div className="p-[16px_22px] border-t border-tn-hair2 bg-[#F7F6F2] shrink-0">
              {selectedInquiry.status === "open" ? (
                <form onSubmit={handleSendReply} className="flex flex-col gap-2.5">
                  <div className="flex items-end gap-2 bg-white border border-tn-hair rounded-2xl p-1.5 focus-within:border-tn-ink/40 shadow-xs">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                      placeholder="Type a reply to customer…"
                      className="flex-1 resize-none bg-transparent px-3 py-1.5 text-sm text-tn-ink placeholder:text-tn-mute focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className="bg-tn-red hover:bg-tn-red-dark text-white size-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                      aria-label="Send reply"
                    >
                      <Icon name="arrow" size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-tn-mute">
                      Press Enter to send · Shift+Enter for new line
                    </span>
                    <button
                      type="button"
                      disabled={closing}
                      onClick={handleCloseInquiry}
                      className="text-xs font-bold text-tn-ink2 hover:text-tn-red cursor-pointer transition-colors"
                    >
                      {closing ? "Closing…" : "Mark as Resolved"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 bg-white border border-tn-hair rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-tn-mute">
                    <Icon name="check" size={14} className="text-[#1F8A5B]" />
                    <span>This conversation is marked as resolved.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
