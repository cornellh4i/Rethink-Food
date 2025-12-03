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
  console.log("restaurantdat", restaurant)

  useEffect(() => {
    const queryMealProviders = async () => {
      try {
        const res = await fetch(
          `/api/meal_providers?restaurant_id=${restaurant.id}`
        );
        const data = await res.json();
        console.log(data)
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
        <h2
          className="text-black font-semibold mb-1"
          style={{ fontSize: "24px", lineHeight: "1.4" }}
        >
          {restaurant.name}
        </h2>
        <p
          className="text-gray-500 mb-1 "
          style={{ fontSize: "16px", lineHeight: "1.4" }}
        >
          {restaurantData?.restaurant_type
            ? restaurantData.restaurant_type + " Restaurant"
            : "Restaurant"}{" "}
          · {restaurant.borough}
        </p>

       

        {/* Cuisine - GREEN for food */}
        <div className="mt-4">
          <h3 className="text-gray-600 mb-2 font-bold" style={{color: "#757575" }}>Food served</h3>
          <div className="flex flex-wrap gap-2">
            {restaurantData?.cuisine &&
              restaurantData.cuisine
                .split(",")
                .map((cuisine: string, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#B6F3C7", color: "#333" }}
                  >
                    {cuisine.trim()}
                  </span>
                ))}
          </div>
        </div>

        <h3
          className="font-bold text-gray-600 mt-4"
          style={{ fontSize: "14px", color: "#757575" }}
        >
          Address
        </h3>

        <p className="text-sm text-gray-600">
          {restaurant.street_address}, {restaurant.state}, {restaurant.zip}{" "}
        </p>

        <h3
          className="font-bold text-gray-600 mt-4"
          style={{ fontSize: "14px", color: "#757575" }}
        >
          Website
        </h3>

        <p className="text-sm text-black underline cursor-pointer">
          {restaurant.website}
        </p>

        <div className="mt-6">
          {connectedCBOs && connectedCBOs.length > 0 && (
            <h3
              className="font-bold mb-3 text-gray-600"
              style={{ fontSize: "14px", color: "#757575" }}
            >
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
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontSize: "16px", lineHeight: "1.4" }}
                  >
                    {cbo.name}
                  </h3>

                  <div className="flex gap-2 flex-wrap">
                    {/* Cuisine Preference Chips - GREEN for food */}
                    {cuisines.map((cuisine, idx) => (
                      <span
                        key={`cuisine-${idx}`}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: "#B6F3C7", color: "#333" }}
                      >
                        {cuisine}
                      </span>
                    ))}

                    {/* Meal Format - GREEN for food */}
                    {cbo.meal_format && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: "#B6F3C7", color: "#333" }}
                      >
                        {cbo.meal_format}
                      </span>
                    )}

                    {/* Serves Youth - BLUE for service */}
                    {cbo.program_serving_minors && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: "#C5F1FF", color: "#333" }}
                      >
                        Serves Youth
                      </span>
                    )}

                    {/* Open Distribution - BLUE for service */}
                    {cbo.open_distribution && (
                      <span
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: "#C5F1FF", color: "#333" }}
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
