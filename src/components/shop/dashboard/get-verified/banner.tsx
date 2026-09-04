import { Icon } from '@/components/tinsae/icon'
import React from 'react'

type Props = {
    completed: number;
}

function Banner({completed}: Props) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-neutral-950 via-neutral-900 to-emerald-950 px-8 py-7">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                        <svg viewBox="0 0 64 64" className="absolute h-24 w-24 -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="27"
                                fill="none"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="27"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 27}`}
                                strokeDashoffset={`${2 * Math.PI * 27 * (1 - completed / 4)}`}
                            />
                        </svg>
                        <Icon name="shield" className="h-6 w-6 text-white" />
                    </div>

                    <div className='flex flex-col gap-3'>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Verification in progress
                        </p>
                        <h1 className="mt-1 text-3xl font-extrabold text-white">
                            Earn your verified badge
                        </h1>
                        <p className="mt-1 max-w-lg text-sm text-neutral-400">
                            Verified shops appear higher in search, win buyer trust, and
                            get the badge on every listing.
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-extrabold text-white">
                        {completed}/{4}
                    </div>
                    <div className="text-xs text-neutral-400">steps complete</div>
                </div>
            </div>
        </div>
    )
}

export default Banner