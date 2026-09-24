import Presshead, { BrandAssets, FactSheet, PressCoverage } from "@/components/press/press";



export default function PressPage(){
    return(
        <div >
            <div className="mx-auto max-w-7xl">
                <Presshead/>
                <FactSheet/>
            </div>
            
            <BrandAssets/>
            <div className="mx-auto max-w-7xl">
                <PressCoverage/>
            </div>
        </div>
    )
}