"use client";
import { useState, useEffect } from "react";
import { Organization } from "@/app/page";

export default function CBODetailPopup({
  cbo,
  cboData,
  onRestaurantClick,
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

  const [connectedRestaurants, setConnectedRestaurants] = useState<
    MealProvider[]
  >([]);
  const [showPovertyTooltip, setShowPovertyTooltip] = useState(false);
  const [showDistributionTooltip, setShowDistributionTooltip] = useState(false);

  useEffect(() => {
    const queryMealProviders = async () => {
      try {
        const res = await fetch(`/api/meal_providers?cbo_id=${cbo.id}`);
        const data = await res.json();
        setConnectedRestaurants(data.meal_providers || []);
      } catch (e) {
        console.log("error fetching meal providers:", e);
      }
    };

    queryMealProviders();
  }, [cbo.id]);

  const cuisinePreferences: string[] = cboData?.cuisine_preference
    ? cboData.cuisine_preference
        .split(";")
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0)
    : [];

  const servesMinors =
    cboData?.program_serving_minors != null
      ? cboData?.program_serving_minors === true 
      : undefined;

  const povertyLine =
    cboData?.percent_below_poverty_served != null
      ? cboData?.percent_below_poverty_served
      : undefined;

  const dietaryRestrictions = cuisinePreferences.filter(
    (c) => c.includes("Halal") || c.includes("Kosher")
  );

  console.log("povertyLine:", povertyLine);
  console.log("dietaryRestrictions:", dietaryRestrictions);
  console.log("servesMinors:", servesMinors);
  console.log("open_distribution:", cboData?.open_distribution);

  return (
    <div className="w-full">
      {/* Header */}
      <h2
        className="text-black font-semibold"
        style={{ fontSize: "24px", lineHeight: "1.4" }}
      >
        {cbo.name}
      </h2>
      <p
        className="text-gray-500 text-sm"
        style={{ fontSize: "16px", lineHeight: "1.4" }}
      >
        Community-Based Org · {cbo.borough || "Brooklyn"}
      </p>

      {/* top section #C5F1FF */}

      <div className="flex flex-row gap-2 mt-2">
        {povertyLine != null && povertyLine > 25 && (
          <div className="relative">
            <div className="flex flex-row items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#C5F1FF] text-[#333]">
              <span>
                {povertyLine > 75
                  ? ">75% Below Poverty Line"
                  : povertyLine > 50
                  ? ">50% Below Poverty Line"
                  : ">25% Below Poverty Line"}
              </span>
              <span
                className="flex items-center justify-center w-4 h-4 rounded-xl bg-gray-500 text-[#C5F1FF] text-[10px] font-bold cursor-pointer"
                onMouseEnter={() => setShowPovertyTooltip(true)}
                onMouseLeave={() => setShowPovertyTooltip(false)}
              >
                ?
              </span>
            </div>
            {showPovertyTooltip && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm text-gray-800 w-64 top-full mt-1 left-0">
                Portion of community members living at or below the poverty line
              </div>
            )}
          </div>
        )}

        {servesMinors != undefined && servesMinors == true && (
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: "#C5F1FF", color: "#333" }}
          >
            Serves Youth
          </span>
        )}

        {dietaryRestrictions?.length > 0 &&
          dietaryRestrictions.map((restriction, index) => (
            <span
              key={index}
              className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: "#B6F3C7", color: "#333" }}
            >
              {restriction}
            </span>
          ))}

        {cboData?.open_distribution != null &&
          (povertyLine == undefined || povertyLine < 25) &&
          dietaryRestrictions.length === 0 &&
          (servesMinors == undefined || servesMinors === false) && (
            <div className="relative">
              <div className="flex flex-row items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#C5F1FF] text-[#333]">
                <span>
                  {cboData.open_distribution === true
                    ? "Open Distribution"
                    : "Selective Distribution"}
                </span>
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-500 text-[#C5F1FF] text-[10px] font-bold cursor-pointer"
                  onMouseEnter={() => setShowDistributionTooltip(true)}
                  onMouseLeave={() => setShowDistributionTooltip(false)}
                >
                  ?
                </span>
              </div>
              {showDistributionTooltip && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-xl shadow-lg p-2 text-sm text-gray-800 w-64 top-full mt-1 left-0">
                  {cboData.open_distribution === true
                    ? "Anyone can receive food"
                    : "Only eligible community members receive food"}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Food served section  */}
      {cuisinePreferences.length > 0 && (
        <div className="mt-4">
          <h3
            className="font-bold mb-2 text-gray-600"
            style={{ fontSize: "14px", color: "#757575" }}
          >
            Food served
          </h3>
          <div className="flex flex-wrap gap-1">
            {cuisinePreferences.map((cuisine: string, index: number) => (
              <span
                key={`cuisine-${index}`}
                className="text-xs px-3 py-1 rounded-full"
                style={{ backgroundColor: "#B6F3C7", color: "#333" }}
              >
                {cuisine}
              </span>
            ))}
            {cboData?.meal_format && (
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{ backgroundColor: "#B6F3C7", color: "#333" }}
              >
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
                  className="text-black font-bold hover:underline cursor-pointer"
                >
                  {provider.restaurant.name}
                </span>
                {index < connectedRestaurants.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Address */}
      {(cbo.street_address || cbo.city || cbo.state || cbo.zip) && (
        <div className="mt-4">
          <h3
            className="font-bold mb-2 text-gray-600"
            style={{ fontSize: "14px", color: "#757575" }}
          >
            Address
          </h3>
          <p className="text-sm text-gray-700">
            {[cbo.street_address, cbo.city, cbo.state, cbo.zip]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}

      {/* Website */}
      {cbo.website && (
        <div className="mt-4">
          <h3
            className="font-bold mb-2 text-gray-600"
            style={{ fontSize: "14px", color: "#757575" }}
          >
            Website
          </h3>
          <a
            href={cbo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline hover:text-black text-sm break-all"
          >
            {cbo.website}
          </a>
        </div>
      )}

      {/* Mission & Partnership */}
      {cbo.writeup && (
        <div className="mt-4">
          <h3
            className="font-bold mb-2 text-gray-600"
            style={{ fontSize: "14px", color: "#757575" }}
          >
            Mission & Partnership
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{cbo.writeup}</p>
        </div>
      )}
    </div>
  );
}
