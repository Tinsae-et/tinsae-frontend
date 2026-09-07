import React from 'react'
import { Icon, IconName } from '../tinsae/icon';
import Link from 'next/link';


const HOURS = [
    { day: "Mon – Fri", time: "9:00 – 19:30" },
    { day: "Saturday", time: "9:00 – 18:00" },
    { day: "Sunday", time: "Closed" },
];

type badge = {
    label: string;
    icon: IconName;
}

const BADGES: badge[] = [
    { label: "Tinsae verified", icon: "shield" },
    { label: "Authorized reseller", icon: "check" },
    { label: "Fast responder", icon: "bolt" },
];

function MapInfoSideBar() {
    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
                {/* Map placeholder */}
                <div className="relative h-60 bg-[#e8e4d8]">
                    <h1 className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-neutral-600">
                        MAP
                    </h1>
                </div>

                <div className="bg-white ">
                    <div className="p-4 border-b">
                        <div className="text-sm font-semibold text-neutral-900">
                            Atlas Building, 2nd floor
                        </div>
                        <div className="text-sm text-neutral-400">
                            Cameroon St. (Bole Atlas)
                        </div>
                        <div className="text-sm text-neutral-400">
                            Addis Ababa, Ethiopia
                        </div>

                        <div className="mt-3 flex gap-2">
                            <Link href="#" className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
                                <Icon name="pin" className="h-3.5 w-3.5" />
                                Directions
                            </Link>
                            <Link href="#" className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
                                <Icon name="phone" className="h-3.5 w-3.5" />
                                Call
                            </Link>
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            Hours
                        </p>
                        <div className="mt-3 space-y-2">
                            {HOURS.map((h) => (
                                <div
                                    key={h.day}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-neutral-600">{h.day}</span>
                                    <span
                                        className={`font-mono ${h.time === "Closed"
                                            ? "text-neutral-400"
                                            : "text-neutral-800"
                                            }`}
                                    >
                                        {h.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* About this shop */}
            <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    About this shop
                </p>

                <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                    Family-run electronics retailer in Bole Atlas since 2018. Authorized
                    reseller for Apple, Samsung, and Sony in Ethiopia. All items ship
                    with original boxes and start-up support.
                </p>

                <div className="mt-4 flex flex-col gap-2.5">
                    {BADGES.map(({ label, icon }) => (
                        <div key={label} className="flex items-center gap-2">
                            <Icon name={icon} className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="text-sm font-bold text-neutral-700">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default MapInfoSideBar