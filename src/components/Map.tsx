"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { PathLayer } from "@deck.gl/layers";
import { useFilter } from "@/context/FilterContext";
import { Organization } from "@/app/page";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const DEFAULT_CENTER: [number, number] = [-73.9836, 40.7469];
const DEFAULT_ZOOM = 14;

interface MealProvider {
  cbo_id: number;
  cbo_name: string;
  meal_provider: string;
  restaurant_id: number;
  cbo: {
    id: number;
    name: string;
    meal_format: string;
    meal_provider: string;
    open_distribution: boolean;
    cuisine_preference: string;
    annual_funding_goal: number;
    quarter_funding_goal: number;
    program_serving_minors: boolean;
    volunteer_opportunities: boolean;
  };
  restaurant: {
    id: number;
    name: string;
    cuisine: string;
    restaurant_type: string;
  };
}

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
  type: "restaurant" | "cbo",
  lngLat: [number, number],
  mapInstance: mapboxgl.Map
): Promise<mapboxgl.Marker> {
  const el = await createPngMarkerElement(type);
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(lngLat)
    .addTo(mapInstance);
  return marker;
}

async function geocodeAddress(
  address: string,
  borough?: string
): Promise<[number, number] | null> {
  try {
    const enriched = borough
      ? `${address}, ${borough}, New York, NY`
      : `${address}, New York, NY`;

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        enriched
      )}.json?access_token=${mapboxgl.accessToken}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    return data.features[0].center || null;
  } catch (error) {
    return null;
  }
}


function makeCurvedPath(
  source: [number, number],
  target: [number, number]
): [number, number][] {
  const [sx, sy] = source;
  const [tx, ty] = target;

  // Midpoint
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;

  // Vector source → target
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  // Perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;

  // Controls how "tall" the arch is relative to distance
  const curveFactor = 0.2; // tweak 0.1–0.3 as desired

  // Control point
  const cx = mx + px * curveFactor * len;
  const cy = my + py * curveFactor * len;

  const points: [number, number][] = [];
  const segments = 40; // smoothness

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * tx;
    const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ty;
    points.push([x, y]);
  }

  return points;
}

