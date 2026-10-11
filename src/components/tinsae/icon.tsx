// Icon set ported from the Claude Design project (shared/tinsae-shared.jsx).
// Same 24x24 grid and 1.6 stroke weight as the design so the visual rhythm matches.

// The names categories may use as their icon (Category.icon from the API);
// `isIconName` guards a value coming from the backend.
export const ICON_NAMES = [
  "search",
  "filter",
  "heart",
  "check",
  "tg",
  "pin",
  "clock",
  "shield",
  "chevron",
  "chevd",
  "star",
  "eye",
  "menu",
  "close",
  "phone",
  "laptop",
  "audio",
  "tablet",
  "plug",
  "camera",
  "arrow",
  "bell",
  "sort",
  "pulse",
  "box",
  "spec",
  "building",
  "bolt",
  "plus",
  "minus",
  "sliders",
  "car",
  "motorbike",
  "bicycle",
  "truck",
  "tv",
  "monitor",
  "desktop",
  "watch",
  "sofa",
  "bed",
  "fridge",
  "pan",
  "lamp",
  "generator",
  "sun",
  "battery",
  "shirt",
  "dress",
  "shoe",
  "bag",
  "gem",
  "land",
  "store",
  "msg",
  "tag",
  "home",
  "user",
  "back",
  "gallery",
  "trash",
  "ellipsis",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const ICON_NAME_SET: ReadonlySet<string> = new Set(ICON_NAMES);

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && ICON_NAME_SET.has(value);
}

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
    case "gallery":
      return (
        <svg {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case "trash":
      return (
        <svg {...stroke}>
          <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
        </svg>
      );
    case "ellipsis":
      return (
        <svg {...filled}>
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
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
    case "car":
      return (
        <svg {...stroke}>
          <path d="M5 11l1.6-4.3A2 2 0 018.5 5.4h7a2 2 0 011.9 1.3L19 11M4 11h16a1 1 0 011 1v4h-2M5 16H3v-4a1 1 0 011-1M5 16v1.5M19 16v1.5M5 16h14" />
          <circle cx="7.5" cy="16.5" r="1.6" />
          <circle cx="16.5" cy="16.5" r="1.6" />
        </svg>
      );
    case "motorbike":
      return (
        <svg {...stroke}>
          <circle cx="5.5" cy="16" r="3" />
          <circle cx="18.5" cy="16" r="3" />
          <path d="M5.5 16h5l3-5h3.5l2 5M13.5 11l-1.5-3H9.5M16 8h2.5" />
        </svg>
      );
    case "bicycle":
      return (
        <svg {...stroke}>
          <circle cx="5.5" cy="16" r="3.5" />
          <circle cx="18.5" cy="16" r="3.5" />
          <path d="M5.5 16l3.5-7h6l3.5 7M9 9l3 7h-6.5M15 9l-1-2.5h2.5M9 9H7.5" />
        </svg>
      );
    case "tv":
      return (
        <svg {...stroke}>
          <rect x="2.5" y="4.5" width="19" height="12.5" rx="1.5" />
          <path d="M8 20.5h8M12 17v3.5" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...stroke}>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M9 20h6M12 16v4" />
        </svg>
      );
    case "desktop":
      return (
        <svg {...stroke}>
          <rect x="2.5" y="5" width="13" height="9.5" rx="1.2" />
          <path d="M6.5 18.5h5M9 14.5v4M18 4.5h3.5v15H18z" />
          <path d="M19.75 16.5v.01" />
        </svg>
      );
    case "sofa":
      return (
        <svg {...stroke}>
          <path d="M5 11V8.5A2.5 2.5 0 017.5 6h9A2.5 2.5 0 0119 8.5V11" />
          <path d="M3 12.5a1.5 1.5 0 013 0V14h12v-1.5a1.5 1.5 0 013 0V17a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
          <path d="M5.5 18v1.5M18.5 18v1.5" />
        </svg>
      );
    case "bed":
      return (
        <svg {...stroke}>
          <path d="M3 18V6M3 13h18v5M21 18v-5a3 3 0 00-3-3h-7v3" />
          <circle cx="7" cy="10.5" r="1.6" />
        </svg>
      );
    case "fridge":
      return (
        <svg {...stroke}>
          <rect x="6" y="2.5" width="12" height="19" rx="2" />
          <path d="M6 9.5h12M9 5.5v2M9 12.5v3" />
        </svg>
      );
    case "pan":
      return (
        <svg {...stroke}>
          <path d="M3 11h14v2a5 5 0 01-5 5H8a5 5 0 01-5-5z" />
          <path d="M17 12h4M8 8c0-1 1-1.5 1-2.5M12 8c0-1 1-1.5 1-2.5" />
        </svg>
      );
    case "generator":
      return (
        <svg {...stroke}>
          <rect x="3" y="7" width="18" height="11" rx="1.5" />
          <path d="M6 7V5h5v2M5 18v2M19 18v2M7 11h4M7 14h4" />
          <path d="M16.5 10l-2 3h3l-2 3" />
        </svg>
      );
    case "sun":
      return (
        <svg {...stroke}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      );
    case "battery":
      return (
        <svg {...stroke}>
          <rect x="2.5" y="7" width="17" height="10" rx="2" />
          <path d="M21.5 10.5v3M6 10v4M9.5 10v4M13 10v4" />
        </svg>
      );
    case "shirt":
      return (
        <svg {...stroke}>
          <path d="M9 3.5L3.5 6.5l2 4 2-1V20.5h9V9.5l2 1 2-4L15 3.5c-.5 1.5-1.6 2.5-3 2.5s-2.5-1-3-2.5z" />
        </svg>
      );
    case "dress":
      return (
        <svg {...stroke}>
          <path d="M9.5 3v3.5L8 10l-3.5 10.5h15L16 10l-1.5-3.5V3M9.5 6.5h5M8 10h8" />
        </svg>
      );
    case "shoe":
      return (
        <svg {...stroke}>
          <path d="M3 8v9.5h18v-1.5c0-1.7-1.2-3-3-3.3l-4.5-.9L10 8.5c-.8.8-2.3 1.2-3.5 1.2S4 9.2 3 8z" />
          <path d="M3 14.5h18M11.5 10.5l1.2-1.2M13.3 11.5l1.2-1.2" />
        </svg>
      );
    case "bag":
      return (
        <svg {...stroke}>
          <path d="M5 8h14l-1 12.5H6z" />
          <path d="M9 10.5V6.5a3 3 0 016 0v4" />
        </svg>
      );
    case "gem":
      return (
        <svg {...stroke}>
          <path d="M7 4h10l4 5-9 11L3 9z" />
          <path d="M3 9h18M9.5 4L12 9l2.5-5M12 9v11" />
        </svg>
      );
    case "land":
      return (
        <svg {...stroke}>
          <path d="M3 18.5l5-9 4 6 3-4 6 7z" />
          <path d="M15.5 4.5v5M15.5 4.5h4l-1 1.2 1 1.3h-4" />
        </svg>
      );
    case "store":
      return (
        <svg {...stroke}>
          <path d="M3.5 9.5L5 4h14l1.5 5.5" />
          <path d="M3.5 9.5a2.8 2.8 0 005.7 0 2.8 2.8 0 005.6 0 2.8 2.8 0 005.7 0" />
          <path d="M5 11.5V20h14v-8.5M10 20v-5h4v5" />
        </svg>
      );
    case "lamp":
      return (
        <svg {...stroke}>
          <path d="M8 3h8l3 8H5z" />
          <path d="M12 11v8M8 21h8" />
        </svg>
      );
    case "watch":
      return (
        <svg {...stroke}>
          <rect x="6.5" y="6.5" width="11" height="11" rx="3" />
          <path d="M9 6.5l.7-3.5h4.6l.7 3.5M9 17.5l.7 3.5h4.6l.7-3.5M12 9.5V12l1.5 1" />
        </svg>
      );
    case "truck":
      return (
        <svg {...stroke}>
          <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.5v2.5h-7" />
          <circle cx="6.5" cy="16.5" r="1.8" />
          <circle cx="17" cy="16.5" r="1.8" />
        </svg>
      );
    case "tag":
      return (
        <svg {...stroke}>
          <path d="M3 12.5V4a1 1 0 011-1h8.5L21 11.5 12.5 20z" />
          <circle cx="7.5" cy="7.5" r="1.4" />
        </svg>
      );
    case "back":
      return (
        <svg {...stroke}>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      );
    case "msg":
      return (
        <svg {...stroke}>
          <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.4-.2-3.4-.6L4 20l1-3.2C3.8 15.4 3 13.8 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
        </svg>
      );
    case "home":
      return (
        <svg {...stroke}>
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z" />
        </svg>
      );
    case "user":
      return (
        <svg {...stroke}>
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0113 0" />
        </svg>
      );
  }
}
