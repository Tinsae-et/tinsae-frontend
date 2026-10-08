"use client";

import React from "react";
import { Icon } from "@/components/tinsae/icon";
import { SettingsCard, getInitials } from "./settings-card";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  phone?: string;
  color: string;
  isOwner?: boolean;
};

type Props = {
  ownerName: string;
  ownerPhone?: string;
};

export default function TeamPanel({ ownerName, ownerPhone }: Props) {
  // PLACEHOLDER: the API has no team model yet, so only the signed-in owner
  // is listed. Inviting teammates waits until roles are defined.
  const members: TeamMember[] = [
    { id: "owner", name: ownerName, role: "Owner", phone: ownerPhone, color: "#0F2A4D", isOwner: true },
  ];

  return (
    <SettingsCard
      title="Team"
      sub="People who can manage listings and reply to buyers on this shop."
      bodyClassName="py-1.5"
    >
      {members.map((member, i) => (
        <div key={member.id} className={`flex items-center gap-3.5 py-3.5 ${i ? "border-t border-tn-hair2" : ""}`}>
          <span
            className="size-[42px] rounded-full text-white font-extrabold text-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: member.color }}
          >
            {getInitials(member.name)}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14.5px] font-extrabold text-tn-ink truncate">{member.name}</span>
              {member.isOwner && (
                <span className="h-[21px] inline-flex items-center rounded-full bg-tn-paper px-2 text-[10.5px] font-extrabold text-tn-ink2">
                  Owner
                </span>
              )}
            </div>
            <div className="text-[12.5px] text-tn-mute mt-0.5">
              {member.role}
              {member.phone && (
                <>
                  {" · "}
                  <span className="font-tn-mono">{member.phone}</span>
                </>
              )}
            </div>
          </div>

          {!member.isOwner && (
            <button
              type="button"
              className="size-[34px] rounded-[10px] border border-tn-hair bg-white flex items-center justify-center text-tn-ink2 hover:bg-tn-paper transition-colors cursor-pointer shrink-0"
              aria-label={`Options for ${member.name}`}
            >
              <Icon name="ellipsis" size={15} />
            </button>
          )}
        </div>
      ))}
    </SettingsCard>
  );
}
