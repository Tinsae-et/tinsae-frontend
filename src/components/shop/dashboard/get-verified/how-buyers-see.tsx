import React from 'react'


function HowBuyersSee() {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white">
            <h3 className="text-sm font-semibold border-b px-5 py-3 text-neutral-900">
                How buyers will see you
            </h3>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border bg-gray-100 mx-5 border-neutral-200 p-3">
                <div className="relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0f2a4d] text-sm font-semibold text-white">
                        AE
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-neutral-900">
                        Almeda Electronics
                    </div>
                    <div className="truncate text-sm text-neutral-400">
                        Bole · Atlas · 142 listings
                    </div>
                </div>
            </div>

            <p className="m-5 text-center text-xs leading-relaxed text-neutral-400">
                Finish all 4 steps to unlock the{" "}
                <span className="font-semibold text-neutral-600">
                    verified badge
                </span>{" "}
                shown here.
            </p>
        </div>
    )
}

export default HowBuyersSee