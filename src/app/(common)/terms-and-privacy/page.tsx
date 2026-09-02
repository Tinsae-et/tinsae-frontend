"use client"
import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

type Tab = "terms" | "privacy";

interface Section {
  id: string;
  number: number;
  title: string;
  paragraphs: string[];
}

const TOC: Section[] = [
  {
    id: "acceptance",
    number: 1,
    title: "Acceptance of these terms",
    paragraphs: [
      'By using Tinsae — our website, apps, and Telegram services (together, the \"Service\") — you agree to these Terms. If you do not agree, please do not use the Service.',
      "These Terms apply to everyone: buyers browsing listings and shop owners who register a storefront.",
    ],
  },
  {
    id: "what-is",
    number: 2,
    title: "What Tinsae is",
    paragraphs: [
      "Tinsae is a marketplace that helps people in Addis Ababa discover verified electronics shops and compare live, in-stock listings. We are an intermediary that connects buyers and shops.",
      "We are not the seller of any item listed. Every sale is a direct agreement between you and the shop. We do not own, hold, ship, or take possession of any inventory.",
    ],
  },
  {
    id: "payments",
    number: 3,
    title: "We never handle payments",
    paragraphs: [
      "Tinsae does not process payments, hold deposits, or provide escrow. All payment happens directly between you and the shop, in person, on terms you agree together.",
      "Because of this, no one should ever ask you to pay \"Tinsae\" for a product. Treat any such request as a scam and report it."
    ],
  },
  {
    id: "verification",
    number: 4,
    title: "Verification & listings",
    paragraphs: [
      "A \"verified\" badge means we have confirmed the shop is a real, registered business at a real address — through phone, documents, and an in-person visit. It is not a guarantee of any specific product, price, or transaction outcome.",
      "Freshness indicators reflect a shop's own most recent confirmation that an item is in stock. We make reasonable efforts to keep listings current but cannot guarantee real-time accuracy."
    ],
  },
  {
    id: "buyer-responsibilities",
    number: 5,
    title: "Your responsibilities as a buyer",
    paragraphs: [
      "Always inspect and test an item in person before paying. Meet at the shop's verified address, keep a receipt, and use the safety guidance in our Trust & safety page.",
      "You are responsible for your own purchasing decisions and for complying with applicable law."
    ],
  },
  {
    id: "shop-responsibilities",
    number: 6,
    title: "Responsibilities of shop owners",
    paragraphs: [
      "Shops must provide accurate business information, keep listings and stock honestly up to date, honour the prices they publish, and respond to buyers in good faith.",
      "Listing counterfeit, stolen, or prohibited goods, or misrepresenting stock or condition, is grounds for immediate removal and loss of verification."
    ],
  },
  {
    id: "prohibited",
    number: 7,
    title: "Prohibited conduct",
    paragraphs: [
      "You agree not to misuse the Service. This includes fraud, harassment, scraping or overloading our systems, impersonation, posting unlawful content, or attempting to move buyers off-platform to deceive them.",
    ],
  },
  {
    id: "ip",
    number: 8,
    title: "Content & intellectual property",
    paragraphs: [
      "The Tinsae name, logo, and platform are our property. Content you submit (such as listings and photos) remains yours, but you grant us a licence to display and promote it within the Service.",
    ],
  },
  {
    id: "disclaimers",
    number: 9,
    title: "Disclaimers & liability",
    paragraphs: [
      "The Service is provided \"as is\". To the fullest extent permitted by law, Tinsae is not liable for the acts of shops or buyers, for the quality, safety, or legality of items, or for any loss arising from a transaction conducted in person.",
    ],
  },
  {
    id: "suspension",
    number: 10,
    title: "Suspension & termination",
    paragraphs: [
      "We may suspend or remove any account or listing that violates these Terms or puts the community at risk, with or without notice where appropriate.",
    ],
  },
  {
    id: "changes",
    number: 11,
    title: "Changes to these terms",
    paragraphs: [
      "We may update these Terms from time to time. Material changes will be posted here with a new effective date. Continued use of the Service means you accept the updated Terms.",
    ],
  },
  {
    id: "governing-law",
    number: 12,
    title: "Governing law & contact",
    paragraphs: [
      "These Terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Questions? Reach us at legal@tinsae.et.",
    ],
  },
];

export default function LegalPage() {
  const [tab, setTab] = useState<Tab>("terms");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#f7f6f2] px-10 pt-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Legal
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
            Terms &amp; Privacy
          </h1>
          <p className="mt-2 font-mono text-sm text-neutral-400">
            Last updated June 1, 2026
          </p>

          {/* Tabs */}
          <div className="mt-6 flex gap-8">
            <button
              onClick={() => setTab("terms")}
              className={`pb-3 text-sm font-semibold transition-colors px-5 ${
                tab === "terms"
                  ? "border-b-2 border-orange-600 text-neutral-900"
                  : "border-b-2 border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setTab("privacy")}
              className={`pb-3 text-sm font-semibold transition-colors px-5 ${
                tab === "privacy"
                  ? "border-b-2 border-orange-600 text-neutral-900"
                  : "border-b-2 border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {tab === "terms" ? (
        <div className="mx-auto max-w-5xl gap-10 py-10 md:flex">
          <nav className="w-56 shrink-0 border-l self-start pl-5 md:sticky top-25">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              On this page
            </p>
            <ul className="mt-4 space-y-4">
              {TOC.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`#${s.id}`}
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    {s.number} · {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="mt-10 min-w-0 flex-1 md:mt-0">
            {/* Summary callout */}
            <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 px-5 py-4 shadow border border-gray-100">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-relaxed text-neutral-700">
                In short: Tinsae
                connects you with verified shops but is not the seller and
                never handles your money. You buy in person, directly from
                the shop.
              </p>
            </div>

            {/* Sections */}
            <div className="mt-8 space-y-8">
              {TOC.map((s) => (
                <section key={s.id} id={s.id}>
                  <h2 className="text-xl font-bold text-neutral-900">
                    {s.number} · {s.title}
                  </h2>
                  <div className="mt-2 space-y-3">
                    {s.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="text-[15px] leading-relaxed text-neutral-600"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-10 py-10">
          <p className="text-sm text-neutral-500">
            Privacy Policy content goes here.
          </p>
        </div>
      )}
    </div>
  );
}
