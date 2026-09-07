import React from 'react'
import MapInfoSidebar from './map-info-sidebar'
import ListingSection from './listing-section'


function MainSection({tab}:{tab:string}) {
    return (
        <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-[1fr_320px]">

            {
                tab === "listings" ? (
                    <ListingSection/>
                ) : (
                    <h1>{tab}</h1>
                )
            }
            {/* Map + info sidebar */}
            <MapInfoSidebar />
        </div>
    )
}

export default MainSection;