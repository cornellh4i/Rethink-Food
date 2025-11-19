"use client";
import { Organization } from "@/app/page";
import { useState, useEffect } from "react";

export default function RestaurantDetailPopup({
  restaurant,
  onCBOClick
}: {
  restaurant: Organization;
  onCBOClick?: (cboId: number) => void;
}) {

  interface MealProvider {
    id: number;
    cbo_id: number;
    cbo_name: string;
    meal_provider: string; 
    restaurant_id: number;
    cbo: CBO;

  }


  interface CBO {
    id: number;
    name: string;
    annual_funding_goal: number;
    quarter_funding_goal: number;
    cuisine_preference: string | null;
    meal_format: string | null;
    meal_provider: string | null;
    open_distribution: boolean;
    program_serving_minors: boolean;
    volunteer_opportunities: boolean;
  }
  
  const [restaurantMap, setRestaurantMap] = useState<Record<any, any>>({});
  const [connectedCBOs, setConnectedCBOs] = useState<MealProvider[]>([]);

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

  const restaurantData = restaurantMap[restaurant.id];

  useEffect(() => {
    const queryMealProviders = async () => {
      try {
        const res = await fetch(
          `/api/meal_providers?restaurant_id=${restaurant.id}`
        );
        const data = await res.json();
        console.log(data.meal_providers)
        setConnectedCBOs(data.meal_providers);
      } catch (e) {
        console.log("error message:", e)
      }
    };

  queryMealProviders()
  }, []);

  return (
    <div className="w-full">
      <div className="h-42 bg-gray-300 -m-4 mb-4" />

      <div>
        <h2 className="text-2xl text-black font-bold mb-1">
          {restaurant.name}
        </h2>
        <p className="text-sm text-gray-600">
          {restaurantData?.restaurant_type + " Restaurant" || "Restaurant"} ·{" "}
          {restaurant.borough}
        </p>
        <p className="text-sm text-gray-600">
          {restaurant.street_address}, {restaurant.state}, {restaurant.zip}{" "}
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          {restaurant.number_of_meals != null &&
            restaurant.number_of_meals > 0 &&
            restaurant.number_of_meals >= 100 && (
              <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
                {restaurant.number_of_meals >= 1000
                  ? "1000+ meals served"
                  : restaurant.number_of_meals >= 500
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
                  className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full"
                >
                  {cuisine.trim()}
                </span>
              ))}
        </div>

        <div className="mt-6">
          {connectedCBOs && connectedCBOs.length > 0 && (
            <p className="text-sm text-black mb-4">
              Support My Distribution Partners
            </p>
          )}

          <div className="space-y-4 text-black">
            {connectedCBOs?.map((partner, index) => {
              const cbo = partner.cbo;
          

              // Split cuisine preferences into chips
              const cuisines = cbo.cuisine_preference
                ? cbo.cuisine_preference.split(";").map((c) => c.trim())
                : [];

              return (
                <div
                  key={index}
                  className="border-gray-400 rounded-lg p-3 shadow-sm bg-white hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    onCBOClick?.(cbo.id);
                  }}
                >
                  {/* CBO Name */}
                  <h3 className="text-lg font-semibold">{cbo.name}</h3>

                  <div className="flex gap-2 flex-wrap mt-2">
                    {/* Cuisine Preference Chips */}
                    {cuisines.map((cuisine, idx) => (
                      <span
                        key={`cuisine-${idx}`}
                        className="px-3 py-1 rounded-full text-xs text-black"
                        style={{ backgroundColor: "#E6E6E6" }}
                      >
                        {cuisine}
                      </span>
                    ))}

                    {/* Meal Format */}
                    {cbo.meal_format && (
                      <span
                        className="px-3 py-1 rounded-full text-xs text-black"
                        style={{ backgroundColor: "#E6E6E6" }}
                      >
                        {cbo.meal_format}
                      </span>
                    )}

                    {/* Serves Youth */}
                    {cbo.program_serving_minors && (
                      <span
                        className="px-3 py-1 rounded-full text-xs text-black"
                        style={{ backgroundColor: "#E6E6E6" }}
                      >
                        Serves Youth (0–18)
                      </span>
                    )}

                    {/* Open Distribution */}
                    {cbo.open_distribution && (
                      <span
                        className="px-3 py-1 rounded-full text-xs text-black"
                        style={{ backgroundColor: "#E6E6E6" }}
                      >
                        Open Distribution
                      </span>
                    )}

                    {/* Volunteer Opportunities */}
                    {cbo.volunteer_opportunities && (
                      <span
                        className="px-3 py-1 rounded-full text-xs text-black"
                        style={{ backgroundColor: "#E6E6E6" }}
                      >
                        Volunteer Opportunities
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
