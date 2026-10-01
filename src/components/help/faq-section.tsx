"use client"

import { X } from "lucide-react";
import { useState } from "react";
import { Icon } from "../tinsae/icon";

type TopicId = "buyers" | "shops" | "trust" | "account";

interface Topic {
    id: TopicId;
    label: string;
}

interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

const TOPICS: Topic[] = [
    { id: "buyers", label: "Buyers" },
    { id: "shops", label: "Shops" },
    { id: "trust", label: "Trust & safety" },
    { id: "account", label: "Account & billing" },
];

const FAQS: Record<TopicId, FaqItem[]> = {
    buyers: [
        {
            id: "free",
            question: "Is Tinsae free for buyers?",
            answer:
                "Completely. Browsing, comparing, saving listings and setting alerts are all free. You never pay Tinsae anything — you pay the shop directly, in person.",
        },
        {
            id: "contact",
            question: "How do I contact a shop?",
            answer:
                "Open any listing and use the contact button to message the shop on Telegram or call them directly.",
        },
        {
            id: "freshness",
            question: "What does the freshness dot mean?",
            answer:
                "A green dot means the shop confirmed the listing recently. A grey dot means it hasn't been confirmed in a while.",
        },
        {
            id: "deposit",
            question: "Do I have to pay a deposit before visiting?",
            answer:
                "No. Tinsae never collects payments or deposits — you deal with the shop directly when you visit.",
        },
    ],
    shops: [
        {
            id: "list",
            question: "How do I list a product?",
            answer:
                "Go to your shop dashboard, click Listings, then New listing, and fill in the details.",
        },
        {
            id: "telegram-connect",
            question: "How do I connect my shop to the Telegram bot?",
            answer:
                "Go to your Shop Dashboard → Telegram, tap 'Connect Telegram', and tap the button to open @tinsae_et_bot in Telegram (or send /link YOUR-CODE). Your chat is bound immediately.",
        },
        {
            id: "telegram-commands",
            question: "What commands are available in the Telegram bot?",
            answer:
                "Use /menu for the main interactive hub, /myproducts to manage items with inline buttons, /status to view freshness and check-in schedules, /pause_shop for vacation mode, /resume_shop to resume, and /help for instructions.",
        },
        {
            id: "telegram-checkin",
            question: "How do I reply to the weekly check-in?",
            answer:
                "When the bot sends your weekly morning digest, tap 'All still available' (or reply 'all' / 'yes' / 'ሁሉም') if everything is in stock. To mark specific items sold, reply 'sold 2 5'. You can also tap 'Check one by one'.",
        },
        {
            id: "telegram-quicksold",
            question: "Can I mark an item sold without waiting for check-in?",
            answer:
                "Yes. Text 'sold [product name]' (e.g. 'sold iPhone 15') to the bot at any time. It marks the item sold immediately and gives you a 1-tap Undo button.",
        },
        {
            id: "telegram-quiet-hours",
            question: "When does the bot send check-in messages?",
            answer:
                "The bot sends one morning digest per week on your shop's due date. It strictly enforces quiet hours between 21:00 and 07:00 EAT, so it will never disturb you at night.",
        },
    ],
    trust: [
        {
            id: "badge",
            question: "What does the verified badge mean?",
            answer:
                "A verified shop has confirmed its location and identity with our team.",
        },
    ],
    account: [
        {
            id: "billing",
            question: "How does billing work?",
            answer:
                "Shops are billed monthly based on their plan. You can view invoices from Plans & billing.",
        },
    ],
};


function FaqRow({
    item,
    open,
    onToggle,
}: {
    item: FaqItem;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className={`rounded-2xl border transition-colors ${open
                    ? "border-orange-100 bg-orange-50/60"
                    : "border-neutral-200 bg-white"
                }`}
        >
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
                <span className="font-semibold text-neutral-900">
                    {item.question}
                </span>
                <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${open ? "bg-orange-600 text-white" : "bg-neutral-100 text-neutral-500"
                        }`}
                >
                    {open ? <X className="h-3.5 w-3.5" /> : <Icon name='plus' className="h-3.5 w-3.5" />}
                </span>
            </button>
            {open && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-500">
                    {item.answer}
                </p>
            )}
        </div>
    );
}

export function FaqSection() {
    const [topic, setTopic] = useState<TopicId>("buyers");
    const [openId, setOpenId] = useState<string | null>("free");

    const items = FAQS[topic];

    return (
        <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Frequently asked
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-900">
                    Quick answers, by topic.
                </h2>

                {/* Topic tabs */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    {TOPICS.map((t) => {
                        const active = topic === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTopic(t.id);
                                    setOpenId(null);
                                }}
                                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${active
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                                    }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Accordion */}
            <div className="mt-8 space-y-3">
                {items.map((item) => (
                    <FaqRow
                        key={item.id}
                        item={item}
                        open={openId === item.id}
                        onToggle={() =>
                            setOpenId((prev) => (prev === item.id ? null : item.id))
                        }
                    />
                ))}
            </div>
        </div>
    );
}