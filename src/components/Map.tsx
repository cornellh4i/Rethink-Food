"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useFilter } from '@/context/FilterContext';
import { Organization } from "@/app/page";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const restaurantColor = "#1e453e";
const cboColor = "#00D100";

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
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.9836, 40.7469],
      zoom: 14,
    });

    map.current.on("load", () => {
      setMapReady(true);

      new mapboxgl.Marker({ color: "#e63946" })
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

      for (const org of dataToPlot) {
        if (!org.street_address) continue;

        const coords = await geocodeAddress(org.street_address);
        if (!coords) continue;

        const markerColor =
          org.org_type === "restaurant" ? restaurantColor : cboColor;

        const popupHTML = `
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong>${org.name ?? "Unknown Org"}</strong><br/>
            ${org.street_address ?? ""}<br/>
            ${org.city ?? ""} ${org.state ?? ""} ${org.zip ?? ""}
          </div>
        `;

        const marker = new mapboxgl.Marker({ color: markerColor })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup().setHTML(popupHTML))
          .addTo(map.current!);

        newMarkers.push(marker);
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

  return <div ref={mapContainer} className="w-full h-full" />;
}
