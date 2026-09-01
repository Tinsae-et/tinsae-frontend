import React from "react"
import { Phone } from "lucide-react"
import { Icon, IconName } from "@/components/tinsae/icon";
import { FaqSection } from "@/components/help/fqa-section";
import SearchBar from "@/components/help/search-bar";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help - Center | Tinsae",
  description: "Find guides,  and answers to frequently asked questions.",
  robots: {
    index: true,
    follow: true
  }
};


const POPULAR_TAGS: string[] = [
    "How verification works",
    "Connect the Telegram bot",
    "Set a price alert",
    "Report a shop",
    "Reveal a phone number",
];

interface CategoryCard {
    id: string;
    title: string;
    description: string;
    count: number;
    icon: IconName;
    iconBg: string;
    iconColor: string;
}

const CATEGORIES: CategoryCard[] = [
    {
        id: "buying",
        title: "Buying on Tinsae",
        description: "Search, compare, contact and visit",
        count: 12,
        icon: "search",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
    },
    {
        id: "verification",
        title: "Verification & trust",
        description: "What the badge means, staying safe",
        count: 9,
        icon: "shield",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
    },
    {
        id: "telegram",
        title: "Telegram bot",
        description: "Connect, import stock, daily check-in",
        count: 8,
        icon: "tg",
        iconBg: "bg-sky-50",
        iconColor: "text-sky-500",
    },
    {
        id: "selling",
        title: "Selling & your shop",
        description: "Register, list, manage, grow",
        count: 14,
        icon: "building",
        iconBg: "bg-violet-50",
        iconColor: "text-violet-500",
    },
    {
        id: "alerts",
        title: "Alerts & account",
        description: "Price drops, saved listings, settings",
        count: 7,
        icon: "bell",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
    },
    {
        id: "billing",
        title: "Plans & billing",
        description: "Featured listings, payments, invoices",
        count: 6,
        icon: "tg",
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
    },
];


function ContactCard() {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="relative mt-16 overflow-hidden rounded-3xl bg-neutral-950 px-10 py-14">
                <div className="grid gap-10 md:grid-cols-2 md:items-center">
                    <div>
                        <h3 className="text-3xl font-extrabold text-white">
                            Still stuck? Talk to a human.
                        </h3>
                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
                            Our support team in Addis answers on Telegram, usually within
                            a couple of hours during the day.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="#"
                            className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-5 py-4 hover:bg-neutral-800"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                                <Icon name="tg" className="h-4 w-4 text-sky-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-white">
                                    Message on Telegram
                                </div>
                                <div className="text-sm text-neutral-400">
                                    @TinsaeSupport
                                </div>
                            </div>
                            <Icon name="arrow" className="h-4 w-4 shrink-0 text-neutral-500" />
                        </Link>

                        <Link
                            href="#"
                            className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-5 py-4 hover:bg-neutral-800"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Icon name="msg" className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-white">Email us</div>
                                <div className="text-sm text-neutral-400">
                                    help@tinsae.et
                                </div>
                            </div>
                            <Icon name="arrow" className="h-4 w-4 shrink-0 text-neutral-500" />
                        </Link>

                        <Link
                            href="#"
                            className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-5 py-4 hover:bg-neutral-800"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600/20">
                                <Phone className="h-4 w-4 text-orange-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-white">
                                    Call support
                                </div>
                                <div className="font-mono text-sm text-neutral-400">
                                    +251 91 000 1234
                                </div>
                            </div>
                            <Icon name="arrow" className="h-4 w-4 shrink-0 text-neutral-500" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}


function HelpCategoryGrid() {
    return (
        <div className="mx-auto my-15 max-w-6xl grid lg:grid-cols-3 md:grid-cols-2 gap-4">
            {CATEGORIES.map(({ id, title, description, count, icon, iconBg, iconColor }) => (
                <button
                    key={id}
                    className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left hover:border-neutral-300 hover:shadow-sm"
                >
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                    >
                        <Icon name={icon} className={`h-5 w-5 ${iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 ">
                            <h3 className="font-semibold text-neutral-900">{title}</h3>
                            <span className="shrink-0 text-sm text-neutral-300">
                                {count}
                            </span>
                        </div>
                        <p className=" text-sm text-neutral-400">{description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}

function HelpPage() {

    return (
        <div className=" gap-15 min-h-screen bg-linear-to-b from-orange-50/60 to-white px-10 py-16">
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Help center
                </p>

                <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-neutral-900">
                    How can we help?
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-lg text-neutral-500">
                    Answers for buyers and shop owners — verification, the Telegram
                    bot, alerts, payments and visits.
                </p>

                <SearchBar />
                {/* Popular tags */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                    <span className="mr-1 text-neutral-400">Popular:</span>
                    {POPULAR_TAGS.map((tag) => (
                        <button
                            key={tag}
                            className="rounded-full border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <HelpCategoryGrid />
            <FaqSection />
            <ContactCard />
        </div>
    )
}

export default HelpPage