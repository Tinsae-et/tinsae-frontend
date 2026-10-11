import type { PressMention } from "@/lib/press";

// PLACEHOLDER: press contact confirmed by the business (ticket dependency).
export const PRESS_EMAIL = "press@tinsae.et";
export const PRESS_TELEGRAM = "TinsaePress";

export const BRAND_KIT_URL = "/assets/press/tinsae-brand-kit.zip";

// Approved copy from the design handoff — journalists paste it verbatim, so
// change it only with sign-off, and move BOILERPLATE_UPDATED with it.
export const BOILERPLATE =
  "Tinsae (ትንሳኤ, Amharic for “rising”) is a verified electronics marketplace serving all of Ethiopia. Buyers compare prices across local shops that have been verified in person and that reconfirm their stock every day over Telegram, then contact the shop and complete the purchase face to face. Tinsae never handles payments and takes no commission on any sale. Founded in Addis Ababa in 2022, it now has 412 verified shops.";
export const BOILERPLATE_UPDATED = "Mar 2026";

// PLACEHOLDER: figures from the design, not yet checked against live metrics —
// the handoff notes they disagree with other pages.
export const FACTS: [label: string, value: string][] = [
  ["Founded", "2022 · Addis Ababa, Ethiopia"],
  ["Category", "Verified local marketplace · consumer electronics"],
  ["Launch market", "Bole, Addis Ababa"],
  ["Verified shops", "412"],
  ["Live listings", "8,920"],
  ["Stock reconfirmed daily", "96% within 24 hours"],
  ["Commission taken", "None — Tinsae handles no payments"],
  ["Team", "11 people, all Addis-based"],
];
export const FACTS_AS_OF = "March 2026";

export type LogoTone = "onRed" | "onPaper" | "onInk" | "mark";

export const LOGO_ASSETS: {
  file: string;
  label: string;
  note: string;
  tone: LogoTone;
  ground: string;
}[] = [
  {
    file: "tinsae-logo-orange.svg",
    label: "Primary lockup",
    note: "White on brand red",
    tone: "onRed",
    ground: "bg-tn-red",
  },
  {
    file: "tinsae-logo-light.svg",
    label: "Light background",
    note: "For white and paper grounds",
    tone: "onPaper",
    ground: "bg-tn-paper",
  },
  {
    file: "tinsae-logo-dark.svg",
    label: "Dark background",
    note: "For black and photo grounds",
    tone: "onInk",
    ground: "bg-tn-ink",
  },
  {
    file: "tinsae-mark.svg",
    label: "Mark only",
    note: "Avatars, favicons, tight spaces",
    tone: "mark",
    ground: "bg-tn-paper",
  },
];

export const SWATCHES: { name: string; hex: string; fill: string }[] = [
  { name: "Brand red", hex: "#CC3000", fill: "bg-tn-red" },
  { name: "Ink", hex: "#0B0B0B", fill: "bg-tn-ink" },
  { name: "Verified green", hex: "#1F8A5B", fill: "bg-tn-green" },
  { name: "Aging amber", hex: "#B8741F", fill: "bg-tn-warn" },
  { name: "Paper", hex: "#F7F6F2", fill: "bg-tn-paper" },
  { name: "Telegram", hex: "#229ED9", fill: "bg-tn-telegram" },
];

// PLACEHOLDER: figures from the design, not yet checked against live metrics.
export const PRESS_STATS: [value: string, label: string][] = [
  ["412", "verified shops"],
  ["8,920", "listings live today"],
  ["~3.4h", "median shop reply"],
  ["2022", "founded in Addis"],
];

// Real coverage only — the page shows an empty state until there is some.
// Order does not matter; the page sorts newest first. Shape:
//   {
//     outlet: "Shega",
//     headline: "Why Tinsae refuses to process a single birr",
//     date: "2026-02-18",
//     url: "https://shega.co/...",
//     kind: "Interview",
//   },
export const PRESS_COVERAGE: PressMention[] = [];
