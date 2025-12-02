"use client";
import React, { useState, useEffect } from "react";
import { useFilter } from "@/context/FilterContext";
import { Organization } from "@/app/page";

export default function OrgList({
  onOrganizationSelect,
}: {
  onOrganizationSelect: (org: Organization) => void;
}) {
  const { filteredDestinations, closeSidebar} = useFilter();
  const [loading, setLoading] = useState(true);
  const [restaurantMap, setRestaurantMap] = useState<Record<any, any>>({});
  const [cboMap, setCboMap] = useState<Record<any, any>>({});

  useEffect(() => {
    if (filteredDestinations !== undefined) {
      setLoading(false);
    }
  }, [filteredDestinations]);

  const parseCBOCuisinePreferences = (cuisinePreference?: string): string[] => {
    if (!cuisinePreference) return [];
    return cuisinePreference.split(';').map(c => c.trim()).filter(c => c.length > 0);
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("/api/restaurants");
        const data = await res.json();

        const obj = Object.fromEntries(
          data.restaurants.map((r: any) => [r.id, r])
        );
        setRestaurantMap(obj);
      } catch (e) {
        console.error("Error fetching restaurants:", e);
      }
    };

    const fetchCBOs = async () => {
      try {
        const res = await fetch("/api/cbos");
        const data = await res.json();

        const obj = Object.fromEntries(
          data.cbos.map((c: any) => [c.id, c])
        );
        setCboMap(obj);
      } catch (e) {
        console.error("Error fetching CBOs:", e);
      }
    };

    fetchRestaurants();
    fetchCBOs();
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500 text-sm px-2">Loading organizations...</p>
    );
  }

  if (
    !Array.isArray(filteredDestinations) ||
    filteredDestinations.length === 0
  ) {
    return (
      <p className="text-gray-500 text-center py-4 text-sm">
        No organizations found
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#F5F5F5' }}>
          <img src="/search_symbol.png" alt="Search" className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-sm text-black placeholder-gray-500"
          />
        </div>
        
        <button
          onClick={closeSidebar}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <img src="/close_sidebar.png" alt="Close sidebar" className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-full overflow-y-auto pr-2">
        {filteredDestinations.map((org: Organization) => {
          const isCBO = org.org_type === 'cbo';
          const isRestaurant = org.org_type === 'restaurant';

          if (org.org_type === "restaurant") {
            const restaurantData = restaurantMap[org.id];

            return (
              <button
                key={org.id}
                className="w-full text-left rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ backgroundColor: "#F5F5F5" }}
                onClick={() => onOrganizationSelect(org)}
              >
                <h3
                  className="text-black mb-1"
                  style={{
                    fontWeight: 600,
                    fontSize: "18px",
                    lineHeight: "140%",
                  }}
                >
                  {org.name}
                </h3>

                <p className="text-sm text-black mb-3">
                  {restaurantData?.restaurant_type + " Restaurant"|| "Restaurant"} ·{" "}
                  {org.borough}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {/* Meals served - BLUE for service */}
                  {org.number_of_meals != null &&
                    org.number_of_meals > 0 &&
                    org.number_of_meals >= 100 && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#C5F1FF', color: '#333' }}
                      >
                        {org.number_of_meals >= 1000
                          ? "1000+ meals served"
                          : org.number_of_meals >= 500
                          ? "500+ meals served"
                          : "100+ meals served"}
                      </span>
                    )}
                  {/* Cuisine - GREEN for food */}
                  {restaurantData?.cuisine &&
                    restaurantData.cuisine
                      .split(",")
                      .map((cuisine: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{ backgroundColor: '#B6F3C7', color: '#333' }}
                        >
                          {cuisine.trim()}
                        </span>
                      ))}
                </div>
              </button>
            );
          }

          return (
            <button
              key={org.id}
              className="w-full text-left rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              style={{ backgroundColor: '#F5F5F5' }}
              onClick={() => onOrganizationSelect(org)}
            >
              <h3 className="text-black mb-1" style={{fontWeight: 600, fontSize: '18px', lineHeight: '140%' }}>
                {org.name}
              </h3>

            <p className="text-sm text-black mb-3">
              Community Based Organization · {org.borough}
            </p>

              {/* Chips */}
              {isCBO && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {/* Cuisine Preferences chips - GREEN for food */}
                  {cboMap[org.id]?.cuisine_preference && 
                    parseCBOCuisinePreferences(cboMap[org.id].cuisine_preference).map((cuisine, idx) => (
                      <span key={`cuisine-pref-${idx}`} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#B6F3C7', color: '#333' }}>
                        {cuisine}
                      </span>
                    ))}

                  {/* Meal Format chip - GREEN for food */}
                  {cboMap[org.id]?.meal_format && (
                    <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#B6F3C7', color: '#333' }}>
                      {cboMap[org.id].meal_format}
                    </span>
                  )}

                  {/* Serves Youth - BLUE for service */}
                  {(cboMap[org.id]?.program_serving_minors === true || cboMap[org.id]?.serves_minors === true) && (
                    <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                      Serves Youth
                    </span>
                  )}

                  {/* Open Distribution - BLUE for service */}
                  {cboMap[org.id]?.open_distribution === true && (
                    <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                      Open Distribution
                    </span>
                  )}
                </div>
              )}
            </button>
          );

      
        })}
      </div>
    </div>
  );
}

