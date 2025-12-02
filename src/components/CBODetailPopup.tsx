'use client';
import { useState, useEffect } from "react";
import { Organization } from "@/app/page";

export default function CBODetailPopup({
  cbo,
  cboData,
  onRestaurantClick
}: {
  cbo: Organization;
  cboData?: any;
  onRestaurantClick?: (restaurantId: number) => void;
}) {

  interface MealProvider {
    id: number;
    cbo_id: number;
    restaurant_id: number;
    restaurant: Restaurant;
  }

  interface Restaurant {
    id: number;
    name: string;
    cuisine: string | null;
    restaurant_type: string | null;
    number_of_meals: number | null;
  }

  const [connectedRestaurants, setConnectedRestaurants] = useState<MealProvider[]>([]);

  useEffect(() => {
    const queryMealProviders = async () => {
      try {
        const res = await fetch(
          `/api/meal_providers?cbo_id=${cbo.id}`
        );
        const data = await res.json();
        setConnectedRestaurants(data.meal_providers || []);
      } catch (e) {
        console.log("error fetching meal providers:", e);
      }
    };

    queryMealProviders();
  }, [cbo.id]);

  const cuisinePreferences: string[] = cboData?.cuisine_preference
    ? cboData.cuisine_preference.split(';').map((c: string) => c.trim()).filter((c: string) => c.length > 0)
    : [];

  const servesMinors = cboData?.program_serving_minors === true || cboData?.serves_minors === true;

  return (
    <div className="w-full">
      {/* Header */}
      <h2 className="text-black font-semibold" style={{ fontSize: '24px', lineHeight: '1.4' }}>{cbo.name}</h2>
      <p className="text-black" style={{ fontSize: '16px', lineHeight: '1.4' }}>Community-Based Org · {cbo.borough || 'Brooklyn'}</p>

      {/* Food served section */}
      {cuisinePreferences.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#757575', fontWeight: 500 }}>Food served</h3>
          <div className="flex flex-wrap gap-2">
            {cuisinePreferences.map((cuisine: string, index: number) => (
              <span key={`cuisine-${index}`} className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#B6F3C7', color: '#333' }}>
                {cuisine}
              </span>
            ))}
            {cboData?.meal_format && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#B6F3C7', color: '#333' }}>
                {cboData.meal_format}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Meals Provided By Section */}
      {connectedRestaurants && connectedRestaurants.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-700">
            Provided by{" "}
            {connectedRestaurants.map((provider, index) => (
              <span key={index}>
                <span
                  onClick={() => onRestaurantClick?.(provider.restaurant.id)}
                  className="text-black hover:underline cursor-pointer font-medium"
                >
                  {provider.restaurant.name}
                </span>
                {index < connectedRestaurants.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Distribution Partners section */}
      {(servesMinors || cboData?.open_distribution || (cbo.number_of_meals !== undefined && cbo.number_of_meals !== null)) && (
        <div className="mt-4">
          <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#757575', fontWeight: 500 }}>Distribution Partners</h3>
          <div className="flex flex-wrap gap-2">
            {servesMinors && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                Serves Youth
              </span>
            )}
            {cboData?.open_distribution && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                Open distribution
              </span>
            )}
            {cbo.number_of_meals !== undefined && cbo.number_of_meals !== null && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#C5F1FF', color: '#333' }}>
                {cbo.number_of_meals} meals per week
              </span>
            )}
          </div>
        </div>
      )}

      {/* Address */}
      {(cbo.street_address || cbo.city || cbo.state || cbo.zip) && (
        <div className="mt-4">
          <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#757575', fontWeight: 500 }}>Address</h3>
          <p className="text-sm text-gray-700">
            {[cbo.street_address, cbo.city, cbo.state, cbo.zip].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* Website */}
      {cbo.website && (
        <div className="mt-4">
          <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#757575', fontWeight: 500 }}>Website</h3>
          <a
            href={cbo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-black text-sm break-all"
          >
            {cbo.website}
          </a>
        </div>
      )}

      {/* Mission & Partnership */}
      {cbo.writeup && (
        <div className="mt-4">
          <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#757575', fontWeight: 500 }}>Mission & Partnership</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{cbo.writeup}</p>
        </div>
      )}
    </div>
  );
}
