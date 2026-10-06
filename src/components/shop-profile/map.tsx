import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

export default function Map({ lat, lng, label }: { lat: number, lng: number, label: string }) {
    const { isLoaded } = useJsApiLoader({
        id: 'tinsae-shop-map',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
    });
    const center = {
        lat: lat,
        lng: lng
    };
    
    if (!isLoaded) return <div className="flex items-center justify-center h-full">Loading Map...</div>;
    return (
        <GoogleMap
            mapContainerStyle={{width: '100%', height: '100%'}}
            center={center}
            zoom={10}
        >
            <Marker position={center} label={label} />
        </GoogleMap>
    );
}
