import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";

// PLACEHOLDER: alerts and saved searches are not built yet; these counts are
// invented. Hide the panel or wire it to the API before launch.
const ALERT_STATS = [
  { icon: "tag" as const, label: "Price-drop alerts", value: "4 active", color: "text-tn-green" },
  { icon: "box" as const, label: "Back-in-stock alerts", value: "2 active", color: "text-tn-red" },
  { icon: "search" as const, label: "Saved searches", value: "3 active", color: "text-tn-ink" },
];

const SAVED_SEARCHES = [
  {
    title: "Sealed iPhone · under ETB 50,000 · Bole",
    meta: "4 filters · 3 new",
    badge: 3,
  },
  {
    title: "MacBook Pro M3 · incl. refurbished",
    meta: "2 filters · no new matches",
    badge: 0,
  },
  {
    title: "Sony cameras · under ETB 200,000",
    meta: "3 filters · 1 new",
    badge: 1,
  },
];

export function SavedSidebar() {
  return (
    <aside className="hidden w-[272px] shrink-0 flex-col gap-4 lg:sticky lg:top-[90px] lg:flex">
      {/* Alert summary card */}
      <div className="border-tn-hair rounded-[18px] border bg-white p-5">
        <h4 className="text-tn-ink mb-3.5 text-[13.5px] font-extrabold tracking-[-0.01em]">
          Your alerts
        </h4>
        <div className="flex flex-col">
          {ALERT_STATS.map(({ icon, label, value, color }, idx) => (
            <div
              key={label}
              className={`flex items-center gap-3 py-2.5 ${
                idx > 0 ? "border-tn-hair2 border-t" : ""
              }`}
            >
              <span className="border-tn-hair bg-tn-paper inline-flex size-[34px] shrink-0 items-center justify-center rounded-[10px] border">
                <Icon name={icon} size={16} className={color} />
              </span>
              <span className="text-tn-ink2 flex-1 text-[13px] font-semibold">{label}</span>
              <span className="font-tn-mono text-tn-mute text-[11.5px] font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Saved searches card */}
      <div className="border-tn-hair rounded-[18px] border bg-white p-5">
        <h4 className="text-tn-ink mb-3 text-[13.5px] font-extrabold tracking-[-0.01em]">
          Saved searches
        </h4>
        <div className="flex flex-col gap-1">
          {SAVED_SEARCHES.map((s, idx) => (
            <Link
              key={idx}
              href="/products"
              className="hover:bg-tn-paper -mx-2.5 rounded-[11px] px-2.5 py-2 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-tn-ink flex-1 text-[13px] font-bold leading-snug">
                  {s.title}
                </span>
                {s.badge > 0 && (
                  <span className="bg-tn-red font-tn-mono inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10.5px] font-extrabold text-white">
                    +{s.badge}
                  </span>
                )}
              </div>
              <p className="font-tn-mono text-tn-mute mt-1 text-[11px]">{s.meta}</p>
            </Link>
          ))}
        </div>

        <Link
          href="/products"
          className="border-tn-hair text-tn-ink hover:border-tn-ink mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-[11px] border text-[13px] font-bold transition-colors"
        >
          <Icon name="plus" size={15} className="text-tn-red" />
          <span>New saved search</span>
        </Link>
      </div>
    </aside>
  );
}
