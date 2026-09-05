"use client"
import { Icon } from "@/components/tinsae/icon"
import Shopcard from "@/components/home/shopcard"

export default function ShopsPage(){
    const shops= [
        {f_car:"AE" , name: "Alemda Electronics",listings:142, reply:98, response:"14m", distance:"0.6Km" , rate:4.9,rate2:312},
        {f_car:"SC" , name: "Sheba Computers",listings:96, reply:98, response:"17m", distance:"1.1Km" , rate:4.9 ,rate2:188},
        {f_car:"AD" , name: "Axum Digital Store",listings:142, reply:98, response:"14m", distance:"0.6Km" , rate:4.9 ,rate2:251},
        {f_car:"MT" , name: "Mosaic Tech Hub",listings:142, reply:98, response:"14m", distance:"0.6Km" , rate:4.9,rate2:204}
    ]
    return(
        <div className="max-w-6xl mx-auto">
            <div className="border-b">
                <div className="flex border rounded-full w-fit px-2 items-center gap-2"><Icon name="shield" className="text-green-500"/> <span>Every shop verified by tinsae</span></div>
                <p className="font-bold text-xl mt-2">The shops behind Bole&apos;s electronics</p>
                <div className="flex items-center justify-between my-2">
                    <p className="text-gray-500">Browse <span className="text-gray-900 font-bold">8 verified shops</span> by rating, reply speed and distance - the visit</p>
                        <div className="border flex rounded-2xl gap-4 bg-gray-200 items-center justify-end w-fit ">
                            <span className="flex items-center text-white bg-black rounded-2xl py-2 px-4 justify-end font-bold text-sm"><Icon name="sort"/>List</span>
                            <span className=" pr-3 flex items-center"><Icon name="pin" size={16}/> Map</span>
                        </div>
                </div>
                
                <div className=" flex items-center justify-between pb-2">
                    <div className="flex gap-1">
                        <button className="border rounded-full px-4 py- hover:bg-black hover:text-white w-min text-center leading-tight text-sm">All areas</button>
                        <button className="border rounded-full px-2 py-1 hover:bg-black hover:text-white text-sm ">Atlas</button>
                        <button  className="border rounded-full px-2 py-1 hover:bg-black hover:text-white text-sm ">Friendship</button>
                        <button  className="border rounded-full px-2 py-1 hover:bg-black hover:text-white text-sm ">Olympia</button>
                        <button  className="border rounded-full px-2 py-1 hover:bg-black hover:text-white text-sm ">Japan</button>
                        <button  className="border rounded-full px-2 py-1 hover:bg-black hover:text-white text-sm ">Medhanialem</button>
                    </div>
                    

                    <div className=" flex items-center justify-end gap-1">
                        <span>Sort</span>
                        <button className="border rounded-full px-4 py-1 hover:bg-red-100 hover:text-red-600 w-min text-center leading-tight text-sm">Top rated</button>
                        <button className="border rounded-full px-2 py-1  hover:bg-red-100 hover:text-red-600 text-sm ">Fastest Reply</button>
                        <button className="border rounded-full px-2 py-1  hover:bg-red-100 hover:text-red-600 text-sm ">Nearest</button>
                        <button className="border rounded-full px-4 py-  hover:bg-red-100 hover:text-red-600 w-min text-center leading-tight text-sm">most listings</button>
                    </div>
                </div>
            </div>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-3 pt-2">
                {shops.map((item)=>(
                    <Shopcard items={item} key={item.name}/>
                ))

                }
            </div>

        </div>
    )
}