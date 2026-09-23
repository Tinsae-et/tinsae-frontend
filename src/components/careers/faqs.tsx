"use client";

import React, { useState } from 'react'
import { FaqItem } from './data';
import { Icon } from '../tinsae/icon';

type Props = {
    faqs: FaqItem[]
}

function Faqs({ faqs }: Props) {
  const [openFaq, setOpenFaq] = useState<string | null>("amharic");
    return (
        <div className="px-10 py-16">
            <div className="mx-auto max-w-4xl text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Questions
                </p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
                    Before you apply
                </h2>

                <div className="mt-8 space-y-3 text-left">
                    {faqs.map((item) => {
                        const isOpen = openFaq === item.id;
                        return (
                            <div
                                key={item.id}
                                className={`rounded-2xl border transition-colors ${isOpen
                                        ? "border-orange-100 bg-orange-50/60"
                                        : "border-neutral-200 bg-white"
                                    }`}
                            >
                                <button
                                    onClick={() =>
                                        setOpenFaq((prev) => (prev === item.id ? null : item.id))
                                    }
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                >
                                    <span className="font-semibold text-neutral-900">
                                        {item.question}
                                    </span>
                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isOpen
                                                ? "bg-orange-600 text-white"
                                                : "bg-neutral-100 text-neutral-500"
                                            }`}
                                    >
                                        {isOpen ? (
                                            <Icon name='close' className="h-3.5 w-3.5" />
                                        ) : (
                                            <Icon name='plus' className="h-3.5 w-3.5" />
                                        )}
                                    </span>
                                </button>
                                {isOpen && (
                                    <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-600">
                                        {item.answer}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Faqs