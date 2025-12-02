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
        setConnectedCBOs(data.meal_providers);
      } catch (e) {
        console.log("error message:", e)
      }
    };

  queryMealProviders()
  }, [restaurant.id]);

  return (
    <div className="w-full">
      <div>
        <h2 className="text-black font-semibold mb-1" style={{ fontSize: '24px', lineHeight: '1.4' }}>
          {restaurant.name}
        </h2>
        <p className="text-black mb-1" style={{ fontSize: '16px', lineHeight: '1.4' }}>
          {restaurantData?.restaurant_type ? restaurantData.restaurant_type + " Restaurant" : "Restaurant"} ·{" "}
          {restaurant.borough}
        </p>
        <p className="text-sm text-gray-600">
          {restaurant.street_address}, {restaurant.state}, {restaurant.zip}{" "}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {/* Meals served - BLUE for service */}
          {restaurant.number_of_meals != null &&
            restaurant.number_of_meals > 0 &&
            restaurant.number_of_meals >= 100 && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                {restaurant.number_of_meals >= 1000
                  ? "1000+ meals served"
                  : restaurant.number_of_meals >= 500
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
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#B6F3C7', color: '#333' }}
                >
                  {cuisine.trim()}
                </span>
              ))}
        </div>

        <div className="mt-6">
          {connectedCBOs && connectedCBOs.length > 0 && (
            <h3 className="font-medium mb-3" style={{ fontSize: '14px', color: '#757575', fontWeight: 500 }}>
              Distribution Partners
            </h3>
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
                  className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    onCBOClick?.(cbo.id);
                  }}
                >
                  {/* CBO Name */}
                  <h3 className="font-semibold mb-2" style={{ fontSize: '16px', lineHeight: '1.4' }}>{cbo.name}</h3>

                  <div className="flex gap-2 flex-wrap">
                    {/* Cuisine Preference Chips - GREEN for food */}
                    {cuisines.map((cuisine, idx) => (
                      <span
                        key={`cuisine-${idx}`}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#B6F3C7', color: '#333' }}
                      >
                        {cuisine}
                      </span>
                    ))}

                    {/* Meal Format - GREEN for food */}
                    {cbo.meal_format && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#B6F3C7', color: '#333' }}
                      >
                        {cbo.meal_format}
                      </span>
                    )}

                    {/* Serves Youth - BLUE for service */}
                    {cbo.program_serving_minors && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#C5F1FF', color: '#333' }}
                      >
                        Serves Youth
                      </span>
                    )}

                    {/* Open Distribution - BLUE for service */}
                    {cbo.open_distribution && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: '#C5F1FF', color: '#333' }}
                      >
                        Open Distribution
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
