import React from 'react'
import { ProcessStep } from './data'

type Props = {
    steps: ProcessStep[]
}

function HiringProces({ steps}: Props) {
    return (
        <div className="px-10 py-16">
            <div className="mx-auto max-w-6xl">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">
                    Hiring process
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-900">
                    Ten days, five steps, no guessing.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500">
                    We tell you where you stand at every stage, and the take-home is
                    paid because your time is worth what ours is.
                </p>

                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
                    {steps.map((step, i) => (
                        <div key={step.id} className="relative">
                            <div className="flex items-center">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 font-mono text-sm font-semibold text-white">
                                    {step.number}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="ml-3 hidden h-px flex-1 bg-neutral-200 lg:block" />
                                )}
                            </div>

                            <h3 className="mt-4 font-semibold text-neutral-900">
                                {step.title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HiringProces