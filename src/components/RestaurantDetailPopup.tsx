'use client';
import { Organization } from "@/app/page";
import { useState, useEffect } from "react";


export default function RestaurantDetailPopup({ restaurant }: { restaurant: Organization }) {
  const [restaurantMap, setRestaurantMap] = useState<Record<any, any>>({});

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


  return (
    <div className="w-full">
      <div className="h-42 bg-gray-300 -m-4 mb-4" />

      <div>
      <h2 className="text-2xl text-black font-bold mb-1">{restaurant.name}</h2>
      <p className="text-sm text-gray-600">{restaurantData?.restaurant_type || "Restaurant"} · {restaurant.borough}</p>
      <p className="text-sm text-gray-600">{restaurant.street_address}, {restaurant.state}, {restaurant.zip} </p>

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
              <span key={index} className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
                {cuisine.trim()}
              </span>
            ))}
        </div>

        <div className="mt-6">
  <p className="text-sm text-black mb-4">Support My Distribution Partners</p>

  <div className="space-y-4 text-black">
    {[
      { name: "Community Center A", meals: 500, needed: 250 },
      { name: "Community Center B", meals: 500, needed: 250 },
      {name: "Community Center C", meals: 500, needed: 250 }
    ].map((partner) => (
      <div
        key={partner.name}
        className="border rounded-xl p-3 shadow-sm bg-white hover:shadow-md transition"
      >
        {/* Partner Name */}
        <h3 className="text-base font-semibold mb-2">{partner.name}</h3>

        {/* Meals + Donation Info */}
        <div className="flex justify-between items-center mb-1">
          <div>
            <p className="text-sm font-semibold">${partner.meals} needed this quater</p>
            <p className="text-xs text-gray-600">500 meals needed / week</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-3">
          <div
            className="bg-gray-600 h-2 rounded-full"
            style={{ width: "50%" }} // adjust as needed
          ></div>
        </div>

      
        </div>
        ))}
        </div>
        </div>
      </div>
    </div>

  );
}
