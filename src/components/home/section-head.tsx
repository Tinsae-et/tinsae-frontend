import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";

export function SectionHead({
  eyebrow,
  title,
  href,
  link,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-tn-red mb-3 text-[13px] font-bold tracking-[0.10em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-tn-ink text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[34px]">
          {title}
        </h2>
      </div>
      {href && link && (
        <Link
          href={href}
          className="text-tn-ink inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap"
        >
          {link}
          <Icon name="arrow" size={15} className="text-tn-red" />
        </Link>
      )}
    </div>
  );
}
