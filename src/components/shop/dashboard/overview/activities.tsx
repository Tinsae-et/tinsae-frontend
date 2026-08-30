import { Icon, IconName } from "@/components/tinsae/icon"
import Link from "next/link"


type Activity = {
    id: number;
    icon: IconName;
    subject: string;
    action: string;
    product: string;
    time: string;
    color: string
}
const ACTIVITIES: Activity[] = [
    { id: 1, icon: "msg", subject: "Yonas T", action: "asked about", product: "Iphone 13 Pro max", time: "2 min ago", color: "red-600" },
    { id: 2, icon: "msg", subject: "Hanna A", action: "started chat about", product: "MacBook Pro 14 M3", time: "18 min ago", color: "red-600" },
    { id: 3, icon: "tg", subject: "bot", action: "auto-confirmed", product: "138 listings", time: "1 hr ago", color: "blue-600" },
    { id: 4, icon: "pulse", subject: "You", action: "updated price on", product: "AirPods Pro 2", time: "3 hr ago", color: "gray-800" },
    { id: 5, icon: "clock", subject: "bot", action: "flagged as ageing", product: "Ipad Air 13 M2", time: "8 hr ago", color: "red-800" },
    { id: 6, icon: "check", subject: "Selam M", action: "visited shop after chat about", product: "Galaxy S24 ultra", time: "1 day ago", color: "gray-800" },
]

export function DailyStockCheckIn() {
    return (
        <div className=" bg-black p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="bg-blue-400 size-10 rounded-lg flex items-center justify-center text-white">
                        <Icon name="tg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">Daily Stock check-in</span>
                        <span className="text-gray-400 text-xs">9 : 00 am . @TinsaeStockBot</span>
                    </div>
                </div>
                <div>
                    <button className="bg-green-500 text-white px-2 py-1 rounded-full font-bold">
                        . Complete
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 p-3 rounded-2xl">
                <p className="text-gray-400">✅ Confirmed <span className="text-gray-50 font-bold">138 of 142 listings .</span> 4 marked ageing <br /> Next check-in <span className="text-orange-700">tomorow 9 : 00 am</span>.</p>
            </div>

            <div className="flex gap-4">
                <button className="bg-white text-red-600 flex items-center justify-center gap-2 px-3 py-3 rounded-full font-bold text-sm">
                    <Icon name="check" />
                    Re-confirm now
                </button>

                <button className="border border-gray-500 text-white flex items-center justify-center gap-2 px-3 py-3 rounded-full font-bold text-sm">
                    View bot log
                </button>
            </div>
        </div>
    )
}


function Activity({ activity }: { activity: Activity }) {
    return (
        <div className="flex gap-1 items-center border-b p-2">
            <div className={`flex size-10 rounded-xl bg-gray-100 items-center justify-center text-${activity.color}`}>
                <Icon name={activity.icon} />
            </div>

            <div>
                <p className="text-sm"><span className="font-bold">{activity.subject}.</span>{activity.action} <span className="font-bold">{activity.product}</span></p>
                <span className="text-xs">{activity.time}</span>
            </div>
        </div>
    )

}

export function RecentActivities() {
    return (
        <div className="bg-white border border-gray-300 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <h4 className="font-bold">Recent activity</h4>
                <Link href={"#"} className="font-bold text-red-600 flex items-center ">
                    View all
                    <Icon name="arrow" />
                </Link>
            </div>

            <div className="flex flex-col">
                {
                    ACTIVITIES.map(a => (
                        <Activity key={a.id} activity={a} />
                    ))
                }
            </div>
        </div>
    )
}