export default function Map({
  selectedOrg,
  onOrganizationSelect,
  onCBOIdSelect,
}: {
  selectedOrg: Organization | null;
  onOrganizationSelect?: (org: Organization) => void;
  onCBOIdSelect?: (cboId: number) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const deckOverlay = useRef<MapboxOverlay | null>(null);

  const { filteredDestinations, allDestinations, isFilterActive } = useFilter();

  const [mapReady, setMapReady] = useState<boolean>(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [connectedCBOs, setConnectedCBOs] = useState<MealProvider[]>([]);
  const [connectedRestaurants, setConnectedRestaurants] = useState<MealProvider[]>([]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.current.on("load", () => {
      if (!deckOverlay.current && map.current) {
        deckOverlay.current = new MapboxOverlay({
          layers: [],
        });
        map.current.addControl(deckOverlay.current);
      }

      setMapReady(true);

      new mapboxgl.Marker({ color: "#e63946" })
        .setLngLat(DEFAULT_CENTER)
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

        const coords = await geocodeAddress(org.street_address, org.borough);
        if (!coords) continue;

        const popupHTML = `
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong>${org.name ?? "Unknown Org"}</strong><br/>
            ${org.street_address ?? ""}<br/>
            ${org.city ?? ""} ${org.state ?? ""} ${org.zip ?? ""}
          </div>
        `;

        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: "bottom",
          offset: 50,
        }).setHTML(popupHTML);

        const m = await createMarker(
          org.org_type === "restaurant" ? "restaurant" : "cbo",
          coords as [number, number],
          map.current!
        );

        const markerElement = m.getElement();

        markerElement.style.cursor = "pointer";

        markerElement.addEventListener("mouseenter", () => {
          popup.setLngLat(coords as [number, number]).addTo(map.current!);
        });

        markerElement.addEventListener("mouseleave", () => {
          popup.remove();
        });

        markerElement.addEventListener("click", () => {
          popup.remove();
          if (onOrganizationSelect) {
            onOrganizationSelect(org);
          }
        });

        newMarkers.push(m);
      }

      setMarkers(newMarkers);
    }

    addMarkers();
  }, [
    mapReady,
    isFilterActive,
    filteredDestinations,
    allDestinations,
    onOrganizationSelect,
  ]);

  useEffect(() => {
    if (
      !mapReady ||
      !map.current ||
      !selectedOrg ||
      !selectedOrg.street_address
    )
      return;

    (async () => {
      const coords = await geocodeAddress(
        selectedOrg.street_address!,
        selectedOrg.borough
      );
      if (!coords) return;
      map.current!.flyTo({
        center: coords,
        zoom: 15,
        essential: true,
      });
    })();
  }, [selectedOrg, mapReady]);

  // Fetch connected CBOs when a restaurant is selected, or connected Restaurants when a CBO is selected
  useEffect(() => {
    // Reset arrows immediately when selectedOrg changes
    setConnectedCBOs([]);
    setConnectedRestaurants([]);
    if (deckOverlay.current) {
      deckOverlay.current.setProps({ layers: [] });
    }

    if (!selectedOrg) {
      return;
    }

    if (selectedOrg.org_type === "restaurant") {
      const fetchConnectedCBOs = async () => {
        try {
          const res = await fetch(
            `/api/meal_providers?restaurant_id=${selectedOrg.id}`
          );
          const data = await res.json();
          setConnectedCBOs(data.meal_providers || []);
        } catch (error) {
          console.error("Error fetching connected CBOs:", error);
          setConnectedCBOs([]);
        }
      };

      fetchConnectedCBOs();
    } else if (selectedOrg.org_type === "cbo") {
      const fetchConnectedRestaurants = async () => {
        try {
          const res = await fetch(
            `/api/meal_providers?cbo_id=${selectedOrg.id}`
          );
          const data = await res.json();
          setConnectedRestaurants(data.meal_providers || []);
        } catch (error) {
          console.error("Error fetching connected restaurants:", error);
          setConnectedRestaurants([]);
        }
      };

      fetchConnectedRestaurants();
    }
  }, [selectedOrg]);

  // Create and update path layer when connected CBOs or Restaurants change
  useEffect(() => {
    if (!mapReady || !map.current || !deckOverlay.current) {
      return;
    }

    if (
      (connectedCBOs.length === 0 && connectedRestaurants.length === 0) ||
      !selectedOrg
    ) {
      deckOverlay.current.setProps({ layers: [] });
      return;
    }

    const createPaths = async () => {

      const paths: {
        path: [number, number][];
        restaurantName: string;
        cboName: string;
      }[] = [];

      // Handle Restaurant → CBO arrows (when restaurant is selected)
      if (selectedOrg.org_type === "restaurant" && connectedCBOs.length > 0) {
        const restaurantCoords = await geocodeAddress(
          selectedOrg.street_address!,
          selectedOrg.borough
        );
        if (!restaurantCoords) return;

        for (const provider of connectedCBOs) {
          const cboOrg = allDestinations.find(
            (org) => org.id === provider.cbo_id
          );
          if (!cboOrg?.street_address) continue;

          const cboCoords = await geocodeAddress(
            cboOrg.street_address,
            cboOrg.borough
          );
          if (!cboCoords) continue;

          const path = makeCurvedPath(
            restaurantCoords as [number, number],
            cboCoords as [number, number]
          );

          paths.push({
            path,
            restaurantName: selectedOrg.name,
            cboName: provider.cbo_name,
          });
        }
      }

      // Handle Restaurant → CBO arrows (when CBO is selected)
      if (selectedOrg.org_type === "cbo" && connectedRestaurants.length > 0) {
        const cboCoords = await geocodeAddress(
          selectedOrg.street_address!,
          selectedOrg.borough
        );
        if (!cboCoords) return;

        for (const provider of connectedRestaurants) {
          const restaurantOrg = allDestinations.find(
            (org) => org.id === provider.restaurant_id
          );
          if (!restaurantOrg?.street_address) continue;

          const restaurantCoords = await geocodeAddress(
            restaurantOrg.street_address,
            restaurantOrg.borough
          );
          if (!restaurantCoords) continue;

          const path = makeCurvedPath(
            restaurantCoords as [number, number],
            cboCoords as [number, number]
          );

          paths.push({
            path,
            restaurantName: provider.restaurant.name,
            cboName: selectedOrg.name,
          });
        }
      }

      if (paths.length === 0) {
        deckOverlay.current!.setProps({ layers: [] });
        return;
      }

      const pathLayer = new PathLayer({
        id: "restaurant-cbo-paths",
        data: paths,
        getPath: (d: any) => d.path,
        getColor: [34, 197, 94, 180], // green to match Figma
        widthUnits: "pixels",
        getWidth: 3,
        rounded: true,
        capRounded: true,
        pickable: false,
      });

      deckOverlay.current!.setProps({ layers: [pathLayer] });
    };

    createPaths();
  }, [connectedCBOs, connectedRestaurants, mapReady, selectedOrg, allDestinations]);

  const handleZoomIn = () => {
    if (!map.current) return;
    map.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (!map.current) return;
    map.current.zoomOut();
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
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-gray-700"
          >
            <polyline points="10 6 12 4 14 6" />
            <polyline points="18 10 20 12 18 14" />
            <polyline points="14 18 12 20 10 18" />
            <polyline points="6 14 4 12 6 10" />
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
