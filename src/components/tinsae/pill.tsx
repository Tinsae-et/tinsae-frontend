import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

// Ported from the design's `Pill` (tinsae-v2-kit.jsx) — the rounded CTA used
// across the landing page. Sizes and shadows follow the handoff spec:
//   lg = 54px tall / px-7  / 16px   md = 48px / px-6 / 15px   sm = 40px / px-4.5 / 13.5px

type PillKind = "solid" | "dark" | "outline" | "ghost" | "light";
type PillSize = "sm" | "md" | "lg";

const kinds: Record<PillKind, string> = {
  solid:
    "bg-tn-red text-white shadow-[0_8px_22px_rgba(204,48,0,0.26)] hover:bg-tn-red-dark",
  dark: "bg-tn-ink text-white shadow-[0_8px_22px_rgba(11,11,11,0.18)] hover:bg-black",
  outline:
    "bg-white text-tn-ink border-[1.5px] border-tn-hair hover:border-tn-ink hover:text-tn-ink",
  ghost:
    "bg-transparent text-tn-ink border-[1.5px] border-tn-ink hover:bg-tn-paper",
  light:
    "bg-white text-tn-red shadow-[0_8px_22px_rgba(11,11,11,0.12)] hover:bg-tn-red-soft",
};

const sizes: Record<PillSize, string> = {
  sm: "h-10 px-[18px] text-[13.5px]",
  md: "h-12 px-6 text-[15px]",
  lg: "h-[54px] px-7 text-base",
};

export function Pill({
  kind = "solid",
  size = "md",
  icon,
  iconAfter,
  href,
  download = false,
  newTab = false,
  onClick,
  type = "button",
  disabled = false,
  children,
  className,
}: {
  kind?: PillKind;
  size?: PillSize;
  icon?: IconName;
  iconAfter?: IconName;
  href?: string;
  /** Serve `href` as a file download rather than navigating to it. */
  download?: boolean;
  /** Open `href` in a new tab — for links that leave the site. */
  newTab?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] whitespace-nowrap transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px",
    kinds[kind],
    sizes[size],
    // A Pill that can't be pressed must say so, not just look faded: the
    // onboarding funnel relied on opacity alone and stayed clickable, which is
    // how a double-tap on "Create my shop" got two shops created.
    disabled &&
      "pointer-events-none cursor-not-allowed opacity-50 shadow-none hover:translate-y-0",
    className,
  );

  if (onClick || type === "submit") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        className={classes}
      >
        {icon && <Icon name={icon} size={size === "lg" ? 18 : 17} />}
        {children}
        {iconAfter && <Icon name={iconAfter} size={size === "lg" ? 16 : 15} />}
      </button>
    );
  }

  const content = (
    <>
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 17} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === "lg" ? 16 : 15} />}
    </>
  );

  // Files and off-site links skip client-side routing, which can do neither.
  if (download || newTab) {
    return (
      <a
        href={href}
        download={download || undefined}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href ?? "#"} className={classes}>
      {content}
    </Link>
  );
}
