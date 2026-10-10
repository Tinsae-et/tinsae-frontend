// Device silhouettes ported from the design's `ProdPlaceholder`
// (shared/tinsae-shared.jsx). Used as the fallback when a product has no
// photo — the handoff says real images should be the norm and these are the
// graceful no-image state, always on the #F7F6F2 letterbox background.

export type ProductKind = "phone" | "laptop" | "audio" | "tablet" | "camera" | "other";

/**
 * Best-effort kind from the backend's category slug. Anything that is not a
 * known device (a car, a sofa, a fridge) gets a neutral parcel rather than a
 * phone silhouette.
 */
export function kindForSlug(slug: string | null | undefined): ProductKind {
  const s = (slug ?? "").toLowerCase();
  if (/laptop|computer|desktop|monitor/.test(s)) return "laptop";
  if (/audio|headphone|speaker/.test(s)) return "audio";
  if (/tablet/.test(s)) return "tablet";
  if (/camera|photo/.test(s)) return "camera";
  if (/phone|wearable/.test(s)) return "phone";
  return "other";
}

const common = {
  viewBox: "0 0 200 200",
  style: { filter: "drop-shadow(0 18px 32px rgba(0,0,0,0.4))" },
  className: "h-[58%] w-auto max-h-full",
  "aria-hidden": true as const,
};

export function ProdPlaceholder({ kind }: { kind: ProductKind }) {
  switch (kind) {
    case "laptop":
      return (
        <svg {...common}>
          <rect x="30" y="50" width="140" height="90" rx="6" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
          <rect x="36" y="56" width="128" height="78" rx="2" fill="#0a0a0a" />
          <path d="M20 140 L180 140 L188 158 L12 158 Z" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <rect x="86" y="140" width="28" height="3" fill="#0a0a0a" />
        </svg>
      );
    case "audio":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="60" rx="60" ry="14" fill="#2a2a2a" />
          <path d="M40 60 L40 130 Q40 150 70 150 L70 80 Q70 70 60 70 Z" fill="#1a1a1a" stroke="#444" />
          <path d="M160 60 L160 130 Q160 150 130 150 L130 80 Q130 70 140 70 Z" fill="#1a1a1a" stroke="#444" />
          <path d="M40 60 Q100 30 160 60" stroke="#444" strokeWidth="6" fill="none" />
        </svg>
      );
    case "tablet":
      return (
        <svg {...common}>
          <rect x="40" y="20" width="120" height="160" rx="10" fill="#1a1a1a" stroke="#444" />
          <rect x="48" y="28" width="104" height="144" rx="3" fill="#0a0a0a" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <rect x="20" y="60" width="160" height="100" rx="8" fill="#1a1a1a" stroke="#444" />
          <rect x="60" y="50" width="50" height="20" rx="3" fill="#1a1a1a" />
          <circle cx="100" cy="110" r="32" fill="#0a0a0a" stroke="#555" strokeWidth="2" />
          <circle cx="100" cy="110" r="22" fill="#222" />
          <circle cx="155" cy="78" r="3" fill="#cc3000" />
        </svg>
      );
    case "other":
      return (
        <svg {...common}>
          <path d="M100 30 L170 62 L170 142 L100 174 L30 142 L30 62 Z" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
          <path d="M30 62 L100 94 L170 62 M100 94 L100 174" stroke="#444" strokeWidth="1" fill="none" />
          <path d="M65 46 L135 78" stroke="#2a2a2a" strokeWidth="10" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="60" y="20" width="80" height="160" rx="14" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
          <rect x="66" y="26" width="68" height="148" rx="8" fill="#0a0a0a" />
        </svg>
      );
  }
}
