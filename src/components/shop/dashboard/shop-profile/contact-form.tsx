import React from "react"
import { Icon } from "@/components/tinsae/icon"


export default function ContactForm() {
    return (
        <form className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-300">
                <h2 className="font-bold">Contact</h2>
                <p className="text-gray-500 text-sm">Buyers reach you through these --keep them current.</p>
            </div>
            <div className="p-4 border border-gray-100">
                <div>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Phone
                            </label>
                            <input
                                type="text"
                                placeholder="+251 12 345 6789"
                                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-neutral-700">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. youremail@gmail.com"
                                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <div className="">
                    <button className="flex items-center bg-red-600 px-3 py-1 rounded-full shadow-red-200 shadow-lg text-white font-bold">
                        <Icon name="check" />
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    )
}