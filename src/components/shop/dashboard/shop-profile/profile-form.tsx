"use client"
import React, { useState } from "react"
import { Icon } from "@/components/tinsae/icon"
import { VerifiedBadge } from "@/components/tinsae/verified-badge"
import Image from "next/image";


export default function ProfileForm() {
    const [shopName, setShopName] = useState<string>("");
    const [telegram, setTelegram] = useState<string>("");
    const [logo, setLogo] = useState<string | null>(null);
    const [about, setAbout] = useState<string>("");

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogo(URL.createObjectURL(file));
    };

    return (
        <form className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-300">
                <h2 className="font-bold">Shop Profile</h2>
                <p className="text-gray-500 text-sm">How your shop appears accross Tinsae search and listings</p>
            </div>
            <div className="p-4 border border-gray-100">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        {
                            logo ? (
                                <div className="border border-gray-500 size-20 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-200">
                                    <Image
                                        src={logo} alt={"Logo"}         
                                        width={70}
                                        height={50}       
                                        className="m-0"           
                                    />
                                </div>
                            ):(
                                <div className="size-20 bg-purple-950 rounded-2xl flex items-center justify-center">
                                    <span className="text-white text-3xl font-bold uppercase">{shopName !== "" ? shopName.slice(0,2) : "ig"}</span>
                                </div>
                            )
                        }

                        <div>
                            <label className="flex cursor-pointer py-2 items-center justify-center gap-3 rounded-full border border-dashed border-neutral-300 bg-neutral-50/50 text-center hover:bg-neutral-50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                                <div>
                                    <div className="text-sm font-bold text-neutral-700 flex gap-2 items-center">
                                        <Icon name="camera" />
                                        Change logo
                                    </div>
                                </div>
                            </label>
                            <p className="text-xs">square PNG at least 256 x 256</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="flex items-center justify-center gap-2 bg-green-50 py-1 px-3 rounded-lg">
                            <VerifiedBadge />
                            <span className="text-green-700 font-semibold">Verified</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Shop name
                            </label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(event)=>setShopName(event.target.value)}
                                placeholder="e.g. Your shop name"
                                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-neutral-700">
                                Telegram handle
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. @yourhandle"
                                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-5">
                    <label className="mb-2 block text-sm font-bold text-neutral-700">
                        About
                    </label>
                    <textarea
                        placeholder="About your shop..."
                        rows={4}
                        className="w-full resize-y rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                    />
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <div className="flex gap-3">
                    <button className="py-1 px-3 border border-gray-100 font-bold bg-white rounded-full">
                        Cancel
                    </button>

                    <button className="flex items-center bg-red-600 px-3 py-1 rounded-full shadow-red-200 shadow-lg text-white font-bold">
                        <Icon name="check" />
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    )
}