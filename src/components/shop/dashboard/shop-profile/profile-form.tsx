"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { Pill } from "@/components/tinsae/pill";
import Image from "next/image";
import { getShop, updateShopProfile } from "@/lib/api";
import { ShopProfile } from "@/lib/types";


function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "AE";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export default function ProfileForm({slug, access}:{slug :string,access:string}) {
  const [shopName, setShopName] = useState<string>("Almeda Electronics");
  const [logo, setLogo] = useState<string | null>(null);

  const logoRef = useRef<string | null>(null);

  useEffect(() => {
    logoRef.current = logo;
  });

  useEffect(() => {
    return () => {
      if (logoRef.current) URL.revokeObjectURL(logoRef.current);
    };
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };
  const [formdata , setformdata] = useState<ShopProfile|null>(null)
  useEffect(()=>{
    getShop(slug)
    .then((res)=>setformdata(res))
    .catch((error)=>console.log(error))
  },[slug])

  const changehandler = (e: React.ChangeEvent<HTMLInputElement> |  React.ChangeEvent<HTMLTextAreaElement>) => {
    setformdata((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  

  const  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formdata) return 
    const Fd = new FormData()
    Fd.append("name", String(formdata?.name))
    Fd.append("telegram_chat_id", String(formdata?.telegram_chat_id))
    Fd.append("description", String(formdata?.description))
    await updateShopProfile(slug  ,Fd , access)
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-tn-hair rounded-[18px] bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair">
        <h2 className="text-[15.5px] font-extrabold text-tn-ink">Shop profile</h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          How your shop appears across Tinsae search and listings.
        </p>
      </div>

      {/* Body */}
      <div className="px-[22px] py-5 flex flex-col gap-5">
        {/* Identity row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {logo ? (
              <div className="size-[72px] rounded-2xl overflow-hidden border border-tn-hair bg-tn-paper flex items-center justify-center shrink-0">
                <Image
                  src={logo}
                  alt="Shop logo"
                  width={72}
                  height={72}
                  unoptimized={logo.startsWith("blob:")}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-[72px] bg-tn-ink rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shrink-0">
                {getInitials(shopName)}
              </div>
            )}

            <div>
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <span className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-[13.5px] h-10 px-[18px] border-[1.5px] border-tn-hair bg-white text-tn-ink hover:border-tn-ink transition-colors">
                  <Icon name="camera" size={16} />
                  Change logo
                </span>
              </label>
              <p className="text-[11.5px] text-tn-mute mt-1.5">
                Square PNG, at least 256×256.
              </p>
            </div>
          </div>

          <div className="bg-tn-green-soft px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#157049] shrink-0 self-start sm:self-center">
            <VerifiedBadge size={12} />
            <span>Verified shop</span>
          </div>
        </div>

        {/* 2-column fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Shop name
            </label>
            <input
              type="text"
              name="name"
              value={formdata?.name}
              onChange={changehandler}
              placeholder="e.g. Almeda Electronics"
              className="h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
            />
          </div>

          <div>
            <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
              Telegram handle
            </label>
            <input
              type="text"
              name="telegram_chat_id"
              value={formdata?.telegram_chat_id}
              
              placeholder="e.g. @AlmedaElectronics"
              className="font-tn-mono h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink"
            />
          </div>
        </div>

        {/* About field */}
        <div>
          <label className="text-[12.5px] font-bold text-tn-ink2 block mb-1.5">
            About
          </label>
          <textarea
            name="description"
            value={formdata?.description}
            onChange={changehandler}
            placeholder="About your shop..."
            rows={3}
            className="w-full rounded-xl border-[1.5px] border-tn-hair bg-white p-3.5 text-[14.5px] text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink resize-y"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-[22px] py-3.5 border-t border-tn-hair bg-tn-paper flex justify-end items-center gap-3">
        <Pill
          kind="outline"
          size="md"
          onClick={() => {
            // Reset to defaults
            setShopName("Almeda Electronics");

          }}
        >
          Cancel
        </Pill>
        <Pill kind="solid" size="md" icon="check" type="submit">
          Save changes
        </Pill>
      </div>
    </form>
  );
}