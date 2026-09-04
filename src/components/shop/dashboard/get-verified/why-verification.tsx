import React from 'react'
import { Icon, IconName } from '@/components/tinsae/icon';

type items = {
    icon: IconName;
    title: string;
    description: string;
}

const UNLOCKS: items[] = [
  {
    icon: "search",
    title: "Higher in search",
    description: "Verified shops rank above unverified",
  },
  {
    icon: "heart",
    title: "More buyer trust",
    description: "The badge is the #1 thing buyers look for",
  },
  {
    icon: "bolt",
    title: "Priority support",
    description: "Faster help and featured-listing eligibility",
  },
];

function WhyVerification() {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-900">
                What verification unlocks
            </h3>

            <div className="mt-4 space-y-4">
                {UNLOCKS.map(({ icon, title, description }) => (
                    <div key={title} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Icon name={icon} className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-neutral-800">
                                {title}
                            </div>
                            <div className="text-xs text-neutral-400">
                                {description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WhyVerification