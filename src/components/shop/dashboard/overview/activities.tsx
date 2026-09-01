import { Icon, IconName } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import Link from "next/link";

type ActivityType = "inquiry" | "bot" | "self" | "aging" | "visit";

const EVENT_COLOR: Record<ActivityType, string> = {
  inquiry: "text-tn-red",
  bot: "text-tn-telegram",
  self: "text-tn-ink2",
  aging: "text-tn-warn",
  visit: "text-tn-green",
};

type ActivityItem = {
  id: number;
  icon: IconName;
  type: ActivityType;
  subject: string;
  action: string;
  product: string;
  time: string;
};

const ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    icon: "msg",
    type: "inquiry",
    subject: "Yonas T.",
    action: "asked about",
    product: "iPhone 15 Pro 256GB",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: "msg",
    type: "inquiry",
    subject: "Hanna A.",
    action: "started a chat about",
    product: 'MacBook Pro 14" M3',
    time: "18 min ago",
  },
  {
    id: 3,
    icon: "tg",
    type: "bot",
    subject: "Bot",
    action: "auto-confirmed",
    product: "138 listings",
    time: "1 hr ago",
  },
  {
    id: 4,
    icon: "pulse",
    type: "self",
    subject: "You",
    action: "updated price on",
    product: "AirPods Pro 2",
    time: "3 hrs ago",
  },
  {
    id: 5,
    icon: "clock",
    type: "aging",
    subject: "Bot",
    action: "flagged as aging",
    product: 'iPad Air 13" M2',
    time: "8 hrs ago",
  },
  {
    id: 6,
    icon: "check",
    type: "visit",
    subject: "Selam M.",
    action: "visited shop after chat about",
    product: "Galaxy S24 Ultra",
    time: "1 day ago",
  },
];

export function DailyStockCheckIn() {
  return (
    <div className="bg-tn-ink rounded-[18px] p-[22px] flex flex-col justify-between gap-5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-tn-telegram size-10 rounded-[11px] flex items-center justify-center text-white shrink-0">
            <Icon name="tg" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-[14px] leading-tight">
              Daily stock check-in
            </span>
            <span className="font-tn-mono text-[11.5px] text-white/65 mt-0.5">
              9:00 am · @TinsaeStockBot
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-tn-green-soft text-tn-green">
          ● Complete
        </span>
      </div>

      <div className="bg-white/6 rounded-[13px] px-[15px] py-[13px] font-tn-mono text-[12.5px] leading-[1.7] text-white/85">
        <div>
          ✅ Confirmed <strong className="font-bold text-white">138 of 142 listings</strong> · 4 marked aging
        </div>
        <div>
          Next check-in <strong className="font-bold text-[#FFB69E]">tomorrow 9:00 am</strong>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Pill kind="light" size="sm" icon="check">
          Re-confirm now
        </Pill>
        <Pill
          kind="ghost"
          size="sm"
          className="border-white/25 text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          View bot log
        </Pill>
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex gap-3 items-center py-[11px] border-b border-tn-hair2 last:border-b-0">
      <div className="size-[30px] rounded-[9px] bg-tn-paper flex items-center justify-center shrink-0">
        <Icon name={activity.icon} size={15} className={EVENT_COLOR[activity.type]} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-[1.45] text-tn-ink2 truncate">
          <span className="font-bold text-tn-ink">{activity.subject}</span>{" "}
          {activity.action}{" "}
          <span className="font-bold text-tn-ink">{activity.product}</span>
        </p>
        <span className="font-tn-mono text-[11px] text-tn-mute">{activity.time}</span>
      </div>
    </div>
  );
}

export function RecentActivities() {
  return (
    <div className="bg-white border border-tn-hair rounded-[18px] px-5 py-[18px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-extrabold text-[14.5px] text-tn-ink">Recent activity</h4>
        <Link
          href="#"
          className="font-bold text-tn-red text-[13px] flex items-center gap-1 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="flex flex-col">
        {ACTIVITIES.map((a) => (
          <ActivityRow key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}