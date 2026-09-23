import React from 'react'
import { Benefit } from './data'

type Props = {
    benefits: Benefit[]
}

function WhatYouGet({ benefits }: Props) {
    return (
        <div className="bg-[#f7f6f2] px-10 py-16">
            <div className="mx-auto max-w-6xl">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">
                    What you get
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-900">
                    The practical part.
                </h2>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((b) => (
                        <div
                            key={b.id}
                            className="rounded-2xl border border-neutral-200 bg-white p-6"
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                                {b.label}
                            </p>
                            <p className="mt-2 text-[15px] leading-relaxed text-neutral-800">
                                {b.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WhatYouGet