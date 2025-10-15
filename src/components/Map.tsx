"use client"
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.9836, 40.7469],
      zoom: 14,
    });

    new mapboxgl.Marker({ color: "#e63946" })
      .setLngLat([-73.9836, 40.7469])
      .setPopup(new mapboxgl.Popup().setHTML("<b>Rethink Food HQ</b><br>136 Madison Ave"))
      .addTo(map.current);
  }, []);

  return <div ref={mapContainer} className="w-full h-[500px]" />;
}