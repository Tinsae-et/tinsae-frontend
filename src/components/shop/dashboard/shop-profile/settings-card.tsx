import React from "react";
import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

// The shop-settings primitives from the handoff (design_handoff_owner_settings):
// one Card and one Field, so every panel shares the same measurements.

export const inputClass =
  "h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink transition-colors read-only:bg-tn-paper read-only:focus:border-tn-hair";

export const textareaClass =
  "w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 py-[11px] text-[14px] leading-normal text-tn-ink placeholder:text-tn-mute focus:outline-none focus:border-tn-ink resize-y transition-colors";

type CardProps = {
  title: string;
  sub?: string;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Overrides the default `20px 22px` body padding. */
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Renders as a <form> when `onSubmit` is given, so the footer's submit pill works. */
export function SettingsCard({
  title,
  sub,
  footer,
  onSubmit,
  bodyClassName,
  children,
}: CardProps) {
  const className =
    "border border-tn-hair rounded-[18px] bg-white overflow-hidden";
  const inner = (
    <>
      <div className="px-[22px] pt-[18px] pb-[14px] border-b border-tn-hair2">
        <h2 className="text-[15.5px] font-extrabold tracking-[-0.015em] text-tn-ink">
          {title}
        </h2>
        {sub && (
          <p className="text-[12.5px] leading-[1.45] text-tn-mute mt-[3px]">
            {sub}
          </p>
        )}
      </div>
      <div className={cn("px-[22px] py-5", bodyClassName)}>{children}</div>
      {footer && (
        <div className="px-[22px] py-[14px] border-t border-tn-hair2 bg-tn-paper flex justify-end items-center gap-2.5">
          {footer}
        </div>
      )}
    </>
  );

  return onSubmit ? (
    <form onSubmit={onSubmit} className={className}>
      {inner}
    </form>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-bold text-tn-ink2 mb-[7px]">
        {label}
      </span>
      {children}
      {error && (
        <span className="block text-[11.5px] text-tn-red mt-1.5">{error}</span>
      )}
      {hint && (
        <span className="block text-[11.5px] text-tn-mute mt-1.5">{hint}</span>
      )}
    </label>
  );
}

export type Feedback = { type: "success" | "error"; message: string };

export function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  const ok = feedback.type === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={cn(
        "mb-4 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border",
        ok
          ? "bg-tn-green-soft text-[#157049] border-[#157049]/20"
          : "bg-tn-red-soft text-tn-red border-tn-red/20",
      )}
    >
      <Icon name={ok ? "check" : "close"} size={14} />
      <span>{feedback.message}</span>
    </div>
  );
}

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "SH";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}
