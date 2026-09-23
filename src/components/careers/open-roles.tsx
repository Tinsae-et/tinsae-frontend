import React from 'react'
import { Role } from '@/components/careers/data';
import { Icon } from '../tinsae/icon';

type Props = {
    roles: Role[];
}

function OpenRoles({ roles }: Props) {
    return (
        <div className="border-t border-neutral-100 px-10 py-16">
            <div className="mx-auto max-w-6xl">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">
                    Open roles
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-900">
                    Six roles, all in Addis.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500">
                    No remote-first roles right now — the verification model needs
                    people who can be inside a shop by Tuesday.
                </p>

                <div className="mt-8 space-y-3">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            className={`flex w-full flex-col gap-3 rounded-2xl border p-6 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/30 md:flex-row md:items-center md:gap-6 ${role.openings ? "border-orange-200" : "border-neutral-200"
                                }`}
                        >
                            <div className="md:w-[50%] md:shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="font-semibold text-neutral-900">
                                        {role.title}
                                    </h3>
                                    {role.openings && (
                                        <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                                            {role.openings} openings
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                                    {role.description}
                                </p>
                            </div>

                            <div className="grid flex-1 grid-cols-3 items-center gap-4 text-sm">
                                <span className="font-medium text-neutral-800">
                                    {role.department}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono text-xs text-neutral-400">
                                    <Icon name='pin' className="h-3.5 w-3.5" />
                                    {role.location}
                                </span>
                                <span className="font-mono text-xs text-neutral-400">
                                    {role.type}
                                </span>
                            </div>

                            <Icon name='arrow' className="h-4 w-4 shrink-0 text-orange-600 md:ml-4" />
                        </button>
                    ))}
                </div>

                {/* Nothing fits CTA */}
                <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Icon name='msg' className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <p className="text-sm text-neutral-600">
                            <span className="font-semibold text-neutral-900">
                                Nothing fits, but you want in?
                            </span>{" "}
                            Tell us what you would do here and why. We have created roles
                            off the back of a good message before.
                        </p>
                    </div>
                    <button className="flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800">
                        <Icon name='tg' className="h-3.5 w-3.5" />
                        Write to us
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OpenRoles