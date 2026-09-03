"use client"

import { MapPin } from "lucide-react"
import { Star } from "lucide-react"
import { Pill } from "@/components/tinsae/pill"

interface Shop{
    f_car:string,
    name:string,
    listings:number,
    reply:number,
    response:string,
    distance:string,
    rate:number,
    rate2:number,
}

interface ShopmapProps{
    item:Shop;
}

export default function Shops({item}:ShopmapProps){
    return(
         <div>
            <button className="hover:bg-orange-100 bg-white border-t pr-25 p-3">
                <div className="flex items-start gap-2 ">
                    <div className="px-2 py-2 bg-gray-600 rounded-xl text-white font-bold">{item.f_car}</div>
                    <div>
                        <span className="font-bold">{item.name}</span>
                        <p className="flex gap-2"><span className="flex items-center font-bold text-sm"> <Star className="text-yellow-500" size={16}/> {item.rate}</span><span className="text-gray-500 text-sm">({item.rate2})</span><span className="flex items-center text-sm text-gray-500 gap-1"><MapPin size={16}/>{item.distance}</span></p>
                        <div className="flex gap-4"><span className="text-sm bg-green-100 px-2 rounded-full py-1">{item.listings} listings</span>
                            <div className="text-sm flex gap-2 items-center bg-green-200 rounded-full px-2 font-bold text-green-700"> <div className="w-2 h-2 bg-green-800 rounded-full inline-block"/> {item.reply}% reply</div>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    )
}

export function ShopMap({item}:ShopmapProps){
    return(
       
        <div className="absolute items-end bg-white pt-2   rounded-xl">
            <div className="p-2">
                <div className="flex items-start gap-2 ">
                <div className="px-2 py-2 bg-gray-600 rounded-xl text-white font-bold">{item.f_car}</div>
                <div className="">
                    <span className="font-bold">{item.name}</span> 
                    <span className="text-sm bg-green-200 px-4 py-1 rounded-full text-green-900 font-bold items-center">
                        <div className="w-2 h-2 bg-green-800 rounded-full items-end inline-block"/> Live</span>
                    <p className="flex gap-2"><span className="flex items-center font-bold text-sm"> <Star className="text-yellow-500" size={16}/> {item.rate}</span>
                    <span className="text-gray-500 text-sm">({item.rate2})</span>
                    <span className="flex items-center text-sm text-gray-500 gap-1"><MapPin size={14}/>Bole Atlas</span></p>
                </div>
            </div>
            <div className= "grid grid-cols-4 gap-2">
                <div className="border-r px-3 my-2">
                    <p className="font-tn-mono font-bold">{item.listings}</p>
                    <p className="text-sm text-gray-500">listings</p>
                </div>
                <div className="border-r px-3 my-2">
                    <p className="font-tn-mono font-bold">{item.reply}%</p>
                    <p className="text-sm text-gray-500">reply rate</p>
                </div>
                <div className="border-r px-3 my-2">
                    <p className="font-tn-mono font-bold">~{item.response}</p>
                    <p className="text-sm text-gray-500">response</p>
                </div>
                <div className=" px-3 my-2">
                    <p className="font-tn-mono font-bold">{item.distance}</p>
                    <p className="text-sm text-gray-500">away</p>
                </div>
            </div>

            </div>
            
            <div className="bg-orange-100 flex gap-2 p-2 px-6 rounded-b-xl">
                <Pill kind="outline" size="lg" className="ml-3 px-10 py-1 "  icon="eye" >
                View Shop
                </Pill>
                <Pill size="lg" className="px-10 py-1 "  icon="tg" >
                contact
                </Pill>

            </div>
            
            
        </div>

)
}