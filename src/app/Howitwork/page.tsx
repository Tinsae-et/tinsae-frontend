import { Icon } from "@/components/tinsae/icon"
import { Pill } from "@/components/tinsae/pill"


const Howit = () => {
    return(
        <div className="flex flex-col gap-10 px-10">
            <div>
                <div className="grid lg:grid-cols-2 gap-4">
                    <div className=" flex flex-col gap-5">
                        <h1 className="font-bold text-5xl">Stock you can trust, before you  <span className="text-red-600">cross town.</span></h1>
                        <p className="text-lg text-gray-700">Tinsae is verified electronics marketplace for Addis. Every shop is checkd in person, and every listing is reconfrimed in stock - so the price you see is the one that's actually on the shelf.</p>
                        <div className="flex gap-4 ">
                            <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">Start browsing</Pill>
                            <Pill kind="outline" size="lg" icon="tg" href="#">List your shop</Pill>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="border p-4 rounded-2xl">
                            <div className="text-gray-500 font-bold text-sm flex items-center gap-2 "> <div className="rounded-full bg-gray-400 size-3 "></div>THE OLD WAY</div>
                            <div className="flex flex-col gap-3 border-b py-4">
                                <div className="flex bg-gray-100 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-200 p-4 size-4 rounded">
                                        
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Call around</span>
                                        <span className="text-xs text-gray-500">prices are hearsay</span>
                                    </div>
                                </div>
                                
                                <div className="flex bg-gray-100 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-200 p-4 rounded-xl">
                                        
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Taxi to bole</span>
                                        <span className="text-xs text-gray-500">Maybe in stock</span>
                                    </div>
                                </div>

                                <div className="flex bg-gray-100 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-200 p-4 size-4 rounded">
                                      
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Shop 1</span>
                                        <span className="text-xs text-gray-500">Sold out</span>
                                    </div>
                                </div>

                                <div className="flex bg-gray-100 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-200 p-4 rounded-xl">

                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Shop 2</span>
                                        <span className="text-xs text-gray-500">Wrong variant</span>
                                    </div>
                                </div>

                                <div className="flex bg-gray-100 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-200 p-4 rounded-xl">

                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Shop 3</span>
                                        <span className="text-xs text-gray-500">in stock— overpriced</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 py-5">
                                <Icon name="clock" className="font-bold text-orange-300"/>
                                <p className="text-gray-500 font-tn-mono">Half a day . 5 shops . 1 sale</p>
                            </div>
                        </div>

                        <div className="border p-4 rounded-2xl bg-black text-white">
                            <div className="font-bold flex items-center gap-2"> <div className="rounded-full bg-green-600 size-3 "></div> WITH TINSAE</div>
                            <div className="flex flex-col gap-3 border-b border-gray-600 py-4">
                                <div className="flex bg-gray-900 border border-gray-700 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-600 p-2 rounded-lg">
                                        <Icon className="text-white" name="search"/>

                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Search the product</span>
                                        <span className="font-tn-mono text-xs text-gray-500">every shop, live prices</span>
                                    </div>
                                </div>
                                
                                <div className="flex border border-gray-700 bg-gray-900 p-3 rounded-xl gap-3">
                                    <div className="bg-green-600 p-2 rounded-lg">
                                        <Icon className="text-white" name="shield"/>

                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">See it confirmed</span>
                                        <span className="text-xs text-gray-500 font-tn-mono">in stock 1h ago</span>
                                    </div>
                                </div>

                                <div className="flex bg-gray-900 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-600 p-2 rounded-lg">
                                        <Icon className="text-white" name="tg"/>

                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Message on Telegram</span>
                                        <span className="text-xs text-gray-500 font-tn-mono">agreed: 142,500</span>
                                    </div>
                                </div>

                                <div className="flex bg-gray-900 p-3 rounded-xl gap-3">
                                    <div className="bg-gray-600 p-2 rounded-lg">
                                        <Icon className="text-white" name="pin"/>

                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Visit & pay</span>
                                        <span className="text-xs text-gray-500">Inspect, then buy</span>
                                    </div>
                                </div>

                            </div>
                            <div className="flex items-center gap-2 py-5">
                                <Icon name="bolt" className="font-bold text-green-600"/>
                                <p className="text-gray-500 font-tn-mono">One trip . right shop . right price</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex gap-3 text-sm">
                    <span className="text-gray-500 font-bold font-tn-mono">412 verified shops</span>
                    <span className="text-gray-500 font-bold font-tn-mono" >96% reconfirmed today</span>
                </div>

            </div>
            

            <div>
                <div className="flex flex-col gap-4 lg:w-[50%]">
                    <p className="text-red-500 font-bold">THE MODEL</p>
                    <h1 className="text-4xl   font-bold">Three things make a listing trustworthy.</h1>
                    <p className="text-gray-600">Most market places show you a photo and price. Tinsae shows you prove that the shop is real and the item is actually there, right now.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                    <div className="rounded-xl p-3">
                        <div className="bg-green-100 inline-block rounded-xl p-3" >
                            <Icon name="shield" className="text-green-600 " size={30}/>
                        </div>
                        <h1 className="font-bold text-xl my-2">Verified in person</h1>
                        <p className="text-gray-500 text-sm" >Before a shop appears on Tinsae, our team confirms a real business at a real address in Bole - phone, documents, and a pyshical store visit.</p>
                        
                    </div>

                    <div className="rounded-xl p-3">
                        <div className="bg-orange-100 inline-block rounded-xl p-3" >
                            <Icon name="bolt" className="text-orange-600 " size={30}/>
                        </div>
                        <h1 className="font-bold text-xl my-2">Confirmed every morning </h1>
                        <p className="text-gray-500 text-sm" >Shop re-confirm what's in stock through our Telegram bot daily. A freshness dot shows exactly how recent each listing is exatly how recent each listing is — stale ones drop off.</p>
                        
                    </div>

                    <div className=" rounded-xl p-3">
                        <div className="bg-blue-100 inline-block rounded-xl p-3" >
                            <Icon name="pin" className="text-blue-600 " size={30}/>
                        </div>
                        <h1 className="font-bold text-xl my-2">Bought in person</h1>
                        <p className="text-gray-500 text-sm" >you message the shop, agree on terms, then walk in to inspect and pay. Tinsae never holds you money or stands between you and the seller.</p>
                        
                    </div>
                    
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="md:w-[60%]">
                    <h1 className="text-red-500 font-bold text-sm">FOR BUYERS</h1>
                    <h1 className=" font-bold text-4xl">From search to shop floor, in four staps.</h1>
                </div>
                <div className="grid md:grid-cols-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-red-600" name="search"/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-red-500 text-sm">01</p>
                        <p className="text-xl font-bold">Search the product</p>
                        <p className="text-sm text-gray-400 pr-4">Type what you want . Every verified shop carrying it appears, sorted py price and freshness.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-red-600" name="shield"/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className=" font-tn-mono text-red-500 text-sm">02</p>
                        <p className="text-xl font-bold">Check it's confirmed</p>
                        <p className="text-sm text-gray-400">The freshness dot tells you when the shop last confirmed stock—hours. not weeks </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-red-600" name="tg"/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-red-500 text-sm">03</p>
                        <p className="text-xl font-bold">Contact on Telegram</p>
                        <p className="text-sm text-gray-400">Message the shop directly. Ask questions. agree a price and a time to come by.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-red-600" name="pin"/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-red-500 text-sm">04</p>
                        <p className="text-xl font-bold">Visit & pay in person</p>
                        <p className="text-sm text-gray-400">Walk in. inspect the item. complete the  purchase. Tinsae stays out of the money.</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 border bg-gray-100 p-10 rounded-2xl ">
                <div className="flex flex-col gap-4">
                    <p className="text-red-500 font-bold text-sm">THE DIFFERENTIATOR</p>
                    <p className="text-4xl font-bold">A listing is only as good as its <span className="text-orange-700">last confirmation.</span></p>
                    <p className="text-gray-500">Each morning the bot asks shops one question: is this still in stock, at this price? Thier reply time tamps the listing - and you see it as a freshness dot the moment you search.</p>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <div className=" flex items-center justify-center bg-green-200 p-1 size-6 rounded-full">
                                <div  className="bg-green-600 size-4 rounded-full"></div>
                            </div>
                            <p className="text-gray-500"><span className="font-bold text-black">Green. </span>Comfirmed within 6 hours - buy with confidence</p>
                        </div>

                        <div className="flex gap-2">
                            <div className=" flex items-center justify-center bg-amber-200 p-1 size-6 rounded-full">
                                <div  className="bg-amber-600 size-4 rounded-full"></div>
                            </div>
                            <p className="text-gray-500"><span className="font-bold text-black">Amber. </span>6-24 hours old — likely fine. worth a quick message</p>
                        </div>

                        <div className="flex gap-2">
                            <div className=" flex items-center justify-center bg-gray-200 p-1 size-6 rounded-full">
                                <div  className="bg-gray-400 size-4 rounded-full"></div>
                            </div>
                            <p className="text-gray-500"><span className="font-bold text-black">Gray. </span>Over a day — Tinsae quietly stops showing it</p>
                        </div>

                    </div>
                </div>
                <div className="bg-tn-ink font-tn-mono rounded-2xl p-5">
                    <div className="mb-3.5 flex items-center gap-2 border-b border-white/10 pb-3">
                        <Icon name="tg" size={16} className="text-tn-telegram" />
                        <span className="text-[13px] font-bold text-white">@TinsaeStockBot</span>
                        <span className="bg-tn-green ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-white">
                        ONLINE
                        </span>
                    </div>
                    <div className="flex flex-col gap-2.5 text-[12.5px]">
                        <p className="max-w-[88%] self-start rounded-xl bg-[#262626] px-3 py-2.5 text-white/90">
                        ☀️Good morning! Still have <span className="text-[#FFB69E]">iPhone 15 Pro 256GB</span> in
                        stock at 142,500?
                        </p>
                        <p className="bg-tn-red max-w-[70%] self-end rounded-xl px-3 py-2.5 text-whitebg-tn-red max-w-[70%] self-end rounded-xl px-3 py-2.5 text-white">
                        ✅ Yes · 3 units
                        </p>
                        <p className="text-tn-green max-w-[88%] self-start rounded-xl bg-[#262626] px-3 py-2.5">
                        Confirmed 09:14 · pinned to top of search ↑
                        </p>
                            <div className="flex gap-2 border-t border-gray-600 pt-4 mt-2">
                                <div className=" flex items-center justify-center bg-green-900 p-1 size-4 rounded-full">
                                    <div  className="bg-green-600 size-2 rounded-full"></div>
                            </div>
                            <p className="text-gray-500">Buyers now see a green dot . "1h ago"</p>
                        </div>

                    </div>
        </div>
            </div>
            
            <div className="flex flex-col gap-8">
                <div className="md:w-[60%]">
                    <h1 className="text-green-600 font-bold text-sm">FOR SHOP OWNERS</h1>
                    <h1 className=" font-bold text-4xl">Get listed, get verified, get ready- to-buy leads.</h1>
                </div>
                <div className="grid md:grid-cols-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-green-600" name="building"/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-green-600 text-sm">01</p>
                        <p className="font-bold text-xl">Register your shop</p>
                        <p className="text-sm text-gray-400 pr-4">Claim an existing listing or create your storefront with hours. location and photos</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-green-600" name="shield" size={20}/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-green-600 text-sm">02</p>
                        <p className="text-xl font-bold">Get verified </p>
                        <p className="text-sm text-gray-400">We confirm you phone, documents and pay a puick visit to your store. then the badge is yours.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2"><Icon className="text-green-600" name="tg"/></div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-green-600 text-sm">03</p>
                        <p className="text-xl font-bold">Connect the bot</p>
                        <p className="text-sm text-gray-400">Link Telegram and import your stock. One message each morning keeps every listing fresh</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 items-center">
                            <div className="bg-gray-100 border rounded-lg p-2">💬</div>
                            <div className="border relative w-full">
                                <div className="absolute size-2 bg-gray-300 right-0 translate-y-[-50%] rounded-full"></div>
                            </div>
                        </div>
                        <p className="font-tn-mono text-green-600 text-sm">04</p>
                        <p className="text-xl font-bold">Receive leads</p>
                        <p className="text-sm text-gray-400">Ready-to-buy customers reach you directly — no commission, no payment handlling, ever.</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 items-center justify-center pt-20">
                <h1 className="font-bold text-orange-600 text-sm">WHERE WE STAND</h1>
                <h1 className="font-bold text-4xl">What Tinsae is - and isn't.</h1>
            </div>
            <div className="flex flex-col grid grid-cols-2 gap-4">
                <div className="border bg-green-100 rounded-xl p-4 pt-7 ">
                    <h1 className="flex text-green-700 font-bold text-sm gap-2 mb-4" ><Icon name="check" className="rounded w-6 h-6 text-sm text-white bg-green-700" /> What we are</h1>
                    <div className="flex flex-col gap-4">
                        <h1 className="flex text-gray-500 text-sm gap-2"><Icon name="check" className=" text-green-600"/>  A directory of shops verified in person</h1>
                        <h1 className="flex text-gray-500 text-sm gap-2"><Icon name="check" className="text-green-600"/>  A live, daily-confirmed price comparison</h1>
                        <h1 className="flex text-gray-500 text-sm gap-2"><Icon name="check" className="text-green-600"/>  A direct line to the shop on Telegram</h1>
                        <h1 className="flex text-gray-500 text-sm gap-2"><Icon name="check" className="text-green-600"/>  Free to browse with no markup on any price</h1>
                    </div>
                </div>

                <div className="pt-7 bg-gray-100 rounded-xl border pl-6 p-6">
                    <h1 className="flex font-bold text-sm gap-2 mb-5 " > <span className="items-center bg-gray-200 rounded px-2">-</span> What we,re not</h1>
                    <div className="flex flex-col gap-4">
                        <h1 className="flex text-gray-500 text-sm gap-3"><span>- </span>A place that hold or processes your payment</h1>
                        <h1 className="flex text-gray-500 text-sm gap-3"><span>- </span>A delivery or escrow service</h1>
                        <h1 className="flex text-gray-500 text-sm gap-3"><span>- </span>A reseller — we never own the inventory</h1>
                        <h1 className="flex text-gray-500 text-sm gap-3"><span>- </span>A reviews-only site with stale uncheked listings</h1>
                    </div>
                </div>

            </div>

            <div className="bg-black flex flex-cols grid lg:grid-cols-4 rounded-xl py-12 p-5 mt-10">
                <div className="border-r border-gray-600 pl-3">
                    <p className="font-tn-mono text-white text-5xl font-bold">8,920</p>
                    <p className="text-gray-300 text-sm">listing live today</p>
                </div>

                <div className="border-r border-gray-600 pl-3">
                    <p className="font-tn-mono text-white text-5xl font-bold">412</p>
                    <p className="text-gray-300 text-sm">verified shops in Bole</p>
                </div>
                <div className="border-r border-gray-600 pl-3">
                    <p className="font-tn-mono text-white text-5xl font-bold">96%</p>
                    <p className="text-gray-300 text-sm">reconfirmed within 24h</p>
                </div>
                <div className=" pl-3">
                    <p className="font-tn-mono text-white text-5xl font-bold">~3.4h</p>
                    <p className="text-gray-300 text-sm">avarage shop response</p>
                </div>
            </div>

            <div className="grid grid-cols-2">
                <div className="pt-20 ">
                    <div className="flex flex-col bg-orange-600 rounded-xl items-center justify-center p-6 pb-20 m-5 gap-2">
                        <h1 className="font-tn-amh self-center text-white font-bold text-9xl ">ትንሳኤ</h1>
                        <h1 className="text-white text-sm">T I N S A E</h1>
                        <h1 className="italic text-white">"rising"</h1>
                    </div>
                    
                </div>

                <div className="flex flex-col gap-5 p-4">
                    <h1 className="text-red-500 text-sm font-bold">WHY WE BUILT IT</h1>
                    <h1 className="font-bold text-4xl">Bole runs on trust between people. We just make it visible.</h1>
                    <p className="text-sm text-gray-600">Addis already has hundreds of honest electronics shops. What it lacked was a way to prove it before you spend an afternoon in traffic - a shared. public record of who's real and what's actually in stock</p>
                    <p className="text-gray-400" ><span className="font-bold">Tinsae</span> — Amharic for <span className="italic">"rising"</span> —is that record. We verify the shops.the bot keeps them honest about stock, and you keep buying in person, the way Addis has always done business done business. We never touch the money. We just make the trust legible.</p>
                    <div className="gap-2">
                        <button className="text-white bg-black py-2 px-3 rounded-full pr-4 text-xs font-bold mt-3 mr-3">Meet the verified shops →</button> <button className="text-xs font-bold border rounded-full py-2 px-2 bg-gray-100">How verification works</button>
                    </div>
                </div>

            </div>

            <div className="flex flex-col items-center bg-gray-100 rounded-xl border gap-4 pt-10 pb-10">
                <h1 className="font-bold text-3xl">Ready to skip the wasted trips?</h1>
                <h1 className="text-gray-400 text-sm">Browse 8,920 live listing from 412 verified shops — or put your <br /> <span className=" flex flex-col items-center"> own shop on the map.</span></h1>
                <div className="flex gap-4 ">
                <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">Start browsing</Pill>
                    <Pill kind="outline" size="lg" icon="tg" href="#">List your shop</Pill>
                </div>
            </div>
        </div>
    )
}

export default Howit