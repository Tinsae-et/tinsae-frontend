import React from 'react'
import { Icon } from '../tinsae/icon'
import { InfoCard } from './data'

type Props = {
    cards: InfoCard[]
}

function HowWeWork({ cards }: Props) {
    return (
        <div className="px-10 py-16">
            <div className="mx-auto max-w-6xl">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">
                    How we work
                </p>
                <h2 className="mt-3 max-w-xl text-4xl font-extrabold tracking-tight text-neutral-900">
                    Four things you should know before applying.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500">
                    Not perks — the actual texture of the job. If any of these sound
                    wrong to you, this is the useful place to find out.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {cards.map(({ id, title, description, icon, iconBg, iconColor }) => (
                        <div
                            key={id}
                            className="rounded-2xl border border-neutral-200 p-6"
                        >
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
                            >
                                <Icon name={icon} className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <h3 className="mt-4 font-semibold text-neutral-900">
                                {title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HowWeWork