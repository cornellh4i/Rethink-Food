"use client";
import React, { useState, useEffect } from "react";
import { useFilter } from "@/context/FilterContext";
import { Organization } from "@/app/page";

export default function OrgList({
  onOrganizationSelect,
}: {
  onOrganizationSelect: (org: Organization) => void;
}) {
  const { filteredDestinations } = useFilter();
  const [loading, setLoading] = useState(true);
  const [restaurantMap, setRestaurantMap] = useState<Record<any, any>>({});

  useEffect(() => {
    if (filteredDestinations !== undefined) {
      setLoading(false);
    }
  }, [filteredDestinations]);

  const getDummyProgress = () => 60 + Math.random() * 10;

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

    fetchRestaurants();
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
                {org.number_of_meals != null &&
                  org.number_of_meals > 0 &&
                  org.number_of_meals >= 100 && (
                    <span
                      className="px-3 py-1 rounded-full text-xs text-black"
                      style={{ backgroundColor: "#E6E6E6" }}
                    >
                      {org.number_of_meals >= 1000
                        ? "1000+ meals served"
                        : org.number_of_meals >= 500
                        ? "500+ meals served"
                        : "100+ meals served"}
                    </span>
                  )}
                {restaurantData?.cuisine &&
                  restaurantData.cuisine
                    .split(",")
                    .map((cuisine: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs text-black"
                        style={{ backgroundColor: "#E6E6E6" }}
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
            {org.org_type === 'cbo' ? 'Community Based Organization' : org.org_type === 'restaurant' ? 'Restaurant' : org.org_type} · {org.borough}
          </p>

            {/* Chips */}
            {isCBO && (
              <div className="flex gap-2 flex-wrap mt-2">
                {/* Cuisine Preferences chips (semicolon-separated) */}
                {parseCBOCuisinePreferences(org.cuisine_preference).map((cuisine, idx) => (
                  <span key={`cuisine-pref-${idx}`} className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
                    {cuisine}
                  </span>
                ))}

                {/* Meal Format chip */}
                {org.meal_format && (
                  <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
                    {org.meal_format}
                  </span>
                )}

                {/* Serves Youth (0-18) - only if program_serving_minors or serves_minors is true */}
                {(org.program_serving_minors === true || org.serves_minors === true) && (
                  <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
                    Serves Youth (0–18)
                  </span>
                )}

                {/* Open Distribution - only if open_distribution is true */}
                {org.open_distribution === true && (
                  <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
                    Open Distribution
                  </span>
                )}

                {/* Volunteer Opportunities - only if volunteer_opportunities is true */}
                {org.volunteer_opportunities === true && (
                  <span className="px-3 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#E6E6E6'}}>
                    Volunteer Opportunities
                  </span>
                )}
              </div>
            )}

     

            {/* CBO Progress Bar (dummy, 60-70% fill) */}
            {isCBO && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div 
                    className="bg-gray-600 h-2 rounded-full transition-all"
                    style={{ width: `${getDummyProgress()}%` }}
                  />
                </div>
              </div>
            )}
          </button>
        );

     
      })}
    </div>
  );
}
