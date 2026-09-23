
import {
    ChevronDown,
    Send,
    MapPin,
} from "lucide-react";
import HowWeWork from "@/components/careers/how-we-work";
import { BENEFITS, CARDS, FAQS, PROCESS_STEPS, ROLES } from "../../../components/careers/data";
import OpenRoles from "@/components/careers/open-roles";
import WhatYouGet from "@/components/careers/what-you-get";
import HiringProces from "@/components/careers/hiring-process";
import Faqs from "@/components/careers/faqs";
import { Pill } from "@/components/tinsae/pill";


export default function CareersPage() {

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="mx-auto border-b px-10">
                <div className="max-w-6xl relative overflow-hidden bg-gradient-to-b from-orange-50/50 to-white pt-14 pb-10 mx-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        We&apos;re hiring
                    </span>

                    <h1 className="mt-5 max-w-2xl text-5xl font-extrabold leading-tight tracking-tight text-neutral-900">
                        Help make local commerce
                        <br />
                        <span className="text-orange-700">trustworthy.</span>
                    </h1>

                    <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-500">
                        Eleven people in Addis building the proof layer under a city&apos;s
                        electronics trade. Six roles open — three of them out in the shops.
                    </p>

                    <div className="mt-7 flex items-center gap-3">

                        <Pill iconAfter="chevd" className="text-lg">See open roles</Pill>
                        <Pill icon="tg" className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-lg font-semibold text-neutral-800 hover:bg-neutral-50">
                            Apply on Telegram
                        </Pill>
                    </div>

                    <div className="mt-8 flex items-center gap-3 border-t border-neutral-100 pt-5 font-mono text-sm text-neutral-500">
                        <span>
                            <span className="font-semibold text-neutral-800">6</span> open
                            roles
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span>
                            <span className="font-semibold text-neutral-800">11</span> people
                            today
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="font-semibold text-neutral-800">Addis</span>{" "}
                            only, for now
                        </span>
                    </div>
                </div>
            </div>

            {/* How we work */}
            <HowWeWork cards={CARDS} />

            {/* Open roles */}
            <OpenRoles roles={ROLES} />

            {/* What you get */}
            <WhatYouGet benefits={BENEFITS} />

            {/* Hiring process */}
            <HiringProces steps={PROCESS_STEPS} />

            {/* FAQ */}
            <Faqs faqs={FAQS} />

            {/* Baner */}
            <section className="mx-auto mt-16 max-w-6xl px-0 sm:px-8 lg:mt-24 lg:px-12 xl:px-16">
                <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-14 text-center sm:px-12 lg:py-16">
                    <span
                        aria-hidden
                        className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[340px] leading-none font-bold text-white/[0.08]"
                    >
                        ትንሳኤ
                    </span>
                    <div className="relative">
                        <h2 className="text-[32px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[50px]">
                            Message us on Telegram.
                        </h2>
                        <p className="mx-auto mt-4  text-base leading-relaxed text-white/90 sm:text-lg">
                            One note, the role name, the why. That is the whole application.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Pill icon="tg" className="bg-white text-red-700 hover:bg-gray-200">Apply now</Pill>
                            <Pill className="border border-gray-100 bg-transparent hover:bg-red-500" href="about">About Tinsae</Pill>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
