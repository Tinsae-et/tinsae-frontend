import { Icon } from "@/components/tinsae/icon"




const Login =() =>{
    return(
        <div className="grid grid-cols-2 p">
            <div className="hidden lg:flex lg:w  overflow-hidden p-5 relative flex bg-[linear-gradient(45deg,theme(colors.amber.500)_-99%,theme(colors.black),theme(colors.amber.500)_190%)] text-white h-screen ">
                <h1 className="absolute top-5 left-5">ትንሳኤ Tinsae</h1>
                <div className="flex flex-col mt-50  gap-3">
                    <h1 className="font-tn-mono text-xs text-gray-400">BOLE . ADDIS ABABA</h1>
                    <h1 className="font-bold text-4xl">The verified way to buy <br /> electronics in Bole.</h1>
                    <p className="text-sl text-gray-400">Compare live prices across verified shops, then message<br/> the seller on Telegram - no middlemen, no fake listings.</p>
                    <div className="flex gap-4">
                        <div>
                            <h1 className="font-tn-mono text-2xl">340+</h1>
                            <h1 className="text-sm text-gray-400">verified shops</h1>
                        </div>

                        <div>
                            <h1 className="font-tn-mono text-2xl">2,840</h1>
                            <h1 className="text-sm text-gray-400 ">live listings</h1>
                        </div>

                        <div>
                            <h1 className="font-tn-mono text-2xl">⁓4 min</h1>
                            <h1 className="text-sm text-gray-400 ">median reply</h1>
                        </div>
                    </div>


                    <div className="flex border border-gray-700 bg-transparent p-3 rounded-xl mt-40  gap-3 ">
                        <div className="bg-green-900 p-2 rounded-lg">
                            <Icon className="text-green-300" name="shield"/>

                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm">every shop is  identity-checked in person before it can <br/> list.<span className="font-bold">Look for the badge</span></span>
                           
                        </div>
                    </div>

                    
                </div>
                
                
            </div>

            <div className="flex p-6 flex-col items-center justify-center gap-4 lg:w-full">
                <div className=" items-center justify-center">
                    <h1 className="font-bold text-xl">Well come back</h1>
                    <p className="text-sm text-gray-400">Sigin in to your seved listings.alerts and chats.</p>
                    <button className="flex items-center justify-center bg-blue-400 py-2 px-20 rounded-xl text-white gap-2 my-5">
                        <Icon name="tg"/>
                        <>Continue with Telegram</>
                    </button>
                    <div className="flex text-sm item-center justify-center text-gray-400 mb-4">
                        <Icon name="bolt"/>
                        <>Fastest - most buyers chat shops here anyway</>
                    </div>
                    <div className="flex justify-center items-center gap-3">
                        <div className="border relative w-full "></div>
                        <h1 className="text-sm  text-gray-400">OR</h1>
                        <div className="border relative w-full"></div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 font-bold ">Phone number</p>
                        <div className="border rounded-xl pl-4 bg-gray-100 "><span className="font-tn-mono">  +251   </span>  
                            <input className="border-l rounded-r-lg p-4 px-9 bg-white  font-tn-mono " placeholder="91 234 5678">
                            </input>
                        </div>
                        <button className="flex items-center justify-center bg-orange-700 py-3 px-33  rounded-xl text-white gap-2 my-5 my-6"><p>Send code  →</p></button>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 text-xs">New to Tinsae? <button className="text-orange-700 font-bold ">Create one free</button></p>
                        <p className="text-gray-400 text-xs">By continuing you agree to Tinsae&apos;s <a href="" >Terms</a>&<a href="">Privacy Policy</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Login