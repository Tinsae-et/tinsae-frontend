import { Icon } from "../tinsae/icon";
import { VerifiedBadge } from "../tinsae/verified-badge";
import { formatETB } from "@/lib/format";

type Shop = {
    n: string;
    loc: string;
    p: number;
    fresh: number;
    best?: boolean;
    aging?: boolean;
    tag?: string;
    c: string;
}

const intials = (name: string) => {
    let s: string = "";
    const splited: string[] = name.split(" ")
    splited.slice(0,2).forEach(item => {
        s += item[0]
    });
    return s
}

const Freshness = ({time}:{time:number}) =>{
    let color: string;
    if (time < 6) color = "green"
    else if (time < 12) color = "amber"
    else color = "gray"
    return (
        <div className={`bg-${color}-200 size-3 border rounded-full flex items-center justify-center`}>
            <div className={`bg-${color}-600 size-2 border rounded-full flex items-center justify-center`}></div>
        </div>
    )
}

export function ShopRow({shop}:{shop:Shop}){
    return(
        <div className="border border-gray-300 hover:bg-red-50 hover:border-red-500 hover:text-red-600 p-3 rounded-2xl grid grid-cols-7 gap-2 items-center min-w-[900px]">
            <div className="flex items-center gap-2 flex-no-wrap col-span-2">
                <span className="p-3 rounded rounded-xl font-bold text-white" style={{background: shop.c}}>{intials(shop.n)}</span>
                <div>
                    <span className="font-bold text-sm text-black items-center">
                        {shop.n} 
                        <VerifiedBadge size={10}/>
                    </span>
    
                    <span className="text-gray-500 text-xs flex gap-1 items-center "><Icon name="pin" className="size-5 py-1"/>{shop.loc}</span>
                </div>
            </div>
            <div className="text-xs text-black font-bold">
                <span>New </span>
                <span>Open box</span>
            </div>
            <div className="text-xs font-bold text-black">
                <span className='flex gap-1 items-center'>
                    <Icon name='shield'/>
                    6mo shop
                </span>
            </div>
            <div className="flex flex-col text-xs text-black font-bold ">
                <span className="flex gap-1"><Freshness time={shop.fresh}/>{shop.fresh}  ago</span>
                <span>resp. 98%</span>
            </div>
            <div className="flex flex-col items-end pr-5">
                <span className="text-xs justify-end">Best price</span>
                <span className="font-bold">{ formatETB(shop.p)}</span>
            </div>
            <button 
                className="hover:text-white hover:bg-red-500 p-3 rounded-full font-bold text-black shadow flex items-center justify-center gap-2"
                >
                <Icon name="tg"/>Contact
            </button>
        </div>
    )
}