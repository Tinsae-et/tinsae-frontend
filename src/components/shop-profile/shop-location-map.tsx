"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "@/lib/config";
import type { LatLng } from "@/lib/shop-location";

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  // One-finger scroll keeps scrolling the page on phones; two fingers pan.
  gestureHandling: "cooperative",
};

/**
 * The shop's pin on a Google map. Loading is deferred until the card is near
 * the viewport, and any failure (no key, script error) falls back to a short
 * message — the address and directions link around it don't depend on it.
 */
export function ShopLocationMap({ location, label }: { location: LatLng; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      {!GOOGLE_MAPS_API_KEY ? (
        <MapMessage>Map unavailable</MapMessage>
      ) : nearViewport ? (
        <LoadedMap location={location} label={label} />
      ) : (
        <MapMessage>Loading map…</MapMessage>
      )}
    </div>
  );
}

function LoadedMap({ location, label }: { location: LatLng; label: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "tinsae-shop-map",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const center = useMemo(
    () => ({ lat: location.lat, lng: location.lng }),
    [location.lat, location.lng]
  );

  if (loadError) return <MapMessage>Map unavailable</MapMessage>;
  if (!isLoaded) return <MapMessage>Loading map…</MapMessage>;
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={16}
      options={MAP_OPTIONS}
    >
      <MarkerF position={center} label={label} />
    </GoogleMap>
  );
}

function MapMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-tn-mute flex h-full items-center justify-center p-4 text-xs">
      {children}
    </div>
  );
}

export default ShopLocationMap;
