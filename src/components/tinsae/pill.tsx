import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

// Ported from the design's `Pill` (tinsae-v2-kit.jsx) — the rounded CTA used
// across the landing page. Sizes and shadows follow the handoff spec:
//   lg = 54px tall / px-7  / 16px   md = 48px / px-6 / 15px   sm = 40px / px-4.5 / 13.5px

type PillKind = "solid" | "dark" | "outline" | "ghost" | "light";
type PillSize = "sm" | "md" | "lg";

const kinds: Record<PillKind, string> = {
  solid: "bg-tn-red text-white shadow-[0_8px_22px_rgba(204,48,0,0.26)] hover:bg-tn-red-dark",
  dark: "bg-tn-ink text-white shadow-[0_8px_22px_rgba(11,11,11,0.18)] hover:bg-black",
  outline:
    "bg-white text-tn-ink border-[1.5px] border-tn-hair hover:border-tn-ink hover:text-tn-ink",
  ghost: "bg-transparent text-tn-ink border-[1.5px] border-tn-ink hover:bg-tn-paper",
  light: "bg-white text-tn-red shadow-[0_8px_22px_rgba(11,11,11,0.12)] hover:bg-tn-red-soft",
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
  children,
  className,
}: {
  kind?: PillKind;
  size?: PillSize;
  icon?: IconName;
  iconAfter?: IconName;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] whitespace-nowrap transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px",
        kinds[kind],
        sizes[size],
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 17} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === "lg" ? 16 : 15} />}
    </Link>
  );
}
