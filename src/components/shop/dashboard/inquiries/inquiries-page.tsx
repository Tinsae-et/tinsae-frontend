"use client"
import {
  Inbox,
} from "lucide-react";
import { LeadCard, Stats, Status, STATUS_ORDER } from "@/components/shop/dashboard/inquiries/inquiries";
import { Inquiry } from "@/lib/types";
import { useMemo, useState } from "react";

const filterNew = (time: string) => {
  const now = Date.now();
  const _then = new Date(time).getTime();
  return now - _then < 6 * 60 * 60 * 1000
}

export function InquiriesPage({ inquiries }: { inquiries: Inquiry[] }) {
  const [tab, setTab] = useState<Status | "all">("all");

  const visible = inquiries.sort(
    (a, b) =>
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );
  



  const filtered = useMemo(() => {
    if (tab === "all") return visible;
    if (tab === "in chat") return visible.filter((i) => i.status === "open");
    if (tab === "new") return visible.filter((i) => filterNew(i.last_message_at))
    return visible
  }, [tab, visible]);

  const countFor = (tab: string) => {
    if (tab === "new") return visible.filter((i) => filterNew(i.last_message_at)).length
    if (tab === "in chat") return visible.filter((i) => i.status === "open").length
    return visible.length
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full space-y-6">
        <h1 className="sr-only">Inquiries</h1>

        {/* Stats */}
        <Stats inquiries={inquiries} />

        {/* Tabs */}
        <div
          role="tablist"
          className="flex gap-6 overflow-x-auto border-b border-neutral-200 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            onClick={() => setTab("all")}
            role="tab"
            aria-selected={tab === "all"}
            className={`-mb-px flex shrink-0 items-start gap-3 border-b-2 pb-3 px-3 capitalize text-sm font-semibold transition-colors ${tab === "all"
              ? "border-orange-600 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
          >
            all
            <span
              className={`font-mono text-[10px] ${tab === "all" ? "text-orange-600" : "text-neutral-400"
                }`}
            >
              {countFor("all")}
            </span>
          </button>
          {STATUS_ORDER.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={active}
                className={`-mb-px flex shrink-0 items-start gap-1 border-b-2 pb-3 capitalize text-sm font-semibold transition-colors ${active
                  ? "border-orange-600 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
              >
                {t}
                <span
                  className={`font-mono text-[10px] ${active ? "text-orange-600" : "text-neutral-400"
                    }`}
                >
                  {countFor(t)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lead list */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
              <Inbox className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="mt-4 font-semibold text-neutral-900">
              No leads here
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500">
              New inquiries from buyers will show up in this list.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                inquiry={lead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}