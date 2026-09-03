"use client"
import {  ListSortDescendingIcon} from "lucide-react"
import { MapPin } from "lucide-react"

import Shops from "@/components/home/shopmap"
import { ShopMap } from "@/components/home/shopmap"




export default function MapPage(){
    const shops= [
        {f_car:"AE" , name: "Alemda Electronics",listings:142, reply:98, response:"14m", distance:"0.6Km" , rate:4.9,rate2:312},
        {f_car:"SC" , name: "Sheba Computers",listings:96, reply:98, response:"17m", distance:"1.1Km" , rate:4.9 ,rate2:188},
        {f_car:"AD" , name: "Axum Digital Store",listings:142, reply:98, response:"14m", distance:"0.6Km" , rate:4.9 ,rate2:251},
        {f_car:"MT" , name: "Mosaic Tech Hub",listings:142, reply:98, response:"14m", distance:"0.6Km" , rate:4.9,rate2:204}
    ]
    return (
        <div>
            <div>
                <div className="flex justify-between items-center border-b gap-4" >
                    <div className=" rounded-2xl mb-3">
                        <h1 className="font-bold text-2xl pl-6">Verified shops in bole</h1>
                        <p className="pl-6 text-sm text-gray-500"><span>8 shops</span> on the map.all reconfirmed within 24h</p>
                    </div>
                
                    <div className="flex justify-end gap-4">
                        <input type="text" className="border rounded-lg px-4 py-2 self-end" placeholder="Search shops or area" />
                        <div className="border flex rounded-2xl gap-4 bg-gray-200 items-center justify-center "><span className="px-3 flex"><ListSortDescendingIcon/>List</span><span className="flex items-center text-white bg-black rounded-2xl py-2 px-4 justify-end font-bold text-sm"><MapPin size={16}/> Map</span></div>
                    </div>
                </div>
                
            </div>
             <div className="grid grid-cols-[1fr_3fr]">
                <div className="border-r border-gray-300 my-1">
                    <div className="flex gap-1 my-4">
                         <button className="border rounded-full px-3 py-1 border-gray-400 hover:bg-black hover:text-white bg-gray-200 text-sm">All</button>
                         <button className="border rounded-full px-3 py-1 border-gray-400 hover:bg-black hover:text-white bg-gray-200 text-sm">Phones</button> 
                         <button className="border rounded-full px-3 py-1 border-gray-400 hover:bg-black hover:text-white bg-gray-200 text-sm">Laptops</button> 
                         <button className="border rounded-full px-3 py-1 border-gray-400 hover:bg-black hover:text-white bg-gray-200 text-sm">Audio</button><br />
                        <button className="border rounded-full px-3 py-1 border-gray-400 hover:bg-black hover:text-white bg-gray-200 text-sm">cameras</button>
                    </div>
                   
                   {shops.map((item) => (
                    <Shops key={item.f_car} item={item} />
                   ))

                   }
                   
                </div>
                <div>
                    <div className="absolute flex w-fit items-center gap-2 border rounded-full bg-white py-1 ml-4 px-3 mt-4">
                        <div className="w-3 h-3 bg-green-800 rounded-full inline-block"/>
                        <div> confirmed stock today</div>
                    </div>
                    <div className="h-120 bg-gray-300  flex flex-col inset-0 justify-end p-4">
                        <ShopMap item={shops[1]} />
                    </div>
                    
                    
                </div>
            </div>
        </div>
       
    )
}