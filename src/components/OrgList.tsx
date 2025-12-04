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
      {/* Match count */}
      <div className="mb-3 px-2">
        <p className="text-sm text-gray-600">
          {filteredDestinations.length} {filteredDestinations.length === 1 ? 'match' : 'matches'} found
        </p>
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
              {isCBO && (() => {
                const cboInfo = cboMap[org.id];
                const povertyLine = cboInfo?.percent_below_poverty_served;
                const servesMinors = cboInfo?.program_serving_minors === true || cboInfo?.serves_minors === true;
                const cuisinePrefs = cboInfo?.cuisine_preference ? parseCBOCuisinePreferences(cboInfo.cuisine_preference) : [];
                const dietaryRestrictions = cuisinePrefs.filter((c: string) => c.includes("Halal") || c.includes("Kosher"));

                const hasPriorityTags = (povertyLine != null && povertyLine > 25) || servesMinors || dietaryRestrictions.length > 0;

                return (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {/* Priority 1: Poverty tags */}
                    {povertyLine != null && povertyLine > 25 && (
                      <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                        {povertyLine > 75 ? ">75% Below Poverty Line" : povertyLine > 50 ? ">50% Below Poverty Line" : ">25% Below Poverty Line"}
                      </span>
                    )}

                    {/* Priority 2: Serves Youth */}
                    {servesMinors && (
                      <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                        Serves Youth
                      </span>
                    )}

                    {/* Priority 3: Dietary Restrictions */}
                    {dietaryRestrictions.map((restriction: string, idx: number) => (
                      <span key={`dietary-${idx}`} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#B6F3C7', color: '#333' }}>
                        {restriction}
                      </span>
                    ))}

                    {/* Default: Distribution tag (only if no priority tags) */}
                    {!hasPriorityTags && cboInfo?.open_distribution != null && (
                      <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                        {cboInfo.open_distribution === true ? "Open Distribution" : "Selective Distribution"}
                      </span>
                    )}
                  </div>
                );
              })()}
            </button>
          );

      
        })}
      </div>
    </div>
  );
}