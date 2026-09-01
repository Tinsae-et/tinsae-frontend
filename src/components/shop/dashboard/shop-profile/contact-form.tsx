"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";

export default function ContactForm() {
  const [phone, setPhone] = useState<string>("+251 91 142 5006");
  const [email, setEmail] = useState<string>("sales@almeda.et");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save contact mutation
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-tn-hair rounded-[18px] bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair">
        <h2 className="text-[15.5px] font-extrabold text-tn-ink">Contact</h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          Buyers reach you through these — keep them current.
        </p>
      </div>

      {/* Body */}
      <div className="px-[22px] py-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +251 91 142 5006"
              className="font-tn-mono h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
            />
            <p className="text-[11.5px] text-tn-mute mt-1.5">
              Shown only after a buyer taps &ldquo;reveal&rdquo;.
            </p>
          </div>

          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Public email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sales@almeda.et"
              className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-[22px] py-3.5 border-t border-tn-hair bg-tn-paper flex justify-end items-center gap-3">
        <Pill kind="solid" size="md" icon="check" type="submit">
          Save changes
        </Pill>
      </div>
    </form>
  );
}