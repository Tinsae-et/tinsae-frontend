// Icon set ported from the Claude Design project (shared/tinsae-shared.jsx).
// Same 24x24 grid and 1.6 stroke weight as the design so the visual rhythm matches.

export type IconName =
  | "search"
  | "filter"
  | "heart"
  | "check"
  | "tg"
  | "pin"
  | "clock"
  | "shield"
  | "chevron"
  | "chevd"
  | "star"
  | "eye"
  | "menu"
  | "close"
  | "phone"
  | "laptop"
  | "audio"
  | "tablet"
  | "plug"
  | "camera"
  | "arrow"
  | "bell"
  | "sort"
  | "pulse"
  | "box"
  | "spec"
  | "building"
  | "bolt"
  | "plus"
  | "minus"
  | "sliders";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 18, className, strokeWidth = 1.6 }: IconProps) {
  const stroke = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  const filled = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "search":
      return (
        <svg {...stroke}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      );
    case "filter":
      return (
        <svg {...stroke}>
          <path d="M3 5h18M6 12h12M10 19h4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...stroke}>
          <path d="M20.8 6.6a5.5 5.5 0 00-9.3-3 5.5 5.5 0 00-9.3 6c1.6 4 9.3 9.4 9.3 9.4s7.7-5.4 9.3-9.4a5.5 5.5 0 000-3z" />
        </svg>
      );
    case "check":
      return (
        <svg {...stroke}>
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      );
    case "tg":
      return (
        <svg {...filled}>
          <path d="M22.05 2.5L1.65 10.4c-1.4.55-1.4 1.4-.25 1.7l5.2 1.65 12.05-7.6c.55-.35 1.05-.15.65.25l-9.75 8.8 8.5 6.3c.95.55 1.65.25 1.9-.85l3.45-16.15c.4-1.5-.55-2.15-1.35-1.9z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...stroke}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "clock":
      return (
        <svg {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...stroke}>
          <path d="M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...stroke}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "chevd":
      return (
        <svg {...stroke}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case "star":
      return (
        <svg {...filled}>
          <path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...stroke}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "menu":
      return (
        <svg {...stroke}>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      );
    case "close":
      return (
        <svg {...stroke} strokeWidth={2}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "phone":
      return (
        <svg {...stroke}>
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case "laptop":
      return (
        <svg {...stroke}>
          <rect x="3" y="5" width="18" height="11" rx="1" />
          <path d="M2 20h20" />
        </svg>
      );
    case "audio":
      return (
        <svg {...stroke}>
          <path d="M9 18V6l12-2v12" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "tablet":
      return (
        <svg {...stroke}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case "plug":
      return (
        <svg {...stroke}>
          <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0z M12 18v4" />
        </svg>
      );
    case "camera":
      return (
        <svg {...stroke}>
          <path d="M3 7h4l2-3h6l2 3h4v12H3z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...stroke}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    case "bell":
      return (
        <svg {...stroke}>
          <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" />
          <path d="M10 21a2 2 0 004 0" />
        </svg>
      );
    case "sort":
      return (
        <svg {...stroke}>
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...stroke}>
          <path d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
      );
    case "box":
      return (
        <svg {...stroke}>
          <path d="M21 8L12 3 3 8v8l9 5 9-5z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      );
    case "spec":
      return (
        <svg {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "building":
      return (
        <svg {...stroke}>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...stroke}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...stroke}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...stroke}>
          <path d="M5 12h14" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...stroke}>
          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
        </svg>
      );
  }
}
