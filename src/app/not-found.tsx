import React from "react";
import { Icon } from "@/components/tinsae/icon";
import Link from "next/link";
import { IconName } from "@/components/tinsae/icon";

type link = {
    href: string,
    text: string,
    icon: IconName
}
const LINKS:link[] = [
    {href:"/", text:"Back to home", icon: "building"},
    {href:"/products", text:"Browse listings", icon: "search"},
    {href:"/shops", text:"Verified shops", icon: "shield"},
    {href:"/help", text:"Help center", icon: "sliders"},
]

function LinkComponent({link}:{link:link}){
    return (
        <Link href={link.href} className="bg-white p-3 rounded-lg outline flex items-center gap-3">
            <span className="bg-gray-200 size-6 rounded flex items-center justify-center">
                <Icon name={link.icon}/>
            </span>
            <span className="font-bold text-sm flex items-center gap-2">{link.text}<Icon name="arrow" className="text-red-500"/> </span>
        </Link>
    )
}


export default function NotFound(){
    return (
        <div className="bg-[linear-gradient(180deg,#ffeeee_0%,#ffffff_100%)] pt-10 bg-opacity-10 relative flex flex-col justify-center items-center gap-4 ">
            <div className="z-1 flex flex-col justify-center items-center gap-4 p-6">
                <div className="border bg-white px-4 py-2 rounded-full flex items-center gap-3">
                    <span className="size-2 bg-gray-400 rounded-full block"></span>
                    <span className="text-gray-500 font-bold text-xs">LAST CONFIRMED NEVER</span>
                </div>
                <h1 className="font-bold text-5xl ">This page is <span className="text-red-500"> out of stock.</span></h1>

                <p className="w-[420px] flex items-center text-center text-gray-600">
                    The listing you are looking for may have sold, moved, or never existed.
                    Let's get you back to something that's confirmed in stock.
                </p>

                <div className="border-tn-hair flex h-11 items-center gap-2.5 rounded-2xl border-[1.5px] bg-white pl-1 w-[401px] overflow-hidden ">
                    <Icon name="search" className="ml-3"/>
                    <input type="text" name="" id="" placeholder="Search verified shops & products" className="text-tn-ink placeholder:text-tn-mute min-w-0 flex-1 bg-transparent text-[14.5px] font-medium outline-none"/>
                    <button className="bg-red-500 text-white p-2 h-11 ">Search</button>
                </div>
                <div className="md:flex grid gap-3 text-center flex-wrap max-w-[80%]">
                    {
                        LINKS.map((l)=>(
                            <LinkComponent key={l.href} link={l}/>
                        ))
                    }
                </div>    
            </div>
            
            <h1 className="absolute md:text-[400px] text-[260px] text-red-100 font-bold z-0">404</h1>
        </div>
    )
}