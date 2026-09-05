"use client"

import React, { ChangeEvent, useState } from 'react'
import { Icon, IconName } from '@/components/tinsae/icon';
import { ChevronDown, FileText } from 'lucide-react';

type STATUS_TAGS = "verified" | "action" | "locked"

function StatusTag({ status }: { status: STATUS_TAGS }) {
    if (status === "verified") {
        return (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                Verified
            </span>
        );
    }
    if (status === "action") {
        return (
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                Action needed
            </span>
        );
    }
    return <span className="text-xs font-medium text-neutral-400">Locked</span>;
}

function StepOverview({
    icon,
    status,
    number,
    title,
    description,
    isOpen,
    setOpenStep
}: {
    icon: IconName,
    status: STATUS_TAGS,
    number: number,
    title: string,
    description: string,
    isOpen: boolean,
    setOpenStep: (open: string | null) => void
}) {
    return (
        <button
            onClick={() =>
                status !== "locked" &&
                setOpenStep(isOpen ? null : title)
            }
            disabled={status === "locked"}
            className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left disabled:cursor-not-allowed"
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 ${status === "verified"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : status === "action"
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-neutral-200 bg-neutral-50 text-neutral-300"
                    }`}
            >
                <Icon name={icon} className='w-4 h-4' />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                        Step {number}
                    </span>
                    <span
                        className={`font-semibold ${status === "locked"
                            ? "text-neutral-400"
                            : "text-neutral-900"
                            }`}
                    >
                        {title}
                    </span>
                </div>
                <p
                    className={`mt-0.5 text-sm ${status === "locked"
                        ? "text-neutral-300"
                        : "text-neutral-500"
                        }`}
                >
                    {description}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <StatusTag status={status} />
                {status !== "locked" && (
                    <ChevronDown
                        className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                )}
            </div>
        </button>
    )
}

function PhoneAndTelegram({ openStep, setOpenStep }: { openStep: string | null; setOpenStep: (step: string | null) => void }) {
    const isOpen = openStep === "Phone and Telegram"
    return (
        <div
            className={`rounded-2xl border bg-white transition-colors ${isOpen
                ? "border-neutral-900"
                : "border-neutral-200"
                }`}
        >
            <StepOverview
                icon="phone"
                status="verified"
                number={1}
                title="Phone and Telegram"
                description="Your number is confirmed and the Tinsae bot is linked to this shop."
                isOpen={isOpen}
                setOpenStep={setOpenStep}
            />
        </div>
    )
}

function Document({ openStep, setOpenStep }: { openStep: string | null; setOpenStep: (step: string | null) => void }) {
    const isOpen = openStep === "Business documents";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [license, setLicense] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fayda, setFayda] = useState<string | null>(null);

    const uploadLicense = (e: ChangeEvent<HTMLInputElement>) =>{
        const file = e.target.files?.[0];
        if (!file) return;
        setLicense(URL.createObjectURL(file));
    }

    const uploadFayda = (e: ChangeEvent<HTMLInputElement>) =>{
        const file = e.target.files?.[0];
        if (!file) return;
        setFayda(URL.createObjectURL(file));
    }
    return (
        <div
            className={`rounded-2xl border bg-white transition-colors ${isOpen
                ? "border-neutral-900"
                : "border-neutral-200"
                }`}
        >
            <StepOverview
                icon="phone"
                status="action"
                number={2}
                title="Business documents"
                description="Trade license and owner ID, so buyers know there's a real business behind the listings."
                isOpen={isOpen}
                setOpenStep={setOpenStep}
            />
            {

                isOpen && <form className="border-t border-neutral-100 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 py-6 hover:bg-neutral-50">
                            <input
                                type="file"
                                className="hidden"
                                onChange={uploadLicense}
                                />
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-500">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-semibold text-neutral-800">
                                    Trade license
                                </div>
                                <div className="text-xs text-neutral-400">
                                    PDF or photo
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 py-6 hover:bg-neutral-50">
                            <input
                                type="file"
                                className="hidden"
                                onChange={uploadFayda}
                                />
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-500">
                                <Icon name="user" className="h-4 w-4" />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-semibold text-neutral-800">
                                    Owner ID / Fayda
                                </div>
                                <div className="text-xs text-neutral-400">
                                    Front &amp; back
                                </div>
                            </div>
                        </label>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <button className="flex items-center gap-1.5 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-red-700 hover:shadow-sm">
                            <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                            Submit documents
                        </button>
                        <span className="text-sm text-neutral-400">
                            Reviewed within 1 business day.
                        </span>
                    </div>
                </form>
            }
        </div>
    )
}

function StoreFront({ openStep, setOpenStep }: { openStep: string | null; setOpenStep: (step: string | null) => void }) {
    const isOpen = openStep === "Storefront & location"
    return (
        <div
            className={`rounded-2xl border bg-white transition-colors ${isOpen
                ? "border-neutral-900"
                : "border-neutral-200"
                }`}
        >
            <StepOverview
                icon="building"
                status="action"
                number={3}
                title="Storefront & location"
                description="A map pin in Bole and two photos of your physical shop."
                isOpen={isOpen}
                setOpenStep={setOpenStep}
            />
        </div>
    )
}

function InPerson({ openStep, setOpenStep }: { openStep: string | null; setOpenStep: (step: string | null) => void }) {
    const isOpen = openStep === "In-person check"
    return (
        <div
            className={`rounded-2xl border bg-white transition-colors ${
                isOpen
                ? "border-neutral-900"
                : "border-neutral-200"
                }`}
        >
            <StepOverview
                icon="phone"
                status="locked"
                number={4}
                title="In-person check"
                description="A Tinsae agent visits to confirm the shop exists and meets standards — the final step."
                isOpen={isOpen}
                setOpenStep={setOpenStep}
            />
        </div>
    )
}

function Steps() {
    const [openStep, setOpenStep] = useState<string | null>(null)
    return (
        <>
            <PhoneAndTelegram openStep={openStep} setOpenStep={setOpenStep} />
            <Document openStep={openStep} setOpenStep={setOpenStep} />
            <StoreFront openStep={openStep} setOpenStep={setOpenStep} />
            <InPerson openStep={openStep} setOpenStep={setOpenStep} />
        </>
    )
}

export default Steps