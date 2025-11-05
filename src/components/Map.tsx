"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useFilter } from '@/context/FilterContext';
import { Organization } from "@/app/page";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const DEFAULT_CENTER: [number, number] = [-73.9836, 40.7469];
const DEFAULT_ZOOM = 14;



function createPngMarkerElement(orgType?: string): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const isRestaurant = orgType === "restaurant";
    
    const img = document.createElement("img");
    img.src = isRestaurant ? "/restaurant-marker.png" : "/cbo-marker.png";
    img.alt = isRestaurant ? "Restaurant Marker" : "CBO Marker";
    img.style.width = "30px";
    img.style.height = "auto";
    img.style.display = "block";
    img.draggable = false;
    
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img); 
  });
}

async function createMarker(
  type: 'restaurant' | 'cbo',
  lngLat: [number, number],
  mapInstance: mapboxgl.Map
): Promise<mapboxgl.Marker> {
  const el = await createPngMarkerElement(type); 
  const marker = new mapboxgl.Marker({ 
    element: el, 
    anchor: 'bottom'
  })
    .setLngLat(lngLat)
    .addTo(mapInstance);
  return marker;
}
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const enriched = `${address}, New York, NY`;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(enriched)}.json?access_token=${mapboxgl.accessToken}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    return data.features[0].center || null;
  } catch (error) {
    return null;
  }
}

export default function Map({
  selectedOrg,
}: {
  selectedOrg: Organization | null;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const { filteredDestinations, allDestinations, isFilterActive } = useFilter();

  const [mapReady, setMapReady] = useState<boolean>(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-73.9836, 40.7469],
      zoom: 14,
    });

    map.current.on("load", () => {
      setMapReady(true);

      const centerMarker = new mapboxgl.Marker({ color: "#e63946" })
        .setLngLat([-73.9836, 40.7469])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            "<b>Rethink Food HQ</b><br>136 Madison Ave"
          )
        )
        .addTo(map.current!);
    });
  }, []);

  const clearMarkers = () => {
    markers.forEach((m) => m.remove());
    setMarkers([]);
  };

  useEffect(() => {
    if (!mapReady || !map.current) return;

    const dataToPlot = isFilterActive ? filteredDestinations : allDestinations;
    if (!Array.isArray(dataToPlot) || dataToPlot.length === 0) {
      clearMarkers();
      return;
    }

    async function addMarkers() {
      clearMarkers();

      const newMarkers: mapboxgl.Marker[] = [];
      const orgs = Array.isArray(dataToPlot) ? dataToPlot : [];

      for (const org of orgs) {
        if (!org.street_address) continue;

        const coords = await geocodeAddress(org.street_address);
        if (!coords) continue;

        const popupHTML = `
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong>${org.name ?? "Unknown Org"}</strong><br/>
            ${org.street_address ?? ""}<br/>
            ${org.city ?? ""} ${org.state ?? ""} ${org.zip ?? ""}
          </div>
        `;

        const m = await createMarker((org.org_type === 'restaurant' ? 'restaurant' : 'cbo'), coords as [number, number], map.current!);
        m.setPopup(new mapboxgl.Popup().setHTML(popupHTML));

        newMarkers.push(m);
      }

      setMarkers(newMarkers);
    }

    addMarkers();
  }, [mapReady, isFilterActive, filteredDestinations, allDestinations]);

  useEffect(() => {
    if (!mapReady || !map.current || !selectedOrg || !selectedOrg.street_address) return;

    (async () => {
      const coords = await geocodeAddress(selectedOrg.street_address!);
      if (!coords) return;
      map.current!.flyTo({
        center: coords,
        zoom: 15,
        essential: true,
      });
    })();
  }, [selectedOrg, mapReady]);

  const handleZoomIn = () => {
    if (!map.current) return; map.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (!map.current) return; map.current.zoomOut();
  };

  const handleResize = () => {
    if (!map.current) return;
    map.current.resize();
    map.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      essential: true,
    });
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      <button
          onClick={handleResize}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-100"
          aria-label="Resize map"
          title="Resize map"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        <div className="flex flex-col bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center border-b border-gray-300 hover:bg-gray-100 text-gray-700 text-xl font-medium"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-700 text-xl font-medium"
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
}
