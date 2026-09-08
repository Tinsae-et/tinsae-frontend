import Link from "next/link";
import { Icon, type IconName } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

export function SegToggle({ active }: { active: "List" | "Map" }) {
  const options: [string, IconName, string][] = [
    ["List", "sort", "/shops"],
    ["Map", "pin", "/map"],
  ];

  return (
    <div className="bg-tn-paper border-tn-hair inline-flex items-center rounded-full border p-[3px]">
      {options.map(([label, icon, href]) => {
        const isActive = active === label;
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "inline-flex h-[34px] items-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition-colors",
              isActive
                ? "bg-tn-ink text-white shadow-sm"
                : "text-tn-ink2 hover:text-tn-ink bg-transparent",
            )}
          >
            <Icon
              name={icon}
              size={14}
              className={isActive ? "text-white" : "text-tn-mute"}
            />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
