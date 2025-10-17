"use client"
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const restaurantColor = "#1e453e";
const cboColor = "#00D100";

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const enriched = `${address}, New York, NY`;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(enriched)}.json?access_token=${mapboxgl.accessToken}`
    );

    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    return data.features[0].center || null; 
  } catch (error) {
    return null; 
  }
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [organizations, setOrganizations] = useState<Array<any>>([]);;
  const [mapReady, setMapReady] = useState<boolean>(false);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        const data = await response.json();
                
        if (data.success) {
          setOrganizations(data.organizations);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    }

    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.9836, 40.7469],
      zoom: 14,
    });

    map.current.on("load", () => {
      setMapReady(true);
    });

    new mapboxgl.Marker({ color: "#e63946" })
      .setLngLat([-73.9836, 40.7469])
      .setPopup(new mapboxgl.Popup().setHTML("<b>Rethink Food HQ</b><br>136 Madison Ave"))
      .addTo(map.current);
  }, []);

  useEffect(() => {
    if (!mapReady || !map.current || organizations.length === 0) return;

    async function addMarkers() {
      for (const org of organizations) {
        const coords = await geocodeAddress(org.street_address);
        if (coords) {
          const markerColor = org.org_type === "restaurant" ? restaurantColor : cboColor;
          new mapboxgl.Marker({ color: markerColor })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML(`<b>${org.name}</b><br>${org.street_address}`))
            .addTo(map.current!);
        }
      }
    }

    addMarkers();
  }, [organizations, mapReady]);

  return <div ref={mapContainer} className="w-full h-[500px]" />;
}