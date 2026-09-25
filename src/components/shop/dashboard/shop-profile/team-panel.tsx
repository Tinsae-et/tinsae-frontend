"use client";

import React, { useState } from "react";
import { Pill } from "@/components/tinsae/pill";
import { Icon } from "@/components/tinsae/icon";
import type { Shop } from "@/lib/types";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  phone: string;
  color: string;
  isOwner?: boolean;
};

type Props = {
  shop: Shop | null;
};

export default function TeamPanel({ shop }: Props) {
  const shopName = shop?.name || "Almeda Electronics";
  const ownerName = shopName.split(" ")[0] + " Owner";

  // PLACEHOLDER: team members are not stored by the API yet.
  const [members] = useState<TeamMember[]>([
    {
      id: "1",
      name: ownerName,
      role: "Owner",
      phone: shop?.phone || "+251 91 142 5006",
      color: "#0F2A4D",
      isOwner: true,
    },
    {
      id: "2",
      name: "Henok Girma",
      role: "Manager · replies to chats",
      phone: "+251 91 776 2210",
      color: "#7A2E2E",
      isOwner: false,
    },
    {
      id: "3",
      name: "Sara Tesfaye",
      role: "Sales",
      phone: "+251 92 005 4471",
      color: "#1F8A5B",
      isOwner: false,
    },
  ]);

  return (
    <div className="border border-tn-hair rounded-[18px] bg-white overflow-hidden shadow-xs">
      <div className="px-[22px] pt-[18px] pb-3.5 border-b border-tn-hair2">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
          Team
        </h2>
        <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-0.5">
          People who can manage listings and reply to buyers on this shop.
        </p>
      </div>

      <div className="px-[22px] py-2 divide-y divide-tn-hair2">
        {members.map((member) => {
          const initials = member.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={member.id}
              className="flex items-center gap-3.5 py-3.5"
            >
              <span
                className="w-[42px] h-[42px] rounded-full text-white font-extrabold text-sm flex items-center justify-center shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {initials}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14.5px] font-extrabold text-tn-ink">
                    {member.name}
                  </span>
                  {member.isOwner && (
                    <span className="rounded-md bg-tn-paper px-2 py-0.5 text-[10.5px] font-extrabold text-tn-ink2">
                      Owner
                    </span>
                  )}
                </div>
                <div className="text-[12.5px] text-tn-mute mt-0.5">
                  <span>{member.role}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-tn-mono">{member.phone}</span>
                </div>
              </div>

              {!member.isOwner && (
                <button
                  type="button"
                  className="w-[34px] h-[34px] rounded-xl border border-tn-hair bg-white flex items-center justify-center text-tn-ink2 hover:bg-tn-paper transition-colors cursor-pointer"
                  aria-label="Member options"
                >
                  <Icon name="bell" size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-[22px] py-3.5 border-t border-tn-hair2 bg-tn-paper flex justify-end items-center">
        <Pill kind="outline" size="sm" icon="plus" type="button">
          Invite teammate
        </Pill>
      </div>
    </div>
  );
}
