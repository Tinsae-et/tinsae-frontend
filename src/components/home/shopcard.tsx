"use client"
import { Icon } from "@/components/tinsae/icon"
import { Pill } from "@/components/tinsae/pill"

interface Shop
    {
    f_car:string,
    name:string,
    listings:number,
    reply:number,
    response:string,
    distance:string,
    rate:number,
    rate2:number,
}
interface ShopProps{
    items:Shop
}



export default  function Shopcard({items}:ShopProps){
    return(
        <div className="relative rounded-2xl border border-orange-300 bg-gray-100 ">
                    <div className="h-19 bg-linear-to-r from-gray-500 to-gray-300 rounded-t-2xl border">
                        <div className="flex  justify-end"> 
                            <span className="flex items-center gap-1 mt-2 mr-4 border border-gray-400 rounded-full px-3 bg-gray-500 w-fit text-sm text-white">
                                <Icon name ="star" size={13}/>Top rated</span>
                        </div>
                    </div>
                    <div className="absolute top-10 py-4 px-4 ml-8 bg-gray-500 border border-gray-400 rounded-xl w-fit font-bold text-xl text-white">{items.f_car}</div>
                    <div className="flex justify-end">
                            <div className="bg-green-100 rounded-full px-2 text-green-700 text-sm font-bold flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-800 rounded-full inline-block"/>
                        Confirmed today</div>
                    </div>
                    <div className="pl-8 pt-3 ">
                        <p className="font-bold my-1">{items.name}</p>
                        <div>
                            <span className="text-yellow-400 flex items-center"><Icon name="star"/><Icon name="star"/><Icon name="star"/><Icon name="star"/><Icon name="star"/>
                                <span className="font-bold text-black text-sm flex gap-3 px-2 items-center">{items.rate}<p className="text-gray-500 text-sm"> ({items.rate2})</p></span>
                            </span>
                        </div>
                        <p className="flex my-2 items-center gap-2 text-sm text-gray-500"><Icon name="pin"/> Bole • Atlas • {items.distance} away</p>
                        <div className="text-gray-600 font-bold flex gap-2 mt-3">
                            <p className="bg-gray-200 border rounded-full px-3 py-1">Phones</p>
                            <p className="bg-gray-200 border rounded-full px-3 py-1">Laptops</p>
                            <p className="bg-gray-200 border rounded-full px-3 py-1">Since 2021</p>
                        </div>
                        <div className="grid grid-cols-3 bg-gray-200 rounded-2xl items-center pl-5 py-3 mt-5 mr-4">
                            <div className="border-r border-gray-300 items-center">
                                <p className="font-tn-mono text-xl font-bold">{items.listings}</p>
                                <p className="text-gray-500 text-sm">Listings</p>
                            </div>
                            <div className="border-r pl-3 border-gray-300 items-center">
                                <p className="font-tn-mono text-xl font-bold">{items.reply}%</p>
                                <p className="text-gray-500 text-sm">Replay rate</p>
                            </div>
                            <div className=" items-center  pl-3 ">
                                <p className="font-tn-mono text-xl font-bold">~{items.response}</p>
                                <p className="text-gray-500 text-sm">Response</p>
                            </div>
                        </div>
                        <div className="flex gap-2 py-5">
                            <Pill kind="outline" size="lg" className="ml-3 px-10 py-1 "  icon="eye" >
                            View Shop
                            </Pill>
                            <Pill size="lg" className="px-10 py-1 "  icon="tg" >
                            contact
                            </Pill>
                        </div>
                    </div>
                </div>
    )
}