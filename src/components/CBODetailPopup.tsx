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
  const [activeTab, setActiveTab] = useState<"how-it-works" | "who-we-serve">("how-it-works");

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

  const progressPercentage = 60;

  const formatBudget = (amount?: number) => {
    if (!amount) return '';
    return `$${amount.toLocaleString()}`;
  };

  const servesMinors = cboData?.program_serving_minors === true || cboData?.serves_minors === true;

  return (
    <div className="w-full">
      <div className="h-42 bg-gray-300 -m-4 mb-4" />

      {/* Header */}
      <h2 className="text-xl text-black font-semibold">{cbo.name}</h2>
      <p className="text-xs text-black">Community Based Organization · {cbo.borough || 'Brooklyn'}</p>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {/* Cuisine Preferences chips */}
        {cuisinePreferences.map((cuisine: string, index: number) => (
          <span key={`cuisine-${index}`} className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
            {cuisine}
          </span>
        ))}

        {/* Meal Format chip */}
        {cboData?.meal_format && (
          <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
            {cboData.meal_format}
          </span>
        )}

        {/* Serves Youth (0-18) - only if program_serving_minors or serves_minors is true */}
        {servesMinors && (
          <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
            Serves Youth (0–18)
          </span>
        )}

        {/* Open Distribution - only if open_distribution is true */}
        {cboData?.open_distribution && (
          <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
            Open Distribution
          </span>
        )}

        {/* Volunteer Opportunities - only if volunteer_opportunities is true */}
        {cboData?.volunteer_opportunities && (
          <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
            Volunteer Opportunities
          </span>
        )}
      </div>

      {/* Meals Provided By Section */}
      {connectedRestaurants && connectedRestaurants.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-600">
            Provided by{" "}
            {connectedRestaurants.map((provider, index) => (
              <span key={index}>
                <span
                  onClick={() => onRestaurantClick?.(provider.restaurant.id)}
                  className="text-black hover:underline cursor-pointer"
                >
                  {provider.restaurant.name}
                </span>
                {index < connectedRestaurants.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Computed fields */}
      <div className="mt-4">
        {/* Meals per week  */}
        <div>
          <p className="text-2xl font-bold text-black">
            {(cbo.number_of_meals !== undefined && cbo.number_of_meals !== null) ? cbo.number_of_meals : '—'}
          </p>
          <p className="text-sm text-gray-500">Meals per Week</p>
        </div>

        {/* Dummy progress bar */}
        <div className="mt-2 mb-2">
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-gray-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Annual Budget Goal */}
        {cboData?.annual_funding_goal && (
          <p className="text-sm text-gray-500 mb-4">
            Annual Budget Goal: {formatBudget(cboData.annual_funding_goal)}
          </p>
        )}
      </div>

      {/* Support button */}
      <button className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg">
        Support this organization
      </button>

      {/* Toggleable tabs */}
      <div className="mt-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("how-it-works")}
          className={`flex-1 py-2 text-sm ${
            activeTab === "how-it-works"
              ? "border-b-2 border-gray-600 text-gray-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          How It Works
        </button>
        <button
          onClick={() => setActiveTab("who-we-serve")}
          className={`flex-1 py-2 text-sm ${
            activeTab === "who-we-serve"
              ? "border-b-2 border-gray-600 text-gray-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Who We Serve
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4 text-xs text-gray-700 leading-relaxed">
        {activeTab === "how-it-works" && (
          <div className="space-y-4">
            {/* Mission section */}
            {cbo.writeup && (
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">Mission</h3>
                <p>{cbo.writeup}</p>
              </div>
            )}

            {/* Food Served - reuse Cuisine Preferences */}
            {cuisinePreferences.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">Food served</h3>
                <div className="flex flex-wrap gap-2">
                  {cuisinePreferences.map((cuisine: string, index: number) => (
                    <span key={`food-${index}`} className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Distribution */}
            <div>
              <h3 className="font-semibold text-sm text-black mb-2">Distribution</h3>
              {cboData?.open_distribution && (
                <span className="bg-gray-100 text-black text-xs px-3 py-1 rounded-full inline-block mb-2">
                  Open Distribution
                </span>
              )}
              {(cbo.street_address || cbo.city || cbo.state || cbo.zip) && (
                <p className="text-xs mt-2">
                  {[cbo.street_address, cbo.city, cbo.state, cbo.zip].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            {/* Learn More */}
            {cbo.website && (
              <div>
                <h3 className="font-semibold text-sm text-black mb-2">Learn More</h3>
                <a
                  href={cbo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {cbo.website}
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === "who-we-serve" && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              This data reflects everyone served by this organization, not only meal recipients.
            </p>

            {/* Poverty Line - dummy data */}
            <div>
              <h3 className="font-semibold text-sm text-black mb-2">Poverty Line</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 h-4 rounded">
                    <div className="bg-gray-600 h-4 rounded" style={{ width: '30%' }}></div>
                  </div>
                  <span>30%</span>
                </div>
              </div>
            </div>

            {/* Age - dummy data */}
            <div>
              <h3 className="font-semibold text-sm text-black mb-2">Age</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 h-4 rounded">
                    <div className="bg-gray-600 h-4 rounded" style={{ width: '40%' }}></div>
                  </div>
                  <span>40%</span>
                </div>
              </div>
            </div>

            {/* Race - dummy data */}
            <div>
              <h3 className="font-semibold text-sm text-black mb-2">Race</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 h-4 rounded">
                    <div className="bg-gray-600 h-4 rounded" style={{ width: '50%' }}></div>
                  </div>
                  <span>50%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
