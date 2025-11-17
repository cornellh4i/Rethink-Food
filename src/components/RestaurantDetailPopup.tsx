"use client";
import { Organization } from "@/app/page";
import { useState, useEffect } from "react";

export default function RestaurantDetailPopup({
  restaurant,
}: {
  restaurant: Organization;
}) {

  interface MealProvider {
    id: number;
    cbo_id: number;
    cbo_name: string;
    meal_provider: string;
    restaurant_id: number;
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
      } catch (e) {}
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
          <p className="text-sm text-black mb-4">
            Support My Distribution Partners
          </p>

          <div className="space-y-4 text-black">
            {connectedCBOs?.map((partner, index) => (
              <div
                key={index}
                className="border rounded-xl p-3 shadow-sm bg-white hover:shadow-md transition"
              >
                {/* Partner Name */}
                <h3 className="text-base font-semibold mb-2">{partner.cbo_name}</h3>

                

      
        
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